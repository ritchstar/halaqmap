/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة موارد المنصة + عمليات التنظيف — عبر service_role بعد تحقق JWT admin.
 */
import {
  isBootstrapAdminEmail,
  verifyActivePlatformAdminFromRequest,
} from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 60,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

type PurgeOp = 'purge_registration' | 'purge_promo' | 'purge_logs';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyActivePlatformAdminFromRequest(request, env.url, env.serviceRole);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  const { data, error } = await gate.supabase.rpc('get_platform_resource_snapshot');
  if (error) {
    return json({ error: error.message || 'snapshot_failed' }, 502, request);
  }

  return json({ ok: true, data }, 200, request);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyActivePlatformAdminFromRequest(request, env.url, env.serviceRole);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  if (!isBootstrapAdminEmail(gate.actorEmail)) {
    return json({ error: 'Forbidden: bootstrap platform admin required for purge operations' }, 403, request);
  }

  let body: { op?: PurgeOp; days?: number } = {};
  try {
    body = (await request.json()) as { op?: PurgeOp; days?: number };
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const op = body.op;
  if (op !== 'purge_registration' && op !== 'purge_promo' && op !== 'purge_logs') {
    return json({ error: 'Invalid op' }, 400, request);
  }

  if (op === 'purge_registration') {
    const { data, error } = await gate.supabase.rpc('admin_purge_registration_storage_objects');
    if (error) return json({ error: error.message || 'purge_failed' }, 502, request);
    return json({ ok: true, data }, 200, request);
  }

  if (op === 'purge_promo') {
    const { data, error } = await gate.supabase.rpc('admin_purge_partner_promo_storage_objects');
    if (error) return json({ error: error.message || 'purge_failed' }, 502, request);
    return json({ ok: true, data }, 200, request);
  }

  const days = Number(body.days ?? 30);
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    return json({ error: 'Invalid days' }, 400, request);
  }

  const { data, error } = await gate.supabase.rpc('admin_purge_old_platform_logs', { p_days: Math.floor(days) });
  if (error) return json({ error: error.message || 'purge_failed' }, 502, request);
  return json({ ok: true, data }, 200, request);
}
