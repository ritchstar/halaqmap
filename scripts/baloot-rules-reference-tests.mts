/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مجموعة اختبارات مرجعية ثابتة لمحرك قواعد بلوت (`src/lib/balootEngine.ts`) —
 * كل حالة هنا مدخل ثابت مصمَّم يدوياً + نتيجة متوقعة معتمدة، لا محاكاة
 * عشوائية. الهدف: حماية أي تعديل مستقبلي على المحرك من كسر قاعدة صحيحة
 * دون ملاحظة فورية. يكمّل محاكاة الـ٥٠٠ مباراة العشوائية (التي تثبت سلامة
 * تدفق المحرك) لا يحل محلها.
 *
 * القواعد المُختبَرة هنا موثّقة رسمياً في docs/baloot-rules-v1.md —
 * أي تغيير في نتيجة متوقعة هنا يجب أن يقابله تحديث في تلك الوثيقة أيضاً.
 *
 * التشغيل: npx tsx scripts/baloot-rules-reference-tests.mts
 * ينجح بخروج 0 وطباعة "كل الاختبارات المرجعية نجحت"، أو يفشل بخروج 1 مع
 * تفصيل أول حالة فاشلة.
 */
import {
  applyBalootBid,
  applyHandScoreToMatch,
  BALOOT_BALOOT_BONUS_POINTS,
  BALOOT_HAND_CARD_POINTS_TOTAL,
  BALOOT_KABOOT_BONUS_POINTS,
  BALOOT_NATURAL_RANK_ORDER,
  BALOOT_SIRA_BONUS_BY_LENGTH,
  BALOOT_SIRA_BONUS_FIVE_PLUS,
  buildBalootDeck,
  cardStrengthIndex,
  cardValue,
  computeBalootHandBonuses,
  isBiddingComplete,
  legalBalootMoves,
  scoreCompletedBalootHand,
  trickWinnerSoFar,
  type BalootCard,
  type BalootHandState,
  type BalootMatchState,
  type BalootRank,
  type BalootSeat,
  type BalootSuit,
  type BalootTrick,
  type BalootTrickCard,
} from '../src/lib/balootEngine.js';

let passCount = 0;
let failCount = 0;
let currentGroup = '';

function group(name: string, fn: () => void): void {
  currentGroup = name;
  fn();
}

function ok(label: string, condition: boolean, detail?: unknown): void {
  if (condition) {
    passCount += 1;
    console.log(`  ✅ ${label}`);
    return;
  }
  failCount += 1;
  console.error(`  ❌ [${currentGroup}] ${label}`);
  if (detail !== undefined) console.error('     detail:', JSON.stringify(detail));
}

function eq<T>(label: string, actual: T, expected: T): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  ok(label, pass, pass ? undefined : { actual, expected });
}

function card(id: string, suit: BalootSuit, rank: BalootRank): BalootCard {
  return { id, suit, rank };
}

function emptyHands(): Record<BalootSeat, BalootCard[]> {
  return { south: [], west: [], north: [], east: [] };
}

