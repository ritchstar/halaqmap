/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة كاملة داخل صفحة الدعوة الحرة: قاعة + ضيف + مضيف.
 */
import { useEffect, useState } from 'react';
import { STORE_EVENT_LIVE_LAB_TOKEN, eventLiveCopy, eventLiveFillClass } from '@/config/storeEventLive';
import { StoreEventGuestForm } from '@/components/store/StoreEventGuestForm';
import { StoreEventHallStage } from '@/components/store/StoreEventHallStage';
import { StoreEventHostPanel } from '@/components/store/StoreEventHostPanel';
import {
  readEventLiveLabState,
  writeEventLiveLabState,
  type EventLiveLabState,
} from '@/lib/storeEventLiveLab';
import { cn } from '@/lib/utils';

type StudioTab = 'guest' | 'host';

export function StoreEventLiveStudio({ token = STORE_EVENT_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<EventLiveLabState>(() => readEventLiveLabState(token));
  const [tab, setTab] = useState<StudioTab>('host');

  useEffect(() => {
    setState(readEventLiveLabState(token));
    const refresh = () => setState(readEventLiveLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: EventLiveLabState) => {
    writeEventLiveLabState(token, next);
    setState(next);
  };

  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  const fill = eventLiveFillClass(voice);

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className={cn('text-sm font-bold', voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]')}>{copy.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{copy.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{copy.labLeadAr}</p>
      <StoreEventHallStage state={state} className="mt-6" />
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
        {tab === 'guest' ? <StoreEventGuestForm state={state} onChange={commit} /> : null}
        {tab === 'host' ? <StoreEventHostPanel state={state} onChange={commit} hostToken={token} isLab /> : null}
      </div>
    </div>
  );
}
