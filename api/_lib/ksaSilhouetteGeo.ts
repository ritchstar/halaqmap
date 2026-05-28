/**
 * KSA silhouette geometry for server-side pulse snapping.
 * Keep polygon vertices in sync with `src/modules/platform-radar/lib/saudiKingdomGeo.ts`.
 */

const KSA_OUTLINE_LNGLAT: ReadonlyArray<[number, number]> = [
  [34.85, 29.35],
  [34.95, 28.95],
  [35.3, 28.1],
  [35.45, 27.55],
  [35.85, 26.65],
  [36.2, 26.1],
  [36.85, 25.4],
  [37.25, 24.85],
  [37.6, 24.45],
  [37.8, 24.05],
  [38.1, 23.4],
  [38.4, 22.85],
  [38.7, 22.3],
  [38.9, 21.8],
  [39.0, 21.45],
  [39.1, 21.05],
  [39.35, 20.45],
  [39.75, 19.75],
  [40.4, 19.05],
  [41.1, 18.4],
  [41.55, 17.65],
  [42.1, 17.1],
  [42.55, 16.85],
  [42.8, 16.6],
  [43.4, 16.95],
  [44.4, 17.35],
  [44.7, 17.4],
  [45.9, 17.55],
  [46.85, 17.3],
  [47.7, 17.15],
  [48.6, 17.6],
  [49.5, 18.15],
  [49.95, 18.65],
  [51.7, 18.95],
  [52.4, 19.05],
  [53.65, 19.45],
  [55.2, 20.05],
  [55.7, 20.65],
  [55.85, 21.6],
  [55.1, 22.55],
  [54.4, 22.85],
  [53.05, 23.55],
  [52.4, 24.05],
  [51.4, 24.2],
  [50.95, 24.5],
  [50.65, 24.85],
  [50.85, 25.35],
  [50.15, 26.0],
  [50.1, 26.4],
  [49.95, 27.1],
  [49.2, 27.95],
  [48.85, 28.55],
  [48.65, 28.95],
  [48.4, 29.05],
  [47.85, 29.1],
  [46.55, 29.1],
  [44.7, 29.45],
  [43.2, 30.55],
  [42.45, 31.2],
  [41.3, 31.6],
  [40.2, 31.95],
  [39.3, 32.2],
  [38.55, 31.85],
  [37.65, 31.05],
  [36.85, 30.35],
  [36.2, 29.8],
  [35.55, 29.45],
  [35.1, 29.4],
  [34.85, 29.35],
];

function pointInLngLatPolygon(
  lng: number,
  lat: number,
  polygon: ReadonlyArray<[number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function isInsideKsaSilhouette(lng: number, lat: number): boolean {
  return pointInLngLatPolygon(lng, lat, KSA_OUTLINE_LNGLAT);
}

const KSA_SILHOUETTE_CENTROID = { lat: 24.0, lng: 45.0 } as const;

export function ensureInsideKsaSilhouette(
  lat: number,
  lng: number,
  anchorLat: number,
  anchorLng: number,
): { lat: number; lng: number } {
  if (isInsideKsaSilhouette(lng, lat)) return { lat, lng };
  if (isInsideKsaSilhouette(anchorLng, anchorLat)) {
    return { lat: anchorLat, lng: anchorLng };
  }
  for (let step = 1; step <= 12; step += 1) {
    const t = step / 12;
    const lat2 = anchorLat + (KSA_SILHOUETTE_CENTROID.lat - anchorLat) * t;
    const lng2 = anchorLng + (KSA_SILHOUETTE_CENTROID.lng - anchorLng) * t;
    if (isInsideKsaSilhouette(lng2, lat2)) return { lat: lat2, lng: lng2 };
  }
  return { lat: anchorLat, lng: anchorLng };
}
