/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملخّص إحصائياتك الحقيقية — من مباريات لُعبت فعلياً ومُحفوظة محلياً
 * (chessStatsLab.ts)، لا أرقاماً تجميلية. تُعرض فقط بعد أول مباراة فعلية.
 */
import { BarChart3 } from 'lucide-react';
import { CHESS_ARENA_COPY, CHESS_DIFFICULTY_LEVELS } from '@/config/chessArena';
import { totalChessStats, type ChessStatsState } from '@/lib/chessStatsLab';

export interface ChessStatsSummaryProps {
  stats: ChessStatsState;
}

export function ChessStatsSummary({ stats }: ChessStatsSummaryProps) {
  const total = totalChessStats(stats);
  if (total.played === 0) return null;

  return (
    <div dir="rtl" className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-[#1f4a52] bg-[#0b1f26]/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#00d6c8]/30 bg-[#00d6c8]/10 text-[#00d6c8]">
          <BarChart3 className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-black text-[#e7f4f2]">{CHESS_ARENA_COPY.statsCardTitleAr}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-xl border border-[#1f4a52] bg-[#05141a]/60 py-2">
          <p className="text-lg font-black text-[#e7f4f2]">{total.played}</p>
          <p className="text-[0.6rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.statsPlayedAr}</p>
        </div>
        <div className="rounded-xl border border-[#1f4a52] bg-[#05141a]/60 py-2">
          <p className="text-lg font-black text-emerald-400">{total.wins}</p>
          <p className="text-[0.6rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.statsWinsAr}</p>
        </div>
        <div className="rounded-xl border border-[#1f4a52] bg-[#05141a]/60 py-2">
          <p className="text-lg font-black text-rose-400">{total.losses}</p>
          <p className="text-[0.6rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.statsLossesAr}</p>
        </div>
        <div className="rounded-xl border border-[#1f4a52] bg-[#05141a]/60 py-2">
          <p className="text-lg font-black text-[#d8ac52]">{total.draws}</p>
          <p className="text-[0.6rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.statsDrawsAr}</p>
        </div>
      </div>

      <p className="mb-2 mt-4 text-xs font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.statsByLevelTitleAr}</p>
      <div className="space-y-1.5 text-xs">
        {CHESS_DIFFICULTY_LEVELS.map((level) => {
          const levelStats = stats[level.id];
          if (levelStats.played === 0) return null;
          return (
            <div key={level.id} className="flex items-center justify-between gap-2 text-[#e7f4f2]">
              <span className="font-bold">{level.titleAr}</span>
              <span dir="ltr" className="font-mono text-[#8aa6a8]">
                {levelStats.wins}W · {levelStats.losses}L · {levelStats.draws}D
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
