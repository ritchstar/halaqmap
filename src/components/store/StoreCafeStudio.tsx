/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_CAFE_LIVE, STORE_CAFE_LIVE_LAB_TOKEN } from '@/config/storeCafeLive';
import { StoreCafeDesk } from '@/components/store/StoreCafeDesk';
import { StoreCafeHallStage } from '@/components/store/StoreCafeHallStage';
import { StoreCafeShop } from '@/components/store/StoreCafeShop';
import { readCafeLabState, writeCafeLabState, type CafeLabState } from '@/lib/storeCafeLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk' | 'screen';

export function StoreCafeStudio({ token = STORE_CAFE_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<CafeLabState>(() => readCafeLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_CAFE_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_CAFE_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readCafeLabState(token));
    const refresh = () => setState(readCafeLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: CafeLabState) => {
    writeCafeLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="text-sm font-bold text-[#c48a4a]">{STORE_CAFE_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_CAFE_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_CAFE_LIVE.labLeadAr}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#c48a4a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_CAFE_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#c48a4a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_CAFE_LIVE.deskLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('screen')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'screen' ? 'bg-[#c48a4a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_CAFE_LIVE.displayLinkAr}
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#c48a4a]/30 bg-[#1a1008]/80 p-4">
        {tab === 'shop' ? <StoreCafeShop state={state} onChange={commit} /> : null}
        {tab === 'desk' ? <StoreCafeDesk state={state} onChange={commit} shopUrl={shopUrl} /> : null}
        {tab === 'screen' ? <StoreCafeHallStage state={state} mode="main" guestUrl={`${typeof window === 'undefined' ? '' : window.location.origin}/#/c/${encodeURIComponent(token)}/guest`} /> : null}
      </div>
    </div>
  );
}
