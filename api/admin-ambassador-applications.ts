/**
 * طابور طلبات انضمام السفراء — أدمن.
 * GET قائمة | POST approve | reject
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  approveAmbassadorApplication,
  listAmbassadorApplications,
  rejectAmbassadorApplicationRemote,
} from './_lib/ambassadorApplicationService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

const ADMIN_PERMS = ['review_payments', 'manage_partner_billing', 'manage_partner_marketing'] as const;

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
    ...ADMIN_PERMS,
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const status = new URL(request.url).searchParams.get('status')?.trim() || '';
  const result = await listAmbassadorApplications(auth.supabase, status || undefined);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 500, headers });
  }
  return Response.json({ ok: true, rows: result.rows }, { headers });
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
    ...ADMIN_PERMS,
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();
  const id = String(body.applicationId ?? body.id ?? '').trim();
  if (!id) {
    return Response.json({ ok: false, error: 'missing_application_id' }, { status: 400, headers });
  }

  if (action === 'approve') {
    const result = await approveAmbassadorApplication(auth.supabase, {
      id,
      adminEmail: auth.actorEmail,
    });
    if (!result.ok) {
      const status =
        result.error === 'not_found'
          ? 404
          : result.error === 'not_pending_review'
            ? 409
            : 400;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json({ ok: true, row: result.row }, { headers });
  }

  if (action === 'reject') {
    const result = await rejectAmbassadorApplicationRemote(auth.supabase, {
      id,
      adminEmail: auth.actorEmail,
      reason: String(body.reason ?? ''),
    });
    if (!result.ok) {
      const status =
        result.error === 'not_found'
          ? 404
          : result.error === 'not_pending_review'
            ? 409
            : result.error === 'reject_reason_required'
              ? 400
              : 400;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json({ ok: true, row: result.row }, { headers });
  }

  return Response.json({ ok: false, error: 'unknown_action' }, { status: 400, headers });
}
