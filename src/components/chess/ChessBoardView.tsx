/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رقعة الشطرنج التفاعلية — اضغط لتحديد قطعة ثم اضغط على مربّع الوجهة.
 * بلا مكتبة رقعة خارجية: شبكة 8×8 برموز يونيكود، فقط chess.js للقواعد.
 */
import { useMemo, useState } from 'react';
import type { Chess } from 'chess.js';

interface EngineBoardSquare {
  type: string;
  color: 'w' | 'b';
}

interface EngineMove {
  from: string;
  to: string;
  promotion?: string;
}

const PIECE_GLYPHS: Record<string, string> = {
  wk: '♔',
  wq: '♕',
  wr: '♖',
  wb: '♗',
  wn: '♘',
  wp: '♙',
  bk: '♚',
  bq: '♛',
  br: '♜',
  bb: '♝',
  bn: '♞',
  bp: '♟',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export interface ChessBoardViewProps {
  chess: Chess;
  playerColor: 'w' | 'b';
  interactive: boolean;
  onPlayerMove: (from: string, to: string, promotion?: string) => void;
}

function squareAt(rowFromTop: number, file: number): string {
  const rank = 8 - rowFromTop;
  return `${FILES[file]}${rank}`;
}

export function ChessBoardView({ chess, playerColor, interactive, onPlayerMove }: ChessBoardViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  const board = chess.board() as unknown as (EngineBoardSquare | null)[][];
  const flipped = playerColor === 'b';

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moves = chess.moves({ square: selected as any, verbose: true }) as unknown as EngineMove[];
    return new Set(moves.map((m) => m.to));
  }, [selected, chess]);

  function handleSquareClick(square: string) {
    if (!interactive || promotionPending) return;

    if (selected && legalTargets.has(square)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const movingPiece = chess.get(selected as any);
      const isPromotion = movingPiece?.type === 'p' && (square.endsWith('8') || square.endsWith('1'));
      if (isPromotion) {
        setPromotionPending({ from: selected, to: square });
        setSelected(null);
        return;
      }
      onPlayerMove(selected, square);
      setSelected(null);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const piece = chess.get(square as any);
    if (piece && piece.color === playerColor && piece.color === chess.turn()) {
      setSelected(square);
    } else {
      setSelected(null);
    }
  }

  function handlePromotionPick(promotion: string) {
    if (!promotionPending) return;
    onPlayerMove(promotionPending.from, promotionPending.to, promotion);
    setPromotionPending(null);
  }

  const displayRows = flipped ? [...board].reverse() : board;

  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="grid grid-cols-8 overflow-hidden rounded-xl border border-[#d8c6a1] shadow-lg">
        {displayRows.map((row, rIdx) => {
          const actualRowFromTop = flipped ? 7 - rIdx : rIdx;
          const displayCols = flipped ? [...row].reverse() : row;
          return displayCols.map((piece, cIdx) => {
            const actualFile = flipped ? 7 - cIdx : cIdx;
            const square = squareAt(actualRowFromTop, actualFile);
            const isDark = (actualRowFromTop + actualFile) % 2 === 1;
            const isSelected = selected === square;
            const isTarget = legalTargets.has(square);
            const glyph = piece ? PIECE_GLYPHS[`${piece.color}${piece.type}`] : '';

            return (
              <button
                key={square}
                type="button"
                onClick={() => handleSquareClick(square)}
                disabled={!interactive}
                aria-label={square}
                className={[
                  'relative flex aspect-square select-none items-center justify-center text-2xl leading-none transition-colors sm:text-3xl',
                  isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]',
                  isSelected ? 'ring-4 ring-inset ring-amber-500' : '',
                  interactive ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                <span aria-hidden="true">{glyph}</span>
                {isTarget && !piece && (
                  <span className="pointer-events-none absolute h-3 w-3 rounded-full bg-emerald-700/60 sm:h-3.5 sm:w-3.5" />
                )}
                {isTarget && piece && (
                  <span className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-red-600/70" />
                )}
              </button>
            );
          });
        })}
      </div>

      {promotionPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60">
          <div dir="rtl" className="rounded-2xl bg-white p-4 text-center shadow-xl">
            <p className="mb-3 text-sm font-bold text-slate-800">اختر الترقية</p>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePromotionPick(p)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-300 text-2xl hover:bg-slate-100"
                >
                  <span aria-hidden="true">{PIECE_GLYPHS[`${playerColor}${p}`]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
