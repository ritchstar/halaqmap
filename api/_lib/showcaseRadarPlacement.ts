/**
 * Showcase radar city anchors — keep in sync with
 * `CITY_BEACONS_LNGLAT` in `src/modules/platform-radar/lib/saudiKingdomGeo.ts`.
 */

/** pilot جنوبي — الباحة · عسير · جازان · نجران */
export const SHOWCASE_BARBER_SOUTH_BBOX = {
  minLat: 16.85,
  maxLat: 20.15,
  minLng: 41.35,
  maxLng: 47.15,
} as const;

export function isInsideShowcaseBarberSouthBbox(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= SHOWCASE_BARBER_SOUTH_BBOX.minLat &&
    lat <= SHOWCASE_BARBER_SOUTH_BBOX.maxLat &&
    lng >= SHOWCASE_BARBER_SOUTH_BBOX.minLng &&
    lng <= SHOWCASE_BARBER_SOUTH_BBOX.maxLng
  );
}
const SHOWCASE_CITY_BEACONS_LNGLAT: ReadonlyArray<{
  nameAr: string;
  lng: number;
  lat: number;
}> = [
  { nameAr: 'الرياض', lng: 46.6753, lat: 24.7136 },
  { nameAr: 'جدة', lng: 39.1925, lat: 21.4858 },
  { nameAr: 'مكة', lng: 39.8579, lat: 21.3891 },
  { nameAr: 'الطائف', lng: 40.4178, lat: 21.2703 },
  { nameAr: 'المدينة', lng: 39.5692, lat: 24.5247 },
  { nameAr: 'الدمام', lng: 49.9777, lat: 26.3927 },
  { nameAr: 'الأحساء', lng: 49.5872, lat: 25.3633 },
  { nameAr: 'الخبر', lng: 50.1971, lat: 26.2172 },
  { nameAr: 'الجبيل', lng: 49.6622, lat: 27.0146 },
  { nameAr: 'تبوك', lng: 36.555, lat: 28.3838 },
  { nameAr: 'حائل', lng: 41.7208, lat: 27.5114 },
  { nameAr: 'بريدة', lng: 43.975, lat: 26.326 },
  { nameAr: 'أبها', lng: 42.5053, lat: 18.2164 },
  { nameAr: 'خميس مشيط', lng: 42.7298, lat: 18.306 },
  { nameAr: 'جازان', lng: 42.5706, lat: 16.8894 },
  { nameAr: 'نجران', lng: 44.2289, lat: 17.5656 },
  { nameAr: 'الباحة', lng: 41.4677, lat: 20.0129 },
  { nameAr: 'ينبع', lng: 38.0584, lat: 24.0889 },
  { nameAr: 'حفر الباطن', lng: 45.9601, lat: 28.4337 },
  { nameAr: 'عرعر', lng: 41.0381, lat: 30.9753 },
  { nameAr: 'سكاكا', lng: 40.2064, lat: 29.9697 },
];

export function resolveShowcaseBeaconLngLat(
  cityAr: string,
): { lng: number; lat: number } | null {
  const query = cityAr.trim();
  if (!query) return null;
  const hit = SHOWCASE_CITY_BEACONS_LNGLAT.find(
    (c) => query.includes(c.nameAr) || c.nameAr.includes(query),
  );
  return hit ? { lng: hit.lng, lat: hit.lat } : null;
}
