/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_LAB_TOKEN } from '@/config/storeGrocersLive';
import { StoreGrocersDesk } from '@/components/store/StoreGrocersDesk';
import { StoreGrocersShop } from '@/components/store/StoreGrocersShop';
import { readGrocersLabState, writeGrocersLabState, type GrocersLabState } from '@/lib/storeGrocersLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreGrocersStudio({ token = STORE_GROCERS_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<GrocersLabState>(() => readGrocersLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_GROCERS_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_GROCERS_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readGrocersLabState(token));
    const refresh = () => setState(readGrocersLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: GrocersLabState) => {
    writeGrocersLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="text-sm font-bold text-[#8fbf7a]">{STORE_GROCERS_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_GROCERS_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_GROCERS_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#8fbf7a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_GROCERS_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#8fbf7a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_GROCERS_LIVE.deskLinkAr}
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#8fbf7a]/30 bg-[#07140e]/80 p-4">
        {tab === 'shop' ? <StoreGrocersShop state={state} onChange={commit} token={token} /> : <StoreGrocersDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} />}
      </div>
    </div>
  );
}
