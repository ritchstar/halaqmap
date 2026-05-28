/**
 * Showcase Radar — server-side aggregation (sanitized, no raw user coords).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

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
  jitterDeg: 0.22,
} as const;

const ON_DEMAND_TAGLINE_AR =
  'الظهور عند الطلب · On-Demand Visibility — الصالون يظهر حين يبحث زبون قريب.';

const KSA_MAJOR_CITIES: { nameAr: string; lat: number; lng: number }[] = [
  { nameAr: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { nameAr: 'جدة', lat: 21.4858, lng: 39.1925 },
  { nameAr: 'مكة', lat: 21.3891, lng: 39.8579 },
  { nameAr: 'المدينة', lat: 24.5247, lng: 39.5692 },
  { nameAr: 'الدمام', lat: 26.3927, lng: 49.9777 },
  { nameAr: 'الخبر', lat: 26.2172, lng: 50.1971 },
  { nameAr: 'أبها', lat: 18.2164, lng: 42.5053 },
  { nameAr: 'تبوك', lat: 28.3838, lng: 36.555 },
  { nameAr: 'بريدة', lat: 26.326, lng: 43.975 },
  { nameAr: 'حائل', lat: 27.5114, lng: 41.7208 },
  { nameAr: 'نجران', lat: 17.5656, lng: 44.2289 },
  { nameAr: 'جازان', lat: 16.8894, lng: 42.5706 },
];

/** عرض مُ curate عند غياب البيانات الحية */
const CURATED_DEMO_PULSES: ShowcaseRadarPulse[] = [
  {
    id: 'demo-riyadh-1',
    kind: 'demand',
    lat: 24.74,
    lng: 46.72,
    cityAr: 'الرياض',
    createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    labelAr: 'طلب — الرياض',
  },
  {
    id: 'demo-jeddah-1',
    kind: 'demand',
    lat: 21.51,
    lng: 39.21,
    cityAr: 'جدة',
    createdAt: new Date(Date.now() - 22 * 60_000).toISOString(),
    labelAr: 'طلب — جدة',
  },
  {
    id: 'demo-dammam-1',
    kind: 'demand',
    lat: 26.41,
    lng: 49.98,
    cityAr: 'الدمام',
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    labelAr: 'طلب — الدمام',
  },
];

function resolveCityCoordinates(cityName: string | null | undefined): { lat: number; lng: number; cityAr: string } | null {
  if (!cityName?.trim()) return null;
  const normalized = cityName.trim();
  const hit = KSA_MAJOR_CITIES.find(
    (c) => normalized.includes(c.nameAr) || c.nameAr.includes(normalized),
  );
  return hit ? { lat: hit.lat, lng: hit.lng, cityAr: hit.nameAr } : null;
}

function stableJitter(id: string, baseLat: number, baseLng: number): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h & 0xffff) / 0xffff) * Math.PI * 2;
  const r = SHOWCASE_LIMITS.jitterDeg * (0.35 + ((h >> 16) & 0xff) / 255);
  return {
    lat: baseLat + Math.sin(a) * r,
    lng: baseLng + Math.cos(a) * r,
  };
}

function isInKsa(lat: number, lng: number): boolean {
  return lat >= 16 && lat <= 33.5 && lng >= 34 && lng <= 56.5;
}

function formatPulseLabel(cityAr: string, districtAr?: string | null): string {
  if (districtAr?.trim()) return `طلب — ${cityAr} · ${districtAr.trim()}`;
  return `طلب — ${cityAr}`;
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

    let city = resolveCityCoordinates(row.city_name);
    if (!city && row.user_lat != null && row.user_lng != null && isInKsa(row.user_lat, row.user_lng)) {
      city = { lat: row.user_lat, lng: row.user_lng, cityAr: row.city_name?.trim() || 'المملكة' };
    }
    if (!city) continue;

    const jittered = stableJitter(row.id, city.lat, city.lng);
    const cityAr = city.cityAr;
    cityPulseCounts.set(cityAr, (cityPulseCounts.get(cityAr) ?? 0) + 1);

    demandPulses.push({
      id: row.id,
      kind: 'demand',
      lat: jittered.lat,
      lng: jittered.lng,
      cityAr,
      districtAr: row.district_name?.trim() || undefined,
      createdAt: row.created_at,
      labelAr: formatPulseLabel(cityAr, row.district_name),
    });
  }

  const salonByCity = new Map<string, number>();
  for (const b of barberRows) {
    const resolved = resolveCityCoordinates(b.city);
    const key = resolved?.cityAr ?? b.city?.trim();
    if (!key) continue;
    salonByCity.set(key, (salonByCity.get(key) ?? 0) + 1);
  }

  const salonClusters: ShowcaseRadarPulse[] = [];
  for (const [cityAr, count] of salonByCity.entries()) {
    if (salonClusters.length >= 12) break;
    const coords = resolveCityCoordinates(cityAr);
    if (!coords) continue;
    const jittered = stableJitter(`salon-${cityAr}`, coords.lat, coords.lng);
    salonClusters.push({
      id: `salon-cluster-${cityAr}`,
      kind: 'salon_cluster',
      lat: jittered.lat,
      lng: jittered.lng,
      cityAr,
      createdAt: new Date().toISOString(),
      labelAr: `صالونات نشطة — ${cityAr} (${count})`,
    });
  }

  let mode: ShowcaseRadarMode = 'live';
  let pulses = [...demandPulses, ...salonClusters].slice(0, SHOWCASE_LIMITS.pulseMaxVisible + 12);

  if (demandPulses.length === 0) {
    mode = 'curated';
    pulses = [...CURATED_DEMO_PULSES, ...salonClusters.slice(0, 6)];
  }

  const citySignals = [...cityPulseCounts.entries()]
    .map(([cityAr, pulseCount24h]) => ({ cityAr, pulseCount24h }))
    .sort((a, b) => b.pulseCount24h - a.pulseCount24h)
    .slice(0, 8);

  if (citySignals.length === 0 && mode === 'curated') {
    citySignals.push(
      { cityAr: 'الرياض', pulseCount24h: 2 },
      { cityAr: 'جدة', pulseCount24h: 1 },
      { cityAr: 'الدمام', pulseCount24h: 1 },
    );
  }

  const citiesCovered = new Set([
    ...demandPulses.map((p) => p.cityAr),
    ...salonByCity.keys(),
  ]).size;

  return {
    ok: true,
    mode,
    collectedAt: new Date().toISOString(),
    stats: {
      citiesCovered: citiesCovered || citySignals.length,
      pulsesVisible: demandPulses.length || CURATED_DEMO_PULSES.length,
      activeSalonsApprox: barberRows.length,
    },
    citySignals,
    pulses,
    onDemandTaglineAr: ON_DEMAND_TAGLINE_AR,
  };
}
