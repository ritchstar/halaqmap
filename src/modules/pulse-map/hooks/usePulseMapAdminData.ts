import { useCallback, useEffect, useState } from 'react';
import { fetchAdminPulseMap } from '@/lib/adminPulseMapRemote';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

const DEFAULT_POLL_MS = 25_000;
const DEFAULT_WINDOW_MINUTES = 120;

export function usePulseMapAdminData(options?: { pollMs?: number; initialWindowMinutes?: number }) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const [windowMinutes, setWindowMinutes] = useState(options?.initialWindowMinutes ?? DEFAULT_WINDOW_MINUTES);
  const [payload, setPayload] = useState<PulseMapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    const result = await fetchAdminPulseMap(windowMinutes);
    if (result.ok) {
      setPayload(result.body);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, [windowMinutes]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => void load({ silent: true }), pollMs);
    return () => window.clearInterval(id);
  }, [load, pollMs]);

  return {
    payload,
    loading,
    refreshing,
    error,
    windowMinutes,
    setWindowMinutes,
    refresh: () => load(),
  };
}
