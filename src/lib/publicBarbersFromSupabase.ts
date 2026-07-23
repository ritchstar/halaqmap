import { IMAGES } from '@/assets/images';
import { PLATFORM_SHOWCASE_EDUCATION_INTRO } from '@/config/platformSmartTracking';
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { Barber, GroomPrepOffer, HomeVisitOffer, InclusiveAccessibleCareOffer } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';
import { sanitizeInclusiveCareDays } from '@/lib/barberInclusiveCareRemote';
import { barberAcceptsChildren } from '@/lib/barberCategoryLexicon';
import { resolvePublicBarberCardCoverImage } from '@/lib/barberPublicBannerImages';
import { normalizeGroomingCenterBannerLines } from '@/config/mensGroomingCenterPolicy';
import { toSaudiE164Plus } from '@/lib/saudiWhatsAppPhone';

const FALLBACK_IMAGE = IMAGES.BARBER_SHOP_1;
const PUBLIC_BARBERS_API = '/api/public-barbers';
const DEFAULT_RADIUS_KM = 25;
const DEFAULT_LIMIT = 120;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  inclusive_care_offered?: boolean | null;
  inclusive_care_price_sar?: number | string | null;
  inclusive_care_public_visible?: boolean | null;
  inclusive_care_restrict_days?: boolean | null;
  inclusive_care_days?: unknown;
  inclusive_care_customer_note?: string | null;
  /** يُجلب للاشتقاق فقط — لا يُمرَّر إلى كائن العرض `Barber`. */
  user_id?: string | null;
  /** عند توفرها من RPC البحث الجغرافي (بدون إرجاع user_id للعميل). */
  account_linked?: boolean | null;
  open_for_customers?: boolean | null;
  distance_km?: number | null;
  rank_score?: number | null;
  has_active_subscription?: boolean | null;
  profile_updated_at?: string | null;
  gallery_count?: number | null;
  featured_images?: unknown;
  is_showcase_preview?: boolean | null;
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
  mens_grooming_center?: boolean | null;
  grooming_center_banner_lines?: unknown;
  /** من الطلب المسجّل — إن وُجد يُعرض بدل الافتراضي */
  weekly_working_hours?: unknown;
};

function mapInclusiveCareFromRow(row: BarberRow): InclusiveAccessibleCareOffer | undefined {
  if (row.inclusive_care_offered !== true) return undefined;
  if (row.inclusive_care_public_visible === false) return undefined;
  const raw = row.inclusive_care_price_sar;
  const p = raw != null && raw !== '' ? Number(raw) : NaN;
  const base: InclusiveAccessibleCareOffer = {
    offered: true,
    publicVisible: true,
    restrictToDays: row.inclusive_care_restrict_days === true,
  };
  if (Number.isFinite(p) && p > 0) {
    base.displayedPriceSar = Math.round(p * 100) / 100;
  }
  const note = row.inclusive_care_customer_note?.trim();
  if (note) base.customerNote = note;
  if (base.restrictToDays && row.inclusive_care_days && typeof row.inclusive_care_days === 'object') {
    base.activeDayFlags = sanitizeInclusiveCareDays(row.inclusive_care_days as Record<string, boolean>);
  }
  return base;
}

function mapHomeVisitFromRow(row: BarberRow): HomeVisitOffer | undefined {
  if (row.home_service_offered !== true) return undefined;
  if (row.home_service_public_visible === false) return undefined;
  const raw = row.home_service_price_sar;
  const p = raw != null && raw !== '' ? Number(raw) : NaN;
  const base: HomeVisitOffer = {
    offered: true,
    publicVisible: true,
  };
  if (Number.isFinite(p) && p > 0) {
    base.displayedPriceSar = Math.round(p * 100) / 100;
  }
  const r = row.home_service_radius_km;
  if (r != null && Number.isFinite(Number(r)) && Number(r) > 0) {
    base.radiusKm = Math.floor(Number(r));
  }
  const note = row.home_service_customer_note?.trim();
  if (note) base.customerNote = note;
  return base;
}

