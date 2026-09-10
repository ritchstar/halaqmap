/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_DATES_LIVE, STORE_DATES_LIVE_LAB_TOKEN } from '@/config/storeDatesLive';
import { StoreDatesDesk } from '@/components/store/StoreDatesDesk';
import { StoreDatesShop } from '@/components/store/StoreDatesShop';
import { readDatesLabState, writeDatesLabState, type DatesLabState } from '@/lib/storeDatesLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreDatesStudio({ token = STORE_DATES_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<DatesLabState>(() => readDatesLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_DATES_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_DATES_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readDatesLabState(token));
    const refresh = () => setState(readDatesLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: DatesLabState) => {
    writeDatesLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100">
        {STORE_DATES_LIVE.labPreviewBadgeAr}
      </p>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_DATES_LIVE.labPreviewEnvAr}</p>
      <p className="mt-4 text-sm font-bold text-[#8A6239]">{STORE_DATES_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_DATES_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_DATES_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#8A6239] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_DATES_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#8A6239] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_DATES_LIVE.deskLinkAr}
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#8A6239]/30 bg-[#1a140c]/80 p-4">
        {tab === 'shop' ? <StoreDatesShop state={state} onChange={commit} token={token} /> : <StoreDatesDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} />}
      </div>
    </div>
  );
}
