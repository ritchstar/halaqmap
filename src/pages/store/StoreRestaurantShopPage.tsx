/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة ضيف الحي ولوحة المطبخ.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreRestaurantDesk } from '@/components/store/StoreRestaurantDesk';
import { StoreRestaurantShop } from '@/components/store/StoreRestaurantShop';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_LAB_TOKEN,
  STORE_RESTAURANT_LIVE_PRODUCT,
  STORE_RESTAURANT_LIVE_PUBLIC_ENABLED,
} from '@/config/storeRestaurantLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  defaultRestaurantLabState,
  readRestaurantLabState,
  writeRestaurantLabState,
  type RestaurantLabState,
} from '@/lib/storeRestaurantLiveLab';
import {
  addRestaurantLiveChat,
  addRestaurantLiveOrder,
  fetchRestaurantLivePublic,
  saveRestaurantLiveHost,
} from '@/lib/storeRestaurantLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: RestaurantLabState): RestaurantLabState {
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
  };
  return {
    host,
    shelf: Array.isArray(payload.shelf) && payload.shelf.length
      ? (payload.shelf as RestaurantLabState['shelf'])
      : fallback.shelf,
    orders: Array.isArray(payload.orders) ? (payload.orders as RestaurantLabState['orders']) : [],
    chats: Array.isArray(payload.chats) ? (payload.chats as RestaurantLabState['chats']) : [],
  };
}

export default function StoreRestaurantShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_RESTAURANT_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_RESTAURANT_LIVE_LAB_TOKEN;
  const [state, setState] = useState<RestaurantLabState>(() =>
    isLab ? readRestaurantLabState(safeToken) : defaultRestaurantLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const [renewToken, setRenewToken] = useState('');
  const [shopUrl, setShopUrl] = useState(
    typeof window === 'undefined'
      ? `/#/r/${encodeURIComponent(safeToken)}`
      : `${window.location.origin}/#/r/${encodeURIComponent(safeToken)}`,
  );
  useDocumentTitle(STORE_RESTAURANT_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_RESTAURANT_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok',
  });

  useEffect(() => {
    if (isLab) {
      setState(readRestaurantLabState(safeToken));
      const refresh = () => setState(readRestaurantLabState(safeToken));
      const timer = window.setInterval(refresh, 1500);
      window.addEventListener('storage', refresh);
      return () => {
        window.clearInterval(timer);
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchRestaurantLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
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
        setState(payloadToState(result.payload as Record<string, unknown>, defaultRestaurantLabState()));
        if (typeof result.shopUrl === 'string' && result.shopUrl) setShopUrl(result.shopUrl);
        setGate('ok');
      });
    };
    load();
    const timer = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [safeToken, desk, isLab]);

  if (!STORE_RESTAURANT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_RESTAURANT}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: RestaurantLabState) => {
    if (isLab) writeRestaurantLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      void saveRestaurantLiveHost({
        token: safeToken,
        ...next.host,
        shelf: next.shelf,
        orders: next.orders,
        chats: next.chats,
      });
    } else {
      const last = next.orders[0];
      const prevIds = new Set(state.orders.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addRestaurantLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
      const lastChat = next.chats[0];
      const prevChat = new Set(state.chats.map((item) => item.id));
      if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
        void addRestaurantLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell>
      <div className="mx-auto max-w-3xl px-3 py-5">
        {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح الصفحة…</p> : null}
        {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          desk ? (
            <StoreRestaurantDesk state={state} onChange={commit} shopUrl={shopUrl} token={safeToken} />
          ) : (
            <StoreRestaurantShop state={state} onChange={commit} />
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
