/**
 * Fleet demand signals — aggregated counters only (no end-user PII).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalShiftContext } from './digitalShiftAssistant.js';
import { dismissRecommendationsByDedupeKeys, upsertRecommendation } from './digitalShiftAssistant.js';
import {
  MARKET_STAGNATION_RECOMMENDATION_BODY_AR,
  MARKET_STAGNATION_RECOMMENDATION_TITLE_AR,
} from './barberFacingCopySanitize.js';

export type FleetDemandSignalType =
  | 'intercept_shop_closed'
  | 'intercept_barber_delay'
  | 'conversation_started'
  | 'market_stagnation';

export type FleetDemandCityRollup = {
  cityAr: string;
  signalType: FleetDemandSignalType;
  total: number;
};

export type FleetStagnationCityRollup = {
  cityAr: string;
  salonCount: number;
  avgDaysSinceContact: number | null;
};

export type FleetDemandSnapshot = {
  windowHours: number;
  collectedAt: string;
  totalsBySignal: Partial<Record<FleetDemandSignalType, number>>;
  topCities: FleetDemandCityRollup[];
  stagnationByCity: FleetStagnationCityRollup[];
  stagnationSalonsToday: number;
};

const STAGNATION_QUIET_DAYS = 7;
const STAGNATION_CONVERSATION_WINDOW_DAYS = 7;

export async function recordFleetDemandSignal(
  supabase: SupabaseClient,
  params: {
    cityAr: string;
    signalType: FleetDemandSignalType;
    districtAr?: string;
  },
): Promise<void> {
  const city = params.cityAr.trim();
  if (!city) return;

  try {
    await supabase.rpc('increment_fleet_demand_counter', {
      p_city_ar: city.slice(0, 120),
      p_signal_type: params.signalType,
      p_district_ar: (params.districtAr ?? '').trim().slice(0, 120),
    });
  } catch {
    /* silent — demand telemetry must not block product flows */
  }
}

export async function loadFleetDemandSnapshot(
  supabase: SupabaseClient,
  windowHours = 24,
): Promise<FleetDemandSnapshot> {
  const hours = Math.min(168, Math.max(1, Math.round(windowHours)));
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const totalsBySignal: Partial<Record<FleetDemandSignalType, number>> = {};
  const cityMap = new Map<string, FleetDemandCityRollup>();

  try {
    const { data: rows } = await supabase
      .from('fleet_demand_counters')
      .select('city_ar, signal_type, counter')
      .gte('bucket_hour', since)
      .limit(5000);

    for (const row of rows ?? []) {
      const signal = String(row.signal_type ?? '') as FleetDemandSignalType;
      const count = Number(row.counter ?? 0);
      if (!count) continue;

      totalsBySignal[signal] = (totalsBySignal[signal] ?? 0) + count;

      const cityAr = String(row.city_ar ?? '').trim();
      if (!cityAr) continue;
      const key = `${cityAr}::${signal}`;
      const prev = cityMap.get(key);
      if (prev) prev.total += count;
      else cityMap.set(key, { cityAr, signalType: signal, total: count });
    }
  } catch {
    /* partial snapshot */
  }

  const stagnationByCity: FleetStagnationCityRollup[] = [];
  let stagnationSalonsToday = 0;

  try {
    const { data: stagnationRows } = await supabase
      .from('fleet_salon_stagnation_pulse')
      .select('city_ar, days_since_last_contact')
      .eq('bucket_day', today)
      .limit(2000);

    stagnationSalonsToday = stagnationRows?.length ?? 0;

    const byCity = new Map<string, { count: number; sumDays: number; withDays: number }>();
    for (const row of stagnationRows ?? []) {
      const cityAr = String(row.city_ar ?? '').trim();
      if (!cityAr) continue;
      const agg = byCity.get(cityAr) ?? { count: 0, sumDays: 0, withDays: 0 };
      agg.count += 1;
      if (row.days_since_last_contact != null) {
        agg.sumDays += Number(row.days_since_last_contact);
        agg.withDays += 1;
      }
      byCity.set(cityAr, agg);
    }

    for (const [cityAr, agg] of byCity) {
      stagnationByCity.push({
        cityAr,
        salonCount: agg.count,
        avgDaysSinceContact: agg.withDays > 0 ? Math.round(agg.sumDays / agg.withDays) : null,
      });
    }

    stagnationByCity.sort((a, b) => b.salonCount - a.salonCount);
  } catch {
    /* partial snapshot */
  }

  const topCities = [...cityMap.values()].sort((a, b) => b.total - a.total).slice(0, 12);

  return {
    windowHours: hours,
    collectedAt: new Date().toISOString(),
    totalsBySignal,
    topCities,
    stagnationByCity: stagnationByCity.slice(0, 8),
    stagnationSalonsToday,
  };
}

