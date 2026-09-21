/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ذكاء اصطناعي قاعدي (heuristic) لبوتات ساحة بلوت الثلاثة — مزايدة ولعب.
 * ليس محرك تعلّم آلي؛ قواعد مصمَّمة لتحاكي قرارات لاعب بلوت واقعي بمستوى
 * متوسط، قابلة للتحسين لاحقاً بعد ملاحظات اللعب الفعلي.
 */
import {
  BALOOT_SEAT_TEAM,
  BALOOT_SUITS,
  cardStrengthIndex,
  cardValue,
  evaluateSuitAsTrump,
  legalBalootMoves,
  trickWinnerSoFar,
  type BalootBidChoice,
  type BalootCard,
  type BalootHandState,
  type BalootSeat,
  type BalootSuit,
} from '@/lib/balootEngine';

/** حد أدنى لقوة البذلة (بنقاط الحكم الافتراضية) كي يقرر البوت إعلان الحكم بدل التمرير. */
const BID_DECLARE_THRESHOLD = 24;
/** وزن إضافي لكل ورقة من بذلة المرشّح — يكافئ التحكم الطويل بالبذلة لا القيمة فقط. */
const SUIT_LENGTH_WEIGHT = 3;
/**
 * حد أدنى لمجموع قيم اليد كاملة بقيم البذلة العادية (بلا حكم) كي يفضّل
 * البوت صن. قابل للضبط لاحقاً بعد ملاحظات لعب فعلية — مثل BID_DECLARE_THRESHOLD.
 */
const SUN_DECLARE_THRESHOLD = 28;

/**
 * يقيّم البوت يده ويقرر: بذلة حكم يعلنها، أو 'sun' (صن)، أو null للتمرير.
 * منطق الاختيار بين حكم وصن: يُحسب أفضل بذلة حكم كالمعتاد، ثم يُحسب مجموع
 * قيمة اليد كاملة كأوراق عادية (بلا حكم) — إن كان هذا المجموع قوياً بذاته
 * ولم تصل أفضل بذلة حكم لعتبة الإعلان (أي لا تركّز قوي في بذلة واحدة)، يُفضَّل
 * صن. خلاف ذلك يُفضَّل الحكم كالمعتاد.
 */
export function chooseBalootBotBid(cards: readonly BalootCard[]): BalootBidChoice {
  let bestSuit: BalootSuit | null = null;
  let bestSuitScore = -1;
  for (const suit of BALOOT_SUITS) {
    const suitLength = cards.filter((c) => c.suit === suit).length;
    if (suitLength === 0) continue;
    const score = evaluateSuitAsTrump(cards, suit) + suitLength * SUIT_LENGTH_WEIGHT;
    if (score > bestSuitScore) {
      bestSuitScore = score;
      bestSuit = suit;
    }
  }

  const sunScore = cards.reduce((sum, c) => sum + cardValue(c, null), 0);
  const hokumWorthDeclaring = bestSuit !== null && bestSuitScore >= BID_DECLARE_THRESHOLD;
  if (sunScore >= SUN_DECLARE_THRESHOLD && !hokumWorthDeclaring) return 'sun';

  if (!hokumWorthDeclaring) return null;
  return bestSuit;
}

/** حد أدنى لقوة يد فريق الدفاع في بذلة الحكم (أو قيمتها الكلية في صن) كي يقرر البوت مضاعفة الرهان. */
const DOUBLE_DECLARE_THRESHOLD = 20;
/** حد أعلى — إعادة المضاعفة بعد دبلة الخصم تصعيد حقيقي، يحتاج ثقة أكبر من عتبة الدبلة نفسها. */
const REDOUBLE_DECLARE_THRESHOLD = 30;

function handStrengthForDoubling(cards: readonly BalootCard[], trumpSuit: BalootSuit | null): number {
  return trumpSuit ? evaluateSuitAsTrump(cards, trumpSuit) : cards.reduce((sum, c) => sum + cardValue(c, null), 0);
}

/**
 * قرار بوت في فريق الدفاع: هل يضاعف رهان الشوط (دبلة ×٢)؟ يرى البوت يده هو
 * فقط (لا يد الخصم ولا الشريك) — قوة يده في بذلة الحكم نفسها (أو قيمتها
 * الكلية في صن) مؤشر تقريبي على أن فريق المزايدة قد يواجه صعوبة رغم إعلانه.
 */
export function shouldBalootBotDouble(cards: readonly BalootCard[], trumpSuit: BalootSuit | null): boolean {
  return handStrengthForDoubling(cards, trumpSuit) >= DOUBLE_DECLARE_THRESHOLD;
}

/**
 * قرار بوت في فريق المزايدة: هل يعيد مضاعفة الرهان (ريدبل ×٤) بعد أن ضاعف
 * الخصم؟ يُشترط ثقة أعلى من عتبة الدبلة نفسها — تصعيد حقيقي للمخاطرة لا
 * قرار افتراضي.
 */
export function shouldBalootBotRedouble(cards: readonly BalootCard[], trumpSuit: BalootSuit | null): boolean {
  return handStrengthForDoubling(cards, trumpSuit) >= REDOUBLE_DECLARE_THRESHOLD;
}

function lowestCard(cards: readonly BalootCard[], trumpSuit: BalootSuit): BalootCard {
  return cards.reduce((min, c) => (cardStrengthIndex(c, trumpSuit) < cardStrengthIndex(min, trumpSuit) ? c : min));
}

function highestCard(cards: readonly BalootCard[], trumpSuit: BalootSuit): BalootCard {
  return cards.reduce((max, c) => (cardStrengthIndex(c, trumpSuit) > cardStrengthIndex(max, trumpSuit) ? c : max));
}

