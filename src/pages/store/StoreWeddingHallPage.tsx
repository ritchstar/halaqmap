/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قاعة الحفل: عرض / ضيف / مضيف.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreWeddingGuestForm } from '@/components/store/StoreWeddingGuestForm';
import { StoreWeddingHallStage } from '@/components/store/StoreWeddingHallStage';
import { StoreWeddingHostPanel } from '@/components/store/StoreWeddingHostPanel';
import {
  STORE_WEDDING_LIVE_LAB_TOKEN,
  STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN,
  STORE_WEDDING_LIVE_PUBLIC_ENABLED,
  weddingLiveCopy,
} from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  normalizeWeddingHostRole,
  normalizeWeddingVoice,
  readWeddingLiveLabState,
  writeWeddingLiveLabState,
  type WeddingLiveHostState,
  type WeddingLiveLabState,
} from '@/lib/storeWeddingLiveLab';
import { addWeddingLiveBlessing, fetchWeddingLivePublic, saveWeddingLiveHost } from '@/lib/storeWeddingLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

type HallMode = 'display' | 'guest' | 'host';

function isWeddingLabToken(token: string): boolean {
  return token === STORE_WEDDING_LIVE_LAB_TOKEN || token === STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN;
}

function payloadToState(payload: Record<string, unknown>, fallback: WeddingLiveLabState): WeddingLiveLabState {
  const voice = normalizeWeddingVoice((payload as Partial<WeddingLiveHostState>).voice ?? fallback.host.voice);
  const host = {
    ...fallback.host,
    ...(payload as Partial<WeddingLiveHostState>),
    voice,
    hostRole: normalizeWeddingHostRole((payload as Partial<WeddingLiveHostState>).hostRole, voice),
  };
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : fallback.blessings;
  return { host, blessings: blessings as WeddingLiveLabState['blessings'] };
}

function useWeddingLabState(token: string, mode: HallMode) {
  const [state, setState] = useState<WeddingLiveLabState>(() => readWeddingLiveLabState(token));
  const isLab = isWeddingLabToken(token);

  useEffect(() => {
    setState(readWeddingLiveLabState(token));
    const refresh = () => setState(readWeddingLiveLabState(token));
    const timer = window.setInterval(refresh, isLab ? 1500 : 4000);
    window.addEventListener('storage', refresh);
    if (!isLab) {
      void fetchWeddingLivePublic(token, mode).then((result) => {
        if (!result.ok || !result.payload || typeof result.payload !== 'object') return;
        setState(payloadToState(result.payload as Record<string, unknown>, readWeddingLiveLabState(token)));
      });
    }
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token, mode, isLab]);

  const commit = (next: WeddingLiveLabState) => {
    writeWeddingLiveLabState(token, next);
    setState(next);
    if (isLab) return;
    if (mode === 'host') {
      void saveWeddingLiveHost({ token, ...next.host, blessings: next.blessings });
    }
    if (mode === 'guest') {
      const last = next.blessings[next.blessings.length - 1];
      if (last) void addWeddingLiveBlessing({ token, ...last });
    }
  };

  return { state, commit };
}

export default function StoreWeddingHallPage() {
  const location = useLocation();
  const mode: HallMode = location.pathname.endsWith('/guest')
    ? 'guest'
    : location.pathname.endsWith('/host')
      ? 'host'
      : 'display';
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || 'lab';
  const { state, commit } = useWeddingLabState(safeToken, mode);
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  useDocumentTitle(copy.documentTitle);

  const isLab = isWeddingLabToken(safeToken);
  const displayPath = `/w/${encodeURIComponent(safeToken)}`;
  const guestPath = `/w/${encodeURIComponent(safeToken)}/guest`;
  const hostPath = `/w/${encodeURIComponent(safeToken)}/host`;
  const landingPath = voice === 'women' ? ROUTE_PATHS.STORE_WEDDING_WOMEN : ROUTE_PATHS.STORE_WEDDING;

  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
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
          <StoreWeddingHallStage state={state} autoWelcome={mode === 'display'} />
          {mode === 'guest' ? (
            <div className="mt-6">
              <StoreWeddingGuestForm state={state} onChange={commit} />
            </div>
          ) : null}
          {mode === 'host' ? (
            <div className="mt-6">
              <StoreWeddingHostPanel state={state} onChange={commit} />
            </div>
          ) : null}
        </div>
      </section>
      {mode !== 'display' ? <StoreVisitorFooter /> : null}
    </StoreVisitorShell>
  );
}
