/**
 * GET /api/admin-pulse-map
 * Admin Pulse Map — live slot pulses + query controls metadata.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { PULSE_MAP_PHASE } from './_lib/pulseMapConfig.js';
import { buildPulseMapLivePayload } from './_lib/pulseMapLive.js';
import { PULSE_MAP_PILOT_REGIONS } from './_lib/pulseMapSlots.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function parseWindowMinutes(url: URL): number {
  const raw = url.searchParams.get('minutes');
  const n = raw ? Number.parseInt(raw, 10) : 120;
  if (!Number.isFinite(n)) return 120;
  return Math.min(720, Math.max(15, n));
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
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return Response.json({ ok: false, error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_command_center',
    'view_overview',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  try {
    const supabase = createClient(serverUrl, serviceRole, { auth: { persistSession: false } });
    const windowMinutes = parseWindowMinutes(new URL(request.url));
    const payload = await buildPulseMapLivePayload(
      supabase,
      PULSE_MAP_PHASE,
      PULSE_MAP_PILOT_REGIONS,
      { windowMinutes, includeAdmin: true },
    );
    return Response.json(payload, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Admin pulse map failed';
    return Response.json({ ok: false, error: msg }, { status: 502, headers });
  }
}
