/**
 * Pulse Map — city anchors from `PLATFORM_COVERED_CITIES` (WGS-84 centres).
 * Tier labels follow `CITY_BEACONS` in platform-radar (capital · major · hub).
 */
import {
  PLATFORM_COVERED_CITIES,
  type PlatformCity,
  type PlatformCityRegion,
} from '@/config/platformCoveredCities';
import {
  PULSE_MAP_VIEWBOX,
  isInsideKingdomOutline,
  projectPulseMapLngLat,
} from '@/modules/pulse-map/lib/pulseMapGeo';

export type PulseMapCityTier = 'capital' | 'major' | 'hub' | 'city';

const BEACON_TIER_BY_ID: Partial<Record<string, PulseMapCityTier>> = {
  riyadh: 'capital',
  jeddah: 'major',
  makkah: 'major',
  taif: 'major',
  madinah: 'major',
  dammam: 'major',
  ahsa: 'major',
  khobar: 'hub',
  jubail: 'hub',
  tabuk: 'hub',
  hail: 'hub',
  buraidah: 'hub',
  abha: 'hub',
  'khamis-mushait': 'hub',
  jazan: 'hub',
  najran: 'hub',
  baha: 'hub',
  yanbu: 'hub',
  'hafar-al-batin': 'hub',
  arar: 'hub',
  sakaka: 'hub',
};

export type PulseMapCityMarker = {
  id: string;
  nameAr: string;
  region: PlatformCityRegion;
  lng: number;
  lat: number;
  x: number;
  y: number;
  tier: PulseMapCityTier;
  showLabel: boolean;
};

function clampViewCoord(value: number, max: number): number {
  return Math.min(max, Math.max(0, value));
}

function buildCityMarker(city: PlatformCity): PulseMapCityMarker | null {
  if (!city.region || !isInsideKingdomOutline(city.lng, city.lat)) return null;
  const tier = BEACON_TIER_BY_ID[city.id] ?? 'city';
  const { x, y } = projectPulseMapLngLat(city.lng, city.lat);
  return {
    id: city.id,
    nameAr: city.nameAr,
    region: city.region,
    lng: city.lng,
    lat: city.lat,
    x: clampViewCoord(x, PULSE_MAP_VIEWBOX.width),
    y: clampViewCoord(y, PULSE_MAP_VIEWBOX.height),
    tier,
    showLabel: tier !== 'city',
  };
}

export const PULSE_MAP_CITY_MARKERS: readonly PulseMapCityMarker[] = PLATFORM_COVERED_CITIES.map(
  buildCityMarker,
).filter((marker): marker is PulseMapCityMarker => marker != null);

const MARKER_BY_ID = new Map(PULSE_MAP_CITY_MARKERS.map((m) => [m.id, m]));

export function getPulseMapCityMarker(cityId: string): PulseMapCityMarker | null {
  return MARKER_BY_ID.get(cityId) ?? null;
}
