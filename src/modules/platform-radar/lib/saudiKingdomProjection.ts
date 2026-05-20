/** Approximate Kingdom of Saudi Arabia bounding box for tactical map projection. */
export const KSA_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.25,
  minLng: 34.5,
  maxLng: 56.0,
} as const;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function projectKsaToPercent(lat: number, lng: number): { left: number; top: number } {
  const { minLat, maxLat, minLng, maxLng } = KSA_BOUNDS;
  const x = ((lng - minLng) / Math.max(0.001, maxLng - minLng)) * 92 + 4;
  const y = ((maxLat - lat) / Math.max(0.001, maxLat - minLat)) * 88 + 6;
  return { left: clamp(x, 3, 97), top: clamp(y, 4, 96) };
}
