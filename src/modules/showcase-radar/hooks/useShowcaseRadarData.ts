import { useCallback, useEffect, useState } from 'react';
import { SHOWCASE_RADAR_CONFIG } from '@/config/showcaseRadarConfig';
import type { ShowcaseRadarPayload } from '@/modules/showcase-radar/types';
import { CITY_BEACONS, resolveBeaconLngLat } from '@/modules/platform-radar/lib/saudiKingdomGeo';

function buildFallbackPayload(): ShowcaseRadarPayload {
  const now = Date.now();
  const citySignals = CITY_BEACONS.slice(0, 12).map((city, index) => ({
    cityAr: city.nameAr,
    pulseCount24h: city.tier === 'capital' ? 9 : city.tier === 'major' ? 6 + (index % 3) : 3 + (index % 2),
  }));

  const pulses = CITY_BEACONS.slice(0, 16)
    .map((city, index) => {
      const coords = resolveBeaconLngLat(city.nameAr);
      if (!coords) return null;
      return {
        id: `fallback-${city.nameAr}-${index}`,
        kind: (index % 3 === 0 ? 'salon_cluster' : 'demand') as 'salon_cluster' | 'demand',
        lat: coords.lat,
        lng: coords.lng,
        cityAr: city.nameAr,
        createdAt: new Date(now - (index + 2) * 5 * 60_000).toISOString(),
        labelAr:
          index % 3 === 0
            ? `ربط — ${city.nameAr} (توضيحي)`
            : `نبض مستخدم — ${city.nameAr}`,
      };
    })
    .filter((pulse): pulse is NonNullable<typeof pulse> => pulse !== null);

  return {
    ok: true,
    mode: 'curated',
    collectedAt: new Date(now).toISOString(),
    stats: {
      citiesCovered: CITY_BEACONS.length,
      pulsesVisible: pulses.filter((p) => p.kind === 'demand').length,
      activeSalonsApprox: pulses.filter((p) => p.kind === 'salon_cluster').length,
    },
    citySignals,
    pulses,
    onDemandTaglineAr: SHOWCASE_RADAR_CONFIG.onDemandTaglineAr,
  };
}

export function useShowcaseRadarData() {
  const [payload, setPayload] = useState<ShowcaseRadarPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(SHOWCASE_RADAR_CONFIG.apiPath, { cache: 'no-store' });
      const data = (await res.json()) as ShowcaseRadarPayload | { ok: false; error?: string };
      if (!res.ok || !('ok' in data) || data.ok !== true) {
        throw new Error('error' in data && data.error ? data.error : 'تعذّر تحميل الرادار');
      }
      setPayload(data);
      setError(null);
    } catch (e) {
      setPayload(buildFallbackPayload());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), SHOWCASE_RADAR_CONFIG.pollMs);
    return () => window.clearInterval(id);
  }, [load]);

  return { payload, loading, error, refresh: load };
}
