/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إحصائيات ساحة الشطرنج الحقيقية — محفوظة محلياً (localStorage)، تُسجَّل
 * فعلياً عند كل نهاية مباراة حقيقية (فوز/خسارة/تعادل)، لا أرقاماً وهمية.
 * على نفس نمط «Lab State» المستخدم في chessSessionLab.ts.
 */
import type { ChessDifficultyId } from '@/config/chessArena';
import type { ChessGameStatus } from '@/lib/chessSessionLab';

const CHESS_STATS_STORAGE_KEY = 'halaqmap-chess-arena-stats:v1';

export interface ChessLevelStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ChessStatsState {
  version: 1;
  beginner: ChessLevelStats;
  intermediate: ChessLevelStats;
  advanced: ChessLevelStats;
}

export type ChessMatchOutcome = 'win' | 'loss' | 'draw';

function emptyLevelStats(): ChessLevelStats {
  return { played: 0, wins: 0, losses: 0, draws: 0 };
}

function emptyStatsState(): ChessStatsState {
  return { version: 1, beginner: emptyLevelStats(), intermediate: emptyLevelStats(), advanced: emptyLevelStats() };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isLevelStats(raw: unknown): raw is ChessLevelStats {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.played === 'number' &&
    typeof r.wins === 'number' &&
    typeof r.losses === 'number' &&
    typeof r.draws === 'number'
  );
}

/** حالة نهاية المباراة الحقيقية → نتيجة إحصائية، أو null إن كانت المباراة ما زالت جارية (لا تُسجَّل). */
export function outcomeFromStatus(status: ChessGameStatus): ChessMatchOutcome | null {
  if (status === 'player_won') return 'win';
  if (status === 'ai_won' || status === 'resigned' || status === 'timeout') return 'loss';
  if (status === 'draw') return 'draw';
  return null;
}

export function readChessStats(): ChessStatsState {
  if (!isBrowser()) return emptyStatsState();
  try {
    const raw = window.localStorage.getItem(CHESS_STATS_STORAGE_KEY);
    if (!raw) return emptyStatsState();
    const parsed = JSON.parse(raw) as Partial<ChessStatsState> | null;
    if (!parsed || !isLevelStats(parsed.beginner) || !isLevelStats(parsed.intermediate) || !isLevelStats(parsed.advanced)) {
      return emptyStatsState();
    }
    return { version: 1, beginner: parsed.beginner, intermediate: parsed.intermediate, advanced: parsed.advanced };
  } catch {
    return emptyStatsState();
  }
}

function writeChessStats(state: ChessStatsState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CHESS_STATS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // تخزين محلي غير متاح — تجاهل بصمت، لا نفشل تجربة اللعب بسبب هذا.
  }
}

/** يسجّل نتيجة مباراة حقيقية واحدة لمستوى معيّن، ويُعيد الحالة الكاملة المحدَّثة. */
export function recordChessMatchResult(level: ChessDifficultyId, outcome: ChessMatchOutcome): ChessStatsState {
  const current = readChessStats();
  const levelStats = { ...current[level] };
  levelStats.played += 1;
  if (outcome === 'win') levelStats.wins += 1;
  else if (outcome === 'loss') levelStats.losses += 1;
  else levelStats.draws += 1;
  const next: ChessStatsState = { ...current, [level]: levelStats };
  writeChessStats(next);
  return next;
}

export function totalChessStats(stats: ChessStatsState): ChessLevelStats {
  return {
    played: stats.beginner.played + stats.intermediate.played + stats.advanced.played,
    wins: stats.beginner.wins + stats.intermediate.wins + stats.advanced.wins,
    losses: stats.beginner.losses + stats.intermediate.losses + stats.advanced.losses,
    draws: stats.beginner.draws + stats.intermediate.draws + stats.advanced.draws,
  };
}
