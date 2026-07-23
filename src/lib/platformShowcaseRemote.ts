import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';
import { barberAcceptsChildren } from '@/lib/barberCategoryLexicon';
import { IMAGES } from '@/assets/images';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { PLATFORM_SHOWCASE_EDUCATION_INTRO } from '@/config/platformSmartTracking';
import { resolvePublicBarberCardCoverImage } from '@/lib/barberPublicBannerImages';
import { toSaudiE164Plus } from '@/lib/saudiWhatsAppPhone';

const API_PATH = '/api/public-showcase-fallback';
const FALLBACK_IMAGE = IMAGES.BARBER_SHOP_1;

type FallbackRow = {
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
  open_for_customers: boolean | null;
  specialties: string[] | null;
  children_specialist?: boolean | null;
  home_service_offered?: boolean | null;
  home_service_price_sar?: number | string | null;
  home_service_radius_km?: number | null;
  home_service_public_visible?: boolean | null;
  home_service_customer_note?: string | null;
  groom_prep_offered?: boolean | null;
  groom_prep_price_sar?: number | string | null;
  groom_prep_public_visible?: boolean | null;
  groom_prep_customer_note?: string | null;
  gallery_count?: number | null;
  featured_images?: unknown;
  is_showcase_preview?: boolean;
};

type RpcPayload = {
  /** PostgREST قد يُرجع boolean أو نص "true"/"false" */
  available?: boolean | string;
  reason?: string;
  education_intro_ar?: string;
  row?: FallbackRow;
};

function publicApiOrigin(): string {
  return String(
    import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_REGISTRATION_API_ORIGIN ||
      '',
  )
    .trim()
    .replace(/\/$/, '');
}

function tierFromDb(t: string | null): SubscriptionTier {
  if (t === SubscriptionTier.GOLD) return SubscriptionTier.GOLD;
  if (t === SubscriptionTier.DIAMOND) return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

function parseFeaturedImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const u = typeof item === 'string' ? item.trim() : '';
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= 4) break;
  }
  return out;
}

function mapHomeVisitFromFallbackRow(row: FallbackRow) {
  if (row.home_service_offered !== true) return undefined;
  if (row.home_service_public_visible === false) return undefined;
  const tier = tierFromDb(row.tier);
  if (tier !== SubscriptionTier.GOLD && tier !== SubscriptionTier.DIAMOND) return undefined;
  const raw = row.home_service_price_sar;
  const p = raw != null && raw !== '' ? Number(raw) : NaN;
  const offer: {
    offered: boolean;
    displayedPriceSar?: number;
    radiusKm?: number;
    customerNote?: string;
  } = { offered: true };
  if (Number.isFinite(p) && p > 0) offer.displayedPriceSar = Math.round(p * 100) / 100;
  const r = row.home_service_radius_km;
  if (r != null && Number.isFinite(Number(r)) && Number(r) > 0) offer.radiusKm = Math.floor(Number(r));
  const note = row.home_service_customer_note?.trim();
  if (note) offer.customerNote = note;
  return offer;
}

function mapGroomPrepFromFallbackRow(row: FallbackRow) {
  if (row.groom_prep_offered !== true) return undefined;
  if (row.groom_prep_public_visible === false) return undefined;
  if (tierFromDb(row.tier) !== SubscriptionTier.DIAMOND) return undefined;
  const raw = row.groom_prep_price_sar;
  const p = raw != null && raw !== '' ? Number(raw) : NaN;
  const offer: {
    offered: boolean;
    displayedPriceSar?: number;
    customerNote?: string;
  } = { offered: true };
  if (Number.isFinite(p) && p > 0) offer.displayedPriceSar = Math.round(p * 100) / 100;
  const note = row.groom_prep_customer_note?.trim();
  if (note) offer.customerNote = note;
  return offer;
}

