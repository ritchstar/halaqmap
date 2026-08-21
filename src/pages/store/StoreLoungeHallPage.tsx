/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة لاونجا1: عرض / زبون / مضيف. عند انتهاء المدة يُحال الرابط إلى الهبوط لإعادة الشراء.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreLoungeGuestForm } from '@/components/store/StoreLoungeGuestForm';
import { StoreLoungeHallStage } from '@/components/store/StoreLoungeHallStage';
import { StoreLoungeHostPanel } from '@/components/store/StoreLoungeHostPanel';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_LAB_TOKEN, STORE_LOUNGE_LIVE_PUBLIC_ENABLED } from '@/config/storeLoungeLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  defaultLoungeLiveLabState,
  readLoungeLiveLabState,
  writeLoungeLiveLabState,
  type LoungeLiveHostState,
  type LoungeLiveLabState,
} from '@/lib/storeLoungeLiveLab';
import { addLoungeLiveBlessing, fetchLoungeLivePublic, saveLoungeLiveHost } from '@/lib/storeLoungeLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

type HallMode = 'display' | 'guest' | 'host';
type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: LoungeLiveLabState): LoungeLiveLabState {
  const host = {
    ...fallback.host,
    ...(payload as Partial<LoungeLiveHostState>),
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
  useDocumentTitle(STORE_LOUNGE_LIVE.documentTitle);

  useEffect(() => {
    if (isLab) {
      setState(readLoungeLiveLabState(safeToken));
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
          setGate('missing');
          return;
        }
        setState(payloadToState(result.payload as Record<string, unknown>, defaultLoungeLiveLabState()));
        setGuestUrl(typeof result.guestUrl === 'string' ? result.guestUrl : '');
        setDisplayUrl(typeof result.displayUrl === 'string' ? result.displayUrl : '');
        setExpiresAt(typeof result.expiresAt === 'string' ? result.expiresAt : '');
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

  const commit = (next: LoungeLiveLabState) => {
    if (isLab) {
      writeLoungeLiveLabState(safeToken, next);
    }
    setState(next);
    if (isLab) return;
    if (mode === 'host') {
      void saveLoungeLiveHost({ token: safeToken, ...next.host, blessings: next.blessings });
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

  const displayPath = `/l/${encodeURIComponent(safeToken)}`;
  const guestPath = `/l/${encodeURIComponent(safeToken)}/guest`;
  const hostPath = `/l/${encodeURIComponent(safeToken)}/host`;

  return (
    <StoreVisitorShell>
      {mode !== 'display' ? <StoreVisitorHeader /> : null}
      <section className={mode === 'display' ? 'px-3 py-4 md:px-6 md:py-6' : 'px-4 py-8'}>
        <div className="mx-auto max-w-6xl">
          {gate === 'loading' ? <p className="text-sm text-white/60">جاري فتح الشاشة…</p> : null}
          {gate === 'missing' ? (
            <p className="text-sm text-white/70">
              الرابط غير صالح.{' '}
              <Link className="text-[#d4a574] underline" to={ROUTE_PATHS.STORE_LOUNGE}>
                {STORE_LOUNGE_LIVE.titleAr}
              </Link>
            </p>
          ) : null}
          {gate === 'ok' ? (
            <>
              {isLab && mode !== 'display' ? (
                <div className="mb-5 flex flex-wrap gap-2 text-xs">
                  <Link to={ROUTE_PATHS.STORE_LOUNGE} className="text-white/50">
                    {STORE_LOUNGE_LIVE.titleAr}
                  </Link>
                  <Link to={displayPath} className="rounded-full border border-white/15 px-3 py-1">
                    {STORE_LOUNGE_LIVE.displayLinkAr}
                  </Link>
                  <Link to={guestPath} className="rounded-full border border-white/15 px-3 py-1">
                    {STORE_LOUNGE_LIVE.guestLinkAr}
                  </Link>
                  <Link to={hostPath} className="rounded-full border border-white/15 px-3 py-1">
                    {STORE_LOUNGE_LIVE.hostLinkAr}
                  </Link>
                </div>
              ) : null}
              <StoreLoungeHallStage state={state} />
              {mode === 'guest' ? (
                <div className="mt-6">
                  <StoreLoungeGuestForm state={state} onChange={commit} />
                </div>
              ) : null}
              {mode === 'host' ? (
                <div className="mt-6">
                  <StoreLoungeHostPanel
                    state={state}
                    onChange={commit}
                    guestUrl={guestUrl}
                    displayUrl={displayUrl}
                    expiresAt={expiresAt}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
      {mode !== 'display' ? <StoreVisitorFooter /> : null}
    </StoreVisitorShell>
  );
}
