/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر تموينات الحي ولوحة الكاشير.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreGrocersDesk } from '@/components/store/StoreGrocersDesk';
import { StoreGrocersShop } from '@/components/store/StoreGrocersShop';
import { GrocersChatlyDesk } from '@/components/store/grocers/GrocersChatlyDesk';
import { GrocersChatlyStorefront } from '@/components/store/grocers/GrocersChatlyStorefront';
import { StoreLiveActivityCartShop } from '@/components/store/live/StoreLiveActivityCartShop';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_ACCENT,
  STORE_GROCERS_LIVE_LAB_TOKEN,
  STORE_GROCERS_LIVE_PRODUCT,
  STORE_GROCERS_LIVE_PUBLIC_ENABLED,
} from '@/config/storeGrocersLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  defaultGrocersLabState,
  readGrocersLabState,
  writeGrocersLabState,
  type GrocersLabState,
} from '@/lib/storeGrocersLiveLab';
import { addGrocersLiveChat, addGrocersLiveOrder, fetchGrocersLivePublic, saveGrocersLiveHost } from '@/lib/storeGrocersLiveRemote';
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
import { isGrocersChatlyUi } from '@/lib/storeGrocersChatlyUi';
import { cn } from '@/lib/utils';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: GrocersLabState): GrocersLabState {
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
    packId: payload.packId === 'm12' ? 'm12' : 'm6',
    ...parseStoreShopHours(payload, fallback.host),
    ...parseShopPickupPlace(payload, fallback.host),
    ...parseShopBackgroundFields(payload, fallback.host),
  };
  return {
    host,
    shelf: pickStoreLiveShelf(payload.shelf, fallback.shelf),
    ...hydrateDeskTickets<GrocersLabState['orders'][number]>(payload.orders, payload.orderArchive),
    chatAddon: payload.chatAddon === true,
    chats: Array.isArray(payload.chats) ? (payload.chats as GrocersLabState['chats']) : [],
  };
}

export default function StoreGrocersShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_GROCERS_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_GROCERS_LIVE_LAB_TOKEN;
  const chatlyUi = isGrocersChatlyUi(safeToken);
  const [state, setState] = useState<GrocersLabState>(() =>
    isLab ? readGrocersLabState(safeToken) : defaultGrocersLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const deskSync = useStoreLiveDeskSync(desk && !isLab);
  const [renewToken, setRenewToken] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [shopUrl, setShopUrl] = useState(storeLiveShopShareHref('grocers', safeToken));
  useDocumentTitle(STORE_GROCERS_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_GROCERS_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok',
  });

  useEffect(() => {
    if (isLab) {
      setState(readGrocersLabState(safeToken));
      if (desk) return undefined;
      const refresh = () => setState(readGrocersLabState(safeToken));
      const stop = scheduleVisiblePoll(refresh, POLL_MS.STORE_LIVE_LAB);
      window.addEventListener('storage', refresh);
      return () => {
        stop();
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchGrocersLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
        if (cancelled) return;
        if (result.expired === true) {
          setRenewToken(String(result.renewToken || safeToken));
          setGate('expired');
          return;
        }
        if (result.ok && result.payload && typeof result.payload === 'object') {
          setState((current) =>
            deskSync.applyPoll(current, payloadToState(result.payload as Record<string, unknown>, current)),
          );
          if (typeof result.shopUrl === 'string' && result.shopUrl) setShopUrl(result.shopUrl);
          setIsTrial(result.isTrial === true);
          setGate('ok');
          return;
        }
        setGate((current) => nextStoreLivePublicGate(current, result).gate);
      });
    };
    load();
    const stop = scheduleVisiblePoll(load, desk ? POLL_MS.STORE_LIVE_DESK : POLL_MS.STORE_LIVE_SHOP);
    return () => {
      cancelled = true;
      stop();
    };
  }, [safeToken, desk, isLab]);

  if (!STORE_GROCERS_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_GROCERS}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: GrocersLabState) => {
    if (isLab) writeGrocersLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      deskSync.scheduleSave(next, (state) =>
        saveGrocersLiveHost({
          token: safeToken,
          ...state.host,
          shelf: state.shelf,
          orders: state.orders,
          orderArchive: state.orderArchive,
          chats: state.chats,
        }),
      );
    } else {
      const last = next.orders[0];
      const prevIds = new Set(state.orders.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addGrocersLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
      const lastChat = next.chats[0];
      const prevChat = new Set(state.chats.map((item) => item.id));
      if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
        void addGrocersLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
      }
    }
  };

  const chatlyStorefront = chatlyUi && !desk;
  const chatlyDesk = chatlyUi && desk;

  return (
    <StorePurchasedShell
      product="grocers"
      surface={desk ? 'workspace' : 'storefront'}
      life={!chatlyStorefront}
      showStoreLink={!desk}
      showDevNotice={!chatlyStorefront}
      showLiveMark={!chatlyStorefront}
      pageBg={chatlyStorefront || chatlyDesk ? undefined : state.host.shopPageBg}
    >
      <div
        className={cn(
          desk && !chatlyDesk && 'mx-auto max-w-3xl px-3 py-5',
          chatlyDesk && '-mx-3 sm:-mx-4',
          chatlyStorefront && '-mx-3 sm:-mx-4',
        )}
      >
        {gate === 'loading' ? (
          <p
            className={cn(
              'pt-[30svh] text-center text-sm',
              chatlyStorefront || chatlyDesk ? 'text-[#849284]' : 'text-white/60',
            )}
          >
            جاري فتح المتجر…
          </p>
        ) : null}
        {gate === 'missing' ? (
          <p
            className={cn(
              'pt-[30svh] text-center text-sm',
              chatlyStorefront || chatlyDesk ? 'text-[#586a5c]' : 'text-white/70',
            )}
          >
            الرابط غير صالح.
          </p>
        ) : null}
        {gate === 'ok' ? (
          desk ? (
            chatlyUi ? (
              <GrocersChatlyDesk
                state={state}
                onChange={commit}
                shopUrl={shopUrl}
                token={safeToken}
                showTrialNote={isTrial}
              />
            ) : (
              <StoreGrocersDesk
                state={state}
                onChange={commit}
                shopUrl={shopUrl}
                token={safeToken}
                showTrialNote={isTrial}
              />
            )
          ) : chatlyUi ? (
            <GrocersChatlyStorefront state={state} onChange={commit} token={safeToken} />
          ) : (
            <StoreLiveActivityCartShop
              kind="grocers"
              token={safeToken}
              initialTab={isLab ? 'order' : 'home'}
              showIndependentStoreIdentity
              host={state.host}
              shelf={toLiveActivityShelf(state.shelf)}
              closed={isShopClosedNow(state.host)}
              acceptingOrders={state.host.acceptingOrders}
              todayName={liveActivityTodayName(state.shelf)}
              coverSrc={liveActivityCoverSrc(state.shelf)}
              hoursBanner={<StoreShopHoursBanner hours={state.host} accent={STORE_GROCERS_LIVE_ACCENT} />}
              directPay={
                <StoreDirectPayPublicMount product="store_grocers_live" token={safeToken} accent={STORE_GROCERS_LIVE_ACCENT} />
              }
            >
              <StoreGrocersShop activityShell state={state} onChange={commit} token={safeToken} />
            </StoreLiveActivityCartShop>
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
