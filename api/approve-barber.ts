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

  // مصدر الحقيقة: طلب التجربة المعتمد (أو أقدم تسجيل) — اسم/جوال/صور/إحداثيات
  try {
    const { applyRegistrationIdentityToBarber } = await import('./_lib/bronzeTrialGeoSync.js');
    const email = String((wl.row as { email?: unknown }).email ?? '').trim();
    const identity = await applyRegistrationIdentityToBarber(supabase, {
      barberId: provision.barberId,
      email,
    });
    if (!identity.ok) {
      console.error('[approve-barber] identity_source_sync_failed', identity.error);
    }
  } catch (err) {
    console.error('[approve-barber] identity_source_sync_threw', err);
  }

  // أوقات العمل من طلب التسجيل → البنر/التفاصيل العامة
  try {
    const email = String((wl.row as { email?: unknown }).email ?? '').trim().toLowerCase();
    let payload: Record<string, unknown> | null = null;
    if (email.includes('@')) {
      const { data: sub } = await supabase
        .from('registration_submissions')
        .select('payload')
        .or(`payload->>email.eq.${email},payload->>linkedBarberId.eq.${provision.barberId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub?.payload && typeof sub.payload === 'object' && !Array.isArray(sub.payload)) {
        payload = sub.payload as Record<string, unknown>;
      }
    }
    if (payload) {
      const { syncBarberWorkingHoursFromRegistrationPayload } = await import(
        './_lib/barberWorkingHoursSync.js'
      );
      const wh = await syncBarberWorkingHoursFromRegistrationPayload(
        supabase,
        provision.barberId,
        payload,
      );
      if (!wh.ok) {
        console.error('[approve-barber] working_hours_sync_failed', wh.error);
      }
    }
  } catch (err) {
    console.error('[approve-barber] working_hours_sync_threw', err);
  }

  // ضمان إدراج نشط (قسائم مدفوعة / تجربة / برونزي افتراضي) حتى يظهر في البحث
  try {
    const { ensureBronzeListingAfterRegistrationApprove } = await import(
      './_lib/listingLicenseService.js'
    );
    const email = String((wl.row as { email?: unknown }).email ?? '').trim().toLowerCase();
    let registrationRequestId: string | null = null;
    if (email.includes('@')) {
      const { data: sub } = await supabase
        .from('registration_submissions')
        .select('id')
        .or(`payload->>email.eq.${email},payload->>linkedBarberId.eq.${provision.barberId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      registrationRequestId = String((sub as { id?: string } | null)?.id ?? '').trim() || null;
    }
    const listing = await ensureBronzeListingAfterRegistrationApprove(supabase, {
      barberId: provision.barberId,
      registrationRequestId,
    });
    if (!listing.ok) {
      console.error('[approve-barber] listing_ensure_failed', listing.error);
    }
  } catch (err) {
    console.error('[approve-barber] listing_ensure_threw', err);
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
