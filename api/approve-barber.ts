import type { SupabaseClient } from '@supabase/supabase-js';
import { safeHost, verifyManageBarbersAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { whitelistBarberUpsertRow } from './_lib/approveBarberUpsertWhitelist.js';
import { provisionBarberAccount, siteBaseUrlFromEnv } from './_lib/barberProvisionService.js';
import { emitOpsEventFireAndForget } from './_lib/opsEventRouter.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 45,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** تشخيص بدون أسرار — افتح: /api/approve-barber */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const url = Boolean(resolvedUrl);
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const resendApiKeySet = Boolean((process.env.RESEND_API_KEY || '').trim());
  const resendFromEmailSet = Boolean((process.env.RESEND_FROM_EMAIL || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'approve-barber',
      supabaseUrlSet: url,
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      resendApiKeySet,
      resendFromEmailSet,
      postAuth: 'Authorization: Bearer <Supabase access_token> + active admin with manage_barbers',
      ready: url && serviceRole,
      credentialsEmailReady: url && serviceRole && resendApiKeySet && resendFromEmailSet,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  const adminAuth = await verifyManageBarbersAdminFromRequest(request, url, serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase as SupabaseClient;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const bodyObj = body as {
    row?: unknown;
    legalDisclaimerAccepted?: unknown;
    legalDisclaimerAcceptedAtIso?: unknown;
  };
  const row = bodyObj?.row;
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return Response.json({ error: 'Invalid row payload' }, { status: 400, headers });
  }

  const legalDisclaimerAccepted = bodyObj.legalDisclaimerAccepted === true;
  const legalDisclaimerAcceptedAtIso =
    typeof bodyObj.legalDisclaimerAcceptedAtIso === 'string'
      ? bodyObj.legalDisclaimerAcceptedAtIso.trim()
      : '';

  const wl = whitelistBarberUpsertRow(row as Record<string, unknown>);
  if (wl.ok === false) {
    return Response.json(
      {
        error: 'Row contains disallowed fields',
        disallowedKeys: wl.disallowedKeys,
        hint: 'Only barber profile columns approved for admin upsert are accepted (rating_invite_token is server-managed).',
      },
      { status: 400, headers }
    );
  }

  const provision = await provisionBarberAccount(supabase, {
    upsertRow: wl.row,
    legalDisclaimerAccepted,
    legalDisclaimerAcceptedAtIso,
    sendCredentialsEmail: String((wl.row as { tier?: unknown }).tier ?? '').trim().toLowerCase() !== 'bronze',
    forceAuthProvision: true,
  });

  if (!provision.ok) {
    emitOpsEventFireAndForget({
      type: 'barber.provision_failed',
      severity: 'urgent',
      title: 'فشل تجهيز حساب حلاق بعد الاعتماد',
      summary: String(provision.error || 'provision_failed').slice(0, 400),
      clientId: provision.barberId || String(wl.row.id || 'UNKNOWN'),
      detail: {
        source: 'approve-barber',
        error: provision.error,
      },
      dedupeKey: `barber.provision_failed:${provision.barberId || wl.row.id || 'unknown'}`,
      dedupeHours: 2,
    });
    return Response.json(
      {
        error: provision.error,
        ...(provision.barberId ? { barberId: provision.barberId } : {}),
      },
      { status: provision.barberId ? 502 : 500, headers }
    );
  }

  // مصدر الحقيقة الجغرافي لشركاء التجربة: إحداثيات طلب التجربة المعتمد.
  try {
    const { applyApprovedBronzeTrialGeoToBarber } = await import('./_lib/bronzeTrialGeoSync.js');
    const email = String((wl.row as { email?: unknown }).email ?? '').trim();
    const geo = await applyApprovedBronzeTrialGeoToBarber(supabase, {
      barberId: provision.barberId,
      email,
    });
    if (!geo.ok) {
      console.error('[approve-barber] bronze_trial_geo_sync_failed', geo.error);
    }
  } catch (err) {
    console.error('[approve-barber] bronze_trial_geo_sync_threw', err);
  }

  if (!provision.authUserId) {
    emitOpsEventFireAndForget({
      type: 'barber.missing_user_id',
      severity: 'urgent',
      title: 'حلاق معتمد بدون user_id',
      summary: `بعد الاعتماد، barberId=${provision.barberId} بدون ربط auth.`,
      clientId: provision.barberId,
      detail: { source: 'approve-barber', member_number: provision.memberNumber },
      dedupeKey: `barber.missing_user_id:${provision.barberId}`,
      dedupeHours: 6,
    });
  }

  if (provision.credentialEmailError) {
    emitOpsEventFireAndForget({
      type: 'barber.credentials_email_failed',
      title: 'فشل إرسال بريد بيانات الدخول',
      summary: String(provision.credentialEmailError).slice(0, 400),
      clientId: provision.barberId,
      detail: {
        source: 'approve-barber',
        member_number: provision.memberNumber,
      },
      dedupeKey: `barber.credentials_email_failed:${provision.barberId}`,
      dedupeHours: 4,
    });
  }

  return Response.json(
    {
      ok: true,
      barberId: provision.barberId,
      memberNumber: provision.memberNumber,
      authUserId: provision.authUserId,
      credentialEmailSent: provision.credentialEmailSent,
      dashboardUrl: `${siteBaseUrlFromEnv()}/#/barber/dashboard`,
      ...(provision.credentialEmailError ? { credentialEmailError: provision.credentialEmailError } : {}),
      ...(provision.shopOpenQuickHashLink ? { shopOpenQuickHashLink: provision.shopOpenQuickHashLink } : {}),
      ...(provision.warning ? { warning: provision.warning } : {}),
    },
    { headers }
  );
}
