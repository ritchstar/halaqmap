import { useCallback, useEffect, useState } from 'react';
import { SHOWCASE_RADAR_CONFIG } from '@/config/showcaseRadarConfig';
import type { ShowcaseRadarPayload } from '@/modules/showcase-radar/types';

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
      setError(e instanceof Error ? e.message : 'تعذّر تحميل الرادار');
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
