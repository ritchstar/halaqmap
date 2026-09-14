/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * محرك خصم الذكاء الاصطناعي المحلي لساحة الشطرنج — بحث Minimax مع تقليم
 * Alpha-Beta وتعميق تكراري محدود بزمن، يعمل بالكامل داخل المتصفح بلا أي
 * اتصال خارجي. يُستخدم للمستويين «مبتدئ» و«متوسط» دائماً، وهو أيضاً خط
 * الرجوع الآمن لمستوى «محترف» إن تعذّر تحميل محرك Stockfish (راجع
 * chessEngine.ts). الأنواع هنا محلية عمداً (بدل الاستيراد من chess.js)
 * لتبقى متوافقة مع شكل الكائنات الفعلي الذي تُرجعه المكتبة.
 */
import { Chess } from 'chess.js';
import type { ChessDifficultyId } from '@/config/chessArena';
import { getChessDifficultyLevel } from '@/config/chessArena';

interface EngineMove {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
}

interface EngineBoardSquare {
  type: string;
  color: 'w' | 'b';
}

export interface ChessAiMoveResult {
  from: string;
  to: string;
  promotion?: string;
}

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// جداول موضع القطعة — منظور الأبيض (الصف 0 = الرتبة 8). تُعكس رأسياً لقطع الأسود.
const PAWN_PST: readonly number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST: readonly number[][] = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

function pstValue(pst: readonly number[][], rowFromTop: number, file: number, color: 'w' | 'b'): number {
  const row = color === 'w' ? rowFromTop : 7 - rowFromTop;
  return pst[row][file];
}

function evaluateBoard(chess: Chess): number {
  const board = chess.board() as unknown as (EngineBoardSquare | null)[][];
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r]?.[f];
      if (!piece) continue;
      const base = PIECE_VALUES[piece.type] ?? 0;
      let positional = 0;
      if (piece.type === 'p') positional = pstValue(PAWN_PST, r, f, piece.color);
      else if (piece.type === 'n') positional = pstValue(KNIGHT_PST, r, f, piece.color);
      const value = base + positional;
      score += piece.color === 'w' ? value : -value;
    }
  }

  if (chess.isCheckmate()) {
    // الطرف الذي يفترض أن يلعب الآن هو من تعرّض لكش الملك.
    return chess.turn() === 'w' ? -100_000 : 100_000;
  }

  const mobility = chess.moves().length;
  score += chess.turn() === 'w' ? mobility * 2 : -mobility * 2;

  return score;
}

function orderMoves(moves: EngineMove[]): EngineMove[] {
  return [...moves].sort((a, b) => {
    const aScore = a.captured ? (PIECE_VALUES[a.captured] ?? 0) * 10 - (PIECE_VALUES[a.piece] ?? 0) : -1;
    const bScore = b.captured ? (PIECE_VALUES[b.captured] ?? 0) * 10 - (PIECE_VALUES[b.piece] ?? 0) : -1;
    return bScore - aScore;
  });
}

function minimax(
  chess: Chess,
  depth: number,
  alphaIn: number,
  betaIn: number,
  maximizing: boolean,
  deadline: number,
): number {
  if (depth === 0 || chess.isGameOver() || Date.now() > deadline) {
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }) as unknown as EngineMove[]);
  if (moves.length === 0) return evaluateBoard(chess);

  let alpha = alphaIn;
  let beta = betaIn;

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move({ from: m.from, to: m.to, promotion: m.promotion });
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false, deadline));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha || Date.now() > deadline) break;
    }
    return best;
  }

  let best = Infinity;
  for (const m of moves) {
    chess.move({ from: m.from, to: m.to, promotion: m.promotion });
    best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true, deadline));
    chess.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha || Date.now() > deadline) break;
  }
  return best;
}

function searchBestMove(chess: Chess, maxDepth: number, timeBudgetMs: number): EngineMove | null {
  const deadline = Date.now() + Math.max(50, timeBudgetMs);
  const rootMoves = orderMoves(chess.moves({ verbose: true }) as unknown as EngineMove[]);
  if (rootMoves.length === 0) return null;

  const maximizingRoot = chess.turn() === 'w';
  let bestMove: EngineMove = rootMoves[0];

  for (let depth = 1; depth <= maxDepth; depth++) {
    let bestScoreThisDepth = maximizingRoot ? -Infinity : Infinity;
    let bestMoveThisDepth: EngineMove | null = null;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const m of rootMoves) {
      chess.move({ from: m.from, to: m.to, promotion: m.promotion });
      const score = minimax(chess, depth - 1, alpha, beta, !maximizingRoot, deadline);
      chess.undo();

      const better = maximizingRoot ? score > bestScoreThisDepth : score < bestScoreThisDepth;
      if (better) {
        bestScoreThisDepth = score;
        bestMoveThisDepth = m;
      }
      if (maximizingRoot) alpha = Math.max(alpha, bestScoreThisDepth);
      else beta = Math.min(beta, bestScoreThisDepth);

      if (Date.now() > deadline) break;
    }

    if (bestMoveThisDepth) bestMove = bestMoveThisDepth;
    if (Date.now() > deadline) break;
  }

  return bestMove;
}

/**
 * يختار نقلة الذكاء الاصطناعي المحلي للوضعية الحالية دون المساس بكائن chess
 * الممرَّر (يُنشئ نسخة مستقلة للبحث). يعيد null فقط إذا لم تعد هناك نقلات شرعية.
 */
export function pickAiMove(chess: Chess, levelId: ChessDifficultyId): ChessAiMoveResult | null {
  const level = getChessDifficultyLevel(levelId);
  const legalMoves = chess.moves({ verbose: true }) as unknown as EngineMove[];
  if (legalMoves.length === 0) return null;

  if (level.blunderChance > 0 && Math.random() < level.blunderChance) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
  }

  const sim = new Chess(chess.fen());
  const best = searchBestMove(sim, level.searchDepth + 1, level.timeBudgetMs);
  if (!best) {
    const fallback = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: fallback.from, to: fallback.to, promotion: fallback.promotion };
  }
  return { from: best.from, to: best.to, promotion: best.promotion };
}
