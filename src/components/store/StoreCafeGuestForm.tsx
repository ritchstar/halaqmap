/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useRef, useState } from 'react';
import { STORE_CAFE_LIVE, STORE_CAFE_LIVE_CANNED } from '@/config/storeCafeLive';
import {
  cafeBlessingDuplicate,
  cafeTextBlocked,
  type CafeBlessing,
  type CafeLabState,
} from '@/lib/storeCafeLiveLab';
import { cn } from '@/lib/utils';

const WRITE_ID = 'write';
const RATE_MS = 45_000;

function lastSendKey(rateKey: string): string {
  return `hm-cafe-last-send:${rateKey}`;
}

function readLastSend(rateKey: string): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(lastSendKey(rateKey)) || 0) || 0;
}

function writeLastSend(rateKey: string, at: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(lastSendKey(rateKey), String(at));
  } catch {
    /* ignore */
  }
}

export function StoreCafeGuestForm({
  state,
  onChange,
  rateKey = 'cafe',
}: {
  state: CafeLabState;
  onChange: (next: CafeLabState) => void;
  rateKey?: string;
}) {
  const [guestName, setGuestName] = useState('');
  const [cannedId, setCannedId] = useState<string>(STORE_CAFE_LIVE_CANNED[0].id);
  const [message, setMessage] = useState(STORE_CAFE_LIVE_CANNED[0].textAr);
  const [extra, setExtra] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [sent, setSent] = useState<'live' | 'pending' | ''>('');
  const [error, setError] = useState('');
  const lastRef = useRef(readLastSend(rateKey));
  const paused = state.host.guestPaused === true;

  function pickCanned(id: string, textAr: string) {
    setCannedId(id);
    setMessage(textAr);
    setShowExtra(false);
  }

  function startWriting() {
    setCannedId(WRITE_ID);
    setMessage('');
    setShowExtra(true);
  }

  function submit() {
    setError('');
    if (paused) {
      setError(STORE_CAFE_LIVE.guestPausedAr);
      return;
    }
    const name = guestName.trim().slice(0, 40) || 'جار الحي';
    const cannedText = message.trim().slice(0, 160);
    const extraText = extra.trim().slice(0, 80);
    if (cannedText.length < 2) return;
    if (cafeTextBlocked(`${cannedText} ${extraText}`)) {
      setError(STORE_CAFE_LIVE.guestBlockedAr);
      return;
    }
    if (cafeBlessingDuplicate(state.blessings, { cannedText, extra: extraText })) {
      setError(STORE_CAFE_LIVE.guestDupAr);
      return;
    }
    const now = Date.now();
    if (now - lastRef.current < RATE_MS) {
      setError(STORE_CAFE_LIVE.guestRateAr);
      return;
    }
    const blessing: CafeBlessing = {
      id: `${now}`,
      name,
      cannedId,
      cannedText,
      extra: extraText,
      hidden: false,
      pending: state.host.reviewBeforeShow === true,
      at: new Date().toISOString(),
    };
    onChange({ ...state, blessings: [...state.blessings, blessing].slice(-80) });
    lastRef.current = now;
    writeLastSend(rateKey, now);
    setSent(blessing.pending ? 'pending' : 'live');
    setExtra('');
  }

  return (
    <section className="rounded-2xl border border-[#c48a4a]/30 bg-[#1a1008]/90 p-5">
      <h2 className="text-xl font-extrabold">{STORE_CAFE_LIVE.guestFormTitleAr}</h2>
      <p className="mt-2 text-sm leading-7 text-white/70">{STORE_CAFE_LIVE.guestPickHintAr}</p>
      {paused ? <p className="mt-3 text-sm text-amber-200">{STORE_CAFE_LIVE.guestPausedAr}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {STORE_CAFE_LIVE_CANNED.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={paused}
            onClick={() => pickCanned(item.id, item.textAr)}
            className={cn(
              'min-h-11 rounded-full border px-3 py-2 text-right text-xs leading-5 disabled:opacity-50',
              cannedId === item.id
                ? 'border-[#c48a4a] bg-[#c48a4a]/15 text-[#f7edd8]'
                : 'border-white/12 bg-black/30 text-white/80',
            )}
          >
            {item.textAr}
          </button>
        ))}
        <button
          type="button"
          disabled={paused}
          onClick={startWriting}
          className={cn(
            'min-h-11 rounded-full border px-3 py-2 text-right text-xs leading-5 disabled:opacity-50',
            cannedId === WRITE_ID
              ? 'border-[#c48a4a] bg-[#c48a4a]/15 text-[#f7edd8]'
              : 'border-white/12 bg-black/30 text-white/80',
          )}
        >
          {STORE_CAFE_LIVE.guestWriteChipAr}
        </button>
      </div>
      <label className="mt-3 block text-sm">
        {STORE_CAFE_LIVE.guestNameLabelAr}
        <input
          value={guestName}
          disabled={paused}
          onChange={(e) => setGuestName(e.target.value)}
          className="cafe-field"
          maxLength={40}
          autoComplete="name"
        />
      </label>
      {showExtra ? (
        <label className="mt-3 block text-sm">
          {STORE_CAFE_LIVE.guestExtraLabelAr}
          <input
            value={extra}
            disabled={paused}
            onChange={(e) => setExtra(e.target.value)}
            className="cafe-field"
            maxLength={80}
          />
        </label>
      ) : null}
      <label className="mt-3 block text-sm">
        {STORE_CAFE_LIVE.guestMessageLabelAr}
        <textarea
          value={message}
          disabled={paused}
          onChange={(e) => {
            setMessage(e.target.value);
            setCannedId(WRITE_ID);
          }}
          className="cafe-field min-h-20 py-2"
          maxLength={160}
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {sent === 'live' ? <p className="mt-3 text-sm text-emerald-300">{STORE_CAFE_LIVE.guestSentAr}</p> : null}
      {sent === 'pending' ? <p className="mt-3 text-sm text-amber-200">{STORE_CAFE_LIVE.guestPendingAr}</p> : null}
      <button
        type="button"
        disabled={paused}
        onClick={submit}
        className="mt-4 min-h-12 w-full rounded-full bg-[#c48a4a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {STORE_CAFE_LIVE.guestSubmitAr}
      </button>
    </section>
  );
}
