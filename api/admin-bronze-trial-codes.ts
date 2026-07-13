/**
 * توليد أكواد تجربة برونزي (إدارة).
 * POST + جلسة إدارية + review_payments أو manage_partner_billing
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { issueBronzeTrialCodes } from './_lib/bronzeTrialCodeService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

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

  const { data, error } = await auth.supabase
    .from('bronze_trial_codes')
    .select(
      'id, status, created_at, created_by_admin_email, note, redeemed_at, redeemed_barber_id, redeemed_registration_request_id',
    )
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers });
  }

  return Response.json({ ok: true, rows: data ?? [] }, { status: 200, headers });
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

  let body: { count?: unknown; note?: unknown };
  try {
    body = (await request.json()) as { count?: unknown; note?: unknown };
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const count = Math.min(50, Math.max(1, Number(body.count) || 1));
  const note = String(body.note ?? '').trim();

  const result = await issueBronzeTrialCodes(auth.supabase, {
    count,
    adminEmail: auth.actorEmail,
    note: note || null,
  });

  if (!result.ok) {
    const status =
      result.error === 'voucher_pepper_not_configured'
        ? 503
        : result.error === 'code_insert_failed'
          ? 500
          : 500;
    return Response.json({ ok: false, error: result.error }, { status, headers });
  }

  return Response.json(
    {
      ok: true,
      count: result.count,
      codes: result.codes,
      hint: 'انسخ الأكواد الآن — لن تُعرض كنص صريح لاحقاً (بصمة فقط في قاعدة البيانات).',
    },
    { status: 200, headers },
  );
}
