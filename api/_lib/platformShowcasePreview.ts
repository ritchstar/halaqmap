import type { SupabaseClient } from '@supabase/supabase-js';
import { provisionBarberAccount } from './barberProvisionService.js';
import { creditBarberListingEntitlement } from './listingLicenseService.js';

export const SHOWCASE_BARBER_EMAIL = 'platform-showcase@halaqmap.com';
export const SHOWCASE_BARBER_NAME = 'صالون الماس — عرض توضيحي';
export const SHOWCASE_DEFAULT_LAT = 24.7136;
export const SHOWCASE_DEFAULT_LNG = 46.6753;
export const SHOWCASE_DEFAULT_ADDRESS = 'حي العليا، الرياض — عرض توضيحي للمنصة';

export type PlatformShowcaseSettings = {
  barberId: string | null;
  fallbackWhenEmpty: boolean;
  mapVisible: boolean;
  educationIntroAr: string;
  updatedAt: string | null;
  updatedByEmail: string | null;
};

export type ShowcasePublicRow = {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
  tier: string;
  rating: number;
  total_reviews: number;
  profile_image: string | null;
  cover_image: string | null;
  is_active: boolean;
  is_verified: boolean;
  open_for_customers: boolean;
  specialties: string[] | null;
  gallery_count: number;
  featured_images: unknown;
  has_active_subscription: boolean;
  account_linked: boolean;
  is_showcase_preview: boolean;
};

function normalizeSettingsRow(raw: Record<string, unknown> | null): PlatformShowcaseSettings {
  const r = raw || {};
  const barberId = typeof r.barber_id === 'string' && r.barber_id.trim() ? r.barber_id.trim() : null;
  return {
    barberId,
    fallbackWhenEmpty: r.fallback_when_empty !== false,
    mapVisible: r.map_visible !== false,
    educationIntroAr:
      String(r.education_intro_ar ?? '').trim() ||
      'هذا عرض توضيحي من منصة حلاق ماب — لتتعرف على شكل البنر والمعرض قبل انضمام صالونات حقيقية في منطقتك.',
    updatedAt: typeof r.updated_at === 'string' ? r.updated_at : null,
    updatedByEmail: typeof r.updated_by_email === 'string' ? r.updated_by_email : null,
  };
}

export async function loadPlatformShowcaseSettings(
  supabase: SupabaseClient,
): Promise<{ ok: true; settings: PlatformShowcaseSettings } | { ok: false; error: string }> {
  const { data, error } = await supabase.from('platform_showcase_settings').select('*').eq('id', 1).maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, settings: normalizeSettingsRow((data || {}) as Record<string, unknown>) };
}

async function loadDiamondProduct(
  supabase: SupabaseClient,
): Promise<
  | { ok: true; product: Parameters<typeof creditBarberListingEntitlement>[1]['product'] }
  | { ok: false; error: string }
> {
  const { data, error } = await supabase
    .from('listing_license_products')
    .select('*')
    .eq('tier', 'diamond')
    .eq('is_active', true)
    .order('listing_days_granted', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: error?.message || 'diamond_product_not_found' };
  }
  return { ok: true, product: data as Parameters<typeof creditBarberListingEntitlement>[1]['product'] };
}

