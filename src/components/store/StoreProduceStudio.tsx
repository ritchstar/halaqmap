/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_PRODUCE_LIVE, STORE_PRODUCE_LIVE_LAB_TOKEN } from '@/config/storeProduceLive';
import { StoreProduceDesk } from '@/components/store/StoreProduceDesk';
import { StoreProduceShop } from '@/components/store/StoreProduceShop';
import { readProduceLabState, writeProduceLabState, type ProduceLabState } from '@/lib/storeProduceLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreProduceStudio({ token = STORE_PRODUCE_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<ProduceLabState>(() => readProduceLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_PRODUCE_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_PRODUCE_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readProduceLabState(token));
    const refresh = () => setState(readProduceLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: ProduceLabState) => {
    writeProduceLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100">
        {STORE_PRODUCE_LIVE.labPreviewBadgeAr}
      </p>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_PRODUCE_LIVE.labPreviewEnvAr}</p>
      <p className="mt-4 text-sm font-bold text-[#3d8b4a]">{STORE_PRODUCE_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_PRODUCE_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_PRODUCE_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#3d8b4a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_PRODUCE_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#3d8b4a] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_PRODUCE_LIVE.deskLinkAr}
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#3d8b4a]/30 bg-[#0b1a10]/80 p-4">
        {tab === 'shop' ? <StoreProduceShop state={state} onChange={commit} token={token} /> : <StoreProduceDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} />}
      </div>
    </div>
  );
}
