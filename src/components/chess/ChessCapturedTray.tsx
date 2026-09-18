/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط القطع المأسورة وميزان المادة — يُحسب من سجل النقلات مباشرة.
 */
import type { Chess } from 'chess.js';
import { CHESS_ARENA_COPY } from '@/config/chessArena';

interface EngineHistoryMove {
  color: 'w' | 'b';
  captured?: string;
}

const POINT_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const CAPTURED_GLYPHS: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
};

export interface ChessCapturedTrayProps {
  chess: Chess;
  playerColor: 'w' | 'b';
}

export function ChessCapturedTray({ chess, playerColor }: ChessCapturedTrayProps) {
  const opponentColor: 'w' | 'b' = playerColor === 'w' ? 'b' : 'w';
  const history = chess.history({ verbose: true }) as unknown as EngineHistoryMove[];

  const capturedByPlayer: string[] = [];
  const capturedByAi: string[] = [];
  for (const m of history) {
    if (!m.captured) continue;
    if (m.color === playerColor) capturedByPlayer.push(m.captured);
    else capturedByAi.push(m.captured);
  }

  const playerMaterial = capturedByPlayer.reduce((sum, t) => sum + (POINT_VALUES[t] ?? 0), 0);
  const aiMaterial = capturedByAi.reduce((sum, t) => sum + (POINT_VALUES[t] ?? 0), 0);
  const advantage = playerMaterial - aiMaterial;

  if (capturedByPlayer.length === 0 && capturedByAi.length === 0) return null;

  return (
    <div dir="rtl" className="mx-auto mt-3 max-w-[500px] rounded-xl border border-[#1f4a52] bg-[#0b1f26]/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.65rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.capturedByPlayerAr}</span>
        <div className="flex flex-wrap justify-end gap-0.5 text-lg leading-none text-[#e7f4f2]">
          {capturedByPlayer.map((t, i) => (
            <span key={`${t}-${i}`} aria-hidden="true">
              {CAPTURED_GLYPHS[`${opponentColor}${t}`]}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[0.65rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.capturedByAiAr}</span>
        <div className="flex flex-wrap justify-end gap-0.5 text-lg leading-none text-[#e7f4f2]">
          {capturedByAi.map((t, i) => (
            <span key={`${t}-${i}`} aria-hidden="true">
              {CAPTURED_GLYPHS[`${playerColor}${t}`]}
            </span>
          ))}
        </div>
      </div>
      {advantage !== 0 && (
        <p className="mt-2 text-center text-[0.65rem] font-bold text-[#00d6c8]">
          {advantage > 0
            ? `${CHESS_ARENA_COPY.materialAdvantagePlayerAr} +${advantage}`
            : `${CHESS_ARENA_COPY.materialAdvantageAiAr} +${Math.abs(advantage)}`}
        </p>
      )}
    </div>
  );
}
