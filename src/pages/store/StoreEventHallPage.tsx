/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قاعة الدعوة الحرة: عرض / ضيف / مضيف.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreEventGuestForm } from '@/components/store/StoreEventGuestForm';
import { StoreEventHallStage } from '@/components/store/StoreEventHallStage';
import { StoreEventHostPanel } from '@/components/store/StoreEventHostPanel';
import {
  STORE_EVENT_LIVE_LAB_TOKEN,
  STORE_EVENT_LIVE_LAB_TOKEN_WOMEN,
  STORE_EVENT_LIVE_PUBLIC_ENABLED,
  eventLiveCopy,
} from '@/config/storeEventLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  normalizeEventVoice,
  readEventLiveLabState,
  writeEventLiveLabState,
  type EventLiveHostState,
  type EventLiveLabState,
} from '@/lib/storeEventLiveLab';
import { addEventLiveBlessing, fetchEventLivePublic, saveEventLiveHost } from '@/lib/storeEventLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

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
    hostRole: 'self' as const,
  };
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : fallback.blessings;
  return { host, blessings: blessings as EventLiveLabState['blessings'] };
}

function useEventLabState(token: string, mode: HallMode) {
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
      if (last) void addEventLiveBlessing({ token, ...last });
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
  const { state, commit } = useEventLabState(safeToken, mode);
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  useDocumentTitle(copy.documentTitle);

  const isLab = isEventLabToken(safeToken);
  const displayPath = `/e/${encodeURIComponent(safeToken)}`;
  const guestPath = `/e/${encodeURIComponent(safeToken)}/guest`;
  const hostPath = `/e/${encodeURIComponent(safeToken)}/host`;
  const landingPath = voice === 'women' ? ROUTE_PATHS.STORE_EVENT_WOMEN : ROUTE_PATHS.STORE_EVENT_MEN;

  if (!STORE_EVENT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      {mode !== 'display' ? <StoreVisitorHeader /> : null}
      <section className={mode === 'display' ? 'px-3 py-4 md:px-6 md:py-6' : 'px-4 py-8'}>
        <div className="mx-auto max-w-6xl">
          {isLab && mode !== 'display' ? (
            <div className="mb-5 flex flex-wrap gap-2 text-xs">
              <Link to={landingPath} className="text-white/50">
                {copy.titleAr}
              </Link>
              <Link to={displayPath} className="rounded-full border border-white/15 px-3 py-1">
                {copy.displayLinkAr}
              </Link>
              <Link to={guestPath} className="rounded-full border border-white/15 px-3 py-1">
                {copy.guestLinkAr}
              </Link>
              <Link to={hostPath} className="rounded-full border border-white/15 px-3 py-1">
                {copy.hostLinkAr}
              </Link>
            </div>
          ) : null}
          <StoreEventHallStage state={state} />
          {mode === 'guest' ? (
            <div className="mt-6">
              <StoreEventGuestForm state={state} onChange={commit} />
            </div>
          ) : null}
          {mode === 'host' ? (
            <div className="mt-6">
              <StoreEventHostPanel state={state} onChange={commit} />
            </div>
          ) : null}
        </div>
      </section>
      {mode !== 'display' ? <StoreVisitorFooter /> : null}
    </StoreVisitorShell>
  );
}
