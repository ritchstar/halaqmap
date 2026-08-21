/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قاعة الحفل: عرض / ضيف / مضيف.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreWeddingGuestForm } from '@/components/store/StoreWeddingGuestForm';
import { StoreWeddingHallStage } from '@/components/store/StoreWeddingHallStage';
import { StoreWeddingHostPanel } from '@/components/store/StoreWeddingHostPanel';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
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

  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StorePurchasedShell>
      <StoreWeddingHallStage state={state} autoWelcome={mode === 'display'} immersive />
      {mode === 'guest' ? <StoreWeddingGuestForm state={state} onChange={commit} /> : null}
      {mode === 'host' ? (
        <div className="relative z-20 px-3 pb-10 pt-3">
          <StoreWeddingHostPanel state={state} onChange={commit} />
        </div>
      ) : null}
    </StorePurchasedShell>
  );
}
