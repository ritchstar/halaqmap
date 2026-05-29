/**
 * Showcase Radar — server-side aggregation (sanitized, no raw user coords).
 */
import type { UntypedSupabaseClient } from './untypedSupabase.js';
import {
  PLATFORM_CITY_COUNT,
  type PlatformCity,
  isBarberPulseCityAllowed,
  isShowcasePulseCoordValid,
  resolvePlatformCity,
  resolvePlatformCityFromSearch,
  snapPulseToCity,
} from './platformCoveredCities.js';
import { SHOWCASE_BARBER_SOUTH_BBOX } from './showcaseRadarPlacement.js';

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

const CURATED_DEMO_BARBER_CITIES = [
  'أبها',
  'خميس مشيط',
  'الباحة',
  'جازان',
  'نجران',
  'بيشة',
  'صبيا',
] as const;

function buildCuratedDemoPulses(): ShowcaseRadarPulse[] {
  const pulses: ShowcaseRadarPulse[] = [];
  for (const [index, cityAr] of CURATED_DEMO_CITIES.entries()) {
    const city = resolvePlatformCity(cityAr);
    if (!city) continue;
    const ageMinutes = 8 + index * 11;
    const pulse = emitDemandPulse(city, `demo-${city.id}`, {
      id: `demo-${city.id}`,
      createdAt: new Date(Date.now() - ageMinutes * 60_000).toISOString(),
      labelAr: `نبض مستخدم — ${city.nameAr}`,
    });
    if (pulse) pulses.push(pulse);
  }
  return pulses;
}

function buildCuratedBarberDemoPulses(): ShowcaseRadarPulse[] {
  const pulses: ShowcaseRadarPulse[] = [];
  for (const [index, cityAr] of CURATED_DEMO_BARBER_CITIES.entries()) {
    const city = resolvePlatformCity(cityAr);
    if (!city) continue;
    const ageMinutes = 5 + index * 9;
    const pulse = emitBarberPulse(city, `demo-barber-${city.id}`, {
      id: `demo-barber-${city.id}`,
      createdAt: new Date(Date.now() - ageMinutes * 60_000).toISOString(),
      labelAr: formatBarberPulseLabel(city.nameAr, 1, true),
    });
    if (pulse) pulses.push(pulse);
  }
  return pulses;
}

function formatUserPulseLabel(cityAr: string, districtAr?: string | null): string {
  if (districtAr?.trim()) return `نبض مستخدم — ${cityAr} · ${districtAr.trim()}`;
  return `نبض مستخدم — ${cityAr}`;
}

function formatBarberPulseLabel(cityAr: string, count: number, curated = false): string {
  if (curated) return `ربط — ${cityAr} (توضيحي)`;
  return count > 1 ? `ربط — ${cityAr} (${count})` : `ربط — ${cityAr}`;
}

function emitDemandPulse(
  city: PlatformCity,
  seed: string,
  meta: {
    id: string;
    createdAt: string;
    labelAr: string;
    districtAr?: string;
  },
): ShowcaseRadarPulse | null {
  const coords = snapPulseToCity(city, seed);
  if (!isShowcasePulseCoordValid(coords.lat, coords.lng)) return null;
  return {
    id: meta.id,
    kind: 'demand',
    lat: coords.lat,
    lng: coords.lng,
    cityAr: city.nameAr,
    districtAr: meta.districtAr,
    createdAt: meta.createdAt,
    labelAr: meta.labelAr,
  };
}

function emitBarberPulse(
  city: PlatformCity,
  seed: string,
  meta: { id: string; createdAt: string; labelAr: string },
): ShowcaseRadarPulse | null {
  if (!isBarberPulseCityAllowed(city)) return null;
  const coords = snapPulseToCity(city, seed);
  if (!isShowcasePulseCoordValid(coords.lat, coords.lng)) return null;
  return {
    id: meta.id,
    kind: 'salon_cluster',
    lat: coords.lat,
    lng: coords.lng,
    cityAr: city.nameAr,
    createdAt: meta.createdAt,
    labelAr: meta.labelAr,
  };
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
  latitude: number | null;
  longitude: number | null;
};

export async function buildShowcaseRadarPayload(
  supabase: UntypedSupabaseClient,
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
      .select('id, city, is_active, latitude, longitude')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', SHOWCASE_BARBER_SOUTH_BBOX.minLat)
      .lte('latitude', SHOWCASE_BARBER_SOUTH_BBOX.maxLat)
      .gte('longitude', SHOWCASE_BARBER_SOUTH_BBOX.minLng)
      .lte('longitude', SHOWCASE_BARBER_SOUTH_BBOX.maxLng)
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

    const cityAr = city.nameAr;
    cityPulseCounts.set(cityAr, (cityPulseCounts.get(cityAr) ?? 0) + 1);

    const pulse = emitDemandPulse(city, row.id, {
      id: row.id,
      createdAt: row.created_at,
      labelAr: formatUserPulseLabel(cityAr, row.district_name),
      districtAr: row.district_name?.trim() || undefined,
    });
    if (pulse) demandPulses.push(pulse);
  }

  const salonByCity = new Map<string, number>();
  for (const b of barberRows) {
    const city = resolvePlatformCity(b.city);
    if (!city || !isBarberPulseCityAllowed(city)) continue;
    salonByCity.set(city.nameAr, (salonByCity.get(city.nameAr) ?? 0) + 1);
  }

  const salonClusters: ShowcaseRadarPulse[] = [];
  for (const [cityAr, count] of salonByCity.entries()) {
    if (salonClusters.length >= SHOWCASE_LIMITS.salonClusterMax) break;
    const city = resolvePlatformCity(cityAr);
    if (!city) continue;
    const pulse = emitBarberPulse(city, `salon-${city.id}`, {
      id: `salon-cluster-${city.id}`,
      createdAt: new Date().toISOString(),
      labelAr: formatBarberPulseLabel(city.nameAr, count),
    });
    if (pulse) salonClusters.push(pulse);
  }

  const curatedDemos = buildCuratedDemoPulses();
  const curatedBarberDemos = buildCuratedBarberDemoPulses();
  let mode: ShowcaseRadarMode = 'live';
  let pulses = [...demandPulses, ...salonClusters].slice(
    0,
    SHOWCASE_LIMITS.pulseMaxVisible + SHOWCASE_LIMITS.salonClusterMax,
  );

  if (demandPulses.length === 0) {
    mode = 'curated';
    pulses = [
      ...curatedDemos,
      ...curatedBarberDemos,
      ...salonClusters.slice(0, 6),
    ];
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

  const curatedSalonCount =
    barberRows.length > 0 ? barberRows.length : mode === 'curated' ? curatedBarberDemos.length : 0;

  return {
    ok: true,
    mode,
    collectedAt: new Date().toISOString(),
    stats: {
      citiesCovered: liveCityCount > 0 ? liveCityCount : PLATFORM_CITY_COUNT,
      pulsesVisible: demandPulses.length || curatedDemos.length,
      activeSalonsApprox: curatedSalonCount,
    },
    citySignals,
    pulses,
    onDemandTaglineAr: ON_DEMAND_TAGLINE_AR,
  };
}
