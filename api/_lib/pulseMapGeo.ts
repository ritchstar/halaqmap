/**
 * Pulse Map geometry — server copy (keep in sync with src/modules/pulse-map/lib/pulseMapGeo.ts).
 */

export type LngLat = [number, number];

/** Same vertices as `KSA_OUTLINE_LNGLAT` in saudiKingdomGeo.ts */
const KSA_OUTLINE_LNGLAT: ReadonlyArray<LngLat> = [
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

export const PULSE_MAP_SOUTHERN_BOUNDS = {
  minLat: 16.55,
  maxLat: 20.45,
  minLng: 39.5,
  maxLng: 48.05,
} as const;

export type PulseMapBounds = typeof PULSE_MAP_SOUTHERN_BOUNDS;

const LNG_SPAN = PULSE_MAP_SOUTHERN_BOUNDS.maxLng - PULSE_MAP_SOUTHERN_BOUNDS.minLng;
const LAT_SPAN = PULSE_MAP_SOUTHERN_BOUNDS.maxLat - PULSE_MAP_SOUTHERN_BOUNDS.minLat;

export const PULSE_MAP_VIEWBOX = {
  width: 1000,
  height: Math.round((LAT_SPAN / LNG_SPAN) * 1000),
} as const;

export function projectPulseMapLngLat(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - PULSE_MAP_SOUTHERN_BOUNDS.minLng) / LNG_SPAN) * PULSE_MAP_VIEWBOX.width;
  const y =
    ((PULSE_MAP_SOUTHERN_BOUNDS.maxLat - lat) / LAT_SPAN) * PULSE_MAP_VIEWBOX.height;
  return { x, y };
}

function intersectX(a: LngLat, b: LngLat, x: number): LngLat {
  const t = (x - a[0]) / (b[0] - a[0] + Number.EPSILON);
  return [x, a[1] + t * (b[1] - a[1])];
}

function intersectY(a: LngLat, b: LngLat, y: number): LngLat {
  const t = (y - a[1]) / (b[1] - a[1] + Number.EPSILON);
  return [a[0] + t * (b[0] - a[0]), y];
}

function clipPolygonToBounds(polygon: ReadonlyArray<LngLat>, bounds: PulseMapBounds): LngLat[] {
  let points = [...polygon];
  const clips: Array<{
    inside: (p: LngLat) => boolean;
    intersect: (a: LngLat, b: LngLat) => LngLat;
  }> = [
    {
      inside: (p) => p[0] >= bounds.minLng,
      intersect: (a, b) => intersectX(a, b, bounds.minLng),
    },
    {
      inside: (p) => p[0] <= bounds.maxLng,
      intersect: (a, b) => intersectX(a, b, bounds.maxLng),
    },
    {
      inside: (p) => p[1] >= bounds.minLat,
      intersect: (a, b) => intersectY(a, b, bounds.minLat),
    },
    {
      inside: (p) => p[1] <= bounds.maxLat,
      intersect: (a, b) => intersectY(a, b, bounds.maxLat),
    },
  ];

  for (const clip of clips) {
    const next: LngLat[] = [];
    if (points.length === 0) break;
    for (let i = 0; i < points.length; i += 1) {
      const curr = points[i];
      const prev = points[(i + points.length - 1) % points.length];
      const currIn = clip.inside(curr);
      const prevIn = clip.inside(prev);
      if (currIn) {
        if (!prevIn) next.push(clip.intersect(prev, curr));
        next.push(curr);
      } else if (prevIn) {
        next.push(clip.intersect(prev, curr));
      }
    }
    points = next;
  }
  return points;
}

export function buildSouthernKsaOutlineLngLat(): LngLat[] {
  return clipPolygonToBounds(KSA_OUTLINE_LNGLAT, PULSE_MAP_SOUTHERN_BOUNDS);
}

export function outlineLngLatToSvgPath(vertices: ReadonlyArray<LngLat>): string {
  if (vertices.length < 3) return '';
  const parts: string[] = [];
  vertices.forEach(([lng, lat], idx) => {
    const { x, y } = projectPulseMapLngLat(lng, lat);
    parts.push(`${idx === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  });
  parts.push('Z');
  return parts.join(' ');
}

export const PULSE_MAP_SOUTHERN_OUTLINE_LNGLAT = buildSouthernKsaOutlineLngLat();

export const PULSE_MAP_SOUTHERN_OUTLINE_PATH = outlineLngLatToSvgPath(
  PULSE_MAP_SOUTHERN_OUTLINE_LNGLAT,
);

export function isInsideSouthernOutline(lng: number, lat: number): boolean {
  const polygon = PULSE_MAP_SOUTHERN_OUTLINE_LNGLAT;
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

export function nudgeLngLatInsideOutline(
  lng: number,
  lat: number,
  anchorLng: number,
  anchorLat: number,
): { lng: number; lat: number } {
  if (isInsideSouthernOutline(lng, lat)) return { lng, lat };
  if (isInsideSouthernOutline(anchorLng, anchorLat)) {
    return { lng: anchorLng, lat: anchorLat };
  }
  const cx = 43.2;
  const cy = 18.4;
  for (let step = 1; step <= 14; step += 1) {
    const t = step / 14;
    const lng2 = anchorLng + (cx - anchorLng) * t;
    const lat2 = anchorLat + (cy - anchorLat) * t;
    if (isInsideSouthernOutline(lng2, lat2)) return { lng: lng2, lat: lat2 };
  }
  return { lng: anchorLng, lat: anchorLat };
}