// ───────────────────────────────────────────────────────────────────────────
group('١) ترتيب الورق وقيمها — حكم مقابل عادي، لكل رتبة', () => {
  const TRUMP_EXPECTED_ORDER: readonly BalootRank[] = ['7', '8', 'Q', 'K', '10', 'A', '9', 'J'];
  const TRUMP_EXPECTED_VALUE: Record<BalootRank, number> = {
    '7': 0, '8': 0, Q: 3, K: 4, '10': 10, A: 11, '9': 14, J: 20,
  };
  const PLAIN_EXPECTED_ORDER: readonly BalootRank[] = ['7', '8', '9', 'J', 'Q', 'K', '10', 'A'];
  const PLAIN_EXPECTED_VALUE: Record<BalootRank, number> = {
    '7': 0, '8': 0, '9': 0, J: 2, Q: 3, K: 4, '10': 10, A: 11,
  };
  const trumpSuit: BalootSuit = 'hearts';

  for (const rank of BALOOT_NATURAL_RANK_ORDER) {
    const trumpCard = card(`hearts-${rank}`, 'hearts', rank);
    eq(`قوة ${rank} كحكم = الفهرس ${TRUMP_EXPECTED_ORDER.indexOf(rank)}`, cardStrengthIndex(trumpCard, trumpSuit), TRUMP_EXPECTED_ORDER.indexOf(rank));
    eq(`قيمة ${rank} كحكم = ${TRUMP_EXPECTED_VALUE[rank]}`, cardValue(trumpCard, trumpSuit), TRUMP_EXPECTED_VALUE[rank]);

    const plainCard = card(`clubs-${rank}`, 'clubs', rank);
    eq(`قوة ${rank} في بذلة عادية = الفهرس ${PLAIN_EXPECTED_ORDER.indexOf(rank)}`, cardStrengthIndex(plainCard, trumpSuit), PLAIN_EXPECTED_ORDER.indexOf(rank));
    eq(`قيمة ${rank} في بذلة عادية = ${PLAIN_EXPECTED_VALUE[rank]}`, cardValue(plainCard, trumpSuit), PLAIN_EXPECTED_VALUE[rank]);
  }

  const trumpSuitTotal = BALOOT_NATURAL_RANK_ORDER.reduce((sum, r) => sum + cardValue(card(`h-${r}`, 'hearts', r), 'hearts'), 0);
  eq('مجموع بذلة الحكم الواحدة = ٦٢', trumpSuitTotal, 62);
  const plainSuitTotal = BALOOT_NATURAL_RANK_ORDER.reduce((sum, r) => sum + cardValue(card(`c-${r}`, 'clubs', r), 'hearts'), 0);
  eq('مجموع بذلة عادية واحدة = ٣٠', plainSuitTotal, 30);

  const fullDeckTotal = buildBalootDeck().reduce((sum, c) => sum + cardValue(c, 'hearts'), 0);
  eq('مجموع الأوراق الـ٣٢ كاملة (حكم قلوب) = ١٥٢', fullDeckTotal, BALOOT_HAND_CARD_POINTS_TOTAL);
});

// ───────────────────────────────────────────────────────────────────────────
group('٢) وجوب اتباع النوع (Follow Suit)', () => {
  const baseHand: BalootHandState = {
    handNumber: 1,
    dealerSeat: 'south',
    hands: {
      south: [card('c7', 'clubs', '7')],
      west: [card('c9', 'clubs', '9'), card('hK', 'hearts', 'K'), card('sJ', 'spades', 'J')],
      north: [],
      east: [],
    },
    bids: [],
    trumpSuit: 'spades',
    biddingTeam: 'playerTeam',
    bonuses: null,
    tricks: [],
    currentTrick: [{ seat: 'south', card: card('cLead', 'clubs', 'K') }],
    turnSeat: 'west',
    phase: 'playing',
    handPoints: null,
  };

  const legalWhenHasSuit = legalBalootMoves(baseHand, 'west');
  eq('يملك أوراق كلوب — يجب اللحاق: يُسمح بورقة الكلوب فقط', legalWhenHasSuit.map((c) => c.id), ['c9']);

  const handNoSuit: BalootHandState = {
    ...baseHand,
    hands: { ...baseHand.hands, west: [card('hK', 'hearts', 'K'), card('sJ', 'spades', 'J')] },
  };
  const legalWhenNoSuit = legalBalootMoves(handNoSuit, 'west');
  eq('لا يملك كلوب — حرّ في اللعب بأي ورقة (تشمل الحكم)', legalWhenNoSuit.map((c) => c.id).sort(), ['hK', 'sJ'].sort());
});

// ───────────────────────────────────────────────────────────────────────────
group('٣) فائز الشوط الفرعي — القص بالحكم', () => {
  const trumpSuit: BalootSuit = 'spades';

  const trickNoTrumpPlayed: BalootTrickCard[] = [
    { seat: 'south', card: card('t1', 'hearts', 'K') },
    { seat: 'west', card: card('t2', 'hearts', 'A') },
    { seat: 'north', card: card('t3', 'hearts', '7') },
    { seat: 'east', card: card('t4', 'hearts', '10') },
  ];
  eq('بلا حكم: يفوز أعلى ورقة من البذلة المفتوحة (الآص)', trickWinnerSoFar(trickNoTrumpPlayed, trumpSuit), 'west');

  const trickWeakestTrumpBeatsStrongPlain: BalootTrickCard[] = [
    { seat: 'south', card: card('t1', 'clubs', 'K') },
    { seat: 'west', card: card('t2', 'clubs', 'A') },
    { seat: 'north', card: card('t3', 'spades', '7') }, // أضعف حكم ممكن
    { seat: 'east', card: card('t4', 'clubs', '10') },
  ];
  eq('أضعف حكم (٧) يتفوّق على أقوى ورقة عادية (آص) دوماً', trickWinnerSoFar(trickWeakestTrumpBeatsStrongPlain, trumpSuit), 'north');

  const trickMultipleTrumps: BalootTrickCard[] = [
    { seat: 'south', card: card('t1', 'clubs', '7') },
    { seat: 'west', card: card('t2', 'spades', '7') }, // حكم ضعيف
    { seat: 'north', card: card('t3', 'spades', 'J') }, // حكم الأقوى إطلاقاً
    { seat: 'east', card: card('t4', 'clubs', 'A') },
  ];
  eq('تعدد الحكم في نفس الشوط: يفوز أقوى حكم (جاك) لا أقوى بذلة أخرى', trickWinnerSoFar(trickMultipleTrumps, trumpSuit), 'north');
});

