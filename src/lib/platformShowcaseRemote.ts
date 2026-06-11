import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { PLATFORM_SHOWCASE_EDUCATION_INTRO } from '@/config/platformSmartTracking';

const API = '/api/public-showcase-fallback';
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
  gallery_count?: number | null;
  featured_images?: unknown;
  is_showcase_preview?: boolean;
};

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

function mapRow(row: FallbackRow): Barber {
  const featured = parseFeaturedImages(row.featured_images);
  const cover = row.cover_image?.trim() || null;
  const profile = row.profile_image?.trim() || null;
  const images = [cover, ...featured, profile].filter(Boolean) as string[];
  const galleryCount = Math.max(0, Math.floor(Number(row.gallery_count) || 0));

  return {
    id: row.id,
    name: row.name,
    phone: row.phone?.trim() || '',
    whatsapp: row.phone?.trim() || '',
    location: {
      lat: row.latitude ?? 0,
      lng: row.longitude ?? 0,
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
    ...(featured.length > 0 ? { featuredImages: featured } : {}),
    ...(galleryCount > 0 ? { galleryCount } : {}),
  };
}

export async function fetchPublicShowcaseFallbackRemote(): Promise<
  { barber: Barber; educationIntro: string } | null
> {
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  const headers: Record<string, string> = {};
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;

  const response = await fetch(API, { headers });
  const payload = (await response.json().catch(() => ({}))) as {
    available?: boolean;
    education_intro_ar?: string;
    row?: FallbackRow;
  };
  if (!response.ok || payload.available !== true || !payload.row) return null;

  return {
    barber: mapRow(payload.row),
    educationIntro: payload.education_intro_ar?.trim() || PLATFORM_SHOWCASE_EDUCATION_INTRO,
  };
}

export function mapShowcasePreviewRowFromPublicApi(row: FallbackRow): Barber {
  return mapRow({ ...row, is_showcase_preview: true });
}
