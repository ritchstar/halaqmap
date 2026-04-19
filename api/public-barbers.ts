import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard';

export const config = {
  maxDuration: 30,
};

const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 100;
const DEFAULT_LIMIT = 120;
const MAX_LIMIT = 200;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon, x-client-supabase-url',
    'Access-Control-Max-Age': '86400',
  };
}

function isTruthyBoolean(raw: string | null): boolean {
  if (!raw) return false;
  return raw === '1' || raw.toLowerCase() === 'true';
}

function parseFinite(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/**
 * /api/public-barbers
 * - الوضع العادي: يرجع الحلاقين النشطين ذوي الإحداثيات.
 * - وضع التشخيص: /api/public-barbers?health=1
 */
export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const requestUrl = new URL(request.url);
  const isHealth = isTruthyBoolean(requestUrl.searchParams.get('health'));
  const lat = parseFinite(requestUrl.searchParams.get('lat'));
  const lng = parseFinite(requestUrl.searchParams.get('lng'));
  const radiusKm = clamp(
    parseFinite(requestUrl.searchParams.get('radius_km')) ?? DEFAULT_RADIUS_KM,
    1,
    MAX_RADIUS_KM
  );
  const limit = clamp(
    Math.floor(parseFinite(requestUrl.searchParams.get('limit')) ?? DEFAULT_LIMIT),
    1,
    MAX_LIMIT
  );
  const offset = Math.max(0, Math.floor(parseFinite(requestUrl.searchParams.get('offset')) ?? 0));
  const minRating = clamp(parseFinite(requestUrl.searchParams.get('min_rating')) ?? 0, 0, 5);
  const tiersRaw = (requestUrl.searchParams.get('tiers') || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x === 'bronze' || x === 'gold' || x === 'diamond');
  const tiers = tiersRaw.length > 0 ? tiersRaw : null;

  if (isHealth) {
    return Response.json(
      {
        ok: true,
        route: 'public-barbers',
        supabaseUrlSet: Boolean(url),
        serviceRoleKeySet: Boolean(serviceRole),
        anonKeySetForVerification: Boolean(expectedAnon),
        ready: Boolean(url && serviceRole && expectedAnon),
        publicApiGuard: registrationGuardDiagnostics(),
      },
      { headers }
    );
  }

  const guard = runRegistrationRouteGuards(request, 'public-barbers-get');
  if (!guard.ok) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  if (!expectedAnon) {
    return Response.json(
      {
        error: 'Server not configured (anon key required)',
        hint: 'Set SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY on Vercel to match the browser x-supabase-anon header.',
      },
      { status: 503, headers }
    );
  }

  const providedAnon = request.headers.get('x-supabase-anon')?.trim() || '';
  if (providedAnon !== expectedAnon) {
    return Response.json(
      {
        error: 'Unauthorized',
        hint:
          'Set SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) on Vercel to match browser anon key.',
      },
      { status: 401, headers }
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // المسار السريع/الدقيق: بحث قريب مرتب على الخادم (PostGIS + score هجين)
  if (lat !== null && lng !== null) {
    const { data, error } = await supabase.rpc('search_barbers_nearby', {
      p_lat: lat,
      p_lng: lng,
      p_radius_km: radiusKm,
      p_limit: limit,
      p_offset: offset,
      p_tiers: tiers,
      p_min_rating: minRating,
    });
    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers });
    }
    return Response.json({ ok: true, mode: 'nearby_rpc', rows: data ?? [] }, { headers });
  }

  // fallback عام عند عدم توفر إحداثيات مستخدم
  const { data, error } = await supabase
    .from('barbers')
    .select(
      `
      id,
      name,
      phone,
      latitude,
      longitude,
      address,
      tier,
      rating,
      total_reviews,
      profile_image,
      cover_image,
      is_active,
      is_verified,
      specialties
      `
    )
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }

  return Response.json({ ok: true, mode: 'fallback_recent', rows: data ?? [] }, { headers });
}
