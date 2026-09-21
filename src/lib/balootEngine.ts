/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * محرك قواعد بلوت (حكم فقط) — المرحلة الأولى التأسيسية لساحة بلوت.
 *
 * ملاحظة مهمة: قيم الأوراق والمكافآت (السرى/البلوت/الكبّوت) وقاعدة «الكبس»
 * (خسارة فريق المزايدة كل نقاط الشوط لصالح الخصم) هنا مبنية على الاصطلاحات
 * الشائعة المنشورة للعبة بلوت (حكم)، وقد تختلف قليلاً بين تجمّعات اللاعبين
 * (سعودي/خليجي). كل قيمة معرّفة كثابت مسمّى بمكان واحد ليسهل ضبطها لاحقاً
 * بعد مراجعة المستخدم دون المساس بمنطق المحرك.
 *
 * الإصدار 1.1: أُضيف صن (اللعب بلا حكم — كل البذل الأربع بقيم البذلة
 * العادية، ولا مكافأة بلوت لأنها تعتمد شايب/كوز الحكم تحديداً) والمضاعفة
 * (دبل ×٢ من فريق الدفاع، ريدبل ×٤ من فريق المزايدة بعد الدبل). كلاهما
 * اصطلاح شائع منشور بانتظار اعتماد نهائي من مرجع بشري — انظر تفاصيل الخيار
 * المعتمد في docs/baloot-rules-v1.md. لا تزال «الإجبار على التغطية»
 * الصارمة عند العجز عن اللحاق بالبذلة غير مُطبَّقة (تُترك حرة).
 *
 * التوثيق الرسمي المقابل لكل قاعدة هنا: docs/baloot-rules-v1.md — أي
 * تعديل على قيمة أو منطق في هذا الملف يجب أن يُحدَّث في تلك الوثيقة
 * وفي scripts/baloot-rules-reference-tests.mts معاً (الاختبارات المرجعية
 * الثابتة التي تحمي من كسر قاعدة صحيحة دون ملاحظة).
 */

export type BalootSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export const BALOOT_SUITS: readonly BalootSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export type BalootRank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
/** ترتيب الرتب الطبيعي (للتسلسل/السرى) — لا علاقة له بقوة الورقة أثناء اللعب. */
export const BALOOT_NATURAL_RANK_ORDER: readonly BalootRank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export interface BalootCard {
  readonly id: string;
  readonly suit: BalootSuit;
  readonly rank: BalootRank;
}

export type BalootSeat = 'south' | 'west' | 'north' | 'east';
/** ترتيب الدوران حول الطاولة. south = اللاعب. north = شريكه الآلي. west/east = الخصمان الآليان. */
export const BALOOT_SEAT_ORDER: readonly BalootSeat[] = ['south', 'west', 'north', 'east'];

export type BalootTeam = 'playerTeam' | 'opponentTeam';
export const BALOOT_SEAT_TEAM: Record<BalootSeat, BalootTeam> = {
  south: 'playerTeam',
  north: 'playerTeam',
  west: 'opponentTeam',
  east: 'opponentTeam',
};

export function nextSeat(seat: BalootSeat): BalootSeat {
  const index = BALOOT_SEAT_ORDER.indexOf(seat);
  return BALOOT_SEAT_ORDER[(index + 1) % BALOOT_SEAT_ORDER.length];
}

export function partnerSeat(seat: BalootSeat): BalootSeat {
  const index = BALOOT_SEAT_ORDER.indexOf(seat);
  return BALOOT_SEAT_ORDER[(index + 2) % BALOOT_SEAT_ORDER.length];
}

export function otherTeam(team: BalootTeam): BalootTeam {
  return team === 'playerTeam' ? 'opponentTeam' : 'playerTeam';
}

/** قوة الورقة داخل بذلة الحكم (من الأضعف للأقوى) وقيمتها بالنقاط. */
const TRUMP_RANK_STRENGTH: readonly BalootRank[] = ['7', '8', 'Q', 'K', '10', 'A', '9', 'J'];
const TRUMP_RANK_VALUE: Record<BalootRank, number> = {
  '7': 0, '8': 0, Q: 3, K: 4, '10': 10, A: 11, '9': 14, J: 20,
};

