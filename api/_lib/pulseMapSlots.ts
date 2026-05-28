/**
 * Pulse Map — southern pilot slot registry (server copy).
 * Keep in sync with `src/config/pulseMapSlots.ts`.
 */
import type { PlatformCityRegion } from './platformCoveredCities.js';

export type PulseMapSlotKind = 'city';

export type PulseMapSlot = {
  id: string;
  nameAr: string;
  region: PlatformCityRegion;
  x: number;
  y: number;
};

export const PULSE_MAP_VIEWBOX = {
  width: 1000,
  height: 520,
} as const;

/** Southern pilot viewport — الباحة · عسير · جازان · نجران */
export const PULSE_MAP_SOUTHERN_BOUNDS = {
  minLat: 16.75,
  maxLat: 20.25,
  minLng: 41.25,
  maxLng: 47.2,
} as const;

export const PULSE_MAP_PILOT_REGIONS: readonly PlatformCityRegion[] = [
  'asir',
  'baha',
  'jazan',
  'najran',
];

type SlotSeed = {
  id: string;
  nameAr: string;
  region: PlatformCityRegion;
  lat: number;
  lng: number;
  /** Manual nudge inside viewBox units */
  dx?: number;
  dy?: number;
};

const LAT_SPAN = PULSE_MAP_SOUTHERN_BOUNDS.maxLat - PULSE_MAP_SOUTHERN_BOUNDS.minLat;
const LNG_SPAN = PULSE_MAP_SOUTHERN_BOUNDS.maxLng - PULSE_MAP_SOUTHERN_BOUNDS.minLng;

function projectSouthernSlot(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - PULSE_MAP_SOUTHERN_BOUNDS.minLng) / LNG_SPAN) * PULSE_MAP_VIEWBOX.width;
  const y =
    ((PULSE_MAP_SOUTHERN_BOUNDS.maxLat - lat) / LAT_SPAN) * PULSE_MAP_VIEWBOX.height;
  return { x, y };
}

const SOUTHERN_SLOT_SEEDS: readonly SlotSeed[] = [
  { id: 'baha', nameAr: 'الباحة', region: 'baha', lat: 20.0129, lng: 41.55, dx: 8, dy: -4 },
  { id: 'bisha', nameAr: 'بيشة', region: 'asir', lat: 19.987, lng: 42.6, dx: 0, dy: 2 },
  { id: 'an-namas', nameAr: 'النماص', region: 'asir', lat: 19.145, lng: 42.12, dx: -6, dy: 4 },
  { id: 'muhayil', nameAr: 'محايل', region: 'asir', lat: 18.544, lng: 42.08, dx: -10, dy: 0 },
  { id: 'abha', nameAr: 'أبها', region: 'asir', lat: 18.2164, lng: 42.55, dx: 4, dy: 6 },
  { id: 'khamis-mushait', nameAr: 'خميس مشيط', region: 'asir', lat: 18.306, lng: 42.68, dx: 12, dy: 10 },
  { id: 'najran', nameAr: 'نجران', region: 'najran', lat: 17.5656, lng: 44.15, dx: -8, dy: 8 },
  { id: 'sharurah', nameAr: 'شرورة', region: 'najran', lat: 17.485, lng: 46.8, dx: -20, dy: 6 },
  { id: 'abu-arish', nameAr: 'أبو عريش', region: 'jazan', lat: 16.9689, lng: 42.78, dx: 6, dy: -6 },
  { id: 'sabya', nameAr: 'صبيا', region: 'jazan', lat: 17.1495, lng: 42.63, dx: 2, dy: -2 },
  { id: 'jazan', nameAr: 'جازان', region: 'jazan', lat: 16.8894, lng: 42.62, dx: 4, dy: 4 },
];

/** Simplified southern KSA outline for the pulse map backdrop. */
export const PULSE_MAP_SOUTHERN_OUTLINE: ReadonlyArray<[number, number]> = [
  [41.35, 20.15],
  [41.55, 19.55],
  [41.85, 18.85],
  [42.15, 17.95],
  [42.55, 16.82],
  [43.25, 16.68],
  [44.35, 17.05],
  [45.85, 17.35],
  [47.15, 17.25],
  [47.2, 18.05],
  [46.85, 19.15],
  [45.95, 19.85],
  [44.75, 20.05],
  [43.2, 20.18],
  [41.35, 20.15],
];

function buildSlots(): PulseMapSlot[] {
  return SOUTHERN_SLOT_SEEDS.map((seed) => {
    const base = projectSouthernSlot(seed.lat, seed.lng);
    return {
      id: seed.id,
      nameAr: seed.nameAr,
      region: seed.region,
      x: Math.min(PULSE_MAP_VIEWBOX.width, Math.max(0, base.x + (seed.dx ?? 0))),
      y: Math.min(PULSE_MAP_VIEWBOX.height, Math.max(0, base.y + (seed.dy ?? 0))),
    };
  });
}

export const PULSE_MAP_SLOTS: readonly PulseMapSlot[] = buildSlots();

const SLOT_BY_ID = new Map(PULSE_MAP_SLOTS.map((s) => [s.id, s]));

export function getPulseMapSlot(slotId: string): PulseMapSlot | null {
  return SLOT_BY_ID.get(slotId) ?? null;
}

export function isPulseMapPilotRegion(region: PlatformCityRegion | undefined): boolean {
  return region != null && PULSE_MAP_PILOT_REGIONS.includes(region);
}

export function outlineToSvgPath(
  vertices: ReadonlyArray<[number, number]>,
): string {
  const parts: string[] = [];
  vertices.forEach(([lng, lat], idx) => {
    const { x, y } = projectSouthernSlot(lat, lng);
    parts.push(`${idx === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  });
  parts.push('Z');
  return parts.join(' ');
}

export const PULSE_MAP_SOUTHERN_OUTLINE_PATH = outlineToSvgPath(PULSE_MAP_SOUTHERN_OUTLINE);
