import { IMAGES } from '@/assets/images';
import riyadhDemoBarbersRaw from '@/data/riyadh_demo_barbers.json';
import { SubscriptionTier, type Barber } from '@/lib/index';
import { STANDARD_MOCK_WORKING_HOURS } from '@/lib/saudiWorkingWeek';

export type RiyadhShowcaseRow = {
  id: string;
  name: string;
  district: string;
  city: string;
  region: 'وسط الرياض' | 'شمال الرياض' | 'جنوب الرياض' | 'شرق الرياض' | 'غرب الرياض';
  latitude: number;
  longitude: number;
  rating: number;
  services: string[];
  contact_whatsapp: string;
  contact_phone: string;
};

export const RIYADH_SHOWCASE_CENTER = { lat: 24.7136, lng: 46.6753 } as const;

export const riyadhShowcaseRows: RiyadhShowcaseRow[] = (
  (riyadhDemoBarbersRaw as RiyadhShowcaseRow[]) ?? []
).map((row) => ({
  ...row,
  id: String(row.id),
  name: String(row.name),
  district: String(row.district),
  city: String(row.city),
  region: row.region,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  rating: Number(row.rating),
  services: Array.isArray(row.services) ? row.services.map((s) => String(s)) : [],
  contact_whatsapp: String(row.contact_whatsapp || ''),
  contact_phone: String(row.contact_phone || ''),
}));

const REGION_SUBSCRIPTION_TIER: Record<RiyadhShowcaseRow['region'], SubscriptionTier> = {
  'وسط الرياض': SubscriptionTier.DIAMOND,
  'شمال الرياض': SubscriptionTier.GOLD,
  'جنوب الرياض': SubscriptionTier.BRONZE,
  'شرق الرياض': SubscriptionTier.GOLD,
  'غرب الرياض': SubscriptionTier.BRONZE,
};

const REGION_IMAGE_BY_TIER: Record<SubscriptionTier, string> = {
  [SubscriptionTier.BRONZE]: IMAGES.BARBER_SHOP_3,
  [SubscriptionTier.GOLD]: IMAGES.BARBER_INTERIOR_3,
  [SubscriptionTier.DIAMOND]: IMAGES.HALAQMAP_BARBER_BANNER_1_41,
};

function mapServicesToCatalog(services: string[]): { name: string; price: number }[] {
  return services.map((service, index) => ({
    name: service,
    price: 25 + index * 10,
  }));
}

function mapCategories(services: string[]): string[] {
  const cats = new Set<string>(['رجالي']);
  for (const service of services) {
    if (service.includes('أطفال')) cats.add('أطفال');
    if (service.includes('لحية')) cats.add('تشذيب لحية');
    if (service.includes('صبغ')) cats.add('صبغ شعر');
    if (service.includes('تنظيف') || service.includes('بشرة')) cats.add('عناية بالبشرة');
  }
  return Array.from(cats);
}

export const riyadhShowcaseBarbers: Barber[] = riyadhShowcaseRows.map((row, index) => {
  const subscription = REGION_SUBSCRIPTION_TIER[row.region];
  const cover = REGION_IMAGE_BY_TIER[subscription];
  const profileFallback = subscription === SubscriptionTier.BRONZE ? IMAGES.BARBER_WORK_4 : IMAGES.BARBER_WORK_2;
  const normalizedRating = Math.min(5, Math.max(3.5, row.rating));

  return {
    // نفس prefix المستخدم في منطق الفلاتر حتى لا تُستبعد بيانات العرض بسبب المسافة.
    id: `demo-showcase-riyadh-${row.id}`,
    name: row.name,
    phone: row.contact_phone,
    whatsapp: row.contact_whatsapp || row.contact_phone,
    location: {
      lat: row.latitude,
      lng: row.longitude,
      address: `${row.district}، ${row.city} — ${row.region}`,
    },
    subscription,
    rating: normalizedRating,
    reviewCount: 15 + (index % 10) * 8,
    images: [cover, profileFallback],
    services: mapServicesToCatalog(row.services),
    workingHours: STANDARD_MOCK_WORKING_HOURS,
    isOpen: true,
    verified: normalizedRating >= 4.6,
    categories: mapCategories(row.services),
    showcaseTopBanner: subscription === SubscriptionTier.BRONZE,
  };
});
