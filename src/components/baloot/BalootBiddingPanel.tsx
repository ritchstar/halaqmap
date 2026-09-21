/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة مزايدة اللاعب — إعلان الحكم باختيار بذلة، أو إعلان صن (بلا حكم)، أو التمرير.
 */
import { BALOOT_ARENA_COPY, BALOOT_SUIT_LABELS_AR, BALOOT_SUIT_SYMBOLS } from '@/config/balootArena';
import { BALOOT_SUITS, type BalootBidChoice } from '@/lib/balootEngine';

type BalootBiddingPanelProps = {
  onDeclare: (choice: Exclude<BalootBidChoice, null>) => void;
  onPass: () => void;
};

export function BalootBiddingPanel({ onDeclare, onPass }: BalootBiddingPanelProps) {
  return (
    <div className="rounded-2xl border-2 border-[#d8ac52] bg-[#0e262d] p-4 text-center shadow-[0_0_24px_rgba(216,172,82,0.15)]">
      <p className="mb-3 text-sm font-black text-[#e7f4f2]">{BALOOT_ARENA_COPY.yourTurnToBidAr}</p>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BALOOT_SUITS.map((suit) => (
          <button
            key={suit}
            type="button"
            onClick={() => onDeclare(suit)}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#d8ac52]/50 bg-[#d8ac52]/10 px-3 py-2.5 text-sm font-bold text-[#e7f4f2] transition-colors hover:bg-[#d8ac52]/25"
          >
            <span className="text-lg">{BALOOT_SUIT_SYMBOLS[suit]}</span>
            <span className="text-xs">{BALOOT_SUIT_LABELS_AR[suit]}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onDeclare('sun')}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/[0.06] px-3 py-2.5 text-sm font-bold text-[#e7f4f2] transition-colors hover:bg-white/10"
      >
        <span className="text-lg">☀️</span>
        <span>{BALOOT_ARENA_COPY.declareSunAr}</span>
      </button>
      <button
        type="button"
        onClick={onPass}
        className="rounded-full border border-white/25 px-5 py-2 text-sm font-bold text-white/80 hover:bg-white/5"
      >
        {BALOOT_ARENA_COPY.passAr}
      </button>
    </div>
  );
}
