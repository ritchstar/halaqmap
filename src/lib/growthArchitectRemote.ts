import { getSupabaseClient } from '@/integrations/supabase/client';

const ENDPOINT = '/api/admin-growth-architect';

export type GrowthRecommendation = {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  scope: 'recruit_barbers' | 'ads_focus' | 'expand_district' | 'monitor';
  cityAr: string;
  districtAr?: string;
  rationaleAr: string;
  metric: {
    searches7d: number;
    searches24h: number;
    zeroResultRatio: number;
  };
  callToActionAr: string;
};

export type GrowthCityAggregate = {
  cityName: string;
  searches7d: number;
  searches24h: number;
  avgResultCount: number;
  zeroResultRatio: number;
  topDistricts: { district: string; count: number }[];
};

export type GrowthArchitectSnapshot = {
  activated: boolean;
  generatedAt: string | null;
  searchCount7d: number;
  citiesAnalyzed: number;
  topCities: GrowthCityAggregate[];
  recommendations: GrowthRecommendation[];
  gateMessageAr?: string;
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchGrowthArchitectSnapshot(): Promise<
  { ok: true; snapshot: GrowthArchitectSnapshot } | { ok: false; error: string }
> {
  try {
    const h = await authHeaders();
    if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

    const res = await fetch(ENDPOINT, { method: 'GET', headers: h, credentials: 'include' });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      activated?: boolean;
      gateMessageAr?: string;
      generatedAt?: string;
      sample?: { searchCount7d?: number; citiesAnalyzed?: number };
      topCities?: GrowthCityAggregate[];
      recommendations?: GrowthRecommendation[];
    };

    if (!res.ok || !body.ok) {
      return { ok: false, error: body.error || `HTTP ${res.status}` };
    }

    return {
      ok: true,
      snapshot: {
        activated: Boolean(body.activated),
        gateMessageAr: body.gateMessageAr,
        generatedAt: body.generatedAt ?? null,
        searchCount7d: body.sample?.searchCount7d ?? 0,
        citiesAnalyzed: body.sample?.citiesAnalyzed ?? 0,
        topCities: Array.isArray(body.topCities) ? body.topCities : [],
        recommendations: Array.isArray(body.recommendations) ? body.recommendations : [],
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Growth Architect fetch failed',
    };
  }
}
