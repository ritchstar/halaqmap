/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة نتيجة المباراة — نقاط الفريقين مقابل الهدف، ورقم الشوط الحالي.
 */
import { BALOOT_ARENA_COPY } from '@/config/balootArena';
import type { BalootMatchState } from '@/lib/balootEngine';

type BalootScoreboardProps = {
  match: BalootMatchState;
};

export function BalootScoreboard({ match }: BalootScoreboardProps) {
  const playerPct = Math.min(100, Math.round((match.matchScore.playerTeam / match.targetScore) * 100));
  const opponentPct = Math.min(100, Math.round((match.matchScore.opponentTeam / match.targetScore) * 100));

  return (
    <div className="rounded-2xl border border-[#1f4a52] bg-[#05141a]/90 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-[#8aa6a8]">{BALOOT_ARENA_COPY.playerTeamLabelAr}</p>
          <p className="text-2xl font-black text-[#3d8b4a]">{match.matchScore.playerTeam}</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#3d8b4a]" style={{ width: `${playerPct}%` }} />
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#8aa6a8]">{BALOOT_ARENA_COPY.opponentTeamLabelAr}</p>
          <p className="text-2xl font-black text-[#c45c7a]">{match.matchScore.opponentTeam}</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="mr-0 h-full bg-[#c45c7a]" style={{ width: `${opponentPct}%`, marginInlineStart: 'auto' }} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#8aa6a8]">
        الهدف {match.targetScore} نقطة · الشوط رقم {match.hand.handNumber}
      </p>
    </div>
  );
}
