/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر تموينات الحي ولوحة الكاشير.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { GrocersChatlyDesk } from '@/components/store/grocers/GrocersChatlyDesk';
import { GrocersChatlyStorefront } from '@/components/store/grocers/GrocersChatlyStorefront';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_GROCERS_LIVE,
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
import { parseStoreShopHours } from '@/lib/storeShopHours';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { parseShopBackgroundFields } from '@/lib/storeShopBackground';
import { parseShopPickupPlace } from '@/lib/storeShopPlace';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeLiveShopShareHref } from '@/lib/storeHostRedirect';

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
  const [state, setState] = useState<GrocersLabState>(() =>
    isLab ? readGrocersLabState(safeToken) : defaultGrocersLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const deskSync = useStoreLiveDeskSync(desk && !isLab);
  const [renewToken, setRenewToken] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [shopUrl, setShopUrl] = useState(storeLiveShopShareHref('grocers', safeToken));
  /*
   * هل يملك هذا الصندوق رفاً محفوظاً فعلياً على الخادم؟ يُحسب من payload
   * الخادم مباشرة قبل أن يدمجه payloadToState مع رف عرض تجريبي عند الفراغ،
   * حتى لا تقرأ قائمة «ابدأ قيادة منتجك» رفاً وهمياً كأنه رف حقيقي.
   */
  const [hasSavedShelf, setHasSavedShelf] = useState(false);
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
          const payload = result.payload as Record<string, unknown>;
          setState((current) => deskSync.applyPoll(current, payloadToState(payload, current)));
          setHasSavedShelf(Array.isArray(payload.shelf) && payload.shelf.length > 0);
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

  return (
    <StorePurchasedShell
      product="grocers"
      surface={desk ? 'workspace' : 'storefront'}
      life={false}
      showStoreLink={!desk}
      showDevNotice={false}
      showLiveMark={false}
      pageBg={undefined}
    >
      <div className="-mx-3 sm:-mx-4">
        {gate === 'loading' ? (
          <p className="pt-[30svh] text-center text-sm text-[#849284]">جاري فتح المتجر…</p>
        ) : null}
        {gate === 'missing' ? (
          <p className="pt-[30svh] text-center text-sm text-[#586a5c]">الرابط غير صالح.</p>
        ) : null}
        {gate === 'ok' ? (
          desk ? (
            <GrocersChatlyDesk
              state={state}
              onChange={commit}
              shopUrl={shopUrl}
              token={safeToken}
              showTrialNote={isTrial}
              saveStatus={deskSync.saveStatus}
              activationEnabled={!isLab}
              hasSavedShelf={hasSavedShelf}
            />
          ) : (
            <GrocersChatlyStorefront state={state} onChange={commit} token={safeToken} />
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
