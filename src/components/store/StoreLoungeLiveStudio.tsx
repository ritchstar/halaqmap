/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة كاملة داخل صفحة لاونجا1: شاشة + زبون + مضيف.
 */
import { useEffect, useState } from 'react';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_LAB_TOKEN } from '@/config/storeLoungeLive';
import { StoreLoungeGuestForm } from '@/components/store/StoreLoungeGuestForm';
import { StoreLoungeHallStage } from '@/components/store/StoreLoungeHallStage';
import { StoreLoungeHostPanel } from '@/components/store/StoreLoungeHostPanel';
import {
  readLoungeLiveLabState,
  writeLoungeLiveLabState,
  type LoungeLiveLabState,
} from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

type StudioTab = 'guest' | 'host';

export function StoreLoungeLiveStudio({ token = STORE_LOUNGE_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<LoungeLiveLabState>(() => readLoungeLiveLabState(token));
  const [tab, setTab] = useState<StudioTab>('host');

  useEffect(() => {
    setState(readLoungeLiveLabState(token));
    const refresh = () => setState(readLoungeLiveLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: LoungeLiveLabState) => {
    writeLoungeLiveLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <div className="store-live-studio-head">
        <p className="text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.labKickerAr}</p>
        <h2 className="mt-2 text-2xl font-extrabold">{STORE_LOUNGE_LIVE.labTitleAr}</h2>
        <p className="mt-2 text-sm leading-8 text-white/75">{STORE_LOUNGE_LIVE.labLeadAr}</p>
      </div>
      <StoreLoungeHallStage
        state={state}
        className="mt-6"
        guestUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://store.halaqmap.com'}/#/l/${encodeURIComponent(token)}/guest`}
      />
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('guest')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold',
            tab === 'guest' ? 'bg-[#d4a574] text-[#12090c]' : 'border border-white/20',
          )}
        >
          {STORE_LOUNGE_LIVE.guestLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('host')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold',
            tab === 'host' ? 'bg-[#d4a574] text-[#12090c]' : 'border border-white/20',
          )}
        >
          {STORE_LOUNGE_LIVE.hostLinkAr}
        </button>
      </div>
      <div className="mt-5">
        {tab === 'guest' ? <StoreLoungeGuestForm state={state} onChange={commit} rateKey={token} /> : null}
        {tab === 'host' ? (
          <StoreLoungeHostPanel
            state={state}
            onChange={commit}
            guestUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://store.halaqmap.com'}/#/l/${encodeURIComponent(token)}/guest`}
            token={token}
          />
        ) : null}
      </div>
    </div>
  );
}
