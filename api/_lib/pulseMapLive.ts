/**
 * Pulse Map — live aggregation (one pulse per city per kind).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PULSE_MAP_SLOTS,
  getPulseMapSlot,
} from './pulseMapSlots.js';
import {
  resolvePlatformCity,
  resolvePlatformCityFromSearch,
  type PlatformCity,
} from './platformCoveredCities.js';
import type { PulseMapPayload, PulseMapPulse } from './pulseMapTypes.js';

export const PULSE_MAP_INTERACTION_WINDOW_MINUTES = 120;

type SearchRow = {
  id: string;
  created_at: string;
  user_lat: number | null;
  user_lng: number | null;
  city_name: string | null;
};

type ConversationRow = {
  barber_id: string | null;
  started_at: string;
};

type BookingRow = {
  barber_id: string;
  created_at: string;
};

type BarberCityRow = {
  id: string;
  city: string | null;
};

function cityToSlotId(city: PlatformCity): string | null {
  const slot = getPulseMapSlot(city.id);
  return slot ? slot.id : null;
}

function aggregateDemandPulses(rows: SearchRow[]): PulseMapPulse[] {
  const bySlot = new Map<string, PulseMapPulse>();

  for (const row of rows) {
    const city = resolvePlatformCityFromSearch(row.city_name, row.user_lat, row.user_lng);
    if (!city) continue;
    const slotId = cityToSlotId(city);
    if (!slotId) continue;

    const prev = bySlot.get(slotId);
    if (!prev || row.created_at > prev.createdAt) {
      bySlot.set(slotId, {
        id: `demand-${slotId}`,
        kind: 'demand',
        slotId,
        createdAt: row.created_at,
      });
    }
  }

  return [...bySlot.values()];
}

function aggregateLinkPulses(
  conversations: ConversationRow[],
  bookings: BookingRow[],
  barberCityById: Map<string, PlatformCity>,
): PulseMapPulse[] {
  const latestBySlot = new Map<string, string>();

  const consider = (barberId: string | null | undefined, createdAt: string) => {
    if (!barberId) return;
    const city = barberCityById.get(barberId);
    if (!city) return;
    const slotId = cityToSlotId(city);
    if (!slotId) return;
    const prev = latestBySlot.get(slotId);
    if (!prev || createdAt > prev) latestBySlot.set(slotId, createdAt);
  };

  for (const row of conversations) consider(row.barber_id, row.started_at);
  for (const row of bookings) consider(row.barber_id, row.created_at);

  return [...latestBySlot.entries()].map(([slotId, createdAt]) => ({
    id: `link-${slotId}`,
    kind: 'link' as const,
    slotId,
    createdAt,
  }));
}

export async function buildPulseMapLivePayload(
  supabase: SupabaseClient<any>,
  phase: PulseMapPayload['phase'],
  pilotRegions: PulseMapPayload['pilotRegions'],
): Promise<PulseMapPayload> {
  const since = new Date(
    Date.now() - PULSE_MAP_INTERACTION_WINDOW_MINUTES * 60_000,
  ).toISOString();

  const [searchRes, conversationsRes, bookingsRes] = await Promise.all([
    supabase
      .from('user_searches')
      .select('id, created_at, user_lat, user_lng, city_name')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('private_conversations')
      .select('barber_id, started_at')
      .gte('started_at', since)
      .not('barber_id', 'is', null)
      .order('started_at', { ascending: false })
      .limit(400),
    supabase
      .from('bookings')
      .select('barber_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(400),
  ]);

  const searchRows = searchRes.error ? [] : ((searchRes.data ?? []) as SearchRow[]);
  const conversationRows = conversationsRes.error
    ? []
    : ((conversationsRes.data ?? []) as ConversationRow[]);
  const bookingRows = bookingsRes.error ? [] : ((bookingsRes.data ?? []) as BookingRow[]);

  const barberIds = new Set<string>();
  for (const row of conversationRows) {
    if (row.barber_id) barberIds.add(row.barber_id);
  }
  for (const row of bookingRows) barberIds.add(row.barber_id);

  const barberCityById = new Map<string, PlatformCity>();
  if (barberIds.size > 0) {
    const barbersRes = await supabase
      .from('barbers')
      .select('id, city')
      .in('id', [...barberIds])
      .limit(500);
    const barberRows = barbersRes.error ? [] : ((barbersRes.data ?? []) as BarberCityRow[]);
    for (const barber of barberRows) {
      const city = resolvePlatformCity(barber.city);
      if (city) barberCityById.set(barber.id, city);
    }
  }

  const demandPulses = aggregateDemandPulses(searchRows);
  const linkPulses = aggregateLinkPulses(conversationRows, bookingRows, barberCityById);
  const pulses = [...demandPulses, ...linkPulses];

  return {
    ok: true,
    phase,
    mode: 'live',
    collectedAt: new Date().toISOString(),
    pilotRegions,
    slots: PULSE_MAP_SLOTS,
    pulses,
    links: [],
    stats: {
      demandCount: demandPulses.length,
      linkCount: linkPulses.length,
      slotsActive: PULSE_MAP_SLOTS.length,
    },
  };
}
