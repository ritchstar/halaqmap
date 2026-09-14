/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سجل النقلات بترقيم أزواج قياسي (1. e4 e5 2. Nf3 …) داخل بطاقة قابلة للتمرير.
 */
import { CHESS_ARENA_COPY } from '@/config/chessArena';

export interface ChessMoveListProps {
  sanHistory: string[];
}

interface MovePair {
  number: number;
  white: string;
  black?: string;
}

export function ChessMoveList({ sanHistory }: ChessMoveListProps) {
  if (sanHistory.length === 0) return null;

  const pairs: MovePair[] = [];
  for (let i = 0; i < sanHistory.length; i += 2) {
    pairs.push({ number: i / 2 + 1, white: sanHistory[i], black: sanHistory[i + 1] });
  }

  return (
    <div dir="rtl" className="mx-auto mt-3 max-w-[500px] rounded-xl border border-[#e3d5b8] bg-white/70 p-3">
      <p className="mb-2 text-xs font-bold text-[#7a6a4f]">{CHESS_ARENA_COPY.movesLabelAr}</p>
      <div dir="ltr" className="max-h-32 overflow-y-auto text-xs leading-relaxed text-[#3a2c1a]">
        <div className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 gap-y-1">
          {pairs.map((pair) => (
            <div key={pair.number} className="contents">
              <span className="text-[#8a7a5f]">{pair.number}.</span>
              <span>{pair.white}</span>
              <span>{pair.black ?? ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
