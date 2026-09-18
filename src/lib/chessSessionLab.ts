/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حفظ جلسة ساحة الشطرنج محلياً (localStorage) — بلا خادم وبلا حساب،
 * على نمط «Lab State» المستخدم في منتجات المتجر الأخرى.
 */
import type { ChessDifficultyId } from '@/config/chessArena';
import { CHESS_SESSION_STORAGE_KEY } from '@/config/chessArena';

export type ChessGameStatus = 'playing' | 'player_won' | 'ai_won' | 'draw' | 'resigned' | 'timeout';

export interface ChessSessionState {
  version: 1;
  fen: string;
  level: ChessDifficultyId;
  playerColor: 'w' | 'b';
  sanHistory: string[];
  status: ChessGameStatus;
  startedAt: number;
  updatedAt: number;
  /** الوقت المتبقي (مللي ثانية) في ساعة اللاعب الحقيقية عند آخر حفظ — اختياري للتوافق مع جلسات أقدم. */
  clockRemainingMs?: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isChessDifficultyId(raw: unknown): raw is ChessDifficultyId {
  return raw === 'beginner' || raw === 'intermediate' || raw === 'advanced';
}

function isChessGameStatus(raw: unknown): raw is ChessGameStatus {
  return (
    raw === 'playing' ||
    raw === 'player_won' ||
    raw === 'ai_won' ||
    raw === 'draw' ||
    raw === 'resigned' ||
    raw === 'timeout'
  );
}

export function readChessSession(): ChessSessionState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CHESS_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChessSessionState> | null;
    if (
      !parsed ||
      typeof parsed.fen !== 'string' ||
      !parsed.fen.trim() ||
      !isChessDifficultyId(parsed.level) ||
      (parsed.playerColor !== 'w' && parsed.playerColor !== 'b') ||
      !Array.isArray(parsed.sanHistory) ||
      !isChessGameStatus(parsed.status)
    ) {
      return null;
    }
    return {
      version: 1,
      fen: parsed.fen,
      level: parsed.level,
      playerColor: parsed.playerColor,
      sanHistory: parsed.sanHistory.filter((entry): entry is string => typeof entry === 'string'),
      status: parsed.status,
      startedAt: typeof parsed.startedAt === 'number' ? parsed.startedAt : Date.now(),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      clockRemainingMs: typeof parsed.clockRemainingMs === 'number' ? parsed.clockRemainingMs : undefined,
    };
  } catch {
    return null;
  }
}

export function writeChessSession(state: Omit<ChessSessionState, 'version' | 'updatedAt'>): void {
  if (!isBrowser()) return;
  try {
    const full: ChessSessionState = { ...state, version: 1, updatedAt: Date.now() };
    window.localStorage.setItem(CHESS_SESSION_STORAGE_KEY, JSON.stringify(full));
  } catch {
    // تخزين محلي غير متاح (وضع خاص، أو حصة ممتلئة) — تجاهل بصمت، اللعب يستمر بلا حفظ.
  }
}

export function clearChessSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(CHESS_SESSION_STORAGE_KEY);
  } catch {
    // تجاهل — لا حاجة لإفشال تجربة اللاعب بسبب فشل مسح التخزين المحلي.
  }
}
