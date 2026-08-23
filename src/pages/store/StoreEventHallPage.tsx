/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قاعة الدعوة الحرة: عرض / ضيف / مضيف.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreEventGuestForm } from '@/components/store/StoreEventGuestForm';
import { StoreEventHallStage } from '@/components/store/StoreEventHallStage';
import { StoreEventHostPanel } from '@/components/store/StoreEventHostPanel';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_EVENT_LIVE_LAB_TOKEN,
  STORE_EVENT_LIVE_LAB_TOKEN_WOMEN,
  STORE_EVENT_LIVE_PUBLIC_ENABLED,
  eventLiveCopy,
} from '@/config/storeEventLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  normalizeEventHostRole,
  normalizeEventVenueKind,
  normalizeEventVoice,
  readEventLiveLabState,
  writeEventLiveLabState,
  type EventLiveHostState,
  type EventLiveLabState,
} from '@/lib/storeEventLiveLab';
import { addEventLiveBlessing, fetchEventLivePublic, saveEventLiveHost } from '@/lib/storeEventLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StoreGuestDeviceBlocked } from '@/components/store/StoreGuestDeviceBlocked';
import { useGuestDeviceGate } from '@/hooks/useGuestDeviceGate';

type HallMode = 'display' | 'guest' | 'host';

function isEventLabToken(token: string): boolean {
  return token === STORE_EVENT_LIVE_LAB_TOKEN || token === STORE_EVENT_LIVE_LAB_TOKEN_WOMEN;
}

function payloadToState(payload: Record<string, unknown>, fallback: EventLiveLabState): EventLiveLabState {
  const voice = normalizeEventVoice((payload as Partial<EventLiveHostState>).voice ?? fallback.host.voice);
  const host = {
    ...fallback.host,
    ...(payload as Partial<EventLiveHostState>),
    voice,
    hostRole: normalizeEventHostRole((payload as Partial<EventLiveHostState>).hostRole, voice),
    venueKind: normalizeEventVenueKind((payload as Partial<EventLiveHostState>).venueKind),
  };
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : fallback.blessings;
  return { host, blessings: blessings as EventLiveLabState['blessings'] };
}

function useEventLabState(token: string, mode: HallMode, seat?: { seatId: string; deviceHash: string }) {
  const [state, setState] = useState<EventLiveLabState>(() => readEventLiveLabState(token));
  const isLab = isEventLabToken(token);

  useEffect(() => {
    setState(readEventLiveLabState(token));
    const refresh = () => setState(readEventLiveLabState(token));
    const timer = window.setInterval(refresh, isLab ? 1500 : 4000);
    window.addEventListener('storage', refresh);
    if (!isLab) {
      void fetchEventLivePublic(token, mode).then((result) => {
        if (!result.ok || !result.payload || typeof result.payload !== 'object') return;
        setState(payloadToState(result.payload as Record<string, unknown>, readEventLiveLabState(token)));
      });
    }
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token, mode, isLab]);

  const commit = (next: EventLiveLabState) => {
    writeEventLiveLabState(token, next);
    setState(next);
    if (isLab) return;
    if (mode === 'host') {
      void saveEventLiveHost({ token, ...next.host, blessings: next.blessings });
    }
    if (mode === 'guest') {
      const last = next.blessings[next.blessings.length - 1];
      if (last) void addEventLiveBlessing({ token, ...last, seatId: seat?.seatId, deviceHash: seat?.deviceHash });
    }
  };

  return { state, commit };
}

export default function StoreEventHallPage() {
  const location = useLocation();
  const mode: HallMode = location.pathname.endsWith('/guest')
    ? 'guest'
    : location.pathname.endsWith('/host')
      ? 'host'
      : 'display';
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_EVENT_LIVE_LAB_TOKEN;
  const isLab = isEventLabToken(safeToken);
  const gate = useGuestDeviceGate({
    kind: 'event',
    token: safeToken,
    enabled: mode === 'guest',
    isLab,
  });
  const { state, commit } = useEventLabState(safeToken, mode, gate);
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  useDocumentTitle(copy.documentTitle);

  if (!STORE_EVENT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (mode === 'guest' && gate.status === 'blocked') {
    return (
      <StoreGuestDeviceBlocked
        productAr={copy.titleAr}
        hostAr={voice === 'women' ? 'المضيفة' : 'المضيف'}
      />
    );
  }

  return (
    <StorePurchasedShell>
      <StoreEventHallStage state={state} immersive />
      {mode === 'guest' && gate.status === 'ok' ? <StoreEventGuestForm state={state} onChange={commit} /> : null}
      {mode === 'host' ? (
        <div className="relative z-20 px-3 pb-10 pt-3">
          <StoreEventHostPanel state={state} onChange={commit} hostToken={safeToken} isLab={isLab} />
        </div>
      ) : null}
    </StorePurchasedShell>
  );
}
