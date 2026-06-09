import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdminRadarPulses } from '@/lib/adminRadarPulsesRemote';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { playTacticalUserPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import { BoundedPulseIdSet } from '@/modules/platform-radar/lib/boundedPulseIdSet';
import {
  createForcePulse,
  parsePlatformRadarUserSearchPayload,
  PLATFORM_RADAR_CHANNEL,
  PLATFORM_RADAR_USER_SEARCH_EVENT,
  userSearchEventToMapPulse,
  type PlatformRadarForcePulse,
} from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

const DEFAULT_POLL_MS = POLL_MS.RADAR_PULSES;
const DEFAULT_WINDOW_MINUTES = 120;
const FORCE_PULSE_TTL_MS = 4_500;
const MAX_TRACKED_PULSE_IDS = 1500;
const TRACKED_PULSE_TTL_MS = 60 * 60 * 1000;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

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

  const seenPulseIdsRef = useRef<BoundedPulseIdSet>(
    new BoundedPulseIdSet({ maxEntries: MAX_TRACKED_PULSE_IDS, maxAgeMs: TRACKED_PULSE_TTL_MS }),
  );
  const isFirstLoadRef = useRef(true);
  const lastGeneratedAtRef = useRef<string | null>(null);
  const forcePulseTimersRef = useRef<Map<string, number>>(new Map());
  const soundEnabledRef = useRef(soundEnabled);
  const realtimeConnectedRef = useRef(realtimeConnected);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    realtimeConnectedRef.current = realtimeConnected;
  }, [realtimeConnected]);

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
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const fp = addForceRipple(lat, lng, partial);
      const mapPulse = userSearchEventToMapPulse({
        id: fp.id,
        lat: fp.lat,
        lng: fp.lng,
        createdAt: fp.createdAt,
        label: fp.label,
        suspicious: fp.suspicious,
      });

      const isNew = !seenPulseIdsRef.current.has(mapPulse.id);
      seenPulseIdsRef.current.add(mapPulse.id);
      setPulses((prev) => upsertPulse(prev, mapPulse));
      if (isNew) {
        setUserPulseCount((n) => n + 1);
        if (fp.suspicious) setSuspiciousCount((n) => n + 1);
      }

      return fp;
    },
    [addForceRipple],
  );

  const ingestRealtimeUserSearch = useCallback(
    (raw: unknown, opts?: { playSound?: boolean }) => {
      const parsed = parsePlatformRadarUserSearchPayload(raw);
      if (!parsed || !Number.isFinite(parsed.lat) || !Number.isFinite(parsed.lng)) return null;

      const mapPulse = userSearchEventToMapPulse(parsed);
      const isNew = !seenPulseIdsRef.current.has(mapPulse.id);
      seenPulseIdsRef.current.add(mapPulse.id);

      setPulses((prev) => upsertPulse(prev, mapPulse));
      if (isNew) {
        setUserPulseCount((n) => n + 1);
        if (mapPulse.suspicious) setSuspiciousCount((n) => n + 1);
      }

      addForceRipple(mapPulse.lat, mapPulse.lng, {
        id: mapPulse.id,
        label: mapPulse.label,
        suspicious: mapPulse.suspicious,
        createdAt: mapPulse.createdAt,
      });

      if (opts?.playSound === false) return mapPulse;
      if (soundEnabledRef.current && isNew) playTacticalUserPulseSound(0.14);
      return mapPulse;
    },
    [addForceRipple],
  );

  const load = useCallback(async () => {
    if (!enabled || !isPollingTabActive()) return;
    try {
      const res = await fetchAdminRadarPulses(windowMinutes);
      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (
        !isFirstLoadRef.current &&
        lastGeneratedAtRef.current === res.body.generatedAt
      ) {
        setError(null);
        return;
      }
      lastGeneratedAtRef.current = res.body.generatedAt;

      const next = res.body.pulses;
      const newUserPulses = next.filter(
        (p) => p.kind === 'user_search' && !seenPulseIdsRef.current.has(p.id),
      );

      if (soundEnabledRef.current && !isFirstLoadRef.current && newUserPulses.length > 0 && !realtimeConnectedRef.current) {
        playTacticalUserPulseSound(0.13);
      }

      if (!isFirstLoadRef.current && newUserPulses.length > 0) {
        for (const p of newUserPulses) {
          addForceRipple(p.lat, p.lng, {
            id: p.id,
            label: p.label,
            suspicious: p.suspicious,
            createdAt: p.createdAt,
          });
        }
      }

      for (const p of next) {
        if (p.kind === 'user_search') seenPulseIdsRef.current.add(p.id);
      }

      isFirstLoadRef.current = false;
      setPulses(next);
      // Polling is authoritative — server counts overwrite local increments,
      // eliminating realtime/poll double-counting drift over 24/7 sessions.
      setUserPulseCount(res.body.userPulseCount);
      setSuspiciousCount(res.body.suspiciousCount);
      setLastSyncAt(res.body.generatedAt);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل نبضات الخريطة');
    } finally {
      setLoading(false);
    }
  }, [addForceRipple, enabled, windowMinutes]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [enabled, load, pollMs]);

  useEffect(() => {
    const set = seenPulseIdsRef.current;
    const id = window.setInterval(() => {
      set.sweep();
    }, SWEEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

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
    setRealtimeConnected,
    refresh: load,
    forcePulse,
    ingestRealtimeUserSearch,
  };
}

type ChannelHandle = ReturnType<SupabaseClient['channel']>;

export function subscribePlatformRadarChannel(opts: {
  enabled: boolean;
  onUserSearch: (payload: unknown) => void;
  onStatus?: (connected: boolean, detail?: string) => void;
}): () => void {
  if (!opts.enabled || !isSupabaseConfigured()) return () => undefined;

  const client = getSupabaseClient();
  if (!client) return () => undefined;

  let cancelled = false;
  let channel: ChannelHandle | null = null;
  let reopenTimer: number | null = null;
  let visibilityHandler: (() => void) | null = null;

  const open = async () => {
    if (cancelled) return;

    if (channel) {
      try {
        await client.removeChannel(channel);
      } catch {
        /* ignore stale-channel removal */
      }
      channel = null;
    }

    const { data } = await client.auth.getSession();
    const token = data.session?.access_token?.trim();
    if (!token) {
      opts.onStatus?.(false, 'no-admin-session');
      return;
    }

    try {
      await client.realtime.setAuth(token);
    } catch {
      opts.onStatus?.(false, 'realtime-auth-failed');
      scheduleReopen(5_000);
      return;
    }

    if (cancelled) return;

    channel = client
      .channel(PLATFORM_RADAR_CHANNEL, { config: { private: true } })
      .on('broadcast', { event: PLATFORM_RADAR_USER_SEARCH_EVENT }, (msg) => {
        opts.onUserSearch(msg.payload ?? msg);
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          opts.onStatus?.(true);
          return;
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          opts.onStatus?.(false, err?.message || status);
          scheduleReopen(4_000);
        }
      });
  };

  const scheduleReopen = (delayMs: number) => {
    if (cancelled) return;
    if (reopenTimer != null) window.clearTimeout(reopenTimer);
    reopenTimer = window.setTimeout(() => {
      reopenTimer = null;
      void open();
    }, delayMs);
  };

  visibilityHandler = () => {
    if (cancelled) return;
    if (document.visibilityState === 'visible') {
      // Tab returned from background — re-establish the realtime channel
      // so iOS Safari (which drops WebSockets on background) recovers
      // without waiting for the polling fallback.
      scheduleReopen(150);
    }
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  void open();

  return () => {
    cancelled = true;
    if (reopenTimer != null) {
      window.clearTimeout(reopenTimer);
      reopenTimer = null;
    }
    if (visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', visibilityHandler);
    }
    if (channel) void client.removeChannel(channel);
    opts.onStatus?.(false);
  };
}