function mapGroomPrepFromRow(row: BarberRow): GroomPrepOffer | undefined {
  if (row.groom_prep_offered !== true) return undefined;
  if (row.groom_prep_public_visible === false) return undefined;
  if (tierFromDb(row.tier) !== SubscriptionTier.DIAMOND) return undefined;
  const raw = row.groom_prep_price_sar;
  const p = raw != null && raw !== '' ? Number(raw) : NaN;
  const base: GroomPrepOffer = {
    offered: true,
    publicVisible: true,
  };
  if (Number.isFinite(p) && p > 0) {
    base.displayedPriceSar = Math.round(p * 100) / 100;
  }
  const note = row.groom_prep_customer_note?.trim();
  if (note) base.customerNote = note;
  return base;
}

export type NearbySearchInput = {
  userLocation: { lat: number; lng: number };
  radiusKm?: number;
  limit?: number;
  minRating?: number;
  tiers?: SubscriptionTier[];
  offset?: number;
};

export type ShowcaseFallbackPayload = {
  barber: Barber;
  intro: string;
};

export type NearbyPublicBarbersResult = {
  barbers: Barber[];
  showcaseFallback: ShowcaseFallbackPayload | null;
};

function getPublicBarbersEndpoint(): string {
  return String(import.meta.env.VITE_PUBLIC_BARBERS_URL || PUBLIC_BARBERS_API).trim();
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

function mergePublicBarberImages(cover: string | null, profile: string | null, featured: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [cover, ...featured, profile]) {
    const t = u?.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.length > 0 ? out : [FALLBACK_IMAGE];
}

function mapWorkingHoursFromRow(row: BarberRow): Barber['workingHours'] {
  const raw = row.weekly_working_hours;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_WORKING_HOURS;
  const slots: Barber['workingHours'] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const day = String(o.day ?? '').trim();
    const open = String(o.open ?? '').trim();
    const close = String(o.close ?? '').trim();
    if (!day || !open || !close) continue;
    slots.push({ day, open, close });
  }
  return slots.length >= 7 ? slots : slots.length > 0 ? slots : DEFAULT_WORKING_HOURS;
}

const DOW_TO_DAY: Record<number, string> = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

async function attachWeeklyHoursToBarberRows(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  rows: BarberRow[],
): Promise<BarberRow[]> {
  if (rows.length === 0) return rows;
  const needIds = rows
    .filter((r) => !Array.isArray(r.weekly_working_hours) || r.weekly_working_hours.length === 0)
    .map((r) => r.id)
    .filter(Boolean);
  if (needIds.length === 0) return rows;

  const { data: fromBarbers } = await client
    .from('barbers')
    .select('id, weekly_working_hours')
    .in('id', needIds);
  const byId = new Map<string, unknown>();
  for (const r of fromBarbers ?? []) {
    const id = String((r as { id?: string }).id ?? '');
    const wh = (r as { weekly_working_hours?: unknown }).weekly_working_hours;
    if (id && Array.isArray(wh) && wh.length > 0) byId.set(id, wh);
  }

  const stillMissing = needIds.filter((id) => !byId.has(id));
  if (stillMissing.length > 0) {
    const { data: whRows } = await client
      .from('working_hours')
      .select('barber_id, day_of_week, is_open, open_time, close_time')
      .in('barber_id', stillMissing);
    const grouped = new Map<string, Barber['workingHours']>();
    for (const r of whRows ?? []) {
      const bid = String((r as { barber_id?: string }).barber_id ?? '');
      const day = DOW_TO_DAY[Number((r as { day_of_week?: number }).day_of_week)];
      if (!bid || !day) continue;
      const list = grouped.get(bid) ?? [];
      const openFlag = (r as { is_open?: boolean | null }).is_open !== false;
      const open = String((r as { open_time?: string | null }).open_time ?? '').slice(0, 5);
      const close = String((r as { close_time?: string | null }).close_time ?? '').slice(0, 5);
      if (!openFlag || !open || !close) {
        list.push({ day, open: 'مغلق', close: 'مغلق' });
      } else {
        list.push({ day, open, close });
      }
      grouped.set(bid, list);
    }
    for (const [bid, slots] of grouped) byId.set(bid, slots);
  }

  return rows.map((row) => {
    if (Array.isArray(row.weekly_working_hours) && row.weekly_working_hours.length > 0) return row;
    const attached = byId.get(row.id);
    return attached ? { ...row, weekly_working_hours: attached } : row;
  });
}

