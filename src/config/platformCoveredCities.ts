/**
 * المدن التي تغطيها المنصة (~47) — مصدر موحّد للرادار والعرض.
 * Keep in sync with `api/_lib/platformCoveredCities.ts`.
 */

export type PlatformCity = {
  id: string;
  nameAr: string;
  lat: number;
  lng: number;
  aliases?: readonly string[];
};

export const KSA_TACTICAL_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.25,
  minLng: 34.5,
  maxLng: 56.0,
} as const;

export const PLATFORM_COVERED_CITIES: readonly PlatformCity[] = [
  { id: 'riyadh', nameAr: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { id: 'jeddah', nameAr: 'جدة', lat: 21.4858, lng: 39.1925 },
  { id: 'makkah', nameAr: 'مكة', lat: 21.3891, lng: 39.8579, aliases: ['مكة المكرمة'] },
  { id: 'madinah', nameAr: 'المدينة', lat: 24.5247, lng: 39.5692, aliases: ['المدينة المنورة'] },
  { id: 'dammam', nameAr: 'الدمام', lat: 26.3927, lng: 49.9777 },
  { id: 'khobar', nameAr: 'الخبر', lat: 26.2172, lng: 50.1971 },
  { id: 'dhahran', nameAr: 'الظهران', lat: 26.3031, lng: 50.115 },
  { id: 'qatif', nameAr: 'القطيف', lat: 26.5654, lng: 49.9983 },
  { id: 'ahsa', nameAr: 'الأحساء', lat: 25.3633, lng: 49.5872, aliases: ['الهفوف'] },
  { id: 'jubail', nameAr: 'الجبيل', lat: 27.0146, lng: 49.6622 },
  { id: 'yanbu', nameAr: 'ينبع', lat: 24.0889, lng: 38.0584 },
  { id: 'taif', nameAr: 'الطائف', lat: 21.2703, lng: 40.4178 },
  { id: 'tabuk', nameAr: 'تبوك', lat: 28.3838, lng: 36.555 },
  { id: 'buraidah', nameAr: 'بريدة', lat: 26.326, lng: 43.975 },
  { id: 'unayzah', nameAr: 'عنيزة', lat: 26.087, lng: 43.993 },
  { id: 'ar-rass', nameAr: 'الرس', lat: 25.8694, lng: 43.4973 },
  { id: 'hail', nameAr: 'حائل', lat: 27.5114, lng: 41.7208 },
  { id: 'sakaka', nameAr: 'سكاكا', lat: 29.9697, lng: 40.2064, aliases: ['الجوف'] },
  { id: 'qurayyat', nameAr: 'القريات', lat: 31.3316, lng: 37.3428 },
  { id: 'arar', nameAr: 'عرعر', lat: 30.9753, lng: 41.0381 },
  { id: 'rafha', nameAr: 'رفحاء', lat: 29.6342, lng: 43.4969 },
  { id: 'turaif', nameAr: 'طريف', lat: 31.6725, lng: 38.6637 },
  { id: 'hafar-al-batin', nameAr: 'حفر الباطن', lat: 28.4337, lng: 45.9601 },
  { id: 'kharj', nameAr: 'الخرج', lat: 24.1556, lng: 47.305 },
  { id: 'dawadmi', nameAr: 'الدوادمي', lat: 24.5077, lng: 44.3922 },
  { id: 'majmaah', nameAr: 'المجمعة', lat: 25.9042, lng: 45.3458 },
  { id: 'wadi-ad-dawasir', nameAr: 'وادي الدواسر', lat: 20.4693, lng: 44.7943 },
  { id: 'zulfi', nameAr: 'الزلفي', lat: 26.2994, lng: 44.8154 },
  { id: 'shagra', nameAr: 'شقراء', lat: 25.2484, lng: 45.2528 },
  { id: 'abha', nameAr: 'أبها', lat: 18.2164, lng: 42.5053 },
  { id: 'khamis-mushait', nameAr: 'خميس مشيط', lat: 18.306, lng: 42.7298 },
  { id: 'bisha', nameAr: 'بيشة', lat: 19.987, lng: 42.589 },
  { id: 'muhayil', nameAr: 'محايل', lat: 18.544, lng: 42.053, aliases: ['محايل عسير'] },
  { id: 'an-namas', nameAr: 'النماص', lat: 19.145, lng: 42.113 },
  { id: 'jazan', nameAr: 'جازان', lat: 16.8894, lng: 42.5706 },
  { id: 'sabya', nameAr: 'صبيا', lat: 17.1495, lng: 42.6257 },
  { id: 'abu-arish', nameAr: 'أبو عريش', lat: 16.9689, lng: 42.8317 },
  { id: 'najran', nameAr: 'نجران', lat: 17.5656, lng: 44.2289 },
  { id: 'sharurah', nameAr: 'شرورة', lat: 17.485, lng: 47.114 },
  { id: 'baha', nameAr: 'الباحة', lat: 20.0129, lng: 41.4677 },
  { id: 'rabigh', nameAr: 'رابغ', lat: 22.7985, lng: 39.035 },
  { id: 'qunfudhah', nameAr: 'القنفذة', lat: 19.1264, lng: 41.0789 },
  { id: 'khafji', nameAr: 'الخفجي', lat: 28.439, lng: 48.4913 },
  { id: 'duba', nameAr: 'ضبا', lat: 27.351, lng: 35.6971 },
  { id: 'umluj', nameAr: 'أملج', lat: 25.0203, lng: 37.2685 },
  { id: 'haql', nameAr: 'حقل', lat: 29.2985, lng: 34.9389 },
  { id: 'neom', nameAr: 'نيوم', lat: 28.0329, lng: 35.0193 },
] as const;

export const PLATFORM_CITY_COUNT = PLATFORM_COVERED_CITIES.length;

function normalizeCityLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function cityMatches(query: string, city: PlatformCity): boolean {
  if (query.includes(city.nameAr) || city.nameAr.includes(query)) return true;
  for (const alias of city.aliases ?? []) {
    if (query.includes(alias) || alias.includes(query)) return true;
  }
  return false;
}

export function isInsideKsaTactical(lat: number, lng: number): boolean {
  return (
    lng >= KSA_TACTICAL_BOUNDS.minLng &&
    lng <= KSA_TACTICAL_BOUNDS.maxLng &&
    lat >= KSA_TACTICAL_BOUNDS.minLat &&
    lat <= KSA_TACTICAL_BOUNDS.maxLat
  );
}

export function resolvePlatformCity(cityName: string | null | undefined): PlatformCity | null {
  if (!cityName?.trim()) return null;
  const query = normalizeCityLabel(cityName);
  return PLATFORM_COVERED_CITIES.find((city) => cityMatches(query, city)) ?? null;
}

function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** أقرب مدينة مغطاة — عند غياب تطابق الاسم. */
export function nearestPlatformCity(lat: number, lng: number): PlatformCity | null {
  if (!isInsideKsaTactical(lat, lng)) return null;
  let best: PlatformCity | null = null;
  let minD = Infinity;
  for (const city of PLATFORM_COVERED_CITIES) {
    const d = distKm(lat, lng, city.lat, city.lng);
    if (d < minD) {
      minD = d;
      best = city;
    }
  }
  return best;
}

export function resolvePlatformCityFromSearch(
  cityName: string | null | undefined,
  lat: number | null | undefined,
  lng: number | null | undefined,
): PlatformCity | null {
  const byName = resolvePlatformCity(cityName);
  if (byName) return byName;
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return nearestPlatformCity(lat, lng);
  }
  return null;
}

function clampTactical(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.min(KSA_TACTICAL_BOUNDS.maxLat, Math.max(KSA_TACTICAL_BOUNDS.minLat, lat)),
    lng: Math.min(KSA_TACTICAL_BOUNDS.maxLng, Math.max(KSA_TACTICAL_BOUNDS.minLng, lng)),
  };
}

/** إزاحة صغيرة ثابتة داخل حدود الخريطة — لا إحداثيات خام. */
export function snapPulseToCity(
  city: PlatformCity,
  seed: string,
  jitterDeg = 0.055,
): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const angle = ((h & 0xffff) / 0xffff) * Math.PI * 2;
  const radius = jitterDeg * (0.35 + ((h >> 16) & 0xff) / 255);
  return clampTactical(city.lat + Math.sin(angle) * radius, city.lng + Math.cos(angle) * radius);
}
