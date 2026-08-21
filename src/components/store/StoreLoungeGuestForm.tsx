/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_CANNED } from '@/config/storeLoungeLive';
import type { LoungeLiveBlessing, LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

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
  const [showExtra, setShowExtra] = useState(false);
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
      className="relative z-20 border-t border-white/10 bg-[#050308]/92 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md"
      onSubmit={(event) => {
        event.preventDefault();
        submitBlessing();
      }}
    >
      <h2 className="text-base font-extrabold">{STORE_LOUNGE_LIVE.guestFormTitleAr}</h2>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.guestNameLabelAr}
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 h-12 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-base text-[#f4efe4]"
          maxLength={40}
          autoComplete="name"
          inputMode="text"
          required
        />
      </label>
      <p className="mt-3 text-xs text-white/50">اختر عبارة وأرسل.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STORE_LOUNGE_LIVE_CANNED.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCannedId(item.id)}
            className={cn(
              'min-h-11 rounded-full border px-3 py-2 text-right text-xs leading-5',
              cannedId === item.id
                ? 'border-[#d4a574] bg-[#d4a574]/15 text-[#f7edd8]'
                : 'border-white/12 bg-black/30 text-white/80',
            )}
          >
            {item.textAr}
          </button>
        ))}
      </div>
      {showExtra ? (
        <label className="mt-3 block text-sm">
          {STORE_LOUNGE_LIVE.guestExtraLabelAr}
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-[#f4efe4]"
            maxLength={80}
          />
        </label>
      ) : (
        <button type="button" onClick={() => setShowExtra(true)} className="mt-3 text-xs text-white/45 underline">
          سطر إضافي إن رغبت
        </button>
      )}
      <button
        type="submit"
        className="mt-4 min-h-12 w-full rounded-full bg-[#d4a574] text-sm font-bold text-[#12090c]"
      >
        {STORE_LOUNGE_LIVE.guestSubmitAr}
      </button>
      {sent ? <p className="mt-3 text-sm text-[#d4a574]">ظهر ترحيبك على الشاشة.</p> : null}
    </form>
  );
}
