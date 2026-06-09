/**
 * GET /api/admin-radar-pulses
 * Live tactical pulses for Platform Radar (security events only after removing search geo logging).
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

  const [securityRes] = await Promise.all([
    supabase
      .from('platform_booking_security_log')
      .select('id, created_at, severity, event_code, message, barber_id')
      .gte('created_at', sinceSecurity)
      .order('created_at', { ascending: false })
      .limit(120),
  ]);

  if (securityRes.error) {
    return Response.json({ error: securityRes.error.message || 'Security pulse query failed' }, { status: 500, headers });
  }

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

  const userPulses: {
    id: string;
    kind: 'user_search';
    lat: number;
    lng: number;
    createdAt: string;
    label: string;
    suspicious: boolean;
    scopeType: string;
  }[] = [];

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
