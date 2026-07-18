/**
 * GET /api/public-pulse-map
 * Slot-based live map payload for the new Pulse Map (public).
 */
import { createClient } from '@supabase/supabase-js';
import { buildPulseMapPayload } from './_lib/pulseMapLib.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 25 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=30',
      ...headers,
    },
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const routeGuard = runRegistrationRouteGuards(request, 'public-pulse-map');
  if (routeGuard.ok === false) {
    return Response.json(routeGuard.json, { status: routeGuard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 60 });
  if (!secGuard.allowed) return secGuard.response;
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceKey) {
    return json({ ok: false, error: 'Server not configured' }, 503, headers);
  }

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const payload = await buildPulseMapPayload(supabase);
    return json(payload, 200, headers);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Pulse map failed';
    return json({ ok: false, error: msg }, 502, headers);
  }
}
