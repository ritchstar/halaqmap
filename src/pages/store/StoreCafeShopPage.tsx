/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة جار الحي ولوحة الكاشير وشاشات المقهى.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreCafeDesk } from '@/components/store/StoreCafeDesk';
import { StoreCafeGuestForm } from '@/components/store/StoreCafeGuestForm';
import { StoreCafeHallStage, type CafeScreenMode } from '@/components/store/StoreCafeHallStage';
import { StoreCafeHostPanel } from '@/components/store/StoreCafeHostPanel';
import { StoreCafeShop } from '@/components/store/StoreCafeShop';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_LAB_TOKEN,
  STORE_CAFE_LIVE_PRODUCT,
  STORE_CAFE_LIVE_PUBLIC_ENABLED,
} from '@/config/storeCafeLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  cafeLabRaw,
  defaultCafeLabState,
  readCafeLabState,
  writeCafeLabState,
  type CafeLabState,
} from '@/lib/storeCafeLiveLab';
import {
  addCafeLiveBlessing,
  addCafeLiveChat,
  addCafeLiveOrder,
  fetchCafeLivePublic,
  saveCafeLiveHost,
  type CafeLiveRole,
} from '@/lib/storeCafeLiveRemote';
import { parseStoreShopHours } from '@/lib/storeShopHours';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';
type CafePageMode = 'shop' | 'desk' | 'host' | 'guest' | CafeScreenMode;

function payloadToState(payload: Record<string, unknown>, fallback: CafeLabState): CafeLabState {
  const host = {
    ...fallback.host,
    shopName: String(payload.shopName || fallback.host.shopName),
    hostName: String(payload.hostName || fallback.host.hostName),
    blurbAr: String(payload.blurbAr || fallback.host.blurbAr),
    customFields: Array.isArray(payload.customFields)
      ? (payload.customFields as string[]).slice(0, 5)
      : fallback.host.customFields,
    flashAr: String(payload.flashAr ?? fallback.host.flashAr),
    packId: payload.packId === 'm12' ? 'm12' : 'm6',
    nextTicket: Number(payload.nextTicket) > 0 ? Number(payload.nextTicket) : fallback.host.nextTicket,
    welcomeAr: String(payload.welcomeAr ?? fallback.host.welcomeAr),
    youtubeUrl: String(payload.youtubeUrl ?? fallback.host.youtubeUrl),
    youtubeHidden: payload.youtubeHidden !== false,
    announcement: String(payload.announcement ?? fallback.host.announcement),
    photoSrc: String(payload.photoSrc ?? fallback.host.photoSrc),
    panoramaSrc: String(payload.panoramaSrc ?? fallback.host.panoramaSrc),
    guestPaused: payload.guestPaused === true,
    reviewBeforeShow: payload.reviewBeforeShow === true,
    activeEventId:
      payload.activeEventId === 'evening' || payload.activeEventId === 'offer' || payload.activeEventId === 'custom'
        ? payload.activeEventId
        : 'welcome',
    customEventTitle: String(payload.customEventTitle ?? fallback.host.customEventTitle),
    ...parseStoreShopHours(payload, fallback.host),
  };
  return {
    host,
    shelf: Array.isArray(payload.shelf) && payload.shelf.length
      ? (payload.shelf as CafeLabState['shelf'])
      : fallback.shelf,
    orders: Array.isArray(payload.orders) ? (payload.orders as CafeLabState['orders']) : [],
    chats: Array.isArray(payload.chats) ? (payload.chats as CafeLabState['chats']) : [],
    blessings: Array.isArray(payload.blessings) ? (payload.blessings as CafeLabState['blessings']) : [],
  };
}

function pageMode(pathname: string): CafePageMode {
  if (pathname.endsWith('/desk')) return 'desk';
  if (pathname.endsWith('/host')) return 'host';
  if (pathname.endsWith('/guest')) return 'guest';
  if (pathname.endsWith('/quiet')) return 'quiet';
  if (pathname.endsWith('/menu')) return 'menu';
  return 'shop';
}

function apiRole(mode: CafePageMode): CafeLiveRole {
  if (mode === 'desk') return 'desk';
  if (mode === 'host') return 'host';
  if (mode === 'guest') return 'guest';
  if (mode === 'quiet' || mode === 'menu' || mode === 'main') return 'display';
  return 'shop';
}