export async function assessMarketStagnation(
  supabase: SupabaseClient,
  barberId: string,
  ctx: DigitalShiftContext,
): Promise<{ stagnant: boolean; conversations7d: number; daysSinceLastContact: number | null }> {
  const cityAr = ctx.cityAr?.trim() ?? '';
  if (!cityAr || ctx.listingDaysRemaining <= 0) {
    return { stagnant: false, conversations7d: 0, daysSinceLastContact: null };
  }

  const since7d = new Date(Date.now() - STAGNATION_CONVERSATION_WINDOW_DAYS * 86400000).toISOString();

  const { data: barberRow } = await supabase
    .from('barbers')
    .select('user_id')
    .eq('id', barberId)
    .maybeSingle();
  const barberUserId = String(barberRow?.user_id ?? '').trim();
  if (!barberUserId) {
    await dismissRecommendationsByDedupeKeys(supabase, barberId, ['market_stagnation_local']);
    return { stagnant: false, conversations7d: 0, daysSinceLastContact: null };
  }

  const [{ count: conversations7d }, { data: lastConv }] = await Promise.all([
    supabase
      .from('private_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('barber_user_id', barberUserId)
      .gte('started_at', since7d),
    supabase
      .from('private_conversations')
      .select('started_at')
      .eq('barber_user_id', barberUserId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const convCount = conversations7d ?? 0;
  const daysSinceLastContact = lastConv?.started_at
    ? Math.floor((Date.now() - new Date(String(lastConv.started_at)).getTime()) / 86400000)
    : null;

  const stagnant =
    convCount === 0 &&
    (daysSinceLastContact == null || daysSinceLastContact >= STAGNATION_QUIET_DAYS);

  if (!stagnant) {
    await dismissRecommendationsByDedupeKeys(supabase, barberId, ['market_stagnation_local']);
    return { stagnant: false, conversations7d: convCount, daysSinceLastContact };
  }

  const noteAr =
    `هدوء محلي — ${cityAr}: لا محادثات خلال ${STAGNATION_CONVERSATION_WINDOW_DAYS} أيام` +
    (daysSinceLastContact != null ? ` · آخر تواصل منذ ${daysSinceLastContact} يوم` : ' · لا سجل تواصل سابق');

  await Promise.all([
    upsertRecommendation(supabase, {
      barberId,
      category: 'shift_chat',
      priority: 88,
      dedupeKey: 'market_stagnation_local',
      title: MARKET_STAGNATION_RECOMMENDATION_TITLE_AR,
      body: MARKET_STAGNATION_RECOMMENDATION_BODY_AR,
      metadata: {
        conversations7d: convCount,
        daysSinceLastContact,
        cityAr,
        source: 'shift_stagnation_assessment',
      },
    }),
    recordFleetDemandSignal(supabase, { cityAr, signalType: 'market_stagnation' }),
    supabase.from('fleet_salon_stagnation_pulse').upsert(
      {
        barber_id: barberId,
        city_ar: cityAr.slice(0, 120),
        bucket_day: new Date().toISOString().slice(0, 10),
        days_since_last_contact: daysSinceLastContact,
        conversations_7d: convCount,
        listing_days_remaining: ctx.listingDaysRemaining,
        shop_open: ctx.shopOpen,
        note_ar: noteAr.slice(0, 500),
        reported_at: new Date().toISOString(),
      },
      { onConflict: 'barber_id,bucket_day' },
    ),
  ]);

  return { stagnant: true, conversations7d: convCount, daysSinceLastContact };
}
