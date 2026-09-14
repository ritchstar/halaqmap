/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة نتيجة المباراة — تظهر فوق الرقعة عند انتهاء اللعب.
 */
import { Flag, Frown, Handshake, RefreshCcw, Trophy } from 'lucide-react';
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
        return { icon: Trophy, iconClass: 'text-amber-500', message: CHESS_ARENA_COPY.checkmatePlayerWinsAr };
      case 'ai_won':
        return { icon: Frown, iconClass: 'text-red-600', message: CHESS_ARENA_COPY.checkmateAiWinsAr };
      case 'draw':
        return { icon: Handshake, iconClass: 'text-slate-500', message: CHESS_ARENA_COPY.drawAr };
      case 'resigned':
        return { icon: Flag, iconClass: 'text-red-600', message: CHESS_ARENA_COPY.resignedAr };
      default:
        return { icon: Handshake, iconClass: 'text-slate-500', message: '' };
    }
  })();

  const Icon = config.icon;

  return (
    <div dir="rtl" className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/55">
      <div className="mx-4 flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-6 text-center shadow-2xl">
        <Icon className={`h-10 w-10 ${config.iconClass}`} />
        <p className="text-base font-black text-[#3a2c1a]">{config.message}</p>
        <button
          type="button"
          onClick={onNewGame}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#3a2c1a] px-5 py-2.5 text-sm font-black text-white"
        >
          <RefreshCcw className="h-4 w-4" />
          {CHESS_ARENA_COPY.resultOverlayNewGameAr}
        </button>
      </div>
    </div>
  );
}
