/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * /api/public-coiffeur-listings
 * استعلام كوافير ماب فقط — لا يقرأ barbers_public_directory ولا search_barbers_nearby.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { normalizeSaudiMobileForWa } from './_lib/saudiWhatsAppPhone.js';
import {
  COIFFEUR_LISTING_SECTOR,
  haversineKm,
  isCoiffeurWomenListing,
  listingMatchesCoiffeurIntent,
} from './_lib/coiffeurListingSector.js';

export const config = {
  maxDuration: 30,
};

const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 100;
const DEFAULT_LIMIT = 80;
const MAX_LIMIT = 120;

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

type DirectoryRow = {
  id?: unknown;
  name?: unknown;
  phone?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  address?: unknown;
  tier?: unknown;
  cover_image?: unknown;
  profile_image?: unknown;
  specialties?: unknown;
  listing_sector?: unknown;
  open_for_customers?: unknown;
  featured_images?: unknown;
};

function sanitizeCoiffeurRow(raw: DirectoryRow, distanceKm: number | null): Record<string, unknown> | null {
  if (!isCoiffeurWomenListing(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name) return null;
  const lat = typeof raw.latitude === 'number' ? raw.latitude : Number(raw.latitude);
  const lng = typeof raw.longitude === 'number' ? raw.longitude : Number(raw.longitude);
  const specialties = Array.isArray(raw.specialties)
    ? raw.specialties.filter((c): c is string => typeof c === 'string')
    : [];
  let phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  const n = phone ? normalizeSaudiMobileForWa(phone) : null;
  if (n) phone = `+${n}`;
  const featured = Array.isArray(raw.featured_images)
    ? raw.featured_images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  return {
    id,
    name,
    phone,
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    address: typeof raw.address === 'string' ? raw.address : '',
    tier: raw.tier === 'gold' || raw.tier === 'diamond' ? raw.tier : 'bronze',
    cover_image: typeof raw.cover_image === 'string' ? raw.cover_image : null,
    profile_image: typeof raw.profile_image === 'string' ? raw.profile_image : null,
    featured_images: featured,
    specialties,
    listing_sector: COIFFEUR_LISTING_SECTOR,
    sector: COIFFEUR_LISTING_SECTOR,
    open_for_customers: raw.open_for_customers !== false,
    distance_km: distanceKm,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

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
    MAX_RADIUS_KM,
  );
  const limit = clamp(
    Math.floor(parseFinite(requestUrl.searchParams.get('limit')) ?? DEFAULT_LIMIT),
    1,
    MAX_LIMIT,
  );
  const intent = (requestUrl.searchParams.get('intent') || 'near_open').trim().toLowerCase();

  if (isHealth) {
    return Response.json(
      {
        ok: true,
        route: 'public-coiffeur-listings',
        supabaseUrlSet: Boolean(url),
        serviceRoleKeySet: Boolean(serviceRole),
        anonKeySetForVerification: Boolean(expectedAnon),
        ready: Boolean(url && serviceRole && expectedAnon),
        publicApiGuard: registrationGuardDiagnostics(),
      },
      { headers },
    );
  }

  const guard = runRegistrationRouteGuards(request, 'public-coiffeur-listings-get');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 90 });
  if (!secGuard.allowed) return secGuard.response;

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }
  if (!expectedAnon) {
    return Response.json(
      {
        error: 'Server not configured (anon key required)',
        hint: 'Set SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY on Vercel to match the browser x-supabase-anon header.',
      },
      { status: 503, headers },
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
      { status: 401, headers },
    );
  }

  if (lat === null || lng === null) {
    return Response.json(
      { ok: true, mode: 'coords_required', rows: [], isolatedFromMensBarbers: true },
      { headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('coiffeur_public_directory')
    .select(
      `
      id,
      name,
      phone,
      latitude,
      longitude,
      address,
      tier,
      cover_image,
      profile_image,
      specialties,
      listing_sector,
      open_for_customers,
      featured_images
      `,
    )
    .eq('listing_sector', COIFFEUR_LISTING_SECTOR)
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(200);

  if (error) {
    return Response.json({ error: error.message, isolatedFromMensBarbers: true }, { status: 500, headers });
  }

  const ranked = (data ?? [])
    .map((raw) => {
      const row = raw as DirectoryRow;
      const rowLat = typeof row.latitude === 'number' ? row.latitude : Number(row.latitude);
      const rowLng = typeof row.longitude === 'number' ? row.longitude : Number(row.longitude);
      if (!Number.isFinite(rowLat) || !Number.isFinite(rowLng)) return null;
      const distanceKm = haversineKm(lat, lng, rowLat, rowLng);
      if (distanceKm > radiusKm) return null;
      const specialties = Array.isArray(row.specialties)
        ? row.specialties.filter((c): c is string => typeof c === 'string')
        : [];
      if (
        !listingMatchesCoiffeurIntent({
          specialties,
          intent,
          openForCustomers: row.open_for_customers !== false,
        })
      ) {
        return null;
      }
      return sanitizeCoiffeurRow(row, Math.round(distanceKm * 10) / 10);
    })
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .sort((a, b) => Number(a.distance_km ?? 999) - Number(b.distance_km ?? 999))
    .slice(0, limit);

  return Response.json(
    {
      ok: true,
      mode: 'coiffeur_nearby',
      rows: ranked,
      isolatedFromMensBarbers: true,
    },
    { headers },
  );
}