// ───────────────────────────────────────────────────────────────────────────
group('٤) السرى والبلوت', () => {
  const hands: Record<BalootSeat, BalootCard[]> = {
    south: [card('s7', 'spades', '7'), card('s8', 'spades', '8'), card('s9', 'spades', '9')], // سرى ٣
    west: [card('h7', 'hearts', '7'), card('h8', 'hearts', '8'), card('h9', 'hearts', '9'), card('h10', 'hearts', '10')], // سرى ٤ (حكم)
    north: [card('hK', 'hearts', 'K'), card('hQ', 'hearts', 'Q')], // بلوت (شايب+كوز الحكم)
    east: [],
  };
  const bonuses = computeBalootHandBonuses(hands, 'hearts');

  eq('سرى الطاولة الأقوى هو الأربعة أوراق (west) لا الثلاثة (south)', bonuses.winningSira?.seat, 'west');
  eq('طول السرى الفائز = ٤', bonuses.winningSira?.length, 4);
  eq(`نقاط سرى الأربعة = ${BALOOT_SIRA_BONUS_BY_LENGTH[4]}`, bonuses.winningSira?.points, BALOOT_SIRA_BONUS_BY_LENGTH[4]);
  eq('north يملك بلوت (شايب+كوز الحكم معاً)', bonuses.balootSeats, ['north']);

  // سرى ٥ فأكثر يُحتسب بقيمة ثابتة BALOOT_SIRA_BONUS_FIVE_PLUS
  const fiveSiraHands: Record<BalootSeat, BalootCard[]> = {
    south: [
      card('d7', 'diamonds', '7'), card('d8', 'diamonds', '8'), card('d9', 'diamonds', '9'),
      card('d10', 'diamonds', '10'), card('dJ', 'diamonds', 'J'),
    ],
    west: [], north: [], east: [],
  };
  const fiveBonus = computeBalootHandBonuses(fiveSiraHands, 'clubs');
  eq(`سرى الخمسة يُحتسب ${BALOOT_SIRA_BONUS_FIVE_PLUS} بالضبط`, fiveBonus.winningSira?.points, BALOOT_SIRA_BONUS_FIVE_PLUS);
});

