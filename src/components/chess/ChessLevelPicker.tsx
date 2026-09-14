/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقات اختيار مستوى الذكاء الاصطناعي — ثلاث درجات صعوبة.
 */
import { Swords } from 'lucide-react';
import { CHESS_ARENA_COPY, CHESS_DIFFICULTY_LEVELS, type ChessDifficultyId } from '@/config/chessArena';

export interface ChessLevelPickerProps {
  selected: ChessDifficultyId | null;
  onSelect: (level: ChessDifficultyId) => void;
  onStart: () => void;
}

export function ChessLevelPicker({ selected, onSelect, onStart }: ChessLevelPickerProps) {
  return (
    <div dir="rtl" className="mx-auto w-full max-w-xl">
      <h2 className="mb-4 text-center text-lg font-black text-[#3a2c1a]">
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
                'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all',
                isSelected
                  ? 'border-amber-600 bg-amber-50 shadow-md'
                  : 'border-[#e3d5b8] bg-white hover:border-amber-400',
              ].join(' ')}
            >
              <span className="text-sm font-black text-[#3a2c1a]">{level.titleAr}</span>
              <span className="text-xs leading-relaxed text-[#7a6a4f]">{level.descriptionAr}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!selected}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3a2c1a] px-6 py-3 text-sm font-black text-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Swords className="h-4 w-4" />
        {CHESS_ARENA_COPY.startButtonAr}
      </button>
    </div>
  );
}
