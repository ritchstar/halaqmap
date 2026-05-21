import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdminRadarPulses } from '@/lib/adminRadarPulsesRemote';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { playTacticalUserPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import {
  createForcePulse,
  parsePlatformRadarUserSearchPayload,
  PLATFORM_RADAR_CHANNEL,
  PLATFORM_RADAR_USER_SEARCH_EVENT,
  userSearchEventToMapPulse,
  type PlatformRadarForcePulse,
} from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

const DEFAULT_POLL_MS = 8_000;
const DEFAULT_WINDOW_MINUTES = 120;
const FORCE_PULSE_TTL_MS = 4_500;

function upsertPulse(list: PlatformRadarMapPulse[], incoming: PlatformRadarMapPulse): PlatformRadarMapPulse[] {
  const idx = list.findIndex((p) => p.id === incoming.id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = incoming;
    return next;
  }
  return [incoming, ...list].slice(0, 500);
}

export function usePlatformRadarPulses(options?: {
  pollMs?: number;
  windowMinutes?: number;
  soundEnabled?: boolean;
  enabled?: boolean;
  realtimeEnabled?: boolean;
}) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const windowMinutes = options?.windowMinutes ?? DEFAULT_WINDOW_MINUTES;
  const soundEnabled = options?.soundEnabled ?? true;
  const enabled = options?.enabled ?? true;
  const realtimeEnabled = options?.realtimeEnabled ?? enabled;

  const [pulses, setPulses] = useState<PlatformRadarMapPulse[]>([]);
  const [forcePulses, setForcePulses] = useState<PlatformRadarForcePulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [userPulseCount, setUserPulseCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const seenUserPulseIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const forcePulseTimersRef = useRef<Map<string, number>>(new Map());

  const addForceRipple = useCallback((lat: number, lng: number, partial?: Parameters<typeof createForcePulse>[2]) => {
    const fp = createForcePulse(lat, lng, partial);
    setForcePulses((prev) => [fp, ...prev].slice(0, 40));

    const prevTimer = forcePulseTimersRef.current.get(fp.burstKey);
    if (prevTimer) window.clearTimeout(prevTimer);
    const timerId = window.setTimeout(() => {
      setForcePulses((prev) => prev.filter((p) => p.burstKey !== fp.burstKey));
      forcePulseTimersRef.current.delete(fp.burstKey);
    }, FORCE_PULSE_TTL_MS);
    forcePulseTimersRef.current.set(fp.burstKey, timerId);

    return fp;
  }, []);

  const forcePulse = useCallback(
    (lat: number, lng: number, partial?: Parameters<typeof createForcePulse>[2]) => {
      const fp = addForceRipple(lat, lng, partial);
      const mapPulse = userSearchEventToMapPulse({
        id: fp.id,
        lat: fp.lat,
        lng: fp.lng,
        createdAt: fp.createdAt,
        label: fp.label,
        suspicious: fp.suspicious,
      });

      setPulses((prev) => upsertPulse(prev, mapPulse));
      setUserPulseCount((n) => n + 1);
      if (fp.suspicious) setSuspiciousCount((n) => n + 1);

      return fp;
    },
    [addForceRipple],
  );

  const ingestRealtimeUserSearch = useCallback(
    (raw: unknown, opts?: { playSound?: boolean }) => {
      const parsed = parsePlatformRadarUserSearchPayload(raw);
      if (!parsed?.lat || !parsed.lng) return null;

      const mapPulse = userSearchEventToMapPulse(parsed);
      const isNew = !seenUserPulseIdsRef.current.has(mapPulse.id);

      seenUserPulseIdsRef.current.add(mapPulse.id);
      setPulses((prev) => upsertPulse(prev, mapPulse));
      setUserPulseCount((n) => (isNew ? n + 1 : n));
      if (mapPulse.suspicious) setSuspiciousCount((n) => (isNew ? n + 1 : n));

      addForceRipple(mapPulse.lat, mapPulse.lng, {
        id: mapPulse.id,
        label: mapPulse.label,
        suspicious: mapPulse.suspicious,
        createdAt: mapPulse.createdAt,
      });

      if (opts?.playSound === false) return mapPulse;
      if (soundEnabled && isNew) playTacticalUserPulseSound(0.14);
      return mapPulse;
    },
    [addForceRipple, soundEnabled],
  );

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

      if (soundEnabled && !isFirstLoadRef.current && newUserPulses.length > 0 && !realtimeConnected) {
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
  }, [enabled, realtimeConnected, soundEnabled, windowMinutes]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [enabled, load, pollMs]);

  useEffect(() => {
    return () => {
      for (const timerId of forcePulseTimersRef.current.values()) {
        window.clearTimeout(timerId);
      }
      forcePulseTimersRef.current.clear();
    };
  }, []);

  return {
    pulses,
    forcePulses,
    loading,
    error,
    lastSyncAt,
    userPulseCount,
    suspiciousCount,
    realtimeConnected,
    refresh: load,
    forcePulse,
    ingestRealtimeUserSearch,
    setRealtimeConnected,
  };
}

export function subscribePlatformRadarChannel(opts: {
  enabled: boolean;
  onUserSearch: (payload: unknown) => void;
  onStatus?: (connected: boolean) => void;
}): () => void {
  if (!opts.enabled || !isSupabaseConfigured()) return () => undefined;

  const client = getSupabaseClient();
  if (!client) return () => undefined;

  const channel = client
    .channel(PLATFORM_RADAR_CHANNEL, { config: { private: true } })
    .on('broadcast', { event: PLATFORM_RADAR_USER_SEARCH_EVENT }, (msg) => {
      opts.onUserSearch(msg.payload ?? msg);
    })
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_searches' },
      (payload) => {
        const row = (payload.new ?? {}) as Record<string, unknown>;
        opts.onUserSearch({
          id: row.id,
          kind: 'user_search',
          lat: row.user_lat,
          lng: row.user_lng,
          createdAt: row.created_at,
          label: row.district_name,
          suspicious: row.suspicious,
          scopeType: row.scope_type,
        });
      },
    )
    .subscribe((status) => {
      const connected = status === 'SUBSCRIBED';
      opts.onStatus?.(connected);
    });

  return () => {
    void client.removeChannel(channel);
    opts.onStatus?.(false);
  };
}
