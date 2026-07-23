import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mapShowcaseRowToApiPayload, resolveShowcaseFallbackForPublic } from './_lib/platformShowcasePreview.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { normalizeSaudiMobileForWa } from './_lib/saudiWhatsAppPhone.js';

export const config = {
  maxDuration: 30,
};

const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 100;
const DEFAULT_LIMIT = 120;
const MAX_LIMIT = 200;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
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

function sanitizePublicBarberRows(rows: unknown): unknown[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const row = { ...(raw as Record<string, unknown>) };
      const uid = row.user_id;
      const uidStr = typeof uid === 'string' ? uid.trim() : '';
      if (typeof row.account_linked !== 'boolean') {
        row.account_linked = Boolean(uidStr);
      }
      delete row.user_id;
      if (typeof row.phone === 'string') {
        const n = normalizeSaudiMobileForWa(row.phone);
        if (n) row.phone = `+${n}`;
      }
      return row;
    })
    .filter(Boolean);
}

async function attachWorkingHoursToRows(
  supabase: SupabaseClient,
  rows: unknown[],
): Promise<unknown[]> {
  const ids = rows
    .map((r) =>
      r && typeof r === 'object' ? String((r as { id?: unknown }).id ?? '').trim() : '',
    )
    .filter(Boolean);
  if (ids.length === 0) return rows;
  try {
    const { loadWorkingHoursSlotsForBarbers } = await import('./_lib/barberWorkingHoursSync.js');
    const map = await loadWorkingHoursSlotsForBarbers(supabase, ids);
    return rows.map((raw) => {
      if (!raw || typeof raw !== 'object') return raw;
      const row = { ...(raw as Record<string, unknown>) };
      const id = String(row.id ?? '');
      const slots = map.get(id);
      if (slots && slots.length) {
        row.weekly_working_hours = slots;
      }
      return row;
    });
  } catch (err) {
    console.error('[public-barbers] attach_working_hours_failed', err);
    return rows;
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/**
 * /api/public-barbers
 * - الوضع العادي: يرجع الحلاقين النشطين ذوي الإحداثيات.
 * - وضع التشخيص: /api/public-barbers?health=1
 */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
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
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 90 });
  if (!secGuard.allowed) return secGuard.response;

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
    const sanitized = await attachWorkingHoursToRows(
      supabase,
      sanitizePublicBarberRows(data ?? []),
    );
    if (sanitized.length === 0) {
      const fallback = await resolveShowcaseFallbackForPublic(supabase);
      if (fallback.ok) {
        return Response.json(
          {
            ok: true,
            mode: 'nearby_rpc_showcase_fallback',
            rows: [mapShowcaseRowToApiPayload(fallback.row)],
            showcase_fallback: true,
            education_intro_ar: fallback.educationIntroAr,
          },
          { headers },
        );
      }
    }
    return Response.json({ ok: true, mode: 'nearby_rpc', rows: sanitized }, { headers });
  }

  // fallback عام عند عدم توفر إحداثيات مستخدم
  const { data, error } = await supabase
    .from('barbers_public_directory')
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
      specialties,
      inclusive_care_offered,
      inclusive_care_price_sar,
      inclusive_care_public_visible,
      inclusive_care_restrict_days,
      inclusive_care_days,
      inclusive_care_customer_note,
      open_for_customers,
      user_id,
      has_active_subscription,
      gallery_count,
      featured_images
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

  return Response.json(
    {
      ok: true,
      mode: 'fallback_recent',
      rows: await attachWorkingHoursToRows(supabase, sanitizePublicBarberRows(data ?? [])),
    },
    { headers },
  );
}
