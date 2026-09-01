/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { STORE_KITCHEN_LIVE, STORE_KITCHEN_LIVE_LAB_TOKEN } from '@/config/storeKitchenLive';
import { StoreKitchenDesk } from '@/components/store/StoreKitchenDesk';
import { StoreKitchenShop } from '@/components/store/StoreKitchenShop';
import {
  kitchenShopUrl,
  readKitchenLabState,
  writeKitchenLabState,
  type KitchenLabState,
} from '@/lib/storeKitchenLiveLab';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreKitchenStudio({ token = STORE_KITCHEN_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<KitchenLabState>(() => readKitchenLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl = kitchenShopUrl(token, state.host.qrActive ? state.host.qrStamp : '');

  useEffect(() => {
    setState(readKitchenLabState(token));
    const refresh = () => setState(readKitchenLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: KitchenLabState) => {
    writeKitchenLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="text-sm font-bold text-[#b45a3c]">{STORE_KITCHEN_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_KITCHEN_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_KITCHEN_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#b45a3c] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_KITCHEN_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#b45a3c] text-[#061018]' : 'border border-white/20')}
        >
          {STORE_KITCHEN_LIVE.deskLinkAr}
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#b45a3c]/30 bg-[#1a0c08]/80 p-4">
        {tab === 'shop' ? <StoreKitchenShop state={state} onChange={commit} /> : <StoreKitchenDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} />}
      </div>
    </div>
  );
}
