/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_EVENT_LIVE_CANNED, eventLiveCopy, eventLiveFillClass } from '@/config/storeEventLive';
import type { EventLiveBlessing, EventLiveLabState } from '@/lib/storeEventLiveLab';
import { cn } from '@/lib/utils';

export function StoreEventGuestForm({
  state,
  onChange,
}: {
  state: EventLiveLabState;
  onChange: (next: EventLiveLabState) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [cannedId, setCannedId] = useState<(typeof STORE_EVENT_LIVE_CANNED)[number]['id']>('baraka');
  const [extra, setExtra] = useState('');
  const [sent, setSent] = useState(false);
  const canned = useMemo(
    () => STORE_EVENT_LIVE_CANNED.find((item) => item.id === cannedId) || STORE_EVENT_LIVE_CANNED[0],
    [cannedId],
  );
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  const fill = eventLiveFillClass(voice);

  function submitBlessing() {
    const name = guestName.trim();
    if (name.length < 2) return;
    const blessing: EventLiveBlessing = {
      id: `${Date.now()}`,
      name: name.slice(0, 40),
      cannedId: canned.id,
      cannedText: canned.textAr,
      extra: extra.trim().slice(0, 80),
      hidden: false,
      at: new Date().toISOString(),
    };
    onChange({ ...state, blessings: [...state.blessings, blessing] });
    setGuestName('');
    setExtra('');
    setSent(true);
  }

  return (
    <form
      className="rounded-2xl border border-white/12 bg-[#0b1a24]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        submitBlessing();
      }}
    >
      <h2 className="text-lg font-extrabold">{copy.guestFormTitleAr}</h2>
      <p className="mt-1 text-xs text-white/50">{copy.guestOnlyHintAr}</p>
      <label className="mt-4 block text-sm">
        {copy.guestNameLabelAr}
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]"
          maxLength={40}
          required
        />
      </label>
      <fieldset className="mt-4 space-y-2">
        {STORE_EVENT_LIVE_CANNED.map((item) => (
          <label key={item.id} className="flex items-start gap-2 text-sm leading-7">
            <input
              type="radio"
              name="event-canned"
              checked={cannedId === item.id}
              onChange={() => setCannedId(item.id)}
              className="mt-1"
            />
            <span>{item.textAr}</span>
          </label>
        ))}
      </fieldset>
      <label className="mt-4 block text-sm">
        {copy.guestExtraLabelAr}
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          className="mt-1 h-20 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          maxLength={80}
        />
      </label>
      <button type="submit" className={cn('mt-4 w-full rounded-full py-2.5 text-sm font-bold', fill)}>
        {copy.guestSubmitAr}
      </button>
      {sent ? (
        <p className={cn('mt-3 text-sm', voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]')}>
          ظهرت تهنئتك على شاشة القاعة.
        </p>
      ) : null}
    </form>
  );
}
