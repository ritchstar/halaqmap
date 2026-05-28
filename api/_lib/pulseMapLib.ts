/**
 * Pulse Map — public API aggregation (slot-based, no raw GPS on wire).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { PULSE_MAP_PHASE } from './pulseMapConfig.js';
import {
  PULSE_MAP_PILOT_REGIONS,
  PULSE_MAP_SLOTS,
  getPulseMapSlot,
  isPulseMapPilotRegion,
} from './pulseMapSlots.js';
import {
  resolvePlatformCity,
  resolvePlatformCityFromSearch,
  type PlatformCity,
} from './platformCoveredCities.js';
import { SHOWCASE_BARBER_SOUTH_BBOX } from './showcaseRadarPlacement.js';

export type PulseMapMode = 'live' | 'curated' | 'phase1';

export type PulseMapKind = 'demand' | 'link';

export type PulseMapPulse = {
  id: string;
  kind: PulseMapKind;
  slotId: string;
  createdAt: string;
};

export type PulseMapLink = {
  id: string;
  fromSlotId: string;
  toSlotId: string;
};

export type PulseMapPayload = {
  ok: true;
  phase: typeof PULSE_MAP_PHASE;
  mode: PulseMapMode;
  collectedAt: string;
  pilotRegions: readonly string[];
  slots: typeof PULSE_MAP_SLOTS;
  pulses: PulseMapPulse[];
  links: PulseMapLink[];
  stats: {
    demandCount: number;
    linkCount: number;
    slotsActive: number;
  };
};

const LIMITS = {
  demandMax: 20,
  linkMax: 12,
  linkMaxAgeMinutes: 120,
  demandMaxAgeMinutes: 120,
} as const;

const PHASE1_DEMAND_SLOTS = [
  'baha',
  'bisha',
  'an-namas',
  'abha',
  'khamis-mushait',
  'najran',
  'jazan',
  'sabya',
] as const;

const PHASE1_LINK_SLOTS = [
  'muhayil',
  'abha',
  'abu-arish',
  'najran',
  'sharurah',
] as const;

function cityToSlotId(city: PlatformCity): string | null {
  if (!isPulseMapPilotRegion(city.region)) return null;
  const slot = getPulseMapSlot(city.id);
  return slot ? slot.id : null;
}

function buildPhase1Payload(): PulseMapPayload {
  return {
    ok: true,
    phase: PULSE_MAP_PHASE,
    mode: 'phase1',
    collectedAt: new Date().toISOString(),
    pilotRegions: PULSE_MAP_PILOT_REGIONS,
    slots: PULSE_MAP_SLOTS,
    pulses: [],
    links: [],
    stats: {
      demandCount: 0,
      linkCount: 0,
      slotsActive: PULSE_MAP_SLOTS.length,
    },
  };
}

const CURATED_DEMAND_SLOTS = ['abha', 'jazan', 'baha', 'najran', 'khamis-mushait', 'sabya'] as const;
const CURATED_LINK_SLOTS = ['abha', 'jazan', 'najran', 'baha'] as const;

function buildCuratedPayload(): Pick<PulseMapPayload, 'pulses' | 'links' | 'mode'> {
  const now = Date.now();
  const pulses: PulseMapPulse[] = [];
  for (const [i, slotId] of CURATED_DEMAND_SLOTS.entries()) {
    pulses.push({
      id: `demo-demand-${slotId}`,
      kind: 'demand',
      slotId,
      createdAt: new Date(now - (8 + i * 9) * 60_000).toISOString(),
    });
  }
  for (const [i, slotId] of CURATED_LINK_SLOTS.entries()) {
    pulses.push({
      id: `demo-link-${slotId}`,
      kind: 'link',
      slotId,
      createdAt: new Date(now - (5 + i * 11) * 60_000).toISOString(),
    });
  }
  const links: PulseMapLink[] = CURATED_LINK_SLOTS.slice(0, 3).map((slotId, i) => ({
    id: `demo-link-pair-${slotId}`,
    fromSlotId: CURATED_DEMAND_SLOTS[i] ?? slotId,
    toSlotId: slotId,
  }));
  return { mode: 'curated', pulses, links };
}

type SearchRow = {
  id: string;
  created_at: string;
  user_lat: number | null;
  user_lng: number | null;
  city_name: string | null;
};

type BarberRow = {
  id: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export async function buildPulseMapPayload(
  supabase: SupabaseClient<any>,
): Promise<PulseMapPayload> {
  if (PULSE_MAP_PHASE === 1) {
    return buildPhase1Payload();
  }

  return buildPulseMapLivePayload(supabase);
}

async function buildPulseMapLivePayload(
  supabase: SupabaseClient<any>,
): Promise<PulseMapPayload> {
  const demandSince = new Date(
    Date.now() - LIMITS.demandMaxAgeMinutes * 60_000,
  ).toISOString();

  const [searchRes, barbersRes] = await Promise.all([
    supabase
      .from('user_searches')
      .select('id, created_at, user_lat, user_lng, city_name')
      .gte('created_at', demandSince)
      .order('created_at', { ascending: false })
      .limit(150),
    supabase
      .from('barbers')
      .select('id, city, latitude, longitude')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', SHOWCASE_BARBER_SOUTH_BBOX.minLat)
      .lte('latitude', SHOWCASE_BARBER_SOUTH_BBOX.maxLat)
      .gte('longitude', SHOWCASE_BARBER_SOUTH_BBOX.minLng)
      .lte('longitude', SHOWCASE_BARBER_SOUTH_BBOX.maxLng)
      .limit(300),
  ]);

  const searchRows = searchRes.error ? [] : ((searchRes.data ?? []) as SearchRow[]);
  const barberRows = barbersRes.error ? [] : ((barbersRes.data ?? []) as BarberRow[]);

  const demandPulses: PulseMapPulse[] = [];
  const linkPulses: PulseMapPulse[] = [];
  const links: PulseMapLink[] = [];
  const activeSlots = new Set<string>();

  for (const row of searchRows) {
    if (demandPulses.length >= LIMITS.demandMax) break;
    const city = resolvePlatformCityFromSearch(row.city_name, row.user_lat, row.user_lng);
    if (!city) continue;
    const slotId = cityToSlotId(city);
    if (!slotId) continue;
    activeSlots.add(slotId);
    demandPulses.push({
      id: row.id,
      kind: 'demand',
      slotId,
      createdAt: row.created_at,
    });
  }

  const linkBySlot = new Map<string, number>();
  for (const b of barberRows) {
    const city = resolvePlatformCity(b.city);
    if (!city || !isPulseMapPilotRegion(city.region)) continue;
    const slotId = cityToSlotId(city);
    if (!slotId) continue;
    linkBySlot.set(slotId, (linkBySlot.get(slotId) ?? 0) + 1);
  }

  for (const [slotId] of linkBySlot.entries()) {
    if (linkPulses.length >= LIMITS.linkMax) break;
    activeSlots.add(slotId);
    linkPulses.push({
      id: `link-${slotId}`,
      kind: 'link',
      slotId,
      createdAt: new Date().toISOString(),
    });
  }

  for (const demand of demandPulses.slice(0, 8)) {
    const matchingLink = linkPulses.find((l) => l.slotId === demand.slotId);
    if (!matchingLink) continue;
    if (links.length >= 8) break;
    links.push({
      id: `pair-${demand.id}-${matchingLink.id}`,
      fromSlotId: demand.slotId,
      toSlotId: matchingLink.slotId,
    });
  }

  let mode: PulseMapMode = 'live';
  let pulses = [...demandPulses, ...linkPulses];

  if (demandPulses.length === 0) {
    const curated = buildCuratedPayload();
    mode = curated.mode;
    pulses = curated.pulses;
    links.splice(0, links.length, ...curated.links);
    for (const p of pulses) activeSlots.add(p.slotId);
  }

  return {
    ok: true,
    phase: PULSE_MAP_PHASE,
    mode,
    collectedAt: new Date().toISOString(),
    pilotRegions: PULSE_MAP_PILOT_REGIONS,
    slots: PULSE_MAP_SLOTS,
    pulses,
    links,
    stats: {
      demandCount: pulses.filter((p) => p.kind === 'demand').length,
      linkCount: pulses.filter((p) => p.kind === 'link').length,
      slotsActive: activeSlots.size,
    },
  };
}