export async function ensureShowcaseBarber(
  supabase: SupabaseClient,
): Promise<{ ok: true; barberId: string; created: boolean } | { ok: false; error: string }> {
  const provision = await provisionBarberAccount(supabase, {
    upsertRow: {
      email: SHOWCASE_BARBER_EMAIL,
      name: SHOWCASE_BARBER_NAME,
      phone: '+966500000001',
      latitude: SHOWCASE_DEFAULT_LAT,
      longitude: SHOWCASE_DEFAULT_LNG,
      address: SHOWCASE_DEFAULT_ADDRESS,
      city: 'الرياض',
      tier: 'diamond',
      rating: 4.9,
      total_reviews: 0,
      is_active: true,
      is_verified: true,
      specialties: ['رجالي', 'تقليدي', 'أطفال'],
    },
    sendCredentialsEmail: false,
    forceAuthProvision: false,
  });
  if (provision.ok === false) {
    return { ok: false, error: provision.error };
  }

  const barberId = provision.barberId;
  const { error: flagErr } = await supabase
    .from('barbers')
    .update({
      is_showcase_preview: true,
      tier: 'diamond',
      is_active: true,
      is_verified: true,
      open_for_customers: true,
      latitude: SHOWCASE_DEFAULT_LAT,
      longitude: SHOWCASE_DEFAULT_LNG,
      updated_at: new Date().toISOString(),
    })
    .eq('id', barberId);
  if (flagErr) return { ok: false, error: flagErr.message };

  const productRes = await loadDiamondProduct(supabase);
  if (productRes.ok === false) return productRes;

  const { data: existingEnt } = await supabase
    .from('barber_listing_entitlements')
    .select('id')
    .eq('barber_id', barberId)
    .gt('valid_until', new Date().toISOString())
    .is('revoked_at', null)
    .limit(1)
    .maybeSingle();

  if (!existingEnt?.id) {
    const credit = await creditBarberListingEntitlement(supabase, {
      barberId,
      product: productRes.product,
      source: 'admin_payment_approve',
      stackFromExisting: false,
    });
    if (credit.ok === false) return { ok: false, error: credit.error };
  }

  const { error: settingsErr } = await supabase
    .from('platform_showcase_settings')
    .upsert({ id: 1, barber_id: barberId, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (settingsErr) return { ok: false, error: settingsErr.message };

  return { ok: true, barberId, created: provision.created };
}

export async function fetchShowcasePublicRow(
  supabase: SupabaseClient,
  barberId: string,
): Promise<ShowcasePublicRow | null> {
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
      open_for_customers,
      specialties,
      gallery_count,
      featured_images,
      user_id,
      is_showcase_preview
    `,
    )
    .eq('id', barberId)
    .eq('is_showcase_preview', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    phone: String(row.phone ?? ''),
    latitude: lat,
    longitude: lng,
    address: String(row.address ?? ''),
    tier: String(row.tier ?? 'diamond'),
    rating: Number(row.rating) || 0,
    total_reviews: Math.max(0, Math.floor(Number(row.total_reviews) || 0)),
    profile_image: typeof row.profile_image === 'string' ? row.profile_image : null,
    cover_image: typeof row.cover_image === 'string' ? row.cover_image : null,
    is_active: row.is_active !== false,
    is_verified: row.is_verified === true,
    open_for_customers: row.open_for_customers !== false,
    specialties: Array.isArray(row.specialties) ? row.specialties.filter(Boolean).map(String) : null,
    gallery_count: Math.max(0, Math.floor(Number(row.gallery_count) || 0)),
    featured_images: row.featured_images ?? [],
    has_active_subscription: true,
    account_linked: Boolean(row.user_id),
    is_showcase_preview: true,
  };
}

export function mapShowcaseRowToApiPayload(row: ShowcasePublicRow): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    tier: row.tier,
    rating: row.rating,
    total_reviews: row.total_reviews,
    profile_image: row.profile_image,
    cover_image: row.cover_image,
    is_active: row.is_active,
    is_verified: row.is_verified,
    open_for_customers: row.open_for_customers,
    specialties: row.specialties,
    gallery_count: row.gallery_count,
    featured_images: row.featured_images,
    has_active_subscription: true,
    account_linked: row.account_linked,
    is_showcase_preview: true,
    distance_km: 0,
    rank_score: 0,
  };
}

export async function resolveShowcaseFallbackForPublic(
  supabase: SupabaseClient,
): Promise<
  | { ok: true; row: ShowcasePublicRow; educationIntroAr: string }
  | { ok: false; reason: 'disabled' | 'not_configured' | 'not_found' }
> {
  const settingsRes = await loadPlatformShowcaseSettings(supabase);
  if (settingsRes.ok === false) return { ok: false, reason: 'not_found' };
  const { settings } = settingsRes;
  if (!settings.mapVisible || !settings.fallbackWhenEmpty || !settings.barberId) {
    return { ok: false, reason: 'disabled' };
  }
  const row = await fetchShowcasePublicRow(supabase, settings.barberId);
  if (!row) return { ok: false, reason: 'not_configured' };
  return { ok: true, row, educationIntroAr: settings.educationIntroAr };
}
