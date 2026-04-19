import { IMAGES } from '@/assets/images';
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';

const FALLBACK_IMAGE = IMAGES.BARBER_SHOP_1;
const PUBLIC_BARBERS_API = '/api/public-barbers';
const DEFAULT_RADIUS_KM = 25;
const DEFAULT_LIMIT = 120;

const DEFAULT_WORKING_HOURS: Barber['workingHours'] = [
  { day: 'السبت', open: '09:00', close: '22:00' },
  { day: 'الأحد', open: '09:00', close: '22:00' },
  { day: 'الاثنين', open: '09:00', close: '22:00' },
  { day: 'الثلاثاء', open: '09:00', close: '22:00' },
  { day: 'الأربعاء', open: '09:00', close: '22:00' },
  { day: 'الخميس', open: '09:00', close: '22:00' },
  { day: 'الجمعة', open: '14:00', close: '22:00' },
];

function tierFromDb(t: string | null): SubscriptionTier {
  if (t === SubscriptionTier.GOLD) return SubscriptionTier.GOLD;
  if (t === SubscriptionTier.DIAMOND) return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

type BarberRow = {
  id: string;
  name: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  tier: string | null;
  rating: number | null;
  total_reviews: number | null;
  profile_image: string | null;
  cover_image: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  specialties: string[] | null;
};

export type NearbySearchInput = {
  userLocation: { lat: number; lng: number };
  radiusKm?: number;
  limit?: number;
  minRating?: number;
  tiers?: SubscriptionTier[];
  offset?: number;
};

function getPublicBarbersEndpoint(): string {
  return String(import.meta.env.VITE_PUBLIC_BARBERS_URL || PUBLIC_BARBERS_API).trim();
}

function mapRow(row: BarberRow): Barber {
  const lat = row.latitude ?? 0;
  const lng = row.longitude ?? 0;
  const imgs = [row.cover_image, row.profile_image].filter((u): u is string => Boolean(u && u.trim()));
  const images = imgs.length > 0 ? imgs : [FALLBACK_IMAGE];
  const phone = row.phone?.trim() || '';
  const categories = Array.isArray(row.specialties) ? row.specialties.filter(Boolean) : [];

  return {
    id: row.id,
    name: row.name,
    phone,
    whatsapp: phone,
    location: {
      lat,
      lng,
      address: row.address?.trim() || '',
    },
    subscription: tierFromDb(row.tier),
    rating: Number(row.rating) || 0,
    reviewCount: Math.max(0, Math.floor(Number(row.total_reviews) || 0)),
    images,
    services: [{ name: 'للاستفسار والأسعار — تواصل مباشرة', price: 0 }],
    workingHours: DEFAULT_WORKING_HOURS,
    isOpen: row.is_active !== false,
    verified: row.is_verified === true,
    categories,
  };
}

function normalizedNearbyInput(input: NearbySearchInput): Required<Omit<NearbySearchInput, 'tiers'>> & {
  tiers?: SubscriptionTier[];
} {
  return {
    userLocation: input.userLocation,
    radiusKm: Math.min(100, Math.max(1, Number(input.radiusKm) || DEFAULT_RADIUS_KM)),
    limit: Math.min(200, Math.max(1, Math.floor(Number(input.limit) || DEFAULT_LIMIT))),
    minRating: Math.min(5, Math.max(0, Number(input.minRating) || 0)),
    offset: Math.max(0, Math.floor(Number(input.offset) || 0)),
    tiers: input.tiers?.length ? input.tiers : undefined,
  };
}

/**
 * جلب الحلاقين النشطين ذوي الإحداثيات لعرضهم على الخريطة/القائمة.
 * يتطلب سياسة RLS تسمح بقراءة جدول `barbers` للعامة (أو للمستخدم الحالي).
 */
export async function fetchPublicBarbersFromSupabase(): Promise<Barber[]> {
  const client = getSupabaseClient();
  if (!client) {
    return fetchPublicBarbersViaServer();
  }

  const { data, error } = await client
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
    .not('longitude', 'is', null);

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[fetchPublicBarbersFromSupabase] direct failed, trying /api/public-barbers', error.message);
    }
    return fetchPublicBarbersViaServer();
  }

  const rows = (data ?? []) as BarberRow[];
  return rows.map(mapRow);
}

/**
 * بحث قريب قابل للتوسع:
 * - يفضّل RPC داخل Supabase (PostGIS + ترتيب هجين)
 * - fallback إلى API السيرفر إذا فشلت صلاحيات/RLS في المتصفح
 */
export async function fetchNearbyPublicBarbersFromSupabase(
  input: NearbySearchInput
): Promise<Barber[]> {
  const args = normalizedNearbyInput(input);
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.rpc('search_barbers_nearby', {
      p_lat: args.userLocation.lat,
      p_lng: args.userLocation.lng,
      p_radius_km: args.radiusKm,
      p_limit: args.limit,
      p_offset: args.offset,
      p_tiers: args.tiers ?? null,
      p_min_rating: args.minRating,
    });

    if (!error) {
      const rows = (data ?? []) as BarberRow[];
      return rows.map(mapRow);
    }

    if (import.meta.env.DEV) {
      console.warn('[fetchNearbyPublicBarbersFromSupabase] rpc failed, trying /api/public-barbers', error.message);
    }
  }

  return fetchPublicBarbersViaServer(args);
}

async function fetchPublicBarbersViaServer(input?: NearbySearchInput): Promise<Barber[]> {
  const endpoint = getPublicBarbersEndpoint();
  if (!endpoint) return [];

  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  const headers: Record<string, string> = {};
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  const url = new URL(endpoint, window.location.origin);
  if (input) {
    const args = normalizedNearbyInput(input);
    url.searchParams.set('lat', String(args.userLocation.lat));
    url.searchParams.set('lng', String(args.userLocation.lng));
    url.searchParams.set('radius_km', String(args.radiusKm));
    url.searchParams.set('limit', String(args.limit));
    url.searchParams.set('offset', String(args.offset));
    url.searchParams.set('min_rating', String(args.minRating));
    if (args.tiers && args.tiers.length > 0) {
      url.searchParams.set('tiers', args.tiers.join(','));
    }
  }

  const response = await fetch(url.toString(), { headers });
  const payload = (await response.json().catch(() => ({}))) as {
    rows?: unknown;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  const rows = Array.isArray(payload.rows) ? (payload.rows as BarberRow[]) : [];
  return rows.map(mapRow);
}
