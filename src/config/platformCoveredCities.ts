/**
 * المدن التي تغطيها المنصة (~47) — مصدر موحّد للرادار والعرض.
 * Keep in sync with `api/_lib/platformCoveredCities.ts`.
 */
import {
  ensureInsideKsaSilhouette,
  isInsideKsaSilhouette,
  resolveBeaconLngLat,
} from '@/modules/platform-radar/lib/saudiKingdomGeo';

export type PlatformCityRegion =
  | 'riyadh'
  | 'makkah'
  | 'madinah'
  | 'eastern'
  | 'qassim'
  | 'hail'
  | 'tabuk'
  | 'north'
  | 'asir'
  | 'baha'
  | 'jazan'
  | 'najran';

export type PlatformCity = {
  id: string;
  nameAr: string;
  lat: number;
  lng: number;
  /** نقطة عرض مُ calibrate داخل مضلّع الرادار */
  radarLat?: number;
  radarLng?: number;
  region?: PlatformCityRegion;
  aliases?: readonly string[];
};

/** pilot جنوبي — الباحة · عسير · جازان · نجران */
export const SHOWCASE_BARBER_REGION_ALLOWLIST: readonly PlatformCityRegion[] = [
  'asir',
  'baha',
  'jazan',
  'najran',
];

export const KSA_TACTICAL_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.25,
  minLng: 34.5,
  maxLng: 56.0,
} as const;

export const PLATFORM_COVERED_CITIES: readonly PlatformCity[] = [
  { id: 'riyadh', nameAr: 'الرياض', lat: 24.7136, lng: 46.6753, region: 'riyadh' },
  { id: 'jeddah', nameAr: 'جدة', lat: 21.4858, lng: 39.1925, radarLat: 21.49, radarLng: 39.22, region: 'makkah' },
  { id: 'makkah', nameAr: 'مكة', lat: 21.3891, lng: 39.8579, radarLat: 21.4, radarLng: 39.88, region: 'makkah', aliases: ['مكة المكرمة'] },
  { id: 'madinah', nameAr: 'المدينة', lat: 24.5247, lng: 39.5692, radarLat: 24.52, radarLng: 39.58, region: 'madinah', aliases: ['المدينة المنورة'] },
  { id: 'dammam', nameAr: 'الدمام', lat: 26.3927, lng: 49.9777, radarLat: 26.39, radarLng: 49.95, region: 'eastern' },
  { id: 'khobar', nameAr: 'الخبر', lat: 26.2172, lng: 50.1971, radarLat: 26.25, radarLng: 50.15, region: 'eastern' },
  { id: 'dhahran', nameAr: 'الظهران', lat: 26.3031, lng: 50.115, region: 'eastern' },
  { id: 'qatif', nameAr: 'القطيف', lat: 26.5654, lng: 49.9983, region: 'eastern' },
  { id: 'ahsa', nameAr: 'الأحساء', lat: 25.3633, lng: 49.5872, region: 'eastern', aliases: ['الهفوف'] },
  { id: 'jubail', nameAr: 'الجبيل', lat: 27.0146, lng: 49.6622, radarLat: 27.0, radarLng: 49.7, region: 'eastern' },
  { id: 'yanbu', nameAr: 'ينبع', lat: 24.0889, lng: 38.0584, radarLat: 24.1, radarLng: 38.1, region: 'madinah' },
  { id: 'taif', nameAr: 'الطائف', lat: 21.2703, lng: 40.4178, radarLat: 21.28, radarLng: 40.45, region: 'makkah' },
  { id: 'tabuk', nameAr: 'تبوك', lat: 28.3838, lng: 36.555, region: 'tabuk' },
  { id: 'buraidah', nameAr: 'بريدة', lat: 26.326, lng: 43.975, region: 'qassim' },
  { id: 'unayzah', nameAr: 'عنيزة', lat: 26.087, lng: 43.993, region: 'qassim' },
  { id: 'ar-rass', nameAr: 'الرس', lat: 25.8694, lng: 43.4973, region: 'qassim' },
  { id: 'hail', nameAr: 'حائل', lat: 27.5114, lng: 41.7208, region: 'hail' },
  { id: 'sakaka', nameAr: 'سكاكا', lat: 29.9697, lng: 40.2064, region: 'north', aliases: ['الجوف'] },
  { id: 'qurayyat', nameAr: 'القريات', lat: 31.3316, lng: 37.3428, region: 'north' },
  { id: 'arar', nameAr: 'عرعر', lat: 30.9753, lng: 41.0381, region: 'north' },
  { id: 'rafha', nameAr: 'رفحاء', lat: 29.6342, lng: 43.4969, region: 'north' },
  { id: 'turaif', nameAr: 'طريف', lat: 31.6725, lng: 38.6637, region: 'north' },
  { id: 'hafar-al-batin', nameAr: 'حفر الباطن', lat: 28.4337, lng: 45.9601, region: 'eastern' },
  { id: 'kharj', nameAr: 'الخرج', lat: 24.1556, lng: 47.305, region: 'riyadh' },
  { id: 'dawadmi', nameAr: 'الدوادمي', lat: 24.5077, lng: 44.3922, region: 'riyadh' },
  { id: 'majmaah', nameAr: 'المجمعة', lat: 25.9042, lng: 45.3458, region: 'riyadh' },
  { id: 'wadi-ad-dawasir', nameAr: 'وادي الدواسر', lat: 20.4693, lng: 44.7943, region: 'riyadh' },
  { id: 'zulfi', nameAr: 'الزلفي', lat: 26.2994, lng: 44.8154, region: 'riyadh' },
  { id: 'shagra', nameAr: 'شقراء', lat: 25.2484, lng: 45.2528, region: 'riyadh' },
  { id: 'abha', nameAr: 'أبها', lat: 18.2164, lng: 42.5053, radarLat: 18.25, radarLng: 42.55, region: 'asir' },
  { id: 'khamis-mushait', nameAr: 'خميس مشيط', lat: 18.306, lng: 42.7298, radarLat: 18.28, radarLng: 42.68, region: 'asir' },
  { id: 'bisha', nameAr: 'بيشة', lat: 19.987, lng: 42.589, radarLat: 19.99, radarLng: 42.6, region: 'asir' },
  { id: 'muhayil', nameAr: 'محايل', lat: 18.544, lng: 42.053, radarLat: 18.55, radarLng: 42.08, region: 'asir', aliases: ['محايل عسير'] },
  { id: 'an-namas', nameAr: 'النماص', lat: 19.145, lng: 42.113, radarLat: 19.15, radarLng: 42.12, region: 'asir' },
  { id: 'jazan', nameAr: 'جازان', lat: 16.8894, lng: 42.5706, radarLat: 16.95, radarLng: 42.62, region: 'jazan' },
  { id: 'sabya', nameAr: 'صبيا', lat: 17.1495, lng: 42.6257, radarLat: 17.16, radarLng: 42.63, region: 'jazan' },
  { id: 'abu-arish', nameAr: 'أبو عريش', lat: 16.9689, lng: 42.8317, radarLat: 16.98, radarLng: 42.78, region: 'jazan' },
  { id: 'najran', nameAr: 'نجران', lat: 17.5656, lng: 44.2289, radarLat: 17.58, radarLng: 44.15, region: 'najran' },
  { id: 'sharurah', nameAr: 'شرورة', lat: 17.485, lng: 47.114, radarLat: 17.5, radarLng: 47.05, region: 'najran' },
  { id: 'baha', nameAr: 'الباحة', lat: 20.0129, lng: 41.4677, radarLat: 20.05, radarLng: 41.52, region: 'baha' },
  { id: 'rabigh', nameAr: 'رابغ', lat: 22.7985, lng: 39.035, radarLat: 22.8, radarLng: 39.08, region: 'makkah' },
  { id: 'qunfudhah', nameAr: 'القنفذة', lat: 19.1264, lng: 41.0789, radarLat: 19.15, radarLng: 41.1, region: 'makkah' },
  { id: 'khafji', nameAr: 'الخفجي', lat: 28.439, lng: 48.4913, region: 'eastern' },
  { id: 'duba', nameAr: 'ضبا', lat: 27.351, lng: 35.6971, radarLat: 27.36, radarLng: 35.75, region: 'tabuk' },
  { id: 'umluj', nameAr: 'أملج', lat: 25.0203, lng: 37.2685, radarLat: 25.05, radarLng: 37.35, region: 'tabuk' },
  { id: 'haql', nameAr: 'حقل', lat: 29.2985, lng: 34.9389, radarLat: 29.3, radarLng: 35.05, region: 'tabuk' },
  { id: 'neom', nameAr: 'نيوم', lat: 28.0329, lng: 35.0193, radarLat: 28.05, radarLng: 35.1, region: 'tabuk' },
] as const;

