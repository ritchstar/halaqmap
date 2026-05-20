import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdminRadarPulses } from '@/lib/adminRadarPulsesRemote';
import { playTacticalUserPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

const DEFAULT_POLL_MS = 8_000;
const DEFAULT_WINDOW_MINUTES = 120;

export function usePlatformRadarPulses(options?: {
  pollMs?: number;
  windowMinutes?: number;
  soundEnabled?: boolean;
  enabled?: boolean;
}) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const windowMinutes = options?.windowMinutes ?? DEFAULT_WINDOW_MINUTES;
  const soundEnabled = options?.soundEnabled ?? true;
  const enabled = options?.enabled ?? true;

  const [pulses, setPulses] = useState<PlatformRadarMapPulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [userPulseCount, setUserPulseCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  const seenUserPulseIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetchAdminRadarPulses(windowMinutes);
      if (!res.ok) {
        setError(res.error);
        return;
      }

      const next = res.body.pulses;
      const newUserPulses = next.filter(
        (p) => p.kind === 'user_search' && !seenUserPulseIdsRef.current.has(p.id),
      );

      if (soundEnabled && !isFirstLoadRef.current && newUserPulses.length > 0) {
        playTacticalUserPulseSound(0.13);
      }

      for (const p of next) {
        if (p.kind === 'user_search') seenUserPulseIdsRef.current.add(p.id);
      }

      isFirstLoadRef.current = false;
      setPulses(next);
      setUserPulseCount(res.body.userPulseCount);
      setSuspiciousCount(res.body.suspiciousCount);
      setLastSyncAt(res.body.generatedAt);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل نبضات الخريطة');
    } finally {
      setLoading(false);
    }
  }, [enabled, soundEnabled, windowMinutes]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [enabled, load, pollMs]);

  return {
    pulses,
    loading,
    error,
    lastSyncAt,
    userPulseCount,
    suspiciousCount,
    refresh: load,
  };
}
