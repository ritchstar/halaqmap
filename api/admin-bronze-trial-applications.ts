/**
 * إدارة طابور طلبات تجربة برونزي.
 * GET قائمة | POST action: approve | reject | resend_code | resend_confirm
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  adminConfirmBronzeTrialApplicationEmail,
  approveBronzeTrialApplication,
  rejectBronzeTrialApplication,
  resendBronzeTrialCodeEmail,
  resendBronzeTrialConfirmEmail,
} from './_lib/bronzeTrialApplicationService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 45 };

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

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'review_payments',
    'manage_partner_billing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const status = new URL(request.url).searchParams.get('status')?.trim() || '';
  let q = auth.supabase
    .from('bronze_trial_applications')
    .select(
      'id, status, salon_name, establishment_name, email, phone, whatsapp, city_ar, district_ar, region_ar, latitude, longitude, notes, photo_exterior_sign_url, photo_exterior_2_url, photo_interior_1_url, photo_interior_2_url, email_confirmed_at, reviewed_at, reviewed_by_admin_email, reject_reason, code_emailed_at, code_email_count, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(80);

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500, headers });
  return Response.json({ ok: true, rows: data ?? [] }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'review_payments',
    'manage_partner_billing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  let body: { action?: unknown; applicationId?: unknown; reason?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim().toLowerCase();
  const applicationId = String(body.applicationId ?? '').trim();

  if (action === 'approve') {
    const result = await approveBronzeTrialApplication(auth.supabase, {
      applicationId,
      adminEmail: auth.actorEmail,
    });
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
    }
    return Response.json(
      {
        ok: true,
        plaintextCode: result.plaintextCode,
        emailSent: result.emailSent,
        hint: 'انسخ الكود إن لم يُرسل البريد — يظهر مرة واحدة هنا.',
      },
      { headers },
    );
  }

  if (action === 'reject') {
    const result = await rejectBronzeTrialApplication(auth.supabase, {
      applicationId,
      adminEmail: auth.actorEmail,
      reason: String(body.reason ?? ''),
    });
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'resend_code') {
    const result = await resendBronzeTrialCodeEmail(auth.supabase, {
      applicationId,
      adminEmail: auth.actorEmail,
    });
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true, plaintextCode: result.plaintextCode }, { headers });
  }

  if (action === 'resend_confirm') {
    const result = await resendBronzeTrialConfirmEmail(auth.supabase, applicationId);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'mark_email_confirmed') {
    const result = await adminConfirmBronzeTrialApplicationEmail(auth.supabase, applicationId);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  return Response.json({ ok: false, error: 'invalid_action' }, { status: 400, headers });
}