/** قوة الورقة في بذلة غير الحكم وقيمتها بالنقاط. */
const PLAIN_RANK_STRENGTH: readonly BalootRank[] = ['7', '8', '9', 'J', 'Q', 'K', '10', 'A'];
const PLAIN_RANK_VALUE: Record<BalootRank, number> = {
  '7': 0, '8': 0, '9': 0, J: 2, Q: 3, K: 4, '10': 10, A: 11,
};

/** إجمالي نقاط الأوراق الثابتة لكل شوط = 62 (بذلة الحكم) + 30×3 (باقي البذل) = 152. */
export const BALOOT_HAND_CARD_POINTS_TOTAL = 152;

export const BALOOT_SIRA_BONUS_BY_LENGTH: Record<number, number> = { 3: 20, 4: 50 };
/** أي تتابع من 5 أوراق فأكثر يُحتسب بقيمة 100. */
export const BALOOT_SIRA_BONUS_FIVE_PLUS = 100;
export const BALOOT_BALOOT_BONUS_POINTS = 20;
/** مكافأة الكبّوت (فوز فريق واحد بكل الأشواط الثمانية) — قيمة قابلة للضبط لاحقاً. */
export const BALOOT_KABOOT_BONUS_POINTS = 10;

/**
 * قيمة ورقة بالنقاط. `trumpSuit = null` تعني «لا حكم إطلاقاً» (وضع صن) —
 * حينها كل البذل الأربع تُحسب بقيم البذلة العادية تلقائياً، لأن المقارنة
 * `card.suit === null` تكون دوماً خاطئة فتسقط على الفرع العادي بلا حاجة
 * لفرع منطقي إضافي.
 */
export function cardValue(card: BalootCard, trumpSuit: BalootSuit | null): number {
  return card.suit === trumpSuit ? TRUMP_RANK_VALUE[card.rank] : PLAIN_RANK_VALUE[card.rank];
}

function rankStrengthIndex(rank: BalootRank, isTrumpSuit: boolean): number {
  const order = isTrumpSuit ? TRUMP_RANK_STRENGTH : PLAIN_RANK_STRENGTH;
  return order.indexOf(rank);
}

/** قوة ورقة نسبية (للمقارنة بين ورقتين من نفس الفئة: حكم مع حكم، أو بذلة مفتوحة مع نفسها). `trumpSuit = null` = وضع صن. */
export function cardStrengthIndex(card: BalootCard, trumpSuit: BalootSuit | null): number {
  return rankStrengthIndex(card.rank, card.suit === trumpSuit);
}