/**
 * هل تتفوّق `card` على `target` فعلياً؟ الحكم يتفوّق دائماً على أي ورقة غير
 * حكم بصرف النظر عن رتبتها (لا يجوز مقارنة فهرسي القوة مباشرة بين الفئتين،
 * فكل فئة تُرقَّم من صفر داخلياً) — والمقارنة الرقمية العادية صالحة فقط
 * عندما تكونان من نفس الفئة (حكم مع حكم، أو نفس البذلة المفتوحة).
 */
function beatsCard(card: BalootCard, target: BalootCard, trumpSuit: BalootSuit): boolean {
  const cardIsTrump = card.suit === trumpSuit;
  const targetIsTrump = target.suit === trumpSuit;
  if (cardIsTrump !== targetIsTrump) return cardIsTrump;
  if (!cardIsTrump && card.suit !== target.suit) return false; // بذلة ثالثة لا تدخل السباق أصلاً
  return cardStrengthIndex(card, trumpSuit) > cardStrengthIndex(target, trumpSuit);
}

/** أرخص ورقة ضمن `cards` تتفوّق فعلاً على `target` — أو null إن لم توجد. */
function cheapestWinningCard(cards: readonly BalootCard[], target: BalootCard, trumpSuit: BalootSuit): BalootCard | null {
  const winners = cards.filter((c) => beatsCard(c, target, trumpSuit));
  if (winners.length === 0) return null;
  // من بين الفائزين، نريد الأضعف (الأرخص): إن كانت c أقوى من المرشّح الحالي
  // نُبقي المرشّح الحالي (الأضعف)، وإلا فـc هي الأضعف فتحل محله.
  return winners.reduce((weakest, c) => (beatsCard(c, weakest, trumpSuit) ? weakest : c));
}

/**
 * يختار البوت ورقة لعب واقعية:
 * - إن كان يقود الشوط: يقود بأضعف ورقة غير حكم (تقليدياً) للحفاظ على الحكم للحظة الحاسمة.
 * - إن كان يستطيع اللحاق بالبذلة المفتوحة: يفوز بأرخص ورقة كافية إن كان الخصم متصدّراً،
 *   ويكتفي بأضعف ورقة إن كان شريكه متصدّراً (لا داعي للمبالغة).
 * - إن كان عاجزاً عن اللحاق (فارغ من البذلة): يحكم بأرخص حكم كافٍ إن كان الخصم متصدّراً،
 *   أو يتخلّص من أضعف ورقة غير حكم إن كان شريكه متصدّراً بالفعل.
 */
export function chooseBalootBotCard(hand: BalootHandState, seat: BalootSeat): string {
  const legal = legalBalootMoves(hand, seat);
  if (legal.length === 1) return legal[0].id;
  const trumpSuit = hand.trumpSuit;
  if (!trumpSuit) return legal[0].id;

  const myTeam = BALOOT_SEAT_TEAM[seat];

  if (hand.currentTrick.length === 0) {
    const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
    const pool = nonTrump.length > 0 ? nonTrump : legal;
    return lowestCard(pool, trumpSuit).id;
  }

  const currentWinnerSeat = trickWinnerSoFar(hand.currentTrick, trumpSuit);
  const partnerWinning = BALOOT_SEAT_TEAM[currentWinnerSeat] === myTeam;
  const bestInTrick = hand.currentTrick.reduce((best, entry) =>
    cardStrengthIndex(entry.card, trumpSuit) > cardStrengthIndex(best.card, trumpSuit) ? entry : best,
  ).card;

  const ledSuit = hand.currentTrick[0].card.suit;
  const followingSuit = legal.every((c) => c.suit === ledSuit) && legal[0].suit === ledSuit;

  if (followingSuit) {
    if (partnerWinning) return lowestCard(legal, trumpSuit).id;
    const winning = cheapestWinningCard(legal, bestInTrick, trumpSuit);
    return (winning ?? lowestCard(legal, trumpSuit)).id;
  }

  // البوت فارغ من البذلة المفتوحة — يملك حرية اللعب بأي ورقة (تشمل الحكم).
  if (partnerWinning) {
    const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
    const pool = nonTrump.length > 0 ? nonTrump : legal;
    return lowestCard(pool, trumpSuit).id;
  }

  const trumps = legal.filter((c) => c.suit === trumpSuit);
  if (trumps.length > 0) {
    const winningTrump = cheapestWinningCard(trumps, bestInTrick, trumpSuit);
    if (winningTrump) return winningTrump.id;
    // لا يستطيع التفوّق حتى بالحكم — يتخلّص من أضعف حكم بدل إهدار ورقة أقوى.
    return lowestCard(trumps, trumpSuit).id;
  }

  const nonTrump = legal.filter((c) => c.suit !== trumpSuit);
  return lowestCard(nonTrump.length > 0 ? nonTrump : legal, trumpSuit).id;
}

/** تقدير نقاط ورقة — يُستخدم أحياناً في عرض تلميحات للاعب لاحقاً (غير مستخدم في القرار الآلي بعد). */
export function estimateCardPoints(card: BalootCard, trumpSuit: BalootSuit): number {
  return cardValue(card, trumpSuit);
}

/** أعلى ورقة في مجموعة — مساعد عام يُصدَّر لاستخدامات واجهة لاحقة (تمييز الورقة الأقوى في اليد مثلاً). */
export function strongestCardOf(cards: readonly BalootCard[], trumpSuit: BalootSuit): BalootCard {
  return highestCard(cards, trumpSuit);
}
