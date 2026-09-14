/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * متجر بخور الحي ولوحة المحل — بخورنا1.
 * بنية تحتية أولية: تعمل بالكامل محليًا (بيانات المتصفح) بلا خادم بعد.
 * راجع docs/bakhurna1-backend-todo.md للخطوات المتبقية قبل الربط الفعلي.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { BakhurnaChatlyDesk } from '@/components/store/bakhurna/BakhurnaChatlyDesk';
import { BakhurnaChatlyStorefront } from '@/components/store/bakhurna/BakhurnaChatlyStorefront';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  STORE_BAKHURNA_LIVE,
  STORE_BAKHURNA_LIVE_LAB_TOKEN,
  STORE_BAKHURNA_LIVE_PUBLIC_ENABLED,
} from '@/config/storeBakhurnaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import { readBakhurnaLabState, writeBakhurnaLabState, type BakhurnaLabState } from '@/lib/storeBakhurnaLiveLab';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeLiveShopShareHref } from '@/lib/storeHostRedirect';

export default function StoreBakhurnaShopPage() {
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_BAKHURNA_LIVE_LAB_TOKEN;
  const [state, setState] = useState<BakhurnaLabState>(() => readBakhurnaLabState(safeToken));
  const shopUrl = storeLiveShopShareHref('bakhurna', safeToken);
  useDocumentTitle(STORE_BAKHURNA_LIVE.documentTitle);
  useStoreShopPresence({
    role: 'shop',
    productTag: 'store_bakhurna_live',
    token: safeToken,
    enabled: !desk,
  });

  useEffect(() => {
    setState(readBakhurnaLabState(safeToken));
    if (desk) return undefined;
    const refresh = () => setState(readBakhurnaLabState(safeToken));
    const stop = scheduleVisiblePoll(refresh, POLL_MS.STORE_LIVE_LAB);
    window.addEventListener('storage', refresh);
    return () => {
      stop();
      window.removeEventListener('storage', refresh);
    };
  }, [safeToken, desk]);

  if (!STORE_BAKHURNA_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const commit = (next: BakhurnaLabState) => {
    writeBakhurnaLabState(safeToken, next);
    setState(next);
  };

  return (
    <StorePurchasedShell
      product="bakhurna"
      surface={desk ? 'workspace' : 'storefront'}
      life={false}
      showStoreLink={!desk}
      showDevNotice={false}
      showLiveMark={false}
    >
      {desk ? (
        <div className="-mx-3 sm:-mx-4">
          <BakhurnaChatlyDesk state={state} onChange={commit} shopUrl={shopUrl} token={safeToken} />
        </div>
      ) : (
        <div className="-mx-3 sm:-mx-4">
          <BakhurnaChatlyStorefront state={state} onChange={commit} token={safeToken} />
        </div>
      )}
    </StorePurchasedShell>
  );
}
