/**
 * GET /api/admin-radar-pulses
 * Live geo pulses for Platform Radar tactical map (search activity + security events).
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type UserSearchRow = {
  id: string;
  created_at: string;
  search_log_id: string | null;
  user_lat: number;
  user_lng: number;
  district_name: string | null;
  city_name: string | null;
  scope_type: string;
  suspicious: boolean;
};

type SearchRow = {
  id: string;
  created_at: string;
  user_lat: number | null;
  user_lng: number | null;
  district_name: string | null;
  city_name: string | null;
  scope_type: string;
  result_count: number | null;
  rpc_result_count: number | null;
  location_sharing: boolean;
};

type SecurityRow = {
  id: string;
  created_at: string;
  severity: string;
  event_code: string;
  message: string | null;
  barber_id: string | null;
};

type BarberCoordRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
};

function isInKsa(lat: number, lng: number): boolean {
  return lat >= 16 && lat <= 33.5 && lng >= 34 && lng <= 56.5;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

function markSuspiciousSearchRows(rows: SearchRow[]): Map<string, boolean> {
  const freq = new Map<string, number>();
  for (const r of rows) {
    const lat = r.user_lat;
    const lng = r.user_lng;
    if (lat == null || lng == null) continue;
    const k = coordKey(lat, lng);
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }

  const out = new Map<string, boolean>();
  for (const r of rows) {
    const lat = r.user_lat;
    const lng = r.user_lng;
    if (lat == null || lng == null) {
      out.set(r.id, false);
      continue;
    }
    const zeroResults =
      (r.result_count != null && r.result_count === 0) ||
      (r.rpc_result_count != null && r.rpc_result_count === 0);
    const rapidCluster = (freq.get(coordKey(lat, lng)) ?? 0) >= 3;
    const probeScope = r.scope_type === 'filter' || r.scope_type === 'composite';
    out.set(r.id, zeroResults || rapidCluster || probeScope);
  }
  return out;
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
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_command_center',
    'view_overview',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  const urlObj = new URL(request.url);
  const minutesRaw = Number(urlObj.searchParams.get('minutes') ?? 120);
  const minutes = Number.isFinite(minutesRaw) ? Math.min(360, Math.max(15, minutesRaw)) : 120;
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const sinceSecurity = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const supabase = adminAuth.supabase;

  const [searchRes, userSearchRes, securityRes] = await Promise.all([
    supabase
      .from('search_activity_logs')
      .select(
        'id, created_at, user_lat, user_lng, district_name, city_name, scope_type, result_count, rpc_result_count, location_sharing',
      )
      .gte('created_at', since)
      .not('user_lat', 'is', null)
      .not('user_lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(400),
    supabase
      .from('user_searches')
      .select('id, created_at, search_log_id, user_lat, user_lng, district_name, city_name, scope_type, suspicious')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(400),
    supabase
      .from('platform_booking_security_log')
      .select('id, created_at, severity, event_code, message, barber_id')
      .gte('created_at', sinceSecurity)
      .order('created_at', { ascending: false })
      .limit(120),
  ]);

  if (searchRes.error) {
    return Response.json({ error: searchRes.error.message || 'Search pulse query failed' }, { status: 500, headers });
  }
  if (securityRes.error) {
    return Response.json({ error: securityRes.error.message || 'Security pulse query failed' }, { status: 500, headers });
  }

  const searchRows = (searchRes.data ?? []) as SearchRow[];
  const userSearchRows = userSearchRes.error ? [] : ((userSearchRes.data ?? []) as UserSearchRow[]);
  const suspiciousMap = markSuspiciousSearchRows(searchRows);

  const securityRows = (securityRes.data ?? []) as SecurityRow[];
  const barberIds = [
    ...new Set(securityRows.map((r) => r.barber_id).filter((id): id is string => Boolean(id))),
  ];

  const barberCoordById = new Map<string, BarberCoordRow>();
  if (barberIds.length > 0) {
    const barbersRes = await supabase
      .from('barbers')
      .select('id, latitude, longitude, city')
      .in('id', barberIds);
    if (!barbersRes.error) {
      for (const row of (barbersRes.data ?? []) as BarberCoordRow[]) {
        barberCoordById.set(row.id, row);
      }
    }
  }

  const userPulsesFromLogs = searchRows
    .filter((r) => {
      const lat = r.user_lat;
      const lng = r.user_lng;
      return lat != null && lng != null && isInKsa(lat, lng);
    })
    .map((r) => ({
      id: r.id,
      kind: 'user_search' as const,
      lat: r.user_lat as number,
      lng: r.user_lng as number,
      createdAt: r.created_at,
      label: [r.district_name, r.city_name].filter(Boolean).join(' · ') || r.scope_type,
      suspicious: suspiciousMap.get(r.id) ?? false,
      scopeType: r.scope_type,
    }));

  const userPulsesFromRadar = userSearchRows
    .filter((r) => isInKsa(r.user_lat, r.user_lng))
    .map((r) => ({
      id: r.id,
      kind: 'user_search' as const,
      lat: r.user_lat,
      lng: r.user_lng,
      createdAt: r.created_at,
      label: [r.district_name, r.city_name].filter(Boolean).join(' · ') || r.scope_type,
      suspicious: r.suspicious,
      scopeType: r.scope_type,
    }));

  const userPulseById = new Map<string, (typeof userPulsesFromRadar)[number]>();
  for (const p of userPulsesFromLogs) userPulseById.set(p.id, p);
  for (const p of userPulsesFromRadar) userPulseById.set(p.id, p);
  const userPulses = [...userPulseById.values()];

  const securityPulses = securityRows
    .map((r) => {
      const barber = r.barber_id ? barberCoordById.get(r.barber_id) : undefined;
      const lat = barber?.latitude;
      const lng = barber?.longitude;
      if (lat == null || lng == null || !isInKsa(lat, lng)) return null;
      return {
        id: r.id,
        kind: 'security' as const,
        lat,
        lng,
        createdAt: r.created_at,
        label: r.message || r.event_code,
        suspicious: true,
        severity: r.severity,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p != null);

  const pulses = [...userPulses, ...securityPulses].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  return Response.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      windowMinutes: minutes,
      userPulseCount: userPulses.length,
      suspiciousCount: pulses.filter((p) => p.suspicious).length,
      pulses,
    },
    { status: 200, headers: { ...headers, 'Cache-Control': 'private, no-store, max-age=0' } },
  );
}
