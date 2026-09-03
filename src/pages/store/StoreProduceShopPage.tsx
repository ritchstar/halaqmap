/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر خضار الحي ولوحة الصندوق.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreProduceDesk } from '@/components/store/StoreProduceDesk';
import { StoreProduceShop } from '@/components/store/StoreProduceShop';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  STORE_PRODUCE_LIVE_PRODUCT,
  STORE_PRODUCE_LIVE_PUBLIC_ENABLED,
} from '@/config/storeProduceLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  defaultProduceLabState,
  readProduceLabState,
  writeProduceLabState,
  type ProduceLabState,
} from '@/lib/storeProduceLiveLab';
import { addProduceLiveChat, addProduceLiveOrder, fetchProduceLivePublic, saveProduceLiveHost } from '@/lib/storeProduceLiveRemote';
import { hydrateDeskTickets } from '@/lib/storeDeskOrderTicket';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import { liveHostText, useStoreLiveDeskSync } from '@/lib/storeLiveDeskSync';
import { nextStoreLivePublicGate, pickStoreLiveShelf } from '@/lib/storeLivePublicRead';
import { parseStoreShopHours } from '@/lib/storeShopHours';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { parseShopPickupPlace } from '@/lib/storeShopPlace';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: ProduceLabState): ProduceLabState {
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
    packId: payload.packId === 'm12' ? ('m12' as const) : ('m6' as const),
    ...parseStoreShopHours(payload, fallback.host),
    ...parseShopPickupPlace(payload, fallback.host),
  };
  return {
    host,
    shelf: pickStoreLiveShelf(payload.shelf, fallback.shelf),
    ...hydrateDeskTickets<ProduceLabState['orders'][number]>(payload.orders, payload.orderArchive),
    chatIncluded: payload.chatIncluded !== false,
    chats: Array.isArray(payload.chats) ? (payload.chats as ProduceLabState['chats']) : [],
  };
}

export default function StoreProduceShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_PRODUCE_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_PRODUCE_LIVE_LAB_TOKEN;
  const [state, setState] = useState<ProduceLabState>(() =>
    isLab ? readProduceLabState(safeToken) : defaultProduceLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const deskSync = useStoreLiveDeskSync(desk && !isLab);
  const [renewToken, setRenewToken] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [shopUrl, setShopUrl] = useState(
    typeof window === 'undefined' ? `/#/v/${encodeURIComponent(safeToken)}` : `${window.location.origin}/#/v/${encodeURIComponent(safeToken)}`,
  );
  useDocumentTitle(STORE_PRODUCE_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_PRODUCE_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok',
  });

  useEffect(() => {
    if (isLab) {
      setState(readProduceLabState(safeToken));
      if (desk) return undefined;
      const refresh = () => setState(readProduceLabState(safeToken));
      const stop = scheduleVisiblePoll(refresh, POLL_MS.STORE_LIVE_LAB);
      window.addEventListener('storage', refresh);
      return () => {
        stop();
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchProduceLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
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

  if (!STORE_PRODUCE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_PRODUCE}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: ProduceLabState) => {
    if (isLab) writeProduceLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      deskSync.scheduleSave(next, (saved) =>
        saveProduceLiveHost({
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
        void addProduceLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
      const lastChat = next.chats[0];
      const prevChat = new Set(state.chats.map((item) => item.id));
      if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
        void addProduceLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell
      sky="produce"
      skySurface={desk ? 'desk' : 'shop'}
      skyLat={state.host.pickupLat}
      skyLng={state.host.pickupLng}
      life
    >
      <div className="mx-auto max-w-3xl px-3 py-5">
        {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح المتجر…</p> : null}
        {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          desk ? (
            <StoreProduceDesk
              state={state}
              onChange={commit}
              shopUrl={shopUrl}
              token={safeToken}
              showTrialNote={isTrial}
            />
          ) : (
            <StoreProduceShop state={state} onChange={commit} token={safeToken} />
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
