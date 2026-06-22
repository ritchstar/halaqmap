/** مدن الشريط العلوي — 10 مدن رئيسية (عرض + طقس). بقية التغطية في `platformCoveredCities`. */
import { PLATFORM_CITY_COUNT } from '@/config/platformCoveredCities';

export type KsaCityGeo = {
  id: string;
  nameAr: string;
  emoji: string;
  accent: string;
  lat: number;
  lng: number;
  /** احتياطي عند فشل جلب الطقس */
  baseTemp: number;
};

/** المدن الـ 10 الظاهرة في `KSACityClocksBar` — ليست قائمة التغطية الكاملة */
export const KSA_CITIES_GEO: readonly KsaCityGeo[] = [
  { id: 'riyadh', nameAr: 'الرياض', emoji: '🏙️', accent: 'text-orange-300', lat: 24.7136, lng: 46.6753, baseTemp: 34 },
  { id: 'buraidah', nameAr: 'بريدة', emoji: '🌾', accent: 'text-lime-300', lat: 26.326, lng: 43.975, baseTemp: 33 },
  { id: 'jeddah', nameAr: 'جدة', emoji: '🌊', accent: 'text-cyan-300', lat: 21.4858, lng: 39.1925, baseTemp: 31 },
  { id: 'makkah', nameAr: 'مكة المكرمة', emoji: '🕌', accent: 'text-amber-200', lat: 21.3891, lng: 39.8579, baseTemp: 33 },
  { id: 'taif', nameAr: 'الطائف', emoji: '🌤️', accent: 'text-sky-300', lat: 21.2703, lng: 40.4178, baseTemp: 26 },
  { id: 'madinah', nameAr: 'المدينة المنورة', emoji: '☪️', accent: 'text-emerald-300', lat: 24.5247, lng: 39.5692, baseTemp: 32 },
  { id: 'dammam', nameAr: 'الدمام', emoji: '⛽', accent: 'text-rose-300', lat: 26.3927, lng: 49.9777, baseTemp: 35 },
  { id: 'abha', nameAr: 'أبها', emoji: '🏔️', accent: 'text-sky-300', lat: 18.2164, lng: 42.5053, baseTemp: 21 },
  { id: 'hail', nameAr: 'حائل', emoji: '🏜️', accent: 'text-stone-300', lat: 27.5114, lng: 41.7208, baseTemp: 30 },
  { id: 'tabuk', nameAr: 'تبوك', emoji: '🌵', accent: 'text-lime-300', lat: 28.3838, lng: 36.555, baseTemp: 28 },
] as const;

export const KSA_CLOCK_BAR_CITY_COUNT = KSA_CITIES_GEO.length;

/** عدد المدن في التغطية الكاملة غير المعروضة في الشريط */
export const KSA_CLOCK_BAR_OVERFLOW_COUNT = Math.max(0, PLATFORM_CITY_COUNT - KSA_CLOCK_BAR_CITY_COUNT);

export const DEFAULT_KSA_CITY_ID = 'riyadh';

export const USER_COORDS_SESSION_KEY = 'halaqmap-user-coords-v1';

export function isKsaClockBarCity(cityId: string): boolean {
  return KSA_CITIES_GEO.some((city) => city.id === cityId);
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function findNearestKsaClockBarCity(lat: number, lng: number): KsaCityGeo {
  let best = KSA_CITIES_GEO[0];
  let bestDist = Infinity;
  for (const city of KSA_CITIES_GEO) {
    const dist = haversineKm({ lat, lng }, { lat: city.lat, lng: city.lng });
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}