function mapRow(row: BarberRow): Barber {
  const lat = row.latitude ?? 0;
  const lng = row.longitude ?? 0;
  const featured = parseFeaturedImages(row.featured_images);
  const cover = row.cover_image?.trim() || null;
  const profile = row.profile_image?.trim() || null;
  const cardCover = resolvePublicBarberCardCoverImage(cover, featured);
  const images = mergePublicBarberImages(cardCover, profile, featured);
  const galleryCount = Math.max(0, Math.floor(Number(row.gallery_count) || 0));
  const phoneRaw = row.phone?.trim() || '';
  const phone = toSaudiE164Plus(phoneRaw) ?? phoneRaw;
  const categories = Array.isArray(row.specialties) ? row.specialties.filter(Boolean) : [];
  const acceptsChildren = barberAcceptsChildren(categories);
  const childrenSpecialist =
    row.children_specialist === true && acceptsChildren && tierFromDb(row.tier) === SubscriptionTier.DIAMOND;
  const groomingBannerLines = normalizeGroomingCenterBannerLines(row.grooming_center_banner_lines);
  const mensGroomingCenter =
    row.mens_grooming_center === true && tierFromDb(row.tier) === SubscriptionTier.DIAMOND;
  const uid = row.user_id?.trim() || '';
  const previewListing =
    row.account_linked === false || (row.account_linked == null && (!uid || !UUID_RE.test(uid)));

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
    inclusiveAccessibleCare: mapInclusiveCareFromRow(row),
    homeVisitOffer: mapHomeVisitFromRow(row),
    groomPrepOffer: mapGroomPrepFromRow(row),
    services: [{ name: 'للاستفسار والأسعار — تواصل مباشرة', price: 0 }],
    workingHours: mapWorkingHoursFromRow(row),
    isOpen: row.is_active !== false && row.open_for_customers !== false,
    verified: row.is_verified === true,
    categories,
    ...(acceptsChildren ? { acceptsChildren: true } : {}),
    ...(childrenSpecialist ? { childrenSpecialist: true } : {}),
    ...(mensGroomingCenter
      ? {
          mensGroomingCenter: true,
          groomingCenterBannerLines: groomingBannerLines,
        }
      : {}),
    ...(previewListing ? { previewListing: true } : {}),
    hasActiveSubscription: row.has_active_subscription === true,
    ...(row.profile_updated_at ? { profileUpdatedAt: row.profile_updated_at } : {}),
    ...(featured.length > 0 ? { featuredImages: featured } : {}),
    ...(galleryCount > 0 ? { galleryCount } : {}),
    ...(row.is_showcase_preview === true ? { showcasePreview: true } : {}),
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
 * جلب الحلاقين النشطين ذوي الإحداثيات لعرضهم عبر نظام الرصد الذكي/القائمة.
 * يتطلب سياسة RLS تسمح بقراءة جدول `barbers` للعامة (أو للمستخدم الحالي).
 */
export async function fetchPublicBarbersFromSupabase(): Promise<Barber[]> {
  const client = getSupabaseClient();
  if (!client) {
    const viaServer = await fetchPublicBarbersViaServer();
    return viaServer.barbers;
  }

  const { data, error } = await client
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
      home_service_offered,
      home_service_price_sar,
      home_service_radius_km,
      home_service_public_visible,
      home_service_customer_note,
      groom_prep_offered,
      groom_prep_price_sar,
      groom_prep_public_visible,
      groom_prep_customer_note,
      user_id,
      has_active_subscription,
      gallery_count,
      featured_images,
      children_specialist,
      mens_grooming_center,
      grooming_center_banner_lines
    `
    )
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[fetchPublicBarbersFromSupabase] direct failed, trying /api/public-barbers', error.message);
    }
    const viaServer = await fetchPublicBarbersViaServer();
    return viaServer.barbers;
  }

  const rows = await attachWeeklyHoursToBarberRows(client, (data ?? []) as BarberRow[]);
  return rows.map(mapRow);
}

function splitShowcaseFromBarbers(list: Barber[]): NearbyPublicBarbersResult {
  const showcaseBarber = list.find((b) => b.showcasePreview) ?? null;
  return {
    barbers: list.filter((b) => !b.showcasePreview),
    showcaseFallback: showcaseBarber
      ? { barber: showcaseBarber, intro: PLATFORM_SHOWCASE_EDUCATION_INTRO }
      : null,
  };
}

function mergeShowcaseFallback(
  barbers: Barber[],
  showcase: ShowcaseFallbackPayload | null,
  intro?: string,
): NearbyPublicBarbersResult {
  if (!showcase) {
    return { barbers, showcaseFallback: null };
  }
  return {
    barbers,
    showcaseFallback: {
      barber: showcase.barber,
      intro: intro?.trim() || showcase.intro || PLATFORM_SHOWCASE_EDUCATION_INTRO,
    },
  };
}

async function fetchShowcaseFallbackOnly(): Promise<ShowcaseFallbackPayload | null> {
  const { fetchPublicShowcaseFallbackRemote } = await import('@/lib/platformShowcaseRemote');
  const fallback = await fetchPublicShowcaseFallbackRemote();
  if (!fallback) return null;
  return { barber: fallback.barber, intro: fallback.educationIntro };
}

/**
 * بحث قريب قابل للتوسع:
 * - يفضّل RPC داخل Supabase (PostGIS + ترتيب هجين)
 * - fallback إلى API السيرفر إذا فشلت صلاحيات/RLS في المتصفح
 * - عند غياب نتائج حقيقية: يُرجع showcaseFallback منفصلاً (لا يُدمَج مع القائمة)
 */
export async function fetchNearbyPublicBarbersFromSupabase(
  input: NearbySearchInput
): Promise<NearbyPublicBarbersResult> {
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
      const rows = await attachWeeklyHoursToBarberRows(client, (data ?? []) as BarberRow[]);
      if (rows.length > 0) {
        const mapped = rows.map(mapRow);
        const split = splitShowcaseFromBarbers(mapped);
        return {
          barbers: split.barbers,
          showcaseFallback: split.showcaseFallback,
        };
      }

      const viaServer = await fetchPublicBarbersViaServer(args);
      if (viaServer.barbers.length > 0 || viaServer.showcaseBarber) {
        return mergeShowcaseFallback(
          viaServer.barbers,
          viaServer.showcaseBarber
            ? {
                barber: viaServer.showcaseBarber,
                intro: viaServer.showcaseIntroAr || PLATFORM_SHOWCASE_EDUCATION_INTRO,
              }
            : null,
          viaServer.showcaseIntroAr,
        );
      }

      const fallback = await fetchShowcaseFallbackOnly();
      return { barbers: [], showcaseFallback: fallback };
    }

    if (import.meta.env.DEV) {
      console.warn('[fetchNearbyPublicBarbersFromSupabase] rpc failed, trying /api/public-barbers', error.message);
    }
  }

  const viaServer = await fetchPublicBarbersViaServer(args);
  if (viaServer.barbers.length > 0 || viaServer.showcaseBarber) {
    return mergeShowcaseFallback(
      viaServer.barbers,
      viaServer.showcaseBarber
        ? {
            barber: viaServer.showcaseBarber,
            intro: viaServer.showcaseIntroAr || PLATFORM_SHOWCASE_EDUCATION_INTRO,
          }
        : null,
      viaServer.showcaseIntroAr,
    );
  }

  const fallback = await fetchShowcaseFallbackOnly();
  return { barbers: [], showcaseFallback: fallback };
}

type PublicBarbersServerFetch = {
  barbers: Barber[];
  showcaseBarber: Barber | null;
  showcaseIntroAr?: string;
};

async function fetchPublicBarbersViaServer(input?: NearbySearchInput): Promise<PublicBarbersServerFetch> {
  const endpoint = getPublicBarbersEndpoint();
  if (!endpoint) {
    return { barbers: [], showcaseBarber: null };
  }

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
    education_intro_ar?: string;
    showcase_fallback?: boolean;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  const rows = Array.isArray(payload.rows) ? (payload.rows as BarberRow[]) : [];
  const mapped = rows.map(mapRow);
  const split = splitShowcaseFromBarbers(mapped);
  const intro =
    payload.showcase_fallback === true && typeof payload.education_intro_ar === 'string'
      ? payload.education_intro_ar
      : split.showcaseFallback?.intro;

  return {
    barbers: split.barbers,
    showcaseBarber: split.showcaseFallback?.barber ?? null,
    showcaseIntroAr: intro,
  };
}
