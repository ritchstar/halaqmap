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
  type BalootCard,
  type BalootHandState,
  type BalootSeat,
  type BalootSuit,
} from '@/lib/balootEngine';

/** حد أدنى لقوة البذلة (بنقاط الحكم الافتراضية) كي يقرر البوت إعلان الحكم بدل التمرير. */
const BID_DECLARE_THRESHOLD = 24;
/** وزن إضافي لكل ورقة من بذلة المرشّح — يكافئ التحكم الطويل بالبذلة لا القيمة فقط. */
const SUIT_LENGTH_WEIGHT = 3;

/** يقيّم البوت يده ويقرر: بذلة حكم يعلنها، أو null للتمرير. */
export function chooseBalootBotBid(cards: readonly BalootCard[]): BalootSuit | null {
  let best: BalootSuit | null = null;
  let bestScore = -1;
  for (const suit of BALOOT_SUITS) {
    const suitLength = cards.filter((c) => c.suit === suit).length;
    if (suitLength === 0) continue;
    const score = evaluateSuitAsTrump(cards, suit) + suitLength * SUIT_LENGTH_WEIGHT;
    if (score > bestScore) {
      bestScore = score;
      best = suit;
    }
  }
  if (best === null || bestScore < BID_DECLARE_THRESHOLD) return null;
  return best;
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
