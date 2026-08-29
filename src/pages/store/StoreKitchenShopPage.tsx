/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة الزبون ولوحة النشاط.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreKitchenDesk } from '@/components/store/StoreKitchenDesk';
import { StoreKitchenShop } from '@/components/store/StoreKitchenShop';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_KITCHEN_LIVE,
  STORE_KITCHEN_LIVE_LAB_TOKEN,
  STORE_KITCHEN_LIVE_PRODUCT,
  STORE_KITCHEN_LIVE_PUBLIC_ENABLED,
} from '@/config/storeKitchenLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import {
  defaultKitchenLabState,
  kitchenQrMatches,
  kitchenShopUrl,
  readKitchenLabState,
  writeKitchenLabState,
  type KitchenLabState,
} from '@/lib/storeKitchenLiveLab';
import { addKitchenLiveOrder, fetchKitchenLivePublic, saveKitchenLiveHost } from '@/lib/storeKitchenLiveRemote';
import { nextStoreLivePublicGate } from '@/lib/storeLivePublicRead';
import { parseStoreShopHours } from '@/lib/storeShopHours';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: KitchenLabState): KitchenLabState {
  const host = {
    ...fallback.host,
    shopName: String(payload.shopName || fallback.host.shopName),
    hostName: String(payload.hostName || fallback.host.hostName),
    blurbAr: String(payload.blurbAr || fallback.host.blurbAr),
    customFields: Array.isArray(payload.customFields)
      ? (payload.customFields as string[]).slice(0, 5)
      : fallback.host.customFields,
    flashAr: String(payload.flashAr ?? fallback.host.flashAr),
    opsPhone: String(payload.opsPhone ?? fallback.host.opsPhone),
    acceptingOrders: payload.acceptingOrders !== false,
    scheduleEnabled: payload.scheduleEnabled === true,
    deliveryFee: Number(payload.deliveryFee) >= 0 ? Number(payload.deliveryFee) : fallback.host.deliveryFee,
    showSoldOut: payload.showSoldOut === true,
    qrStamp: String(payload.qrStamp || fallback.host.qrStamp),
    qrActive: payload.qrActive !== false,
    nextTicket: Number(payload.nextTicket) > 0 ? Number(payload.nextTicket) : fallback.host.nextTicket,
    pickupLat: Number.isFinite(Number(payload.pickupLat)) ? Number(payload.pickupLat) : fallback.host.pickupLat,
    pickupLng: Number.isFinite(Number(payload.pickupLng)) ? Number(payload.pickupLng) : fallback.host.pickupLng,
    pickupMapsUrl: String(payload.pickupMapsUrl || fallback.host.pickupMapsUrl).slice(0, 240),
    pickupPlaceVisible: payload.pickupPlaceVisible === true,
    ...parseStoreShopHours(payload, fallback.host),
  };
  return {
    host,
    shelf: Array.isArray(payload.shelf) && payload.shelf.length
      ? (payload.shelf as KitchenLabState['shelf'])
      : fallback.shelf,
    orders: Array.isArray(payload.orders) ? (payload.orders as KitchenLabState['orders']) : [],
  };
}

export default function StoreKitchenShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_KITCHEN_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_KITCHEN_LIVE_LAB_TOKEN;
  const [state, setState] = useState<KitchenLabState>(() =>
    isLab ? readKitchenLabState(safeToken) : defaultKitchenLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const [renewToken, setRenewToken] = useState('');
  const [giftNotice, setGiftNotice] = useState<{ expiresAt: string; shopToken: string } | null>(null);
  const [shopUrl, setShopUrl] = useState(
    typeof window === 'undefined'
      ? `/#/k/${encodeURIComponent(safeToken)}`
      : kitchenShopUrl(safeToken, ''),
  );
  const qrParam = readHashQueryParam('qr') || '';
  const qrOk = desk || kitchenQrMatches(state.host, qrParam);
  useDocumentTitle(STORE_KITCHEN_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_KITCHEN_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok' && qrOk,
  });

  useEffect(() => {
    if (isLab) {
      setState(readKitchenLabState(safeToken));
      const refresh = () => setState(readKitchenLabState(safeToken));
      const timer = window.setInterval(refresh, 1500);
      window.addEventListener('storage', refresh);
      return () => {
        window.clearInterval(timer);
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchKitchenLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
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
        const payload = result.payload as Record<string, unknown>;
        setState(payloadToState(payload, defaultKitchenLabState()));
        if (typeof result.shopUrl === 'string' && result.shopUrl) setShopUrl(result.shopUrl);
        if (payload.gift === true) {
          setGiftNotice({
            expiresAt: String(result.expiresAt || ''),
            shopToken: String(result.shopToken || ''),
          });
        } else {
          setGiftNotice(null);
        }
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

  if (!STORE_KITCHEN_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_KITCHEN}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const liveShopUrl = isLab
    ? kitchenShopUrl(safeToken, state.host.qrActive ? state.host.qrStamp : '')
    : shopUrl;

  const commit = (next: KitchenLabState) => {
    if (isLab) writeKitchenLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      void saveKitchenLiveHost({
        token: safeToken,
        ...next.host,
        shelf: next.shelf,
        orders: next.orders,
      });
    } else {
      const last = next.orders[0];
      const prevIds = new Set(state.orders.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addKitchenLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell>
      <div className="mx-auto max-w-3xl px-3 py-5">
        {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح الصفحة…</p> : null}
        {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          !qrOk ? (
            <p className="pt-[30svh] text-center text-sm text-white/70">{STORE_KITCHEN_LIVE.qrRevokedAr}</p>
          ) : desk ? (
            <StoreKitchenDesk
              state={state}
              onChange={commit}
              shopUrl={liveShopUrl}
              token={safeToken}
              gift={giftNotice}
            />
          ) : (
            <StoreKitchenShop state={state} onChange={commit} />
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
