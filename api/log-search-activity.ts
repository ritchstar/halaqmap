/**
 * POST /api/log-search-activity
 * تسجيل عملية بحث (زائر) في search_activity_logs عبر RPC آمنة.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { reverseGeocodeDistrictHint } from './_lib/reverseGeocodeHint.js';
import {
  broadcastPlatformRadarUserSearchServer,
  isKsaGeoPulse,
} from './_lib/platformRadarBroadcastServer.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

const ALLOWED_SCOPES = new Set(['district', 'city', 'service', 'geo_nearby', 'filter', 'composite']);

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function clampStr(s: unknown, max: number): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  return t.slice(0, max);
}

function asNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function asStrArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out = v.map((x) => String(x ?? '').trim()).filter(Boolean);
  return out.length ? out.map((s) => s.slice(0, 80)) : null;
}

function asFiltersJson(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const o = v as Record<string, unknown>;
  const safe: Record<string, unknown> = {};
  let n = 0;
  for (const [k, val] of Object.entries(o)) {
    if (n >= 24) break;
    n += 1;
    const key = k.slice(0, 40);
    if (typeof val === 'string') safe[key] = val.slice(0, 400);
    else if (typeof val === 'number' && Number.isFinite(val)) safe[key] = val;
    else if (typeof val === 'boolean') safe[key] = val;
    else if (val == null) safe[key] = null;
    else if (Array.isArray(val)) safe[key] = val.map((x) => String(x).slice(0, 80)).slice(0, 20);
  }
  return safe;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'log-search-activity',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      ready: url && serviceRole,
      registrationGuard: registrationGuardDiagnostics(),
      note: 'POST { queryText, scopeType, districtName?, cityName?, ... } — يُكمّل الحي/المدينة من الإحداثيات عند الحاجة.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'log-search-activity');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const b = body as Record<string, unknown>;
  const queryText = clampStr(b.queryText, 500);
  const scopeRaw = String(b.scopeType ?? '').trim().toLowerCase();
  if (!queryText || !ALLOWED_SCOPES.has(scopeRaw)) {
    return Response.json(
      { error: 'Invalid payload', hint: 'queryText (non-empty) and scopeType are required.' },
      { status: 400, headers },
    );
  }

  let districtName = clampStr(b.districtName, 200);
  let cityName = clampStr(b.cityName, 200);
  const serviceTags = asStrArray(b.serviceTags);
  const lat = asNum(b.userLat ?? (b.location && typeof b.location === 'object' ? (b.location as { lat?: unknown }).lat : null));
  const lng = asNum(b.userLng ?? (b.location && typeof b.location === 'object' ? (b.location as { lng?: unknown }).lng : null));
  const locationSharing =
    asBool(b.locationSharing) ||
    asBool(b.location && typeof b.location === 'object' ? (b.location as { sharing?: unknown }).sharing : false);
  const filtersJson = asFiltersJson(b.filters);
  const resultCount = asNum(b.resultCount);
  const rpcResultCount = asNum(b.rpcResultCount);

  const wantGeoHint =
    locationSharing &&
    lat != null &&
    lng != null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !districtName &&
    !cityName;

  if (wantGeoHint) {
    const hint = await reverseGeocodeDistrictHint(lat, lng);
    if (hint) {
      districtName = districtName || hint.districtName;
      cityName = cityName || hint.cityName;
    }
  }

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: rpcId, error } = await supabase.rpc('log_search_activity', {
    p_query_text: queryText,
    p_scope_type: scopeRaw,
    p_district_name: districtName,
    p_city_name: cityName,
    p_service_tags: serviceTags,
    p_user_lat: lat,
    p_user_lng: lng,
    p_location_sharing: locationSharing,
    p_filters_json: filtersJson,
    p_result_count: resultCount,
    p_rpc_result_count: rpcResultCount,
  });

  if (error) {
    return Response.json({ error: error.message || 'log_search_activity failed' }, { status: 502, headers });
  }

  const logId = rpcId != null ? String(rpcId) : null;

  // Fire-and-forget broadcast: the DB trigger handles realtime delivery in normal
  // operation. This server-side fallback never blocks the API response — it runs
  // in the background and silently fails if the channel is unreachable. Disable
  // entirely by setting PLATFORM_RADAR_DISABLE_API_BROADCAST=1 in production once
  // the DB trigger is verified healthy.
  const apiBroadcastDisabled =
    String(process.env.PLATFORM_RADAR_DISABLE_API_BROADCAST || '').trim() === '1';

  if (
    !apiBroadcastDisabled &&
    logId &&
    lat != null &&
    lng != null &&
    isKsaGeoPulse(lat, lng)
  ) {
    const label = [districtName, cityName].filter(Boolean).join(' · ') || scopeRaw;
    void broadcastPlatformRadarUserSearchServer(
      supabase,
      {
        id: logId,
        kind: 'user_search',
        lat,
        lng,
        createdAt: new Date().toISOString(),
        label,
        suspicious:
          (resultCount != null && resultCount === 0) ||
          (rpcResultCount != null && rpcResultCount === 0) ||
          scopeRaw === 'filter' ||
          scopeRaw === 'composite',
        scopeType: scopeRaw,
      },
      serviceRole,
    ).catch(() => undefined);
  }

  return Response.json({ ok: true, id: logId }, { headers });
}