/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر تموينات الحي ولوحة الكاشير.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { StoreGrocersDesk } from '@/components/store/StoreGrocersDesk';
import { StoreGrocersShop } from '@/components/store/StoreGrocersShop';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_LAB_TOKEN, STORE_GROCERS_LIVE_PUBLIC_ENABLED } from '@/config/storeGrocersLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  defaultGrocersLabState,
  readGrocersLabState,
  writeGrocersLabState,
  type GrocersLabState,
} from '@/lib/storeGrocersLiveLab';
import { addGrocersLiveOrder, fetchGrocersLivePublic, saveGrocersLiveHost } from '@/lib/storeGrocersLiveRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'expired' | 'missing';

function payloadToState(payload: Record<string, unknown>, fallback: GrocersLabState): GrocersLabState {
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
  };
  return {
    host,
    shelf: Array.isArray(payload.shelf) && payload.shelf.length ? (payload.shelf as GrocersLabState['shelf']) : fallback.shelf,
    orders: Array.isArray(payload.orders) ? (payload.orders as GrocersLabState['orders']) : [],
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
  const [renewToken, setRenewToken] = useState('');
  const [shopUrl, setShopUrl] = useState(
    typeof window === 'undefined' ? `/#/g/${encodeURIComponent(safeToken)}` : `${window.location.origin}/#/g/${encodeURIComponent(safeToken)}`,
  );
  useDocumentTitle(STORE_GROCERS_LIVE.documentTitle);

  useEffect(() => {
    if (isLab) {
      setState(readGrocersLabState(safeToken));
      const refresh = () => setState(readGrocersLabState(safeToken));
      const timer = window.setInterval(refresh, 1500);
      window.addEventListener('storage', refresh);
      return () => {
        window.clearInterval(timer);
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
        if (!result.ok || !result.payload || typeof result.payload !== 'object') {
          setGate('missing');
          return;
        }
        setState(payloadToState(result.payload as Record<string, unknown>, defaultGrocersLabState()));
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
      void saveGrocersLiveHost({ token: safeToken, ...next.host, shelf: next.shelf, orders: next.orders });
    } else {
      const last = next.orders[0];
      const prevIds = new Set(state.orders.map((item) => item.id));
      if (last && !prevIds.has(last.id)) {
        void addGrocersLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell>
      <div className="mx-auto max-w-3xl px-3 py-5">
        {gate === 'loading' ? <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح المتجر…</p> : null}
        {gate === 'missing' ? <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          desk ? (
            <StoreGrocersDesk state={state} onChange={commit} shopUrl={shopUrl} />
          ) : (
            <StoreGrocersShop state={state} onChange={commit} />
          )
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
