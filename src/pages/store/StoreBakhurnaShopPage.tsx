/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر بخور الحي ولوحة التشغيل — بخورنا1.
 * الرمز المعياري bakhurna-lab يبقى معاينة محلية بلا خادم؛ أي رمز حقيقي صادر
 * من الدفع يُقرأ ويُحفظ عبر api/public-store-bakhurna-live.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { BakhurnaChatlyDesk } from '@/components/store/bakhurna/BakhurnaChatlyDesk';
import { BakhurnaChatlyStorefront } from '@/components/store/bakhurna/BakhurnaChatlyStorefront';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_BAKHURNA_LIVE,
  STORE_BAKHURNA_LIVE_LAB_TOKEN,
  STORE_BAKHURNA_LIVE_PRODUCT,
  STORE_BAKHURNA_LIVE_PUBLIC_ENABLED,
} from '@/config/storeBakhurnaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import {
  defaultBakhurnaLabState,
  readBakhurnaLabState,
  writeBakhurnaLabState,
  type BakhurnaLabState,
} from '@/lib/storeBakhurnaLiveLab';
import {
  addBakhurnaLiveChat,
  addBakhurnaLiveOrder,
  fetchBakhurnaLivePublic,
  saveBakhurnaLiveHost,
} from '@/lib/storeBakhurnaLiveRemote';
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

function payloadToState(payload: Record<string, unknown>, fallback: BakhurnaLabState): BakhurnaLabState {
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
    ...hydrateDeskTickets<BakhurnaLabState['orders'][number]>(payload.orders, payload.orderArchive),
    chatIncluded: payload.chatIncluded !== false,
    chats: Array.isArray(payload.chats) ? (payload.chats as BakhurnaLabState['chats']) : [],
  };
}

export default function StoreBakhurnaShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_BAKHURNA_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_BAKHURNA_LIVE_LAB_TOKEN;
  const [state, setState] = useState<BakhurnaLabState>(() =>
    isLab ? readBakhurnaLabState(safeToken) : defaultBakhurnaLabState(),
  );
  const [gate, setGate] = useState<Gate>(isLab ? 'ok' : 'loading');
  const deskSync = useStoreLiveDeskSync(desk && !isLab);
  const [renewToken, setRenewToken] = useState('');
  const [giftNotice, setGiftNotice] = useState<{ expiresAt: string; shopToken: string } | null>(null);
  const [shopUrl, setShopUrl] = useState(storeLiveShopShareHref('bakhurna', safeToken));
  useDocumentTitle(STORE_BAKHURNA_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: STORE_BAKHURNA_LIVE_PRODUCT,
    token: safeToken,
    enabled: !desk && gate === 'ok',
  });

  useEffect(() => {
    if (isLab) {
      setState(readBakhurnaLabState(safeToken));
      if (desk) return undefined;
      const refresh = () => setState(readBakhurnaLabState(safeToken));
      const stop = scheduleVisiblePoll(refresh, POLL_MS.STORE_LIVE_LAB);
      window.addEventListener('storage', refresh);
      return () => {
        stop();
        window.removeEventListener('storage', refresh);
      };
    }
    let cancelled = false;
    const load = () => {
      void fetchBakhurnaLivePublic(safeToken, desk ? 'desk' : 'shop').then((result) => {
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
        setState((current) => deskSync.applyPoll(current, payloadToState(payload, current)));
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
    const stop = scheduleVisiblePoll(load, desk ? POLL_MS.STORE_LIVE_DESK : POLL_MS.STORE_LIVE_SHOP);
    return () => {
      cancelled = true;
      stop();
    };
  }, [safeToken, desk, isLab]);

  if (!STORE_BAKHURNA_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'expired' && renewToken) {
    return <Navigate to={`${ROUTE_PATHS.STORE_BAKHURNA}?renew=${encodeURIComponent(renewToken)}`} replace />;
  }

  const commit = (next: BakhurnaLabState) => {
    if (isLab) writeBakhurnaLabState(safeToken, next);
    setState(next);
    if (isLab) return;
    if (desk) {
      deskSync.scheduleSave(next, (saved) =>
        saveBakhurnaLiveHost({
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
        void addBakhurnaLiveOrder(safeToken, last as unknown as Record<string, unknown>);
      }
      const lastChat = next.chats[0];
      const prevChat = new Set(state.chats.map((item) => item.id));
      if (lastChat && lastChat.from === 'buyer' && !prevChat.has(lastChat.id)) {
        void addBakhurnaLiveChat(safeToken, lastChat as unknown as Record<string, unknown>);
      }
    }
  };

  return (
    <StorePurchasedShell
      product="bakhurna"
      surface={desk ? 'workspace' : 'storefront'}
      life={gate === 'ok' && !isLab}
      showStoreLink={!desk}
      showDevNotice={false}
      showLiveMark={false}
      pageBg={state.host.shopPageBg}
    >
      {gate === 'loading' && !isLab ? (
        <p className="pt-[30svh] text-center text-sm text-white/60">جاري فتح المتجر…</p>
      ) : null}
      {gate === 'missing' ? (
        <p className="pt-[30svh] text-center text-sm text-white/70">الرابط غير صالح.</p>
      ) : null}
      {gate === 'ok' || isLab ? (
        desk ? (
          <div className="-mx-3 sm:-mx-4">
            <BakhurnaChatlyDesk state={state} onChange={commit} shopUrl={shopUrl} token={safeToken} gift={giftNotice} />
          </div>
        ) : (
          <div className="-mx-3 sm:-mx-4">
            <BakhurnaChatlyStorefront state={state} onChange={commit} token={safeToken} />
          </div>
        )
      ) : null}
    </StorePurchasedShell>
  );
}
