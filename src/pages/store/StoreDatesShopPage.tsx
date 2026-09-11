/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر تمر الحي ولوحة الصندوق.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreDatesDesk } from '@/components/store/StoreDatesDesk';
import { StoreDatesShop } from '@/components/store/StoreDatesShop';
import { StoreLiveActivityCartShop } from '@/components/store/live/StoreLiveActivityCartShop';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_DATES_LIVE,
  STORE_DATES_LIVE_ACCENT,
  STORE_DATES_LIVE_LAB_TOKEN,
  STORE_DATES_LIVE_PRODUCT,
  STORE_DATES_LIVE_PUBLIC_ENABLED,
} from '@/config/storeDatesLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  defaultDatesLabState,
  readDatesLabState,
  writeDatesLabState,
  type DatesLabState,
} from '@/lib/storeDatesLiveLab';
import { addDatesLiveChat, addDatesLiveOrder, fetchDatesLivePublic, saveDatesLiveHost } from '@/lib/storeDatesLiveRemote';
import { hydrateDeskTickets } from '@/lib/storeDeskOrderTicket';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import { liveHostText, useStoreLiveDeskSync } from '@/lib/storeLiveDeskSync';
import { nextStoreLivePublicGate, pickStoreLiveShelf } from '@/lib/storeLivePublicRead';
import { isShopClosedNow, parseStoreShopHours } from '@/lib/storeShopHours';
import { liveActivityCoverSrc, liveActivityTodayName, toLiveActivityShelf } from '@/lib/storeLiveActivityShelf';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { parseShopBackgroundFields } from '@/lib/storeShopBackground';
import { parseShopPickupPlace } from '@/lib/storeShopPlace';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeLiveShopShareHref } from '@/lib/storeHostRedirect';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: DatesLabState): DatesLabState {
  const host = {
    ...fallback.host,
    shopName: liveHostText(payload.shopName, fallback.host.shopName),
    logoSrc: parseShopLogoSrc(payload.logoSrc, fallback.host.logoSrc),
    hostName: liveHostText(payload.hostName, fallback.host.hostName),
    blurbAr: liveHostText(payload.blurbAr, fallback.host.blurbAr),
    customFields: Array.isArray(payload.customFields)
      ? (payload.customFields as string[]).slice(0, 5)
      : fallback.host.customFields,
    flashAr: liveHostText(payload.flashAr, fallback.host.flashAr),
    acceptingOrders: payload.acceptingOrders !== false,
    packId: payload.packId === 'm12' ? ('m12' as const) : ('m6' as const),
    ...parseStoreShopHours(payload, fallback.host),
    ...parseShopPickupPlace(payload, fallback.host),
    ...parseShopBackgroundFields(payload, fallback.host),
  };
  return {
    host,
    shelf: pickStoreLiveShelf(payload.shelf, fallback.shelf),
    ...hydrateDeskTickets<DatesLabState['orders'][number]>(payload.orders, payload.orderArchive),
    chatIncluded: payload.chatIncluded !== false,
    chats: Array.isArray(payload.chats) ? (payload.chats as DatesLabState['chats']) : [],
  };
}

export default function StoreDatesShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_DATES_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_DATES_LIVE_LAB_TOKEN;
  const [state, setState] = useState<DatesLabState>(() =>
    isLab ? readDatesLabState(safeToken) : defaultDatesLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const deskSync = useStoreLiveDeskSync(desk && !isLab);
  const [renewToken, setRenewToken] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [shopUrl, setShopUrl] = useState(storeLiveShopShareHref('dates', safeToken));
  useDocumentTitle(STORE_DATES_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_DATES_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok',
  });

  useEffect(() => {
    if (isLab) {
      setState(readDatesLabState(safeToken));
      if (desk) return undefined;
      const refresh = () => setState(readDatesLabState(safeToken));
      const stop = scheduleVisiblePoll(refresh, POLL_MS.STORE_LIVE_LAB);
      window.addEventListener('storage', refresh);
      return () => {
        stop();
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchDatesLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
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
        setState((current) =>
          deskSync.applyPoll(current, payloadToState(result.payload as Record<string, unknown>, current)),
        );
        if (typeof result.shopUrl === 'string' && result.shopUrl) setShopUrl(result.shopUrl);
        setIsTrial(result.isTrial === true);
        setGate('ok');
      });
    };
    load();
    const stop = scheduleVisiblePoll(load, desk ? POLL_MS.STORE_LIVE_DESK : POLL_MS.STORE_LIVE_SHOP);
    return () => {
      cancelled = true;
      stop();
    };
  }, [safeToken, desk, isLab]);

  if (!STORE_DATES_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_DATES}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: DatesLabState) => {
    if (isLab) writeDatesLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      deskSync.scheduleSave(next, (saved) =>
        saveDatesLiveHost({
          token: safeToken,
          ...saved.host,
          shelf: saved.shelf,
          orders: saved.orders,
          orderArchive: saved.orderArchive,
          chats: saved.chats,
        }),
      );
    } else {
      const last = next.orders[0];
      const prevIds = new Set(state.orders.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addDatesLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
      const lastChat = next.chats[0];
      const prevChat = new Set(state.chats.map((item) => item.id));
      if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
        void addDatesLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell
      product="dates"
      surface={desk ? 'workspace' : 'storefront'}
      life
      showStoreLink={!desk}
      pageBg={state.host.shopPageBg}
    >
      <div className={desk ? 'mx-auto max-w-3xl px-3 py-5' : undefined}>
        {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح المتجر…</p> : null}
        {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          desk ? (
            <StoreDatesDesk
              state={state}
              onChange={commit}
              shopUrl={shopUrl}
              token={safeToken}
              showTrialNote={isTrial}
            />
          ) : (
            <StoreLiveActivityCartShop
              kind="dates"
              token={safeToken}
              host={state.host}
              shelf={toLiveActivityShelf(state.shelf)}
              closed={isShopClosedNow(state.host)}
              acceptingOrders={state.host.acceptingOrders}
              todayName={liveActivityTodayName(state.shelf)}
              coverSrc={liveActivityCoverSrc(state.shelf)}
              hoursBanner={<StoreShopHoursBanner hours={state.host} accent={STORE_DATES_LIVE_ACCENT} />}
              directPay={
                <StoreDirectPayPublicMount product="store_dates_live" token={safeToken} accent={STORE_DATES_LIVE_ACCENT} />
              }
            >
              <StoreDatesShop activityShell state={state} onChange={commit} token={safeToken} />
            </StoreLiveActivityCartShop>
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
