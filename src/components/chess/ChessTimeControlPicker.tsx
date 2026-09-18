/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اختيار طريقة اللعب (التحكم بالوقت) — أزرار حبّية، ساعة حقيقية تتغيّر
 * فعلياً حسب الاختيار، لا مجرد تسمية.
 */
import { Infinity as InfinityIcon, Timer } from 'lucide-react';
import { CHESS_ARENA_COPY, CHESS_TIME_CONTROLS, type ChessTimeControlId } from '@/config/chessArena';

export interface ChessTimeControlPickerProps {
  selected: ChessTimeControlId;
  onSelect: (id: ChessTimeControlId) => void;
}

export function ChessTimeControlPicker({ selected, onSelect }: ChessTimeControlPickerProps) {
  return (
    <div dir="rtl" className="mx-auto mt-6 w-full max-w-xl">
      <h3 className="mb-3 text-center text-sm font-black text-[#e7f4f2]">
        {CHESS_ARENA_COPY.pickTimeControlTitleAr}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CHESS_TIME_CONTROLS.map((tc) => {
          const isSelected = selected === tc.id;
          return (
            <button
              key={tc.id}
              type="button"
              onClick={() => onSelect(tc.id)}
              className={[
                'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors',
                isSelected
                  ? 'border-[#00d6c8] bg-[#00d6c8]/10 text-[#00d6c8]'
                  : 'border-[#1f4a52] bg-[#0b1f26]/70 text-[#8aa6a8] hover:border-[#00d6c8]/40 hover:text-[#e7f4f2]',
              ].join(' ')}
            >
              {tc.ms === null ? <InfinityIcon className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
              {tc.labelAr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
