/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رقعة الشطرنج التفاعلية — اضغط لتحديد قطعة ثم اضغط على مربّع الوجهة.
 * بلا مكتبة رقعة خارجية: شبكة 8×8 برموز يونيكود، فقط chess.js للقواعد.
 * تتضمن إحداثيات الملفات/الرتب وتظليل آخر نقلة.
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
  lastMove?: { from: string; to: string } | null;
  onPlayerMove: (from: string, to: string, promotion?: string) => void;
}

function squareAt(rowFromTop: number, file: number): string {
  const rank = 8 - rowFromTop;
  return `${FILES[file]}${rank}`;
}

export function ChessBoardView({ chess, playerColor, interactive, lastMove, onPlayerMove }: ChessBoardViewProps) {
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
  const displayFiles = flipped ? [...FILES].reverse() : FILES;
  const displayRanks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="rounded-2xl border border-[#1f4a52] bg-[#0b2025]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-3">
        <div className="flex">
          <div className="flex flex-col justify-around pe-1 sm:pe-1.5">
            {displayRanks.map((rank) => (
              <span key={rank} className="flex h-full items-center text-[0.6rem] font-bold text-[#5f8a8d] sm:text-xs">
                {rank}
              </span>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-8 overflow-hidden rounded-xl border border-[#1f4a52]/70 shadow-inner">
            {displayRows.map((row, rIdx) => {
              const actualRowFromTop = flipped ? 7 - rIdx : rIdx;
              const displayCols = flipped ? [...row].reverse() : row;
              return displayCols.map((piece, cIdx) => {
                const actualFile = flipped ? 7 - cIdx : cIdx;
                const square = squareAt(actualRowFromTop, actualFile);
                const isDark = (actualRowFromTop + actualFile) % 2 === 1;
                const isSelected = selected === square;
                const isTarget = legalTargets.has(square);
                const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                const glyph = piece ? PIECE_GLYPHS[`${piece.color}${piece.type}`] : '';

                return (
                  <button
                    key={square}
                    type="button"
                    onClick={() => handleSquareClick(square)}
                    disabled={!interactive}
                    aria-label={square}
                    className={[
                      'relative flex aspect-square select-none items-center justify-center text-2xl leading-none transition-colors duration-200 sm:text-3xl',
                      isDark ? 'bg-[#0e262d]' : 'bg-[#15343c]',
                      isSelected ? 'ring-2 ring-inset ring-[#d8ac52]' : '',
                      interactive ? 'cursor-pointer' : 'cursor-default',
                    ].join(' ')}
                  >
                    {isLastMoveSquare && !isSelected && (
                      <span className="pointer-events-none absolute inset-0 bg-[#d8ac52]/18" />
                    )}
                    <span
                      aria-hidden="true"
                      className={[
                        'relative z-10 select-none leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
                        piece?.color === 'b' ? 'text-[#d8ac52]' : 'text-[#eef7f5]',
                      ].join(' ')}
                    >
                      {glyph}
                    </span>
                    {isTarget && !piece && (
                      <span className="pointer-events-none absolute z-10 h-3 w-3 rounded-full bg-[#00d6c8]/85 shadow-[0_0_14px_rgba(0,214,200,0.85)] sm:h-3.5 sm:w-3.5" />
                    )}
                    {isTarget && piece && (
                      <span className="pointer-events-none absolute inset-0 z-10 ring-4 ring-inset ring-rose-400/70" />
                    )}
                  </button>
                );
              });
            })}
          </div>
        </div>

        <div className="flex ps-[calc(1.1rem)] pt-1 sm:ps-[calc(1.35rem)]">
          {displayFiles.map((file) => (
            <span
              key={file}
              className="flex flex-1 items-center justify-center text-[0.6rem] font-bold text-[#5f8a8d] sm:text-xs"
            >
              {file}
            </span>
          ))}
        </div>
      </div>

      {promotionPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/65">
          <div dir="rtl" className="rounded-2xl border border-[#1f4a52] bg-[#0b1f26] p-4 text-center shadow-2xl">
            <p className="mb-3 text-sm font-bold text-[#e7f4f2]">اختر الترقية</p>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePromotionPick(p)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#296269]/60 bg-[#0e262d] text-2xl text-[#eef7f5] transition-colors hover:border-[#d8ac52]/60 hover:bg-[#15343c]"
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
