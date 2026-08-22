/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useRef, useState } from 'react';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_CANNED } from '@/config/storeLoungeLive';
import type { LoungeLiveBlessing, LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

const WRITE_ID = 'write';

export function StoreLoungeGuestForm({
  state,
  onChange,
}: {
  state: LoungeLiveLabState;
  onChange: (next: LoungeLiveLabState) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [cannedId, setCannedId] = useState<string>(STORE_LOUNGE_LIVE_CANNED[0].id);
  const [message, setMessage] = useState(STORE_LOUNGE_LIVE_CANNED[0].textAr);
  const [extra, setExtra] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [sent, setSent] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const matched = useMemo(
    () => STORE_LOUNGE_LIVE_CANNED.find((item) => item.textAr === message.trim()),
    [message],
  );

  function pickCanned(id: string, textAr: string) {
    setCannedId(id);
    setMessage(textAr);
    messageRef.current?.focus();
  }

  function startWriting() {
    setCannedId(WRITE_ID);
    setMessage('');
    messageRef.current?.focus();
  }

  function submitBlessing() {
    const text = message.trim();
    if (!text) {
      messageRef.current?.focus();
      return;
    }
    const blessing: LoungeLiveBlessing = {
      id: `${Date.now()}`,
      name: (guestName.trim() || 'ضيف').slice(0, 40),
      cannedId: matched?.id || WRITE_ID,
      cannedText: text.slice(0, 120),
      extra: extra.trim().slice(0, 80),
      hidden: false,
      at: new Date().toISOString(),
    };
    onChange({ ...state, blessings: [...state.blessings, blessing] });
    setGuestName('');
    setExtra('');
    setMessage(STORE_LOUNGE_LIVE_CANNED[0].textAr);
    setCannedId(STORE_LOUNGE_LIVE_CANNED[0].id);
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
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_LOUNGE_LIVE.guestPickHintAr}</p>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.guestMessageLabelAr}
        <textarea
          ref={messageRef}
          value={message}
          onChange={(event) => {
            const next = event.target.value;
            setMessage(next);
            const hit = STORE_LOUNGE_LIVE_CANNED.find((item) => item.textAr === next.trim());
            setCannedId(hit?.id || WRITE_ID);
          }}
          className="mt-1 min-h-[4.5rem] w-full resize-none rounded-xl border border-[#d4a574]/45 bg-black/40 px-3 py-2 text-base leading-7 text-[#f4efe4]"
          maxLength={120}
          rows={3}
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {STORE_LOUNGE_LIVE_CANNED.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickCanned(item.id, item.textAr)}
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
        <button
          type="button"
          onClick={startWriting}
          className={cn(
            'min-h-11 rounded-full border px-3 py-2 text-right text-xs leading-5',
            cannedId === WRITE_ID
              ? 'border-[#d4a574] bg-[#d4a574]/15 text-[#f7edd8]'
              : 'border-white/12 bg-black/30 text-white/80',
          )}
        >
          {STORE_LOUNGE_LIVE.guestWriteChipAr}
        </button>
      </div>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.guestNameLabelAr}
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-base text-[#f4efe4]"
          maxLength={40}
          autoComplete="name"
          inputMode="text"
        />
      </label>
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
