import { useCallback, useEffect, useState } from 'react';
import { PULSE_MAP_CONFIG } from '@/config/pulseMapConfig';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

export function usePulseMapData() {
  const [payload, setPayload] = useState<PulseMapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(PULSE_MAP_CONFIG.apiPath, { cache: 'no-store' });
      const data = (await res.json()) as PulseMapPayload | { ok: false; error?: string };
      if (!res.ok || !('ok' in data) || data.ok !== true) {
        throw new Error('error' in data && data.error ? data.error : 'تعذّر تحميل خريطة النبض');
      }
      setPayload(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تحميل خريطة النبض');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), PULSE_MAP_CONFIG.pollMs);
    return () => window.clearInterval(id);
  }, [load]);

  return { payload, loading, error, refresh: load };
}
