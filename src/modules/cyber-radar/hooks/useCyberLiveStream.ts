/**
 * useCyberLiveStream — taps the existing platform_radar realtime channel
 * and maps each broadcasted user_search into a CyberEvent. Suspicious
 * rows become `threat_probe` pulses so the security narrative stays
 * consistent across live and scenario modes.
 */

import { useEffect, useRef, useState } from 'react';
import { subscribePlatformRadarChannel } from '@/modules/platform-radar/hooks/usePlatformRadarPulses';
import { isInsideTacticalCanvas } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { ksaLngLatToView } from '../lib/cyberGeo';
import type { CyberEvent } from '../types';

const PULSE_LIFETIME_MS = 6_000;
const PULSE_CAP = 80; // most recent N pulses kept in memory

let liveSeq = 0;

type IncomingPayload = {
  id?: unknown;
  lat?: unknown;
  lng?: unknown;
  label?: unknown;
  suspicious?: unknown;
  createdAt?: unknown;
};

function parsePayload(payload: unknown): IncomingPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as IncomingPayload;
}

function payloadToEvent(payload: IncomingPayload): CyberEvent | null {
  const lat = typeof payload.lat === 'number' ? payload.lat : Number(payload.lat);
  const lng = typeof payload.lng === 'number' ? payload.lng : Number(payload.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const inside = isInsideTacticalCanvas(lng, lat);
  if (!inside) return null;

  const source = ksaLngLatToView(lng, lat);
  const suspicious = payload.suspicious === true;
  const label = typeof payload.label === 'string' ? payload.label : undefined;
  const ts =
    typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString();

  return {
    id: `live-${Date.now()}-${++liveSeq}`,
    kind: suspicious ? 'threat_probe' : 'visit_internal',
    severity: suspicious ? 'elevated' : 'info',
    source,
    description: suspicious
      ? `نَشاط مَريب — ${label ?? 'منطقة مَجهولة'}`
      : `زيارة من ${label ?? 'منطقة سعودية'}`,
    originLabelAr: label,
    protocolTag: suspicious ? 'pattern flagged' : 'TLS 1.3',
    timestamp: ts,
    lifetimeMs: PULSE_LIFETIME_MS,
  };
}

export type CyberLiveStreamHandle = {
  pulses: ReadonlyArray<CyberEvent>;
  liveConnected: boolean;
  liveHint: string | null;
};

export function useCyberLiveStream(enabled: boolean): CyberLiveStreamHandle {
  const [pulses, setPulses] = useState<CyberEvent[]>([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveHint, setLiveHint] = useState<string | null>(null);

  // Stable ingest handler — never re-subscribes.
  const ingestRef = useRef((payload: unknown) => {
    const parsed = parsePayload(payload);
    if (!parsed) return;
    const evt = payloadToEvent(parsed);
    if (!evt) return;
    setPulses((prev) => {
      const next = [...prev, evt];
      // Cap the buffer and drop expired entries in one pass.
      const cutoff = Date.now();
      return next
        .filter((p) => {
          if (!p.lifetimeMs) return true;
          const age = cutoff - new Date(p.timestamp).getTime();
          return age <= p.lifetimeMs;
        })
        .slice(-PULSE_CAP);
    });
  });

  // Sweep expired pulses on a slow interval so they fade out even when
  // no new live events arrive.
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const cutoff = Date.now();
      setPulses((prev) =>
        prev.filter((p) => {
          if (!p.lifetimeMs) return true;
          const age = cutoff - new Date(p.timestamp).getTime();
          return age <= p.lifetimeMs;
        }),
      );
    }, 1_500);
    return () => window.clearInterval(id);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    return subscribePlatformRadarChannel({
      enabled: true,
      onUserSearch: (payload) => ingestRef.current(payload),
      onStatus: (connected, detail) => {
        setLiveConnected(connected);
        setLiveHint(connected ? null : (detail ?? 'polling-fallback'));
      },
    });
  }, [enabled]);

  return { pulses, liveConnected, liveHint };
}
