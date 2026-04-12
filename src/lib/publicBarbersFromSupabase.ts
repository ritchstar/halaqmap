import { IMAGES } from '@/assets/images';
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';

const FALLBACK_IMAGE = IMAGES.BARBER_SHOP_1;

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

/**
 * جلب الحلاقين النشطين ذوي الإحداثيات لعرضهم على الخريطة/القائمة.
 * يتطلب سياسة RLS تسمح بقراءة جدول `barbers` للعامة (أو للمستخدم الحالي).
 */
export async function fetchPublicBarbersFromSupabase(): Promise<Barber[]> {
  const client = getSupabaseClient();
  if (!client) return [];

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
    console.error('[fetchPublicBarbersFromSupabase]', error);
    throw error;
  }

  const rows = (data ?? []) as BarberRow[];
  return rows.map(mapRow);
}
