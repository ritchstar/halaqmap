/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقات اختيار مستوى الذكاء الاصطناعي — ثلاث درجات صعوبة.
 */
import { Cpu, Swords } from 'lucide-react';
import { CHESS_ARENA_COPY, CHESS_DIFFICULTY_LEVELS, type ChessDifficultyId } from '@/config/chessArena';

export interface ChessLevelPickerProps {
  selected: ChessDifficultyId | null;
  onSelect: (level: ChessDifficultyId) => void;
  onStart: () => void;
}

export function ChessLevelPicker({ selected, onSelect, onStart }: ChessLevelPickerProps) {
  return (
    <div dir="rtl" className="mx-auto w-full max-w-xl">
      <h2 className="mb-4 text-center text-lg font-black text-[#e7f4f2]">
        {CHESS_ARENA_COPY.pickLevelTitleAr}
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {CHESS_DIFFICULTY_LEVELS.map((level) => {
          const isSelected = selected === level.id;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onSelect(level.id)}
              className={[
                'relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all',
                isSelected
                  ? 'border-[#d8ac52] bg-[#d8ac52]/10 shadow-[0_0_24px_rgba(216,172,82,0.15)]'
                  : 'border-[#1f4a52] bg-[#0b1f26]/70 hover:border-[#00d6c8]/50',
              ].join(' ')}
            >
              {level.useStockfish && (
                <span className="absolute -top-2 inline-flex items-center gap-1 rounded-full bg-[#0b2025] px-2 py-0.5 text-[0.6rem] font-bold text-[#00d6c8] ring-1 ring-[#00d6c8]/40">
                  <Cpu className="h-2.5 w-2.5" />
                  Stockfish
                </span>
              )}
              <span className="text-sm font-black text-[#e7f4f2]">{level.titleAr}</span>
              <span className="text-xs leading-relaxed text-[#8aa6a8]">{level.descriptionAr}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!selected}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8ac52] px-6 py-3 text-sm font-black text-[#0b1f26] shadow-[0_10px_30px_rgba(216,172,82,0.25)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Swords className="h-4 w-4" />
        {CHESS_ARENA_COPY.startButtonAr}
      </button>
    </div>
  );
}
