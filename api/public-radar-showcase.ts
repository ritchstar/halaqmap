/**
 * GET /api/public-radar-showcase
 * Sanitized live/curated payload for the public Showcase Radar landing page.
 */
import { createClient } from '@supabase/supabase-js';
import { buildShowcaseRadarPayload } from './_lib/showcaseRadarLib.js';
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
      'Cache-Control': 'public, max-age=20, s-maxage=20, stale-while-revalidate=40',
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

  const secGuard = await runSecurityGuard(request, { sensitiveRoute: false });
  if (!secGuard.allowed) return secGuard.response;

  const headers = corsHeaders(request);
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceKey) {
    return json({ ok: false, error: 'Server not configured' }, 503, headers);
  }

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const payload = await buildShowcaseRadarPayload(supabase);
    return json(payload, 200, headers);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Showcase radar failed';
    return json({ ok: false, error: msg }, 502, headers);
  }
}
