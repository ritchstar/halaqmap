/**
 * Tactical KSA projection — re-targeted to the kingdom's actual bounding box
 * so pulses, anchors and the SVG backdrop share one coordinate space.
 *
 * Historically this module wrapped a wider Arabian Peninsula viewport that
 * matched a satellite raster asset. We've now switched to a vector backdrop
 * (see `saudiKingdomGeo.ts`) whose viewBox is locked to the KSA bounds —
 * every projector below delegates to that single source of truth, removing
 * the calibration hacks that previously tried to compensate for an
 * `object-cover` raster.
 */
import {
  KSA_TACTICAL_BOUNDS,
  projectLngLatToPercent,
} from '@/modules/platform-radar/lib/saudiKingdomGeo';

/** Tactical canvas bounds — KSA-focused (single source of truth). */
export const ARABIAN_TACTICAL_BOUNDS = KSA_TACTICAL_BOUNDS;

/** Legacy alias — kept for backwards compatibility with older callers. */
export const KSA_BOUNDS = KSA_TACTICAL_BOUNDS;

export type KsaCityGlow = {
  nameAr: string;
  lat: number;
  lng: number;
  tier: 'capital' | 'major' | 'hub';
};

/** Major Saudi cities — anchored on the tactical map. */
export const KSA_MAJOR_CITIES: KsaCityGlow[] = [
  { nameAr: 'الرياض', lat: 24.7136, lng: 46.6753, tier: 'capital' },
  { nameAr: 'جدة', lat: 21.4858, lng: 39.1925, tier: 'major' },
  { nameAr: 'مكة', lat: 21.3891, lng: 39.8579, tier: 'major' },
  { nameAr: 'المدينة', lat: 24.5247, lng: 39.5692, tier: 'major' },
  { nameAr: 'الدمام', lat: 26.3927, lng: 49.9777, tier: 'major' },
  { nameAr: 'الخبر', lat: 26.2172, lng: 50.1971, tier: 'hub' },
  { nameAr: 'أبها', lat: 18.2164, lng: 42.5053, tier: 'hub' },
  { nameAr: 'تبوك', lat: 28.3838, lng: 36.555, tier: 'hub' },
  { nameAr: 'بريدة', lat: 26.326, lng: 43.975, tier: 'hub' },
  { nameAr: 'حائل', lat: 27.5114, lng: 41.7208, tier: 'hub' },
  { nameAr: 'نجران', lat: 17.5656, lng: 44.2289, tier: 'hub' },
  { nameAr: 'جازان', lat: 16.8894, lng: 42.5706, tier: 'hub' },
];

/** Map lat/lng → percent on the radar canvas (delegates to geo lib). */
export function projectKsaToPercent(lat: number, lng: number): { left: number; top: number } {
  return projectLngLatToPercent(lng, lat);
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

/** Compact HUD readout — e.g. `21/05 08:31, 24.7, 46.7`. */
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

export function resolveCityCoordinates(
  cityName: string | null | undefined,
): { lat: number; lng: number } | null {
  if (!cityName?.trim()) return null;
  const normalized = cityName.trim();
  const hit = KSA_MAJOR_CITIES.find(
    (c) => normalized.includes(c.nameAr) || c.nameAr.includes(normalized),
  );
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}
