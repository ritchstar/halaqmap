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
import { STORE_WEDDING_LIVE, STORE_WEDDING_LIVE_LAB_TOKEN, STORE_WEDDING_LIVE_PUBLIC_ENABLED } from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  normalizeWeddingHostRole,
  readWeddingLiveLabState,
  writeWeddingLiveLabState,
  type WeddingLiveHostState,
  type WeddingLiveLabState,
} from '@/lib/storeWeddingLiveLab';
import { addWeddingLiveBlessing, fetchWeddingLivePublic, saveWeddingLiveHost } from '@/lib/storeWeddingLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

type HallMode = 'display' | 'guest' | 'host';

function payloadToState(payload: Record<string, unknown>, fallback: WeddingLiveLabState): WeddingLiveLabState {
  const host = {
    ...fallback.host,
    ...(payload as Partial<WeddingLiveHostState>),
    hostRole: normalizeWeddingHostRole((payload as Partial<WeddingLiveHostState>).hostRole),
  };
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : fallback.blessings;
  return { host, blessings: blessings as WeddingLiveLabState['blessings'] };
}

function useWeddingLabState(token: string, mode: HallMode) {
  const [state, setState] = useState<WeddingLiveLabState>(() => readWeddingLiveLabState(token));
  const isLab = token === STORE_WEDDING_LIVE_LAB_TOKEN;

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
  useDocumentTitle(STORE_WEDDING_LIVE.documentTitle);
  const location = useLocation();
  const mode: HallMode = location.pathname.endsWith('/guest')
    ? 'guest'
    : location.pathname.endsWith('/host')
      ? 'host'
      : 'display';
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || 'lab';
  const { state, commit } = useWeddingLabState(safeToken, mode);

  const isLab = safeToken === STORE_WEDDING_LIVE_LAB_TOKEN;
  const displayPath = `/w/${encodeURIComponent(safeToken)}`;
  const guestPath = `/w/${encodeURIComponent(safeToken)}/guest`;
  const hostPath = `/w/${encodeURIComponent(safeToken)}/host`;

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
              <Link to={ROUTE_PATHS.STORE_WEDDING} className="text-white/50">
                {STORE_WEDDING_LIVE.titleAr}
              </Link>
              <Link to={displayPath} className="rounded-full border border-white/15 px-3 py-1">
                {STORE_WEDDING_LIVE.displayLinkAr}
              </Link>
              <Link to={guestPath} className="rounded-full border border-white/15 px-3 py-1">
                {STORE_WEDDING_LIVE.guestLinkAr}
              </Link>
              <Link to={hostPath} className="rounded-full border border-white/15 px-3 py-1">
                {STORE_WEDDING_LIVE.hostLinkAr}
              </Link>
            </div>
          ) : null}
          <StoreWeddingHallStage state={state} />
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
