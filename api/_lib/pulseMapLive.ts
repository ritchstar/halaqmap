/**
 * Pulse Map — live aggregation (one pulse per city per kind).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { PULSE_MAP_SLOTS, getPulseMapSlot } from './pulseMapSlots.js';
import {
  resolvePlatformCity,
  resolvePlatformCityFromSearch,
  type PlatformCity,
} from './platformCoveredCities.js';
import type {
  PulseMapAdminCitySignal,
  PulseMapAdminInsight,
  PulseMapPayload,
  PulseMapPulse,
} from './pulseMapTypes.js';

export const PULSE_MAP_INTERACTION_WINDOW_MINUTES = 120;

export type PulseMapLiveOptions = {
  windowMinutes?: number;
  includeAdmin?: boolean;
};

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

function buildAdminInsight(
  windowMinutes: number,
  searchRows: SearchRow[],
  conversationRows: ConversationRow[],
  bookingRows: BookingRow[],
  demandPulses: PulseMapPulse[],
  linkPulses: PulseMapPulse[],
): PulseMapAdminInsight {
  const slotNameById = new Map(PULSE_MAP_SLOTS.map((s) => [s.id, s.nameAr]));
  const signals = new Map<string, PulseMapAdminCitySignal>();

  const touch = (slotId: string, kind: 'demand' | 'link', createdAt: string) => {
    const prev = signals.get(slotId) ?? {
      slotId,
      nameAr: slotNameById.get(slotId) ?? slotId,
      demand: false,
      link: false,
      latestAt: null as string | null,
    };
    if (kind === 'demand') prev.demand = true;
    if (kind === 'link') prev.link = true;
    if (!prev.latestAt || createdAt > prev.latestAt) prev.latestAt = createdAt;
    signals.set(slotId, prev);
  };

  for (const pulse of demandPulses) touch(pulse.slotId, 'demand', pulse.createdAt);
  for (const pulse of linkPulses) touch(pulse.slotId, 'link', pulse.createdAt);

  const citySignals = [...signals.values()].sort((a, b) =>
    (b.latestAt ?? '').localeCompare(a.latestAt ?? ''),
  );

  return {
    windowMinutes,
    raw: {
      searches: searchRows.length,
      conversations: conversationRows.length,
      bookings: bookingRows.length,
    },
    citySignals,
  };
}

export async function buildPulseMapLivePayload(
  supabase: SupabaseClient<any>,
  phase: PulseMapPayload['phase'],
  pilotRegions: PulseMapPayload['pilotRegions'],
  options: PulseMapLiveOptions = {},
): Promise<PulseMapPayload> {
  const windowMinutes = Math.min(
    720,
    Math.max(15, Math.round(options.windowMinutes ?? PULSE_MAP_INTERACTION_WINDOW_MINUTES)),
  );
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

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

  const payload: PulseMapPayload = {
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

  if (options.includeAdmin) {
    payload.admin = buildAdminInsight(
      windowMinutes,
      searchRows,
      conversationRows,
      bookingRows,
      demandPulses,
      linkPulses,
    );
  }

  return payload;
}