export default function StoreCafeShopPage() {
  const location = useLocation();
  const mode = pageMode(location.pathname);
  const displayMode: CafeScreenMode | null =
    mode === 'quiet' || mode === 'menu' ? mode : mode === 'shop' ? null : mode === 'main' ? 'main' : null;
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_CAFE_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_CAFE_LIVE_LAB_TOKEN;
  const [state, setState] = useState<CafeLabState>(() =>
    isLab ? readCafeLabState(safeToken) : defaultCafeLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const [renewToken, setRenewToken] = useState('');
  const [shopUrl, setShopUrl] = useState(
    typeof window === 'undefined'
      ? `/#/c/${encodeURIComponent(safeToken)}`
      : `${window.location.origin}/#/c/${encodeURIComponent(safeToken)}`,
  );
  const [guestUrl, setGuestUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [quietUrl, setQuietUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [screenLive, setScreenLive] = useState(true);
  const [asDisplay, setAsDisplay] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const neighborhoodShop = mode === 'shop' && !displayMode && !asDisplay;
  useDocumentTitle(STORE_CAFE_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_CAFE_LIVE_PRODUCT,
    token: safeToken,
    enabled: gate === 'ok' && neighborhoodShop,
  });

  useEffect(() => {
    if (isLab) {
      let raw = cafeLabRaw(safeToken);
      setState(readCafeLabState(safeToken));
      const origin = window.location.origin;
      setShopUrl(`${origin}/#/c/${encodeURIComponent(safeToken)}`);
      setGuestUrl(`${origin}/#/c/${encodeURIComponent(safeToken)}/guest`);
      setDisplayUrl(`${origin}/#/c/${encodeURIComponent(safeToken)}`);
      setQuietUrl(`${origin}/#/c/${encodeURIComponent(safeToken)}/quiet`);
      setMenuUrl(`${origin}/#/c/${encodeURIComponent(safeToken)}/menu`);
      setScreenLive(true);
      setAsDisplay(false);
      setIsTrial(false);
      const refresh = () => {
        const next = cafeLabRaw(safeToken);
        if (next === raw) return;
        raw = next;
        setState(readCafeLabState(safeToken));
      };
      const timer = window.setInterval(refresh, 1500);
      window.addEventListener('storage', refresh);
      return () => {
        window.clearInterval(timer);
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const role = apiRole(mode === 'shop' ? 'shop' : mode);
    const load = () => {
      void fetchCafeLivePublic(safeToken, role).then((result) => {
        if (cancelled) return;
        if (result.expired === true) {
          setRenewToken(String(result.renewToken || safeToken));
          setGate('expired');
          return;
        }
        if (!result.ok || !result.payload || typeof result.payload !== 'object') {
          setGate('missing');
          setScreenLive(false);
          return;
        }
        setState(payloadToState(result.payload as Record<string, unknown>, defaultCafeLabState()));
        if (typeof result.shopUrl === 'string' && result.shopUrl) setShopUrl(result.shopUrl);
        if (typeof result.guestUrl === 'string') setGuestUrl(result.guestUrl);
        if (typeof result.displayUrl === 'string') setDisplayUrl(result.displayUrl);
        if (typeof result.quietUrl === 'string') setQuietUrl(result.quietUrl);
        if (typeof result.menuUrl === 'string') setMenuUrl(result.menuUrl);
        setAsDisplay(result.role === 'display' && mode === 'shop');
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

  if (!STORE_CAFE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_CAFE}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: CafeLabState) => {
    if (isLab) writeCafeLabState(safeToken, next);
    const prev = state;
    setState(next);
    if (isLab) return;
    if (mode === 'desk' || mode === 'host') {
      void saveCafeLiveHost({
        token: safeToken,
        ...next.host,
        shelf: next.shelf,
        orders: next.orders,
        chats: next.chats,
        blessings: next.blessings,
      });
      return;
    }
    if (mode === 'guest') {
      const last = next.blessings[next.blessings.length - 1];
      const prevIds = new Set(prev.blessings.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addCafeLiveBlessing({ token: safeToken, ...last });
      }
      return;
    }
    const last = next.orders[0];
    const prevIds = new Set(prev.orders.map((item) => item.id));
    if (last && !prevIds.has(last.id)) {
      void addCafeLiveOrder(safeToken, last as unknown as Record<string, unknown>);
    }
    const lastChat = next.chats[0];
    const prevChat = new Set(prev.chats.map((item) => item.id));
    if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
      void addCafeLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
    }
  };

  const screen: CafeScreenMode | null =
    displayMode || (asDisplay && mode === 'shop' ? 'main' : null);

  return (
    <StorePurchasedShell>
      {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح الصفحة…</p> : null}
      {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
      {gate === 'ok' && screen ? (
        <StoreCafeHallStage
          state={state}
          mode={screen}
          immersive
          guestUrl={guestUrl}
          screenLive={screenLive}
        />
      ) : null}
      {gate === 'ok' && !screen ? (
        <div className="mx-auto max-w-3xl px-3 py-5">
          {mode === 'desk' ? (
            <StoreCafeDesk state={state} onChange={commit} shopUrl={shopUrl} showTrialNote={isTrial} token={safeToken} />
          ) : null}
          {mode === 'host' ? (
            <StoreCafeHostPanel
              state={state}
              onChange={commit}
              guestUrl={guestUrl}
              displayUrl={displayUrl || shopUrl}
              quietUrl={quietUrl}
              menuUrl={menuUrl}
            />
          ) : null}
          {mode === 'guest' ? <StoreCafeGuestForm state={state} onChange={commit} rateKey={safeToken} /> : null}
          {mode === 'shop' ? <StoreCafeShop state={state} onChange={commit} /> : null}
        </div>
      ) : null}
    </StorePurchasedShell>
  );
}
