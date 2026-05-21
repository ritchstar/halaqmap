/** Wider Arabian Peninsula viewport — matches satellite night map framing. */
export const ARABIAN_TACTICAL_BOUNDS = {
  minLat: 11.5,
  maxLat: 37.5,
  minLng: 30.0,
  maxLng: 62.5,
} as const;

/** Legacy alias — KSA-focused queries still use this inner box. */
export const KSA_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.25,
  minLng: 34.5,
  maxLng: 56.0,
} as const;

export type KsaCityGlow = {
  nameAr: string;
  lat: number;
  lng: number;
  tier: 'capital' | 'major' | 'hub';
};

/** Major cities — subtle night-light anchors on the tactical map. */
export const KSA_MAJOR_CITIES: KsaCityGlow[] = [
  { nameAr: 'الرياض', lat: 24.7136, lng: 46.6753, tier: 'capital' },
  { nameAr: 'جدة', lat: 21.4858, lng: 39.1925, tier: 'major' },
  { nameAr: 'مكة', lat: 21.3891, lng: 39.8579, tier: 'major' },
  { nameAr: 'المدينة', lat: 24.5247, lng: 39.5692, tier: 'major' },
  { nameAr: 'الدمام', lat: 26.3927, lng: 49.9777, tier: 'major' },
  { nameAr: 'دبي', lat: 25.2048, lng: 55.2708, tier: 'major' },
  { nameAr: 'الكويت', lat: 29.3759, lng: 47.9774, tier: 'hub' },
  { nameAr: 'الخبر', lat: 26.2172, lng: 50.1971, tier: 'hub' },
  { nameAr: 'أبها', lat: 18.2164, lng: 42.5053, tier: 'hub' },
  { nameAr: 'تبوك', lat: 28.3838, lng: 36.555, tier: 'hub' },
  { nameAr: 'بريدة', lat: 26.326, lng: 43.975, tier: 'hub' },
  { nameAr: 'حائل', lat: 27.5114, lng: 41.7208, tier: 'hub' },
  { nameAr: 'نجران', lat: 17.5656, lng: 44.2289, tier: 'hub' },
  { nameAr: 'جازان', lat: 16.8894, lng: 42.5706, tier: 'hub' },
];

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Map lat/lng → percent on the tactical satellite canvas (calibrated to night-map asset). */
export function projectKsaToPercent(lat: number, lng: number): { left: number; top: number } {
  const { minLat, maxLat, minLng, maxLng } = ARABIAN_TACTICAL_BOUNDS;
  const x = ((lng - minLng) / Math.max(0.001, maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / Math.max(0.001, maxLat - minLat)) * 100;
  return {
    left: clamp(x * 0.96 + 2, 1.5, 98.5),
    top: clamp(y * 0.94 + 3, 2, 98),
  };
}

export function formatTacticalCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir} · ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function formatTacticalTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Compact HUD readout — e.g. `21/05 08:31, 24.7, 46.7` */
export function formatTacticalOverlay(iso: string, lat: number, lng: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return `${lat.toFixed(1)}, ${lng.toFixed(1)}`;
  const d = new Date(t);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}, ${lat.toFixed(1)}, ${lng.toFixed(1)}`;
}

export function resolveCityCoordinates(cityName: string | null | undefined): { lat: number; lng: number } | null {
  if (!cityName?.trim()) return null;
  const normalized = cityName.trim();
  const hit = KSA_MAJOR_CITIES.find(
    (c) => normalized.includes(c.nameAr) || c.nameAr.includes(normalized),
  );
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}
