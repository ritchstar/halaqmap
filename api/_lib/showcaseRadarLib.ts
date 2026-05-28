/**
 * Showcase Radar — server-side aggregation (sanitized, no raw user coords).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PLATFORM_CITY_COUNT,
  resolvePlatformCity,
  resolvePlatformCityFromSearch,
  snapPulseToCity,
} from './platformCoveredCities.js';

export type ShowcaseRadarMode = 'live' | 'curated';

export type ShowcaseRadarPulse = {
  id: string;
  kind: 'demand' | 'salon_cluster';
  lat: number;
  lng: number;
  cityAr: string;
  districtAr?: string;
  createdAt: string;
  labelAr: string;
};

export type ShowcaseRadarPayload = {
  ok: true;
  mode: ShowcaseRadarMode;
  collectedAt: string;
  stats: {
    citiesCovered: number;
    pulsesVisible: number;
    activeSalonsApprox: number;
  };
  citySignals: { cityAr: string; pulseCount24h: number }[];
  pulses: ShowcaseRadarPulse[];
  onDemandTaglineAr: string;
};

const SHOWCASE_LIMITS = {
  pulseMaxVisible: 24,
  pulseMaxAgeMinutes: 120,
  salonClusterMax: 12,
} as const;

const ON_DEMAND_TAGLINE_AR =
  'الظهور عند الطلب · On-Demand Visibility — الصالون يظهر حين يبحث زبون قريب.';

/** عرض مُ curate — موزّع على مدن مغطاة (لا إحداثيات خام). */
const CURATED_DEMO_CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة',
  'المدينة',
  'الطائف',
  'أبها',
  'تبوك',
  'بريدة',
  'حائل',
  'الخبر',
  'جازان',
] as const;

function buildCuratedDemoPulses(): ShowcaseRadarPulse[] {
  const pulses: ShowcaseRadarPulse[] = [];
  for (const [index, cityAr] of CURATED_DEMO_CITIES.entries()) {
    const city = resolvePlatformCity(cityAr);
    if (!city) continue;
    const coords = snapPulseToCity(city, `demo-${city.id}`);
    const ageMinutes = 8 + index * 11;
    pulses.push({
      id: `demo-${city.id}`,
      kind: 'demand',
      lat: coords.lat,
      lng: coords.lng,
      cityAr: city.nameAr,
      createdAt: new Date(Date.now() - ageMinutes * 60_000).toISOString(),
      labelAr: `نبض مستخدم — ${city.nameAr}`,
    });
  }
  return pulses;
}

function formatUserPulseLabel(cityAr: string, districtAr?: string | null): string {
  if (districtAr?.trim()) return `نبض مستخدم — ${cityAr} · ${districtAr.trim()}`;
  return `نبض مستخدم — ${cityAr}`;
}

function formatBarberPulseLabel(cityAr: string, count: number): string {
  return `نبض حلاق — ${cityAr} (${count})`;
}

type SearchRow = {
  id: string;
  created_at: string;
  user_lat: number | null;
  user_lng: number | null;
  district_name: string | null;
  city_name: string | null;
};

type BarberRow = {
  id: string;
  city: string | null;
  is_active: boolean | null;
};

export async function buildShowcaseRadarPayload(
  supabase: SupabaseClient<any>,
): Promise<ShowcaseRadarPayload> {
  const since = new Date(
    Date.now() - SHOWCASE_LIMITS.pulseMaxAgeMinutes * 60 * 1000,
  ).toISOString();

  const [searchRes, barbersRes] = await Promise.all([
    supabase
      .from('user_searches')
      .select('id, created_at, user_lat, user_lng, district_name, city_name')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('barbers')
      .select('id, city, is_active')
      .eq('is_active', true)
      .limit(500),
  ]);

  const searchRows = searchRes.error ? [] : ((searchRes.data ?? []) as SearchRow[]);
  const barberRows = barbersRes.error ? [] : ((barbersRes.data ?? []) as BarberRow[]);

  const demandPulses: ShowcaseRadarPulse[] = [];
  const cityPulseCounts = new Map<string, number>();

  for (const row of searchRows) {
    if (demandPulses.length >= SHOWCASE_LIMITS.pulseMaxVisible) break;

    const city = resolvePlatformCityFromSearch(row.city_name, row.user_lat, row.user_lng);
    if (!city) continue;

    const coords = snapPulseToCity(city, row.id);
    const cityAr = city.nameAr;
    cityPulseCounts.set(cityAr, (cityPulseCounts.get(cityAr) ?? 0) + 1);

    demandPulses.push({
      id: row.id,
      kind: 'demand',
      lat: coords.lat,
      lng: coords.lng,
      cityAr,
      districtAr: row.district_name?.trim() || undefined,
      createdAt: row.created_at,
      labelAr: formatUserPulseLabel(cityAr, row.district_name),
    });
  }

  const salonByCity = new Map<string, number>();
  for (const b of barberRows) {
    const city = resolvePlatformCity(b.city);
    if (!city) continue;
    salonByCity.set(city.nameAr, (salonByCity.get(city.nameAr) ?? 0) + 1);
  }

  const salonClusters: ShowcaseRadarPulse[] = [];
  for (const [cityAr, count] of salonByCity.entries()) {
    if (salonClusters.length >= SHOWCASE_LIMITS.salonClusterMax) break;
    const city = resolvePlatformCity(cityAr);
    if (!city) continue;
    const coords = snapPulseToCity(city, `salon-${city.id}`);
    salonClusters.push({
      id: `salon-cluster-${city.id}`,
      kind: 'salon_cluster',
      lat: coords.lat,
      lng: coords.lng,
      cityAr: city.nameAr,
      createdAt: new Date().toISOString(),
      labelAr: formatBarberPulseLabel(city.nameAr, count),
    });
  }

  const curatedDemos = buildCuratedDemoPulses();
  let mode: ShowcaseRadarMode = 'live';
  let pulses = [...demandPulses, ...salonClusters].slice(
    0,
    SHOWCASE_LIMITS.pulseMaxVisible + SHOWCASE_LIMITS.salonClusterMax,
  );

  if (demandPulses.length === 0) {
    mode = 'curated';
    pulses = [...curatedDemos, ...salonClusters.slice(0, 6)];
  }

  const citySignals = [...cityPulseCounts.entries()]
    .map(([cityAr, pulseCount24h]) => ({ cityAr, pulseCount24h }))
    .sort((a, b) => b.pulseCount24h - a.pulseCount24h)
    .slice(0, 8);

  if (citySignals.length === 0 && mode === 'curated') {
    for (const demo of curatedDemos.slice(0, 3)) {
      citySignals.push({ cityAr: demo.cityAr, pulseCount24h: 1 });
    }
  }

  const liveCityCount = new Set([
    ...demandPulses.map((p) => p.cityAr),
    ...salonByCity.keys(),
  ]).size;

  return {
    ok: true,
    mode,
    collectedAt: new Date().toISOString(),
    stats: {
      citiesCovered: liveCityCount > 0 ? liveCityCount : PLATFORM_CITY_COUNT,
      pulsesVisible: demandPulses.length || curatedDemos.length,
      activeSalonsApprox: barberRows.length,
    },
    citySignals,
    pulses,
    onDemandTaglineAr: ON_DEMAND_TAGLINE_AR,
  };
}