function mapRow(row: FallbackRow): Barber {
  const featured = parseFeaturedImages(row.featured_images);
  const cover = row.cover_image?.trim() || null;
  const profile = row.profile_image?.trim() || null;
  const cardCover = resolvePublicBarberCardCoverImage(cover, featured);
  const images = [cardCover, ...featured, profile].filter(Boolean) as string[];
  const galleryCount = Math.max(0, Math.floor(Number(row.gallery_count) || 0));
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  const homeVisitOffer = mapHomeVisitFromFallbackRow(row);
  const groomPrepOffer = mapGroomPrepFromFallbackRow(row);

  return {
    id: row.id,
    name: row.name,
    phone: toSaudiE164Plus(row.phone?.trim() || '') ?? (row.phone?.trim() || ''),
    whatsapp: toSaudiE164Plus(row.phone?.trim() || '') ?? (row.phone?.trim() || ''),
    location: {
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      address: row.address?.trim() || '',
    },
    subscription: tierFromDb(row.tier),
    rating: Number(row.rating) || 0,
    reviewCount: Math.max(0, Math.floor(Number(row.total_reviews) || 0)),
    images: images.length > 0 ? images : [FALLBACK_IMAGE],
    services: [{ name: 'للاستفسار والأسعار — تواصل مباشرة', price: 0 }],
    workingHours: [],
    isOpen: row.is_active !== false && row.open_for_customers !== false,
    verified: row.is_verified === true,
    categories: Array.isArray(row.specialties) ? row.specialties.filter(Boolean) : [],
    hasActiveSubscription: true,
    showcasePreview: true,
    ...(barberAcceptsChildren(row.specialties) ? { acceptsChildren: true } : {}),
    ...(row.children_specialist === true &&
    barberAcceptsChildren(row.specialties) &&
    tierFromDb(row.tier) === SubscriptionTier.DIAMOND
      ? { childrenSpecialist: true }
      : {}),
    ...(homeVisitOffer ? { homeVisitOffer } : {}),
    ...(groomPrepOffer ? { groomPrepOffer } : {}),
    ...(featured.length > 0 ? { featuredImages: featured } : {}),
    ...(galleryCount > 0 ? { galleryCount } : {}),
  };
}

function normalizeRpcPayload(data: unknown): RpcPayload {
  if (data == null) return {};
  let raw: unknown = data;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return {};
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const payload = raw as RpcPayload;
  if (payload.row && typeof payload.row === 'object') return payload;

  // بعض إصدارات PostgREST تُرجع صف الحلاق مباشرة بدون غلاف available/row
  const maybeRow = raw as FallbackRow;
  if (typeof maybeRow.id === 'string' && typeof maybeRow.name === 'string') {
    return { available: true, row: maybeRow };
  }

  return payload;
}

function isShowcaseAvailable(payload: RpcPayload): boolean {
  if (payload.available === true) return true;
  if (typeof payload.available === 'string') {
    return payload.available.toLowerCase() === 'true';
  }
  return Boolean(payload.row && typeof payload.row === 'object' && typeof payload.row.id === 'string');
}

function mapRpcPayload(payload: RpcPayload): { barber: Barber; educationIntro: string } | null {
  const row = payload.row && typeof payload.row === 'object' ? payload.row : null;
  if (!isShowcaseAvailable(payload) || !row) return null;
  return {
    barber: mapRow(row),
    educationIntro: payload.education_intro_ar?.trim() || PLATFORM_SHOWCASE_EDUCATION_INTRO,
  };
}

async function fetchPublicShowcaseFallbackViaRpc(): Promise<
  { barber: Barber; educationIntro: string } | null
> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.rpc('get_public_showcase_fallback');
  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[showcase-fallback] rpc failed:', error.message);
    }
    return null;
  }

  const payload = normalizeRpcPayload(data);
  if (import.meta.env.DEV && !isShowcaseAvailable(payload) && payload.reason) {
    console.info('[showcase-fallback] rpc unavailable:', payload.reason);
  }
  return mapRpcPayload(payload);
}

async function fetchPublicShowcaseFallbackViaApi(): Promise<
  { barber: Barber; educationIntro: string } | null
> {
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  const headers: Record<string, string> = {};
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;

  const origin = publicApiOrigin();
  const url = origin ? `${origin}${API_PATH}` : API_PATH;
  const response = await fetch(url, { headers });
  const payload = normalizeRpcPayload(await response.json().catch(() => ({})));
  if (!response.ok) {
    if (import.meta.env.DEV) {
      const errPayload = payload as RpcPayload & { error?: string };
      console.warn('[showcase-fallback] api failed:', errPayload.error || response.status);
    }
    return null;
  }

  if (import.meta.env.DEV && !isShowcaseAvailable(payload) && payload.reason) {
    console.info('[showcase-fallback] api unavailable:', payload.reason);
  }
  return mapRpcPayload(payload);
}

/** يُفضّل RPC مباشرة من Supabase ثم API كاحتياط. */
export async function fetchPublicShowcaseFallbackRemote(): Promise<
  { barber: Barber; educationIntro: string } | null
> {
  const viaRpc = await fetchPublicShowcaseFallbackViaRpc();
  if (viaRpc) return viaRpc;
  return fetchPublicShowcaseFallbackViaApi();
}

export type ShowcaseFallbackState = { barber: Barber; intro: string };

/** يحمّل المعاينة عند غياب نتائج معروضة — يُستخدم من صفحة البحث. */
export async function resolveShowcaseForEmptyDisplay(
  existing: ShowcaseFallbackState | null,
): Promise<ShowcaseFallbackState | null> {
  if (existing) return existing;
  const remote = await fetchPublicShowcaseFallbackRemote();
  if (!remote) return null;
  return { barber: remote.barber, intro: remote.educationIntro };
}

export function mapShowcasePreviewRowFromPublicApi(row: FallbackRow): Barber {
  return mapRow({ ...row, is_showcase_preview: true });
}
