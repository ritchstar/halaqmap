/**
 * Pulse Map geometry — clip real KSA outline to southern pilot viewport.
 */
import { KSA_OUTLINE_LNGLAT } from '@/modules/platform-radar/lib/saudiKingdomGeo';

export type LngLat = [number, number];

/** Southern pilot window — wide enough for Red Sea coast + Empty Quarter arc. */
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

/** KSA southern pilot — clipped from the tactical kingdom outline. */
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

/** Red Sea + Empty Quarter hints outside the land fill. */
export const PULSE_MAP_SEA_LABELS = [
  { id: 'red-sea', labelAr: 'البحر الأحمر', lng: 39.85, lat: 18.35 },
  { id: 'empty-quarter', labelAr: 'الربع الخالي', lng: 47.35, lat: 19.05 },
] as const;

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