// ───────────────────────────────────────────────────────────────────────────
group('٥) الكبّوت والكبس واحتساب المكافآت داخل نقاط الشوط', () => {
  function fourFillerCards(mainSuit: BalootSuit, mainRank: BalootRank): BalootTrickCard[] {
    return [
      { seat: 'south', card: card('m', mainSuit, mainRank) },
      { seat: 'west', card: card('f1', 'clubs', '7') },
      { seat: 'north', card: card('f2', 'clubs', '7') },
      { seat: 'east', card: card('f3', 'clubs', '7') },
    ];
  }

  // كبّوت: فريق واحد يفوز بكل الأشواط الثمانية — بلا مكافآت أخرى هنا.
  const kabootTricks: BalootTrick[] = Array.from({ length: 8 }, (_, i) => ({
    leaderSeat: 'south' as BalootSeat,
    cards: fourFillerCards('spades', '7'), // كل الأوراق بقيمة صفر (٧ حكم أو عادي = صفر)
    winnerSeat: 'south' as BalootSeat,
  }));
  const kabootHand: BalootHandState = {
    handNumber: 1, dealerSeat: 'south', hands: emptyHands(), bids: [],
    trumpSuit: 'spades', biddingTeam: 'playerTeam',
    bonuses: { winningSira: null, balootSeats: [] },
    tricks: kabootTricks, currentTrick: [], turnSeat: 'south', phase: 'hand_scored', handPoints: null,
  };
  eq(
    `كبّوت فقط (بلا نقاط أوراق): playerTeam=${BALOOT_KABOOT_BONUS_POINTS}, opponentTeam=0`,
    scoreCompletedBalootHand(kabootHand),
    { playerTeam: BALOOT_KABOOT_BONUS_POINTS, opponentTeam: 0 },
  );

  // سرى + بلوت لفريق المزايدة، بلا كبس (فريق المزايدة أعلى من الخصم بعد المكافآت).
  // نبني يدوياً بقيم دقيقة كي تبقى الأرقام قابلة للتحقق بسهولة:
  const preciseBonusTricks: BalootTrick[] = [
    { leaderSeat: 'south', cards: fourFillerCards('spades', 'K'), winnerSeat: 'south' }, // 4 (حكم K)
    { leaderSeat: 'south', cards: fourFillerCards('spades', 'A'), winnerSeat: 'south' }, // 11 (حكم A)
    { leaderSeat: 'south', cards: fourFillerCards('spades', '10'), winnerSeat: 'south' }, // 10 (حكم 10)
    { leaderSeat: 'south', cards: fourFillerCards('spades', '9'), winnerSeat: 'south' }, // 14 (حكم 9) → مجموع playerTeam الخام = 39
    { leaderSeat: 'west', cards: fourFillerCards('clubs', 'A'), winnerSeat: 'west' }, // 11
    { leaderSeat: 'west', cards: fourFillerCards('clubs', '10'), winnerSeat: 'west' }, // 10 → مجموع opponentTeam الخام = 21
    { leaderSeat: 'west', cards: fourFillerCards('clubs', '7'), winnerSeat: 'west' }, // 0
    { leaderSeat: 'west', cards: fourFillerCards('clubs', '7'), winnerSeat: 'west' }, // 0
  ];
  const bonusHand: BalootHandState = {
    handNumber: 1, dealerSeat: 'south', hands: emptyHands(), bids: [],
    trumpSuit: 'spades', biddingTeam: 'playerTeam',
    bonuses: {
      winningSira: { seat: 'south', suit: 'hearts', length: 3, topRankIndex: BALOOT_NATURAL_RANK_ORDER.indexOf('9'), points: BALOOT_SIRA_BONUS_BY_LENGTH[3] },
      balootSeats: ['north'],
    },
    tricks: preciseBonusTricks, currentTrick: [], turnSeat: 'south', phase: 'hand_scored', handPoints: null,
  };
  // playerTeam: خام 39 + سرى ٢٠ + بلوت ٢٠ = ٧٩. opponentTeam: خام ٢١ + صفر = ٢١. ٧٩ > ٢١ فلا كبس.
  eq(
    'سرى + بلوت يُضافان لفريق المزايدة، ولا كبس لأنه متفوّق أصلاً',
    scoreCompletedBalootHand(bonusHand),
    { playerTeam: 39 + BALOOT_SIRA_BONUS_BY_LENGTH[3] + BALOOT_BALOOT_BONUS_POINTS, opponentTeam: 21 },
  );

  // كبس: فريق المزايدة لا يتفوّق على الخصم — يخسر كل شيء لصالح الخصم.
  const kabsTricks: BalootTrick[] = [
    { leaderSeat: 'south', cards: fourFillerCards('spades', 'K'), winnerSeat: 'south' }, // 4
    { leaderSeat: 'south', cards: fourFillerCards('clubs', '7'), winnerSeat: 'south' }, // 0
    { leaderSeat: 'south', cards: fourFillerCards('clubs', '7'), winnerSeat: 'south' }, // 0
    { leaderSeat: 'south', cards: fourFillerCards('clubs', '7'), winnerSeat: 'south' }, // 0 → playerTeam خام = 4
    { leaderSeat: 'west', cards: fourFillerCards('hearts', 'A'), winnerSeat: 'west' }, // 11
    { leaderSeat: 'west', cards: fourFillerCards('hearts', '10'), winnerSeat: 'west' }, // 10
    { leaderSeat: 'west', cards: fourFillerCards('hearts', 'K'), winnerSeat: 'west' }, // 4
    { leaderSeat: 'west', cards: fourFillerCards('hearts', 'Q'), winnerSeat: 'west' }, // 3 → opponentTeam خام = 28
  ];
  const kabsHand: BalootHandState = {
    handNumber: 1, dealerSeat: 'south', hands: emptyHands(), bids: [],
    trumpSuit: 'spades', biddingTeam: 'playerTeam',
    bonuses: { winningSira: null, balootSeats: [] },
    tricks: kabsTricks, currentTrick: [], turnSeat: 'south', phase: 'hand_scored', handPoints: null,
  };
  // playerTeam خام=4 <= opponentTeam خام=28 → كبس: playerTeam=0, opponentTeam=4+28=32.
  eq('كبس: فريق المزايدة يخسر كل شيء، والخصم يأخذ مجموع الشوط كاملاً (٤+٢٨=٣٢)', scoreCompletedBalootHand(kabsHand), { playerTeam: 0, opponentTeam: 32 });
});

