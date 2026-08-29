/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة لاونجا1: عرض / زبون / مضيف. عند انتهاء المدة يُحال الرابط إلى الهبوط لإعادة الشراء.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreLoungeGuestForm } from '@/components/store/StoreLoungeGuestForm';
import { StoreLoungeHallStage } from '@/components/store/StoreLoungeHallStage';
import { StoreLoungeHostPanel } from '@/components/store/StoreLoungeHostPanel';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_LAB_TOKEN, STORE_LOUNGE_LIVE_PUBLIC_ENABLED } from '@/config/storeLoungeLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  defaultLoungeLiveLabState,
  readLoungeLiveLabState,
  writeLoungeLiveLabState,
  type LoungeLiveHostState,
  type LoungeLiveLabState,
} from '@/lib/storeLoungeLiveLab';
import { liveHostText, useStoreLiveDeskSync } from '@/lib/storeLiveDeskSync';
import { nextStoreLivePublicGate } from '@/lib/storeLivePublicRead';
import { addLoungeLiveBlessing, fetchLoungeLivePublic, saveLoungeLiveHost } from '@/lib/storeLoungeLiveRemote';
import { parseShopPickupPlace } from '@/lib/storeShopPlace';
import { ROUTE_PATHS } from '@/lib/routePaths';

type HallMode = 'display' | 'guest' | 'host';
type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: LoungeLiveLabState): LoungeLiveLabState {
  const host = {
    ...fallback.host,
    ...(payload as Partial<LoungeLiveHostState>),
    loungeName: liveHostText(payload.loungeName, fallback.host.loungeName),
    hostName: liveHostText(payload.hostName, fallback.host.hostName),
    welcomeAr: liveHostText(payload.welcomeAr, fallback.host.welcomeAr),
    announcement: liveHostText(payload.announcement, fallback.host.announcement),
    youtubeUrl: liveHostText(payload.youtubeUrl, fallback.host.youtubeUrl),
    customEventTitle: liveHostText(payload.customEventTitle, fallback.host.customEventTitle),
    guestPaused: payload.guestPaused === true,
    reviewBeforeShow: payload.reviewBeforeShow === true,
    ...parseShopPickupPlace(payload, fallback.host),
  };
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : fallback.blessings;
  return { host, blessings: blessings as LoungeLiveLabState['blessings'] };
}

export default function StoreLoungeHallPage() {
  const location = useLocation();
  const mode: HallMode = location.pathname.endsWith('/guest')
    ? 'guest'
    : location.pathname.endsWith('/host')
      ? 'host'
      : 'display';
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_LOUNGE_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_LOUNGE_LIVE_LAB_TOKEN;
  const [state, setState] = useState<LoungeLiveLabState>(() =>
    isLab ? readLoungeLiveLabState(safeToken) : defaultLoungeLiveLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const [renewToken, setRenewToken] = useState('');
  const [guestUrl, setGuestUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [screenLive, setScreenLive] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  useDocumentTitle(STORE_LOUNGE_LIVE.documentTitle);
  const deskSync = useStoreLiveDeskSync(mode === 'host' && !isLab);

  useEffect(() => {
    if (isLab) {
      setState(readLoungeLiveLabState(safeToken));
      setGuestUrl(`${window.location.origin}/#/l/${encodeURIComponent(safeToken)}/guest`);
      setDisplayUrl(`${window.location.origin}/#/l/${encodeURIComponent(safeToken)}`);
      setScreenLive(true);
      setIsTrial(false);
      if (mode === 'host') return undefined;
      const refresh = () => setState(readLoungeLiveLabState(safeToken));
      const timer = window.setInterval(refresh, 1500);
      window.addEventListener('storage', refresh);
      return () => {
        window.clearInterval(timer);
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchLoungeLivePublic(safeToken, mode).then((result) => {
        if (cancelled) return;
        if (result.expired === true) {
          setRenewToken(String(result.renewToken || safeToken));
          setGate('expired');
          return;
        }
        if (!result.ok || !result.payload || typeof result.payload !== 'object') {
          setGate((current) => nextStoreLivePublicGate(current, result).gate);
          return;
        }
        setState((current) => deskSync.applyPoll(current, payloadToState(result.payload as Record<string, unknown>, current)));
        setGuestUrl(typeof result.guestUrl === 'string' ? result.guestUrl : '');
        setDisplayUrl(typeof result.displayUrl === 'string' ? result.displayUrl : '');
        setExpiresAt(typeof result.expiresAt === 'string' ? result.expiresAt : '');
        setIsTrial(result.isTrial === true);
        setScreenLive(true);
        setGate('ok');
      });
    };
    load();
    const timer = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [safeToken, mode, isLab]);

  useEffect(() => {
    if (mode !== 'display' || gate !== 'ok') return;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    let sentinel: { release: () => Promise<void> } | undefined;
    const lock = async () => {
      try {
        sentinel = await nav.wakeLock?.request('screen');
      } catch {
        /* الجهاز قد يرفض الإبقاء مستيقظاً */
      }
    };
    void lock();
    const onVis = () => {
      if (document.visibilityState === 'visible') void lock();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      void sentinel?.release();
    };
  }, [mode, gate]);

  const commit = (next: LoungeLiveLabState) => {
    if (isLab) {
      writeLoungeLiveLabState(safeToken, next);
    }
    setState(next);
    if (isLab) return;
    if (mode === 'host') {
      deskSync.scheduleSave(next, (latest) =>
        saveLoungeLiveHost({ token: safeToken, ...latest.host, blessings: latest.blessings }),
      );
    }
    if (mode === 'guest') {
      const last = next.blessings[next.blessings.length - 1];
      if (last) void addLoungeLiveBlessing({ token: safeToken, ...last });
    }
  };

  if (!STORE_LOUNGE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_LOUNGE}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  return (
    <StorePurchasedShell>
      {gate === 'loading' ? (
        <p className="px-4 pt-[40svh] text-center text-sm text-white/60">جاري فتح الشاشة…</p>
      ) : null}
      {gate === 'missing' ? (
        <p className="px-4 pt-[40svh] text-center text-sm text-white/70">الرابط غير صالح.</p>
      ) : null}
      {gate === 'ok' ? (
        <>
          <StoreLoungeHallStage
            state={state}
            immersive
            guestUrl={mode === 'guest' ? '' : guestUrl}
            screenLive={screenLive}
          />
          {mode === 'guest' ? <StoreLoungeGuestForm state={state} onChange={commit} rateKey={safeToken} /> : null}
          {mode === 'host' ? (
            <div className="relative z-20 px-3 pb-10 pt-3">
              <StoreLoungeHostPanel
                state={state}
                onChange={commit}
                guestUrl={guestUrl}
                displayUrl={displayUrl}
                expiresAt={expiresAt}
                showTrialNote={isTrial}
                token={safeToken}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </StorePurchasedShell>
  );
}