export function buildBalootDeck(): BalootCard[] {
  const deck: BalootCard[] = [];
  for (const suit of BALOOT_SUITS) {
    for (const rank of BALOOT_NATURAL_RANK_ORDER) {
      deck.push({ id: `${suit}-${rank}`, suit, rank });
    }
  }
  return deck;
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealBalootHands(rng: () => number = Math.random): Record<BalootSeat, BalootCard[]> {
  const shuffled = shuffle(buildBalootDeck(), rng);
  const hands: Record<BalootSeat, BalootCard[]> = { south: [], west: [], north: [], east: [] };
  BALOOT_SEAT_ORDER.forEach((seat, seatIndex) => {
    hands[seat] = shuffled.slice(seatIndex * 8, seatIndex * 8 + 8);
  });
  return hands;
}

export interface BalootTrickCard {
  seat: BalootSeat;
  card: BalootCard;
}

export interface BalootTrick {
  leaderSeat: BalootSeat;
  cards: BalootTrickCard[];
  winnerSeat: BalootSeat;
}

/** اختيار المزايدة: بذلة حكم، أو 'sun' (صن — بلا حكم)، أو null (تمرير). */
export type BalootBidChoice = BalootSuit | 'sun' | null;

export interface BalootBidEntry {
  seat: BalootSeat;
  /** null لكل من «تمرير» و«صن» — استخدم الحقل `sun` للتفريق بينهما. */
  trumpSuit: BalootSuit | null;
  /** true فقط حين كان هذا الإعلان صن (بلا حكم). غائب/false يعني تمرير أو حكم عادي. */
  sun?: boolean;
  forced?: boolean;
}

export type BalootGameMode = 'hokum' | 'sun';

export type BalootPhase = 'bidding' | 'doubling' | 'playing' | 'hand_scored' | 'match_over';

/** مستوى المضاعفة الحالي: ١ = بلا دبلة، ٢ = دبلة من فريق الدفاع، ٤ = ريدبل من فريق المزايدة. */
export type BalootDoubleLevel = 1 | 2 | 4;

export interface BalootSiraResult {
  seat: BalootSeat;
  suit: BalootSuit;
  length: number;
  topRankIndex: number;
  points: number;
}

export interface BalootHandBonuses {
  /** أقوى سرى على الطاولة فقط هو من يُحتسب — الباقي صفر. */
  winningSira: BalootSiraResult | null;
  /** كل من يملك شايب وبيبي الحكم معاً يُحتسب له بلوت (نادراً ما يتكرر لكنه ممكن نظرياً بلاعب واحد فقط). */
  balootSeats: BalootSeat[];
}

export interface BalootHandState {
  handNumber: number;
  dealerSeat: BalootSeat;
  hands: Record<BalootSeat, BalootCard[]>;
  bids: BalootBidEntry[];
  trumpSuit: BalootSuit | null;
  /** 'hokum' افتراضياً حتى تكتمل المزايدة — لا معنى له فعلياً قبل ذلك. */
  mode: BalootGameMode;
  biddingTeam: BalootTeam | null;
  bonuses: BalootHandBonuses | null;
  doubleLevel: BalootDoubleLevel;
  tricks: BalootTrick[];
  currentTrick: BalootTrickCard[];
  turnSeat: BalootSeat;
  phase: BalootPhase;
  handPoints: Record<BalootTeam, number> | null;
}

export interface BalootMatchState {
  version: 1;
  targetScore: number;
  matchScore: Record<BalootTeam, number>;
  hand: BalootHandState;
  status: 'playing' | 'player_team_won' | 'opponent_team_won';
  startedAt: number;
  updatedAt: number;
}

function firstBidderSeat(dealerSeat: BalootSeat): BalootSeat {
  return nextSeat(dealerSeat);
}

export function startBalootHand(handNumber: number, dealerSeat: BalootSeat, rng: () => number = Math.random): BalootHandState {
  return {
    handNumber,
    dealerSeat,
    hands: dealBalootHands(rng),
    bids: [],
    trumpSuit: null,
    mode: 'hokum',
    biddingTeam: null,
    bonuses: null,
    doubleLevel: 1,
    tricks: [],
    currentTrick: [],
    turnSeat: firstBidderSeat(dealerSeat),
    phase: 'bidding',
    handPoints: null,
  };
}

export function startBalootMatch(targetScore: number = 152, rng: () => number = Math.random): BalootMatchState {
  const now = Date.now();
  return {
    version: 1,
    targetScore,
    matchScore: { playerTeam: 0, opponentTeam: 0 },
    hand: startBalootHand(1, 'south', rng),
    status: 'playing',
    startedAt: now,
    updatedAt: now,
  };
}

/** هل تبقّى أي لاعب لم يُزايد بعد في هذا الدور؟ */
export function isBiddingComplete(hand: BalootHandState): boolean {
  return hand.trumpSuit !== null || hand.bids.length >= BALOOT_SEAT_ORDER.length;
}

/**
 * تسجيل مزايدة مقعد: choice = بذلة يعلن بها الحكم، أو 'sun' لإعلان صن
 * (بلا حكم إطلاقاً)، أو null للتمرير. إن أعلن أحد حكماً أو صن تنتهي
 * المزايدة فوراً وتبدأ نافذة المضاعفة (phase: 'doubling') قبل اللعب —
 * انظر canDeclareDouble/declareBalootDouble. إن مرّر الأربعة، يُجبر
 * الموزّع على إعلان الحكم في مزايدة تالية إضافية (forced: true) — الإجبار
 * حكم دوماً، لا صن (لا يوجد أساس منشور لإجبار الموزّع على صن تحديداً).
 */
export function applyBalootBid(hand: BalootHandState, seat: BalootSeat, choice: BalootBidChoice): BalootHandState {
  if (hand.phase !== 'bidding' || hand.turnSeat !== seat || hand.trumpSuit !== null) return hand;

  const isSun = choice === 'sun';
  const trumpSuit: BalootSuit | null = isSun ? null : choice;
  const bids = [...hand.bids, { seat, trumpSuit, ...(isSun ? { sun: true as const } : {}) }];

  if (choice !== null) {
    const leader = firstBidderSeat(hand.dealerSeat);
    return {
      ...hand,
      bids,
      trumpSuit,
      mode: isSun ? 'sun' : 'hokum',
      biddingTeam: BALOOT_SEAT_TEAM[seat],
      bonuses: computeBalootHandBonuses(hand.hands, trumpSuit),
      doubleLevel: 1,
      turnSeat: leader,
      phase: 'doubling',
    };
  }

  const allPassedSoFar = bids.length >= BALOOT_SEAT_ORDER.length;
  if (allPassedSoFar) {
    // الجميع مرّر — إجبار الموزّع على إعلان بذلة من أقوى بذلة في يده (منطق الإجبار في الحاسم).
    const forcedSuit = strongestSuitInHand(hand.hands[hand.dealerSeat]);
    const leader = firstBidderSeat(hand.dealerSeat);
    return {
      ...hand,
      bids: [...bids, { seat: hand.dealerSeat, trumpSuit: forcedSuit, forced: true }],
      trumpSuit: forcedSuit,
      mode: 'hokum',
      biddingTeam: BALOOT_SEAT_TEAM[hand.dealerSeat],
      bonuses: computeBalootHandBonuses(hand.hands, forcedSuit),
      doubleLevel: 1,
      turnSeat: leader,
      phase: 'doubling',
    };
  }

  return { ...hand, bids, turnSeat: nextSeat(seat) };
}

/** هل يحق لفريق الدفاع إعلان دبلة الآن (قبل أول ورقة، ولم تُعلَن دبلة بعد)؟ */
export function canDeclareDouble(hand: BalootHandState, seat: BalootSeat): boolean {
  return hand.phase === 'doubling' && hand.doubleLevel === 1 && hand.biddingTeam !== null && BALOOT_SEAT_TEAM[seat] !== hand.biddingTeam;
}

/** هل يحق لفريق المزايدة إعلان ريدبل الآن (بعد أن ضاعف فريق الدفاع بالفعل)؟ */
export function canDeclareRedouble(hand: BalootHandState, seat: BalootSeat): boolean {
  return hand.phase === 'doubling' && hand.doubleLevel === 2 && hand.biddingTeam !== null && BALOOT_SEAT_TEAM[seat] === hand.biddingTeam;
}

/** فريق الدفاع يضاعف رهان الشوط ×٢. لا ينهي نافذة المضاعفة — فريق المزايدة يملك حق الريدبل بعدها. */
export function declareBalootDouble(hand: BalootHandState, seat: BalootSeat): BalootHandState {
  if (!canDeclareDouble(hand, seat)) return hand;
  return { ...hand, doubleLevel: 2 };
}

/** فريق المزايدة يعيد مضاعفة الرهان ×٤ بعد دبلة الخصم — ينهي نافذة المضاعفة فوراً ويبدأ اللعب. */
export function declareBalootRedouble(hand: BalootHandState, seat: BalootSeat): BalootHandState {
  if (!canDeclareRedouble(hand, seat)) return hand;
  return { ...hand, doubleLevel: 4, phase: 'playing', turnSeat: firstBidderSeat(hand.dealerSeat) };
}

/** إنهاء نافذة المضاعفة بلا مزيد من التصعيد (تجاهل الطرف الآخر) — تبدأ اللعبة بالمضاعف الحالي كما هو. */
export function startBalootPlayAfterDoubling(hand: BalootHandState): BalootHandState {
  if (hand.phase !== 'doubling') return hand;
  return { ...hand, phase: 'playing', turnSeat: firstBidderSeat(hand.dealerSeat) };
}

/** قيمة أوراق مقعد ضمن بذلة معيّنة لو صارت هي الحكم — أساس تقييم قوة المزايدة. */
export function evaluateSuitAsTrump(cards: readonly BalootCard[], suit: BalootSuit): number {
  return cards.filter((c) => c.suit === suit).reduce((sum, c) => sum + TRUMP_RANK_VALUE[c.rank], 0);
}

function strongestSuitInHand(cards: readonly BalootCard[]): BalootSuit {
  let best: BalootSuit = 'hearts';
  let bestScore = -1;
  for (const suit of BALOOT_SUITS) {
    const score = evaluateSuitAsTrump(cards, suit);
    if (score > bestScore) {
      bestScore = score;
      best = suit;
    }
  }
  return best;
}

/** كل أوراق مقعد ضمن بذلة معيّنة، مرتّبة بالترتيب الطبيعي (لاكتشاف السرى). */
function suitCardsNaturalOrder(cards: readonly BalootCard[], suit: BalootSuit): BalootCard[] {
  return cards
    .filter((c) => c.suit === suit)
    .sort((a, b) => BALOOT_NATURAL_RANK_ORDER.indexOf(a.rank) - BALOOT_NATURAL_RANK_ORDER.indexOf(b.rank));
}

/** أطول تتابع متصل (٣ فأكثر) داخل بذلة واحدة للاعب — يُعاد أفضل تتابع واحد فقط. */
function longestSiraInSuit(cards: readonly BalootCard[], suit: BalootSuit): { length: number; topRankIndex: number } | null {
  const ordered = suitCardsNaturalOrder(cards, suit).map((c) => BALOOT_NATURAL_RANK_ORDER.indexOf(c.rank));
  let best: { length: number; topRankIndex: number } | null = null;
  let runStart = 0;
  for (let i = 1; i <= ordered.length; i += 1) {
    const brokeRun = i === ordered.length || ordered[i] !== ordered[i - 1] + 1;
    if (brokeRun) {
      const runLength = i - runStart;
      if (runLength >= 3 && (!best || runLength > best.length)) {
        best = { length: runLength, topRankIndex: ordered[i - 1] };
      }
      runStart = i;
    }
  }
  return best;
}

function siraPoints(length: number): number {
  if (length >= 5) return BALOOT_SIRA_BONUS_FIVE_PLUS;
  return BALOOT_SIRA_BONUS_BY_LENGTH[length] ?? 0;
}

/**
 * يحسب مكافآت السرى (الأقوى فقط على الطاولة) والبلوت (شايب+بيبي الحكم) عند
 * بداية الشوط. `trumpSuit = null` (وضع صن) يجعل بلوت مستحيلاً تلقائياً —
 * لا بذلة حكم إطلاقاً فلا معنى لامتلاك «شايب وبيبي الحكم» — بينما السرى
 * يبقى محتسباً بلا تغيير (لا يعتمد على وجود حكم أصلاً).
 */
export function computeBalootHandBonuses(
  hands: Record<BalootSeat, BalootCard[]>,
  trumpSuit: BalootSuit | null,
): BalootHandBonuses {
  let winningSira: BalootSiraResult | null = null;
  for (const seat of BALOOT_SEAT_ORDER) {
    for (const suit of BALOOT_SUITS) {
      const found = longestSiraInSuit(hands[seat], suit);
      if (!found) continue;
      const candidate: BalootSiraResult = {
        seat,
        suit,
        length: found.length,
        topRankIndex: found.topRankIndex,
        points: siraPoints(found.length),
      };
      if (
        !winningSira ||
        candidate.length > winningSira.length ||
        (candidate.length === winningSira.length && candidate.topRankIndex > winningSira.topRankIndex)
      ) {
        winningSira = candidate;
      }
    }
  }

  const balootSeats = BALOOT_SEAT_ORDER.filter((seat) => {
    const trumpCards = hands[seat].filter((c) => c.suit === trumpSuit).map((c) => c.rank);
    return trumpCards.includes('K') && trumpCards.includes('Q');
  });

  return { winningSira, balootSeats };
}

/**
 * فائز الشوط الفرعي — يعمل أيضاً على شوط غير مكتمل (لمعرفة من يتصدّر حالياً
 * أثناء اللعب). `trumpSuit = null` (صن) يجعل مقارنة `card.suit === trumpSuit`
 * خاطئة دوماً فلا تُختار أي ورقة كحكم — يفوز أعلى ورقة من بذلة الشوط المفتوح
 * فقط، بلا أي بذلة متفوّقة، بلا حاجة لفرع منطقي إضافي.
 */
export function trickWinnerSoFar(trick: readonly BalootTrickCard[], trumpSuit: BalootSuit | null): BalootSeat {
  return trickWinner(trick as BalootTrickCard[], trumpSuit);
}

function trickWinner(trick: BalootTrickCard[], trumpSuit: BalootSuit | null): BalootSeat {
  const ledSuit = trick[0].card.suit;
  const trumpsPlayed = trick.filter((t) => t.card.suit === trumpSuit);
  const pool = trumpsPlayed.length > 0 ? trumpsPlayed : trick.filter((t) => t.card.suit === ledSuit);
  let best = pool[0];
  for (const entry of pool.slice(1)) {
    const isTrumpSuit = entry.card.suit === trumpSuit;
    if (rankStrengthIndex(entry.card.rank, isTrumpSuit) > rankStrengthIndex(best.card.rank, isTrumpSuit)) {
      best = entry;
    }
  }
  return best.seat;
}

/** أوراق مقعد يمكنه لعبها الآن — يجب اللحاق بالبذلة المفتوحة إن أمكن. */
export function legalBalootMoves(hand: BalootHandState, seat: BalootSeat): BalootCard[] {
  const cards = hand.hands[seat];
  if (hand.currentTrick.length === 0) return cards;
  const ledSuit = hand.currentTrick[0].card.suit;
  const canFollow = cards.filter((c) => c.suit === ledSuit);
  return canFollow.length > 0 ? canFollow : cards;
}

/** يلعب ورقة لمقعد ما، ويغلق الشوط الفرعي (trick) تلقائياً عند اكتمال ٤ أوراق. */
export function playBalootCard(hand: BalootHandState, seat: BalootSeat, cardId: string): BalootHandState {
  // ملاحظة: لا نتحقق من `hand.trumpSuit` هنا — في وضع صن يبقى null طوال
  // الشوط عن قصد (لا بذلة حكم إطلاقاً)، فالتحقق الصحيح من «هل انتهت
  // المزايدة فعلاً؟» هو phase==='playing' مع biddingTeam مُحدَّد لا trumpSuit.
  if (hand.phase !== 'playing' || hand.turnSeat !== seat || !hand.biddingTeam) return hand;
  const legal = legalBalootMoves(hand, seat);
  const card = legal.find((c) => c.id === cardId);
  if (!card) return hand;

  const remainingHand = hand.hands[seat].filter((c) => c.id !== cardId);
  const nextHands = { ...hand.hands, [seat]: remainingHand };
  const currentTrick = [...hand.currentTrick, { seat, card }];

  if (currentTrick.length < BALOOT_SEAT_ORDER.length) {
    return { ...hand, hands: nextHands, currentTrick, turnSeat: nextSeat(seat) };
  }

  const winnerSeat = trickWinner(currentTrick, hand.trumpSuit);
  const closedTrick: BalootTrick = { leaderSeat: currentTrick[0].seat, cards: currentTrick, winnerSeat };
  const tricks = [...hand.tricks, closedTrick];
  const handComplete = tricks.length >= 8;

  if (!handComplete) {
    return { ...hand, hands: nextHands, tricks, currentTrick: [], turnSeat: winnerSeat };
  }

  const handPoints = scoreCompletedBalootHand({ ...hand, hands: nextHands, tricks, currentTrick: [] });
  return {
    ...hand,
    hands: nextHands,
    tricks,
    currentTrick: [],
    turnSeat: winnerSeat,
    phase: 'hand_scored',
    handPoints,
  };
}

/**
 * يحسب نقاط الفريقين النهائية لشوط مكتمل (٨ أشواط فرعية)، متضمّناً قاعدة
 * «الكبس» والمكافآت والمضاعفة (doubleLevel). لا نتحقق من `hand.trumpSuit`
 * هنا — يبقى null طوال شوط صن عن قصد؛ الفحص الصحيح لاكتمال المزايدة هو
 * `hand.biddingTeam`.
 */
export function scoreCompletedBalootHand(hand: BalootHandState): Record<BalootTeam, number> {
  if (!hand.biddingTeam || hand.tricks.length < 8) {
    return { playerTeam: 0, opponentTeam: 0 };
  }
  const multiplier = hand.doubleLevel ?? 1;

  const rawCardPoints: Record<BalootTeam, number> = { playerTeam: 0, opponentTeam: 0 };
  for (const trick of hand.tricks) {
    const team = BALOOT_SEAT_TEAM[trick.winnerSeat];
    const trickPoints = trick.cards.reduce((sum, entry) => sum + cardValue(entry.card, hand.trumpSuit), 0);
    rawCardPoints[team] += trickPoints;
  }

  const tricksWonByTeam: Record<BalootTeam, number> = { playerTeam: 0, opponentTeam: 0 };
  for (const trick of hand.tricks) {
    tricksWonByTeam[BALOOT_SEAT_TEAM[trick.winnerSeat]] += 1;
  }
  const kabootTeam: BalootTeam | null =
    tricksWonByTeam.playerTeam === 8 ? 'playerTeam' : tricksWonByTeam.opponentTeam === 8 ? 'opponentTeam' : null;

  const bonusPoints: Record<BalootTeam, number> = { playerTeam: 0, opponentTeam: 0 };
  if (hand.bonuses?.winningSira) {
    bonusPoints[BALOOT_SEAT_TEAM[hand.bonuses.winningSira.seat]] += hand.bonuses.winningSira.points;
  }
  for (const seat of hand.bonuses?.balootSeats ?? []) {
    bonusPoints[BALOOT_SEAT_TEAM[seat]] += BALOOT_BALOOT_BONUS_POINTS;
  }
  if (kabootTeam) {
    bonusPoints[kabootTeam] += BALOOT_KABOOT_BONUS_POINTS;
  }

  const total: Record<BalootTeam, number> = {
    playerTeam: rawCardPoints.playerTeam + bonusPoints.playerTeam,
    opponentTeam: rawCardPoints.opponentTeam + bonusPoints.opponentTeam,
  };

  const biddingTeam = hand.biddingTeam;
  const defendingTeam = otherTeam(biddingTeam);
  // ملاحظة: المضاعفة (multiplier) تُطبَّق على الناتج النهائي فقط — لا تدخل
  // مقارنة الكبس نفسها، فمن حقق النقاط الأعلى فعلياً لا يتغيّر بمضاعفة الرهان.
  if (total[biddingTeam] <= total[defendingTeam]) {
    // «كبس»: فريق المزايدة لم يحقق الأغلبية — يخسر شوطه كاملاً لصالح الخصم.
    const handTotal = (total.playerTeam + total.opponentTeam) * multiplier;
    return { [biddingTeam]: 0, [defendingTeam]: handTotal } as Record<BalootTeam, number>;
  }

  return {
    playerTeam: total.playerTeam * multiplier,
    opponentTeam: total.opponentTeam * multiplier,
  };
}

export function applyHandScoreToMatch(match: BalootMatchState): BalootMatchState {
  if (!match.hand.handPoints) return match;
  const matchScore: Record<BalootTeam, number> = {
    playerTeam: match.matchScore.playerTeam + match.hand.handPoints.playerTeam,
    opponentTeam: match.matchScore.opponentTeam + match.hand.handPoints.opponentTeam,
  };
  const status: BalootMatchState['status'] =
    matchScore.playerTeam >= match.targetScore && matchScore.playerTeam > matchScore.opponentTeam
      ? 'player_team_won'
      : matchScore.opponentTeam >= match.targetScore && matchScore.opponentTeam > matchScore.playerTeam
        ? 'opponent_team_won'
        : 'playing';
  return { ...match, matchScore, status, updatedAt: Date.now() };
}

export function startNextBalootHand(match: BalootMatchState, rng: () => number = Math.random): BalootMatchState {
  if (match.status !== 'playing') return match;
  const nextDealer = nextSeat(match.hand.dealerSeat);
  return {
    ...match,
    hand: startBalootHand(match.hand.handNumber + 1, nextDealer, rng),
    updatedAt: Date.now(),
  };
}
