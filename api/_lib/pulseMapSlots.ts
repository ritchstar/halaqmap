/**
 * Pulse Map — southern pilot slot registry (server copy).
 * Keep in sync with `src/config/pulseMapSlots.ts`.
 */
import type { PlatformCityRegion } from './platformCoveredCities.js';
import {
  PULSE_MAP_VIEWBOX,
  nudgeLngLatInsideOutline,
  projectPulseMapLngLat,
} from './pulseMapGeo.js';

export type PulseMapSlot = {
  id: string;
  nameAr: string;
  region: PlatformCityRegion;
  x: number;
  y: number;
};

export { PULSE_MAP_VIEWBOX, PULSE_MAP_SOUTHERN_BOUNDS, PULSE_MAP_SOUTHERN_OUTLINE_PATH } from './pulseMapGeo.js';

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
  lng: number;
  lat: number;
};

const SOUTHERN_SLOT_SEEDS: readonly SlotSeed[] = [
  { id: 'baha', nameAr: 'الباحة', region: 'baha', lng: 41.4677, lat: 20.0129 },
  { id: 'bisha', nameAr: 'بيشة', region: 'asir', lng: 42.589, lat: 19.987 },
  { id: 'an-namas', nameAr: 'النماص', region: 'asir', lng: 42.113, lat: 19.145 },
  { id: 'muhayil', nameAr: 'محايل', region: 'asir', lng: 42.053, lat: 18.544 },
  { id: 'abha', nameAr: 'أبها', region: 'asir', lng: 42.5053, lat: 18.2164 },
  { id: 'khamis-mushait', nameAr: 'خميس مشيط', region: 'asir', lng: 42.7298, lat: 18.306 },
  { id: 'najran', nameAr: 'نجران', region: 'najran', lng: 44.2289, lat: 17.5656 },
  { id: 'sharurah', nameAr: 'شرورة', region: 'najran', lng: 47.114, lat: 17.485 },
  { id: 'abu-arish', nameAr: 'أبو عريش', region: 'jazan', lng: 42.8317, lat: 16.9689 },
  { id: 'sabya', nameAr: 'صبيا', region: 'jazan', lng: 42.6257, lat: 17.1495 },
  { id: 'jazan', nameAr: 'جازان', region: 'jazan', lng: 42.5706, lat: 16.8894 },
];

function buildSlots(): PulseMapSlot[] {
  return SOUTHERN_SLOT_SEEDS.map((seed) => {
    const anchored = nudgeLngLatInsideOutline(seed.lng, seed.lat, seed.lng, seed.lat);
    const { x, y } = projectPulseMapLngLat(anchored.lng, anchored.lat);
    return {
      id: seed.id,
      nameAr: seed.nameAr,
      region: seed.region,
      x: Math.min(PULSE_MAP_VIEWBOX.width, Math.max(0, x)),
      y: Math.min(PULSE_MAP_VIEWBOX.height, Math.max(0, y)),
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
