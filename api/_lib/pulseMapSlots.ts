/**
 * Pulse Map — city slot registry (server copy).
 * Keep in sync with `src/config/pulseMapSlots.ts`.
 */
import type { PlatformCityRegion } from './platformCoveredCities.js';
import { SHOWCASE_BARBER_REGION_ALLOWLIST } from './platformCoveredCities.js';
import { PULSE_MAP_CITY_MARKERS } from './pulseMapCities.js';

export type PulseMapSlot = {
  id: string;
  nameAr: string;
  region: PlatformCityRegion;
  x: number;
  y: number;
};

export {
  PULSE_MAP_BOUNDS,
  PULSE_MAP_KINGDOM_OUTLINE_PATHS,
  PULSE_MAP_VIEWBOX,
  projectPulseMapLngLat,
} from './pulseMapGeo.js';

export { PULSE_MAP_CITY_MARKERS } from './pulseMapCities.js';

export const PULSE_MAP_PILOT_REGIONS: readonly PlatformCityRegion[] =
  SHOWCASE_BARBER_REGION_ALLOWLIST;

export const PULSE_MAP_SLOTS: readonly PulseMapSlot[] = PULSE_MAP_CITY_MARKERS.map((city) => ({
  id: city.id,
  nameAr: city.nameAr,
  region: city.region,
  x: city.x,
  y: city.y,
}));

const SLOT_BY_ID = new Map(PULSE_MAP_SLOTS.map((s) => [s.id, s]));

export function getPulseMapSlot(slotId: string): PulseMapSlot | null {
  return SLOT_BY_ID.get(slotId) ?? null;
}

export function isPulseMapPilotRegion(region: PlatformCityRegion | undefined): boolean {
  return region != null && PULSE_MAP_PILOT_REGIONS.includes(region);
}
