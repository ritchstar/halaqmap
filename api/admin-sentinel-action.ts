import { verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { clientIpFromRequest } from './_lib/adminSentinelRequest.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { ADMIN_SENTINEL_UI_HEADER, assertSentinelUiHeader } from './_lib/adminSentinelClientHeader.js';
import { rejectIfSentinelProductionPublicOriginsMisconfigured } from './_lib/adminSentinelProductionCorsPolicy.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: `Content-Type, Authorization, x-client-supabase-url, x-supabase-anon, x-ops-password, ${ADMIN_SENTINEL_UI_HEADER}`,
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

const ALLOWED_TYPES = new Set([
  'alert_barber',
  'flag_tier_review',
  'security_note',
  'noop',
]);

export async function OPTIONS(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const ui = assertSentinelUiHeader(request);
  if (!ui.ok) {
    return Response.json(ui.json, { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const guard = runRegistrationRouteGuards(request, 'admin-sentinel-action');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'manage_command_center');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  const expected = (process.env.ADMIN_SENTINEL_OPS_PASSWORD || '').trim();
  if (!expected) {
    return Response.json(
      {
        error: 'Operations password not configured',
        hint: 'عيّن ADMIN_SENTINEL_OPS_PASSWORD على خادم Vercel قبل تفعيل العمليات السيادية.',
      },
      { status: 503, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const opsFromHeader = (request.headers.get('x-ops-password') || '').trim();
  const opsFromBody = String((body as { opsPassword?: unknown }).opsPassword ?? '').trim();
  const ops = opsFromHeader || opsFromBody;
  if (ops !== expected) {
    return Response.json({ error: 'Invalid operations password' }, { status: 401, headers });
  }

  const actionType = String((body as { actionType?: unknown }).actionType ?? '').trim();
  if (!ALLOWED_TYPES.has(actionType)) {
    return Response.json(
      { error: 'Unknown actionType', allowed: [...ALLOWED_TYPES] },
      { status: 400, headers },
    );
  }

  const detail = (body as { detail?: unknown }).detail;
  const safeDetail =
    detail && typeof detail === 'object' && !Array.isArray(detail) ? (detail as Record<string, unknown>) : {};

  const ua = (request.headers.get('user-agent') || '').slice(0, 512);
  const ip = clientIpFromRequest(request);

  const { error } = await adminAuth.supabase.from('admin_actions_log').insert({
    actor_email: adminAuth.actorEmail,
    action_type: actionType,
    detail: { ...safeDetail, source: 'admin_sentinel_ui' },
    client_ip: ip,
    client_user_agent: ua,
  });

  if (error) {
    return Response.json({ error: error.message || 'Log insert failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true, logged: true, actionType }, { headers });
}
