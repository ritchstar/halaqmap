/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حفظ جلسة ساحة بلوت محلياً (localStorage) — بلا خادم وبلا حساب، على نمط
 * «Lab State» المستخدم في ساحة الشطرنج ومنتجات المتجر الأخرى.
 */
import { BALOOT_SESSION_STORAGE_KEY } from '@/config/balootArena';
import { BALOOT_SEAT_ORDER, type BalootMatchState, type BalootSeat } from '@/lib/balootEngine';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isBalootSeat(raw: unknown): raw is BalootSeat {
  return typeof raw === 'string' && (BALOOT_SEAT_ORDER as readonly string[]).includes(raw);
}

/** تحقّق بنيوي خفيف — لا نعيد بناء الحالة بالكامل، فقط نتأكد أنها لا تبدو تالفة قبل استخدامها. */
function looksLikeValidMatch(raw: unknown): raw is BalootMatchState {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<BalootMatchState>;
  if (candidate.version !== 1) return false;
  if (!candidate.matchScore || typeof candidate.matchScore.playerTeam !== 'number' || typeof candidate.matchScore.opponentTeam !== 'number') {
    return false;
  }
  if (!candidate.hand || typeof candidate.hand !== 'object') return false;
  if (!isBalootSeat(candidate.hand.dealerSeat) || !isBalootSeat(candidate.hand.turnSeat)) return false;
  if (!Array.isArray(candidate.hand.tricks)) return false;
  // جلسات محفوظة قبل إضافة صن والمضاعفة لا تحمل هذين الحقلين — نرفضها هنا
  // عمداً (بدل تعويض قيم افتراضية بصمت) لمنع تشغيل شوط بحالة ناقصة بعد نشر
  // هذا التحديث؛ اللاعب يبدأ مباراة جديدة بدل استكمال جلسة قديمة غير متوافقة.
  if (candidate.hand.mode !== 'hokum' && candidate.hand.mode !== 'sun') return false;
  if (candidate.hand.doubleLevel !== 1 && candidate.hand.doubleLevel !== 2 && candidate.hand.doubleLevel !== 4) return false;
  if (candidate.status !== 'playing' && candidate.status !== 'player_team_won' && candidate.status !== 'opponent_team_won') {
    return false;
  }
  return true;
}

export function readBalootSession(): BalootMatchState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(BALOOT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return looksLikeValidMatch(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeBalootSession(match: BalootMatchState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(BALOOT_SESSION_STORAGE_KEY, JSON.stringify({ ...match, updatedAt: Date.now() }));
  } catch {
    // تخزين محلي غير متاح (وضع خاص، أو حصة ممتلئة) — تجاهل بصمت، اللعب يستمر بلا حفظ.
  }
}

export function clearBalootSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(BALOOT_SESSION_STORAGE_KEY);
  } catch {
    // تجاهل — لا حاجة لإفشال تجربة اللاعب بسبب فشل مسح التخزين المحلي.
  }
}
