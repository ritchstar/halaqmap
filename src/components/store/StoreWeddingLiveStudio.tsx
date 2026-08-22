/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة كاملة داخل صفحة المنتج: قاعة + ضيف + مضيف.
 */
import { useEffect, useState } from 'react';
import {
  STORE_WEDDING_LIVE_LAB_TOKEN,
  weddingLiveCopy,
  weddingLiveFillClass,
} from '@/config/storeWeddingLive';
import { StoreWeddingGuestForm } from '@/components/store/StoreWeddingGuestForm';
import { StoreWeddingHallStage } from '@/components/store/StoreWeddingHallStage';
import { StoreWeddingHostPanel } from '@/components/store/StoreWeddingHostPanel';
import {
  readWeddingLiveLabState,
  writeWeddingLiveLabState,
  type WeddingLiveLabState,
} from '@/lib/storeWeddingLiveLab';
import { cn } from '@/lib/utils';

type StudioTab = 'guest' | 'host';

export function StoreWeddingLiveStudio({ token = STORE_WEDDING_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<WeddingLiveLabState>(() => readWeddingLiveLabState(token));
  const [tab, setTab] = useState<StudioTab>('host');

  useEffect(() => {
    setState(readWeddingLiveLabState(token));
    const refresh = () => setState(readWeddingLiveLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: WeddingLiveLabState) => {
    writeWeddingLiveLabState(token, next);
    setState(next);
  };

  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  const fill = weddingLiveFillClass(voice);

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className={cn('text-sm font-bold', voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]')}>{copy.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{copy.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{copy.labLeadAr}</p>
      <StoreWeddingHallStage state={state} className="mt-6" />
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('guest')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'guest' ? fill : 'border border-white/20')}
        >
          {copy.guestLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('host')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'host' ? fill : 'border border-white/20')}
        >
          {copy.hostLinkAr}
        </button>
      </div>
      <div className="mt-5">
        {tab === 'guest' ? <StoreWeddingGuestForm state={state} onChange={commit} /> : null}
        {tab === 'host' ? <StoreWeddingHostPanel state={state} onChange={commit} hostToken={token} isLab /> : null}
      </div>
    </div>
  );
}
