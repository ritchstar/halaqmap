/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة نتيجة المباراة — تظهر فوق الرقعة عند انتهاء اللعب.
 */
import { Clock, Flag, Frown, Handshake, RefreshCcw, Trophy } from 'lucide-react';
import { CHESS_ARENA_COPY } from '@/config/chessArena';
import type { ChessGameStatus } from '@/lib/chessSessionLab';

export interface ChessResultOverlayProps {
  status: Exclude<ChessGameStatus, 'playing'>;
  onNewGame: () => void;
}

export function ChessResultOverlay({ status, onNewGame }: ChessResultOverlayProps) {
  const config = (() => {
    switch (status) {
      case 'player_won':
        return { icon: Trophy, iconClass: 'text-[#d8ac52]', message: CHESS_ARENA_COPY.checkmatePlayerWinsAr };
      case 'ai_won':
        return { icon: Frown, iconClass: 'text-rose-400', message: CHESS_ARENA_COPY.checkmateAiWinsAr };
      case 'draw':
        return { icon: Handshake, iconClass: 'text-[#8aa6a8]', message: CHESS_ARENA_COPY.drawAr };
      case 'resigned':
        return { icon: Flag, iconClass: 'text-rose-400', message: CHESS_ARENA_COPY.resignedAr };
      case 'timeout':
        return { icon: Clock, iconClass: 'text-rose-400', message: CHESS_ARENA_COPY.timeoutAr };
      default:
        return { icon: Handshake, iconClass: 'text-[#8aa6a8]', message: '' };
    }
  })();

  const Icon = config.icon;

  return (
    <div dir="rtl" className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/65">
      <div className="mx-4 flex flex-col items-center gap-3 rounded-2xl border border-[#1f4a52] bg-[#0b1f26] px-6 py-6 text-center shadow-2xl">
        <Icon className={`h-10 w-10 ${config.iconClass}`} />
        <p className="text-base font-black text-[#e7f4f2]">{config.message}</p>
        <button
          type="button"
          onClick={onNewGame}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#d8ac52] px-5 py-2.5 text-sm font-black text-[#0b1f26]"
        >
          <RefreshCcw className="h-4 w-4" />
          {CHESS_ARENA_COPY.resultOverlayNewGameAr}
        </button>
      </div>
    </div>
  );
}
