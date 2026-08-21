/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_CANNED } from '@/config/storeLoungeLive';
import type { LoungeLiveBlessing, LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';

export function StoreLoungeGuestForm({
  state,
  onChange,
}: {
  state: LoungeLiveLabState;
  onChange: (next: LoungeLiveLabState) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [cannedId, setCannedId] = useState<(typeof STORE_LOUNGE_LIVE_CANNED)[number]['id']>('welcome');
  const [extra, setExtra] = useState('');
  const [sent, setSent] = useState(false);
  const canned = useMemo(
    () => STORE_LOUNGE_LIVE_CANNED.find((item) => item.id === cannedId) || STORE_LOUNGE_LIVE_CANNED[0],
    [cannedId],
  );

  function submitBlessing() {
    const name = guestName.trim();
    if (name.length < 2) return;
    const blessing: LoungeLiveBlessing = {
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
      <h2 className="text-lg font-extrabold">{STORE_LOUNGE_LIVE.guestFormTitleAr}</h2>
      <p className="mt-1 text-xs text-white/50">{STORE_LOUNGE_LIVE.guestOnlyHintAr}</p>
      <label className="mt-4 block text-sm">
        {STORE_LOUNGE_LIVE.guestNameLabelAr}
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]"
          maxLength={40}
          required
        />
      </label>
      <fieldset className="mt-4 space-y-2">
        {STORE_LOUNGE_LIVE_CANNED.map((item) => (
          <label key={item.id} className="flex items-start gap-2 text-sm leading-7">
            <input
              type="radio"
              name="lounge-canned"
              checked={cannedId === item.id}
              onChange={() => setCannedId(item.id)}
              className="mt-1"
            />
            <span>{item.textAr}</span>
          </label>
        ))}
      </fieldset>
      <label className="mt-4 block text-sm">
        {STORE_LOUNGE_LIVE.guestExtraLabelAr}
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          className="mt-1 h-20 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          maxLength={80}
        />
      </label>
      <button type="submit" className="mt-4 w-full rounded-full bg-[#d4a574] py-2.5 text-sm font-bold text-[#12090c]">
        {STORE_LOUNGE_LIVE.guestSubmitAr}
      </button>
      {sent ? <p className="mt-3 text-sm text-[#d4a574]">ظهر ترحيبك على شاشة اللاونج.</p> : null}
    </form>
  );
}
