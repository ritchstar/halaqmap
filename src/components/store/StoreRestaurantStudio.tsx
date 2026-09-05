/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_RESTAURANT_LIVE, STORE_RESTAURANT_LIVE_LAB_TOKEN } from '@/config/storeRestaurantLive';
import { StoreRestaurantDesk } from '@/components/store/StoreRestaurantDesk';
import { StoreRestaurantShop } from '@/components/store/StoreRestaurantShop';
import { readRestaurantLabState, writeRestaurantLabState, type RestaurantLabState } from '@/lib/storeRestaurantLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreRestaurantStudio({ token = STORE_RESTAURANT_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<RestaurantLabState>(() => readRestaurantLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const isLab = token === STORE_RESTAURANT_LIVE_LAB_TOKEN;
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_RESTAURANT_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_RESTAURANT_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readRestaurantLabState(token));
    const refresh = () => setState(readRestaurantLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: RestaurantLabState) => {
    writeRestaurantLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      {isLab ? (
        <>
          <p className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100">
            {STORE_RESTAURANT_LIVE.labPreviewBadgeAr}
          </p>
          <p className="mt-2 text-xs leading-6 text-white/55">{STORE_RESTAURANT_LIVE.labPreviewEnvAr}</p>
        </>
      ) : null}
      <p className="mt-4 text-sm font-bold text-[#e08a3c]">{STORE_RESTAURANT_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_RESTAURANT_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_RESTAURANT_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#e08a3c] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_RESTAURANT_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#e08a3c] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_RESTAURANT_LIVE.deskLinkAr}
        </button>
      </div>
      <p className="mt-3 text-xs font-bold text-white/55">
        {tab === 'shop' ? STORE_RESTAURANT_LIVE.shopPreviewHintAr : STORE_RESTAURANT_LIVE.deskPreviewHintAr}
      </p>
      <div
        className={cn(
          'mt-3 rounded-2xl border border-[#e08a3c]/30 bg-[#1a1008]/80 p-4',
          tab === 'desk' ? 'mx-auto max-w-[1180px]' : 'mx-auto max-w-md',
        )}
      >
        {tab === 'shop' ? (
          <StoreRestaurantShop state={state} onChange={commit} token={token} />
        ) : (
          <StoreRestaurantDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} maskPii={isLab} />
        )}
      </div>
    </div>
  );
}