// ───────────────────────────────────────────────────────────────────────────
group('٦) تمرير الجميع وإجبار الموزّع', () => {
  const hands: Record<BalootSeat, BalootCard[]> = {
    south: [card('sJ', 'spades', 'J'), card('hK', 'hearts', 'K'), card('hQ', 'hearts', 'Q')], // spades كأقوى بذلة لو صارت حكم (٢٠) مقابل hearts (٤+٣=٧)
    west: [], north: [], east: [],
  };
  let hand: BalootHandState = {
    handNumber: 1, dealerSeat: 'south', hands, bids: [],
    trumpSuit: null, biddingTeam: null, bonuses: null,
    tricks: [], currentTrick: [], turnSeat: 'west', phase: 'bidding', handPoints: null,
  };

  hand = applyBalootBid(hand, 'west', null);
  hand = applyBalootBid(hand, 'north', null);
  hand = applyBalootBid(hand, 'east', null);
  ok('قبل مزايدة الموزّع الأخيرة: المزايدة لم تكتمل بعد', !isBiddingComplete(hand));

  hand = applyBalootBid(hand, 'south', null); // الموزّع نفسه يمرّر أيضاً → إجبار تلقائي
  ok('بعد تمرير الجميع بمن فيهم الموزّع: المزايدة اكتملت (إجبار)', isBiddingComplete(hand));
  eq('البذلة المُجبَرة = الأقوى في يد الموزّع (سبيد، ٢٠ > هارت ٧)', hand.trumpSuit, 'spades');
  eq('فريق المزايدة = فريق الموزّع (south → playerTeam)', hand.biddingTeam, 'playerTeam');
  eq('آخر مزايدة مُعلَّمة forced:true لمقعد الموزّع', hand.bids[hand.bids.length - 1], { seat: 'south', trumpSuit: 'spades', forced: true });
  eq('الطور بعد الإجبار = playing', hand.phase, 'playing');
});

// ───────────────────────────────────────────────────────────────────────────
group('٧) تراكم نقاط المباراة وتحديد الفائز', () => {
  function matchWith(playerTeam: number, opponentTeam: number, handPoints: Record<'playerTeam' | 'opponentTeam', number>): BalootMatchState {
    return {
      version: 1, targetScore: 152, matchScore: { playerTeam, opponentTeam },
      hand: {
        handNumber: 1, dealerSeat: 'south', hands: emptyHands(), bids: [], trumpSuit: 'spades',
        biddingTeam: 'playerTeam', bonuses: null, tricks: [], currentTrick: [], turnSeat: 'south',
        phase: 'hand_scored', handPoints,
      },
      status: 'playing', startedAt: 0, updatedAt: 0,
    };
  }

  const win = applyHandScoreToMatch(matchWith(140, 100, { playerTeam: 20, opponentTeam: 0 }));
  eq('١٦٠ ≥ الهدف و> الخصم → playerTeam يفوز', win.status, 'player_team_won');

  const notYet = applyHandScoreToMatch(matchWith(100, 90, { playerTeam: 20, opponentTeam: 0 }));
  eq('١٢٠ لم يبلغ الهدف بعد → المباراة مستمرة', notYet.status, 'playing');

  const oppWin = applyHandScoreToMatch(matchWith(90, 140, { playerTeam: 0, opponentTeam: 20 }));
  eq('opponentTeam يبلغ الهدف ويتفوّق → opponentTeam يفوز', oppWin.status, 'opponent_team_won');

  const tie = applyHandScoreToMatch(matchWith(150, 150, { playerTeam: 2, opponentTeam: 2 }));
  eq('تعادل عند بلوغ الهدف معاً → لا فائز بعد، المباراة مستمرة', tie.status, 'playing');
});

// ───────────────────────────────────────────────────────────────────────────
console.log('');
console.log(`النتيجة: ${passCount} نجحت، ${failCount} فشلت.`);
if (failCount > 0) {
  console.error('❌ توجد اختبارات مرجعية فاشلة — راجع التفاصيل أعلاه قبل قبول أي تعديل على balootEngine.ts.');
  process.exit(1);
}
console.log('✅ كل الاختبارات المرجعية نجحت.');