export const PLATFORM_CITY_COUNT = PLATFORM_COVERED_CITIES.length;

export { isInsideKsaSilhouette };

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

export function cityRadarCoords(city: PlatformCity): { lat: number; lng: number } {
  const beacon = resolveBeaconLngLat(city.nameAr);
  if (beacon) return { lat: beacon.lat, lng: beacon.lng };
  return {
    lat: city.radarLat ?? city.lat,
    lng: city.radarLng ?? city.lng,
  };
}

export function isBarberPulseCityAllowed(city: PlatformCity): boolean {
  if (SHOWCASE_BARBER_REGION_ALLOWLIST.length === 0) return true;
  return city.region != null && SHOWCASE_BARBER_REGION_ALLOWLIST.includes(city.region);
}

export function isShowcasePulseCoordValid(lat: number, lng: number): boolean {
  return isInsideKsaTactical(lat, lng) && isInsideKsaSilhouette(lng, lat);
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

export function nearestPlatformCity(lat: number, lng: number): PlatformCity | null {
  if (!isInsideKsaTactical(lat, lng)) return null;
  let best: PlatformCity | null = null;
  let minD = Infinity;
  for (const city of PLATFORM_COVERED_CITIES) {
    const anchor = cityRadarCoords(city);
    const d = distKm(lat, lng, anchor.lat, anchor.lng);
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

/** إزاحة صغيرة ثابتة داخل مضلّع المملكة — لا إحداثيات خام. */
export function snapPulseToCity(
  city: PlatformCity,
  seed: string,
  jitterDeg = 0.02,
): { lat: number; lng: number } {
  const anchor = cityRadarCoords(city);
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const angle = ((h & 0xffff) / 0xffff) * Math.PI * 2;
  const radius = jitterDeg * (0.35 + ((h >> 16) & 0xff) / 255);
  const jittered = clampTactical(
    anchor.lat + Math.sin(angle) * radius,
    anchor.lng + Math.cos(angle) * radius,
  );
  const snapped = ensureInsideKsaSilhouette(jittered.lat, jittered.lng, anchor.lat, anchor.lng);
  if (!isInsideKsaSilhouette(snapped.lng, snapped.lat)) return anchor;
  return snapped;
}
