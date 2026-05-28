/**
 * Pulse Map — city slot registry (server copy).
 * Step 1: outline only — slots empty until city anchors are added.
 * Keep in sync with `src/config/pulseMapSlots.ts`.
 */
import type { PlatformCityRegion } from './platformCoveredCities.js';

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

export const PULSE_MAP_PILOT_REGIONS: readonly PlatformCityRegion[] = [];

export const PULSE_MAP_SLOTS: readonly PulseMapSlot[] = [];

export function getPulseMapSlot(_slotId: string): PulseMapSlot | null {
  return null;
}

export function isPulseMapPilotRegion(_region: PlatformCityRegion | undefined): boolean {
  return false;
}
