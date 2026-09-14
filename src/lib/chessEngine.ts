/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طبقة اختيار المحرك: تقرر لكل مستوى هل تلعب بالمحرك المحلي (chessAi.ts)
 * أو بمحرك Stockfish الحقيقي (stockfishEngine.ts) — مع تراجع تلقائي
 * للمحلي إن تعذّر Stockfish لأي سبب، حتى لا تتعطل اللعبة أبداً.
 *
 * قرار تصميم متعمد: المستويان «مبتدئ» و«متوسط» يستخدمان المحرك المحلي
 * دائماً — لأن Stockfish بمستويات مهارة منخفضة يلعب أخطاءً غريبة غير
 * طبيعية (نقلات عشوائية بالكامل أحياناً)، بينما محرك «الخطأ المتعمد»
 * المحلي يمنح تجربة أقرب لخصم مبتدئ حقيقي. Stockfish بكامل قوته
 * (Skill Level 20) هو من يمثّل مستوى «محترف».
 */
import type { Chess } from 'chess.js';
import { getChessDifficultyLevel, type ChessDifficultyId } from '@/config/chessArena';
import { pickAiMove, type ChessAiMoveResult } from '@/lib/chessAi';
import { getStockfishMove, isStockfishAvailable } from '@/lib/stockfishEngine';

export type ChessEngineKind = 'stockfish' | 'local';

export interface ChessEngineMoveOutcome {
  move: ChessAiMoveResult;
  engine: ChessEngineKind;
}

/** يتحقق مسبقاً (بلا حجب طويل) هل Stockfish سيكون متاحاً لمستوى «محترف» — لعرض شارة حالة صادقة في الواجهة. */
export async function checkStockfishReadiness(levelId: ChessDifficultyId): Promise<ChessEngineKind | null> {
  const level = getChessDifficultyLevel(levelId);
  if (!level.useStockfish) return 'local';
  const available = await isStockfishAvailable();
  return available ? 'stockfish' : 'local';
}

/** يختار نقلة الذكاء الاصطناعي، مع محاولة Stockfish أولاً عند الاقتضاء ثم التراجع التلقائي للمحلي. */
export async function resolveAiMove(chess: Chess, levelId: ChessDifficultyId): Promise<ChessEngineMoveOutcome | null> {
  const level = getChessDifficultyLevel(levelId);

  if (level.useStockfish) {
    const stockfishMove = await getStockfishMove(chess.fen(), {
      movetimeMs: level.timeBudgetMs,
      skillLevel: level.stockfishSkillLevel ?? 20,
    });
    if (stockfishMove) {
      return { move: stockfishMove, engine: 'stockfish' };
    }
    // تعذّر Stockfish — تراجع فوري للمحرك المحلي بنفس إعدادات المستوى.
  }

  const localMove = pickAiMove(chess, levelId);
  if (!localMove) return null;
  return { move: localMove, engine: 'local' };
}
