/** مدن المملكة — إحداثيات + عرض الشريط العلوي */

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

export const KSA_CITIES_GEO: readonly KsaCityGeo[] = [
  { id: 'riyadh', nameAr: 'الرياض', emoji: '🏙️', accent: 'text-orange-300', lat: 24.7136, lng: 46.6753, baseTemp: 34 },
  { id: 'jeddah', nameAr: 'جدة', emoji: '🌊', accent: 'text-cyan-300', lat: 21.4858, lng: 39.1925, baseTemp: 31 },
  { id: 'makkah', nameAr: 'مكة المكرمة', emoji: '🕌', accent: 'text-amber-200', lat: 21.3891, lng: 39.8579, baseTemp: 33 },
  { id: 'madinah', nameAr: 'المدينة المنورة', emoji: '☪️', accent: 'text-emerald-300', lat: 24.5247, lng: 39.5692, baseTemp: 32 },
  { id: 'dammam', nameAr: 'الدمام', emoji: '⛽', accent: 'text-rose-300', lat: 26.3927, lng: 49.9777, baseTemp: 35 },
  { id: 'abha', nameAr: 'أبها', emoji: '🏔️', accent: 'text-sky-300', lat: 18.2164, lng: 42.5053, baseTemp: 21 },
  { id: 'tabuk', nameAr: 'تبوك', emoji: '🌵', accent: 'text-lime-300', lat: 28.3838, lng: 36.555, baseTemp: 28 },
] as const;

export const DEFAULT_KSA_CITY_ID = 'riyadh';

export const USER_COORDS_SESSION_KEY = 'halaqmap-user-coords-v1';
