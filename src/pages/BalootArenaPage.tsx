/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة بلوت — لعب حكم أو صن، فريق حقيقي ٢ ضد ٢ (اللاعب وشريك آلي مقابل
 * خصمين آليين) ضد بوتات قاعدية، مع دبلة وريدبل، مجاني بالكامل، بجلسة
 * محفوظة محلياً. اللعب الحقيقي مع الأصدقاء لم يُطبَّق بعد — انظر التعليق
 * أعلى balootEngine.ts.
 * Route: /baloot
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, GraduationCap, RefreshCcw } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BALOOT_ARENA_COPY, BALOOT_MATCH_TARGET_SCORE, BALOOT_SEAT_LABELS_AR, BALOOT_SUIT_LABELS_AR, BALOOT_SUIT_SYMBOLS } from '@/config/balootArena';
import {
  applyBalootBid,
  applyHandScoreToMatch,
  BALOOT_SEAT_TEAM,
  canDeclareDouble,
  canDeclareRedouble,
  declareBalootDouble,
  declareBalootRedouble,
  legalBalootMoves,
  playBalootCard,
  startBalootMatch,
  startBalootPlayAfterDoubling,
  startNextBalootHand,
  type BalootBidChoice,
  type BalootMatchState,
  type BalootSeat,
  type BalootSuit,
} from '@/lib/balootEngine';
import { chooseBalootBotBid, chooseBalootBotCard, shouldBalootBotDouble, shouldBalootBotRedouble } from '@/lib/balootBotAi';
import { clearBalootSession, readBalootSession, writeBalootSession } from '@/lib/balootSessionLab';
import { BalootCardFace } from '@/components/baloot/BalootCardFace';
import { BalootHandFan } from '@/components/baloot/BalootHandFan';
import { BalootBiddingPanel } from '@/components/baloot/BalootBiddingPanel';
import { BalootDoublingPanel } from '@/components/baloot/BalootDoublingPanel';
import { BalootScoreboard } from '@/components/baloot/BalootScoreboard';

type BalootArenaView = 'landing' | 'playing';

const BOT_SEATS: readonly BalootSeat[] = ['west', 'north', 'east'];
const BOT_MOVE_DELAY_MS = 700;
const HAND_SCORED_PAUSE_MS = 2200;

export default function BalootArenaPage() {
  useDocumentTitle(BALOOT_ARENA_COPY.documentTitle);
  const navigate = useNavigate();

  const [view, setView] = useState<BalootArenaView>('landing');
  const [match, setMatch] = useState<BalootMatchState | null>(null);
  const [resumableMatch, setResumableMatch] = useState<BalootMatchState | null>(null);
  const botTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setResumableMatch(readBalootSession());
    return () => {
      if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
    };
  }, []);

  function persist(next: BalootMatchState) {
    setMatch(next);
    writeBalootSession(next);
  }

  function beginNewMatch() {
    if (match && match.status === 'playing' && typeof window !== 'undefined') {
      if (!window.confirm(BALOOT_ARENA_COPY.confirmNewMatchWhilePlayingAr)) return;
    }
    clearBalootSession();
    const fresh = startBalootMatch(BALOOT_MATCH_TARGET_SCORE);
    setResumableMatch(null);
    setView('playing');
    persist(fresh);
  }

  function resumeMatch() {
    if (!resumableMatch) return;
    setView('playing');
    setMatch(resumableMatch);
  }

  // محرك دوران البوتات: كلما كان الدور لمقعد آلي (مزايدة أو لعب ورقة)، ننفّذ
  // قراره بعد تأخير قصير لواقعية بصرية، بمؤقّت واحد يُنظَّف عند كل تغيّر حالة.
  useEffect(() => {
    if (view !== 'playing' || !match || match.status !== 'playing') return;
    const hand = match.hand;

    if (hand.phase === 'hand_scored') {
      botTimerRef.current = window.setTimeout(() => {
        const scored = applyHandScoreToMatch(match);
        if (scored.status !== 'playing') {
          persist(scored);
          return;
        }
        persist(startNextBalootHand(scored));
      }, HAND_SCORED_PAUSE_MS);
      return () => {
        if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
      };
    }

    // نافذة المضاعفة قرار على مستوى الفريق لا المقعد: نتحقق فقط حين يكون
    // القرار بأكمله لفريق البوتات (لا يشمل south إطلاقاً) — غير ذلك يبقى
    // القرار للاعب عبر BalootDoublingPanel بلا أي فعل تلقائي هنا.
    if (hand.phase === 'doubling') {
      const southOnBiddingTeam = hand.biddingTeam !== null && BALOOT_SEAT_TEAM.south === hand.biddingTeam;

      if (hand.doubleLevel === 1 && southOnBiddingTeam) {
        botTimerRef.current = window.setTimeout(() => {
          const defenders = BOT_SEATS.filter((s) => BALOOT_SEAT_TEAM[s] !== hand.biddingTeam);
          const willDouble = defenders.some((s) => shouldBalootBotDouble(hand.hands[s], hand.trumpSuit));
          const nextHand = willDouble ? declareBalootDouble(hand, defenders[0]) : startBalootPlayAfterDoubling(hand);
          persist({ ...match, hand: nextHand, updatedAt: Date.now() });
        }, BOT_MOVE_DELAY_MS);
        return () => {
          if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
        };
      }

      if (hand.doubleLevel === 2 && !southOnBiddingTeam) {
        botTimerRef.current = window.setTimeout(() => {
          const bidders = BOT_SEATS.filter((s) => BALOOT_SEAT_TEAM[s] === hand.biddingTeam);
          const willRedouble = bidders.some((s) => shouldBalootBotRedouble(hand.hands[s], hand.trumpSuit));
          const nextHand = willRedouble ? declareBalootRedouble(hand, bidders[0]) : startBalootPlayAfterDoubling(hand);
          persist({ ...match, hand: nextHand, updatedAt: Date.now() });
        }, BOT_MOVE_DELAY_MS);
        return () => {
          if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
        };
      }

      return;
    }

    const isBotTurn = BOT_SEATS.includes(hand.turnSeat) && (hand.phase === 'bidding' || hand.phase === 'playing');
    if (!isBotTurn) return;

    botTimerRef.current = window.setTimeout(() => {
      if (hand.phase === 'bidding') {
        const choice = chooseBalootBotBid(hand.hands[hand.turnSeat]);
        persist({ ...match, hand: applyBalootBid(hand, hand.turnSeat, choice), updatedAt: Date.now() });
        return;
      }
      const cardId = chooseBalootBotCard(hand, hand.turnSeat);
      persist({ ...match, hand: playBalootCard(hand, hand.turnSeat, cardId), updatedAt: Date.now() });
    }, BOT_MOVE_DELAY_MS);

    return () => {
      if (botTimerRef.current !== null) window.clearTimeout(botTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, match?.hand.turnSeat, match?.hand.phase, match?.hand.currentTrick.length, match?.hand.doubleLevel, match?.status]);

  function handlePlayerBid(choice: Exclude<BalootBidChoice, null>) {
    if (!match || match.hand.turnSeat !== 'south' || match.hand.phase !== 'bidding') return;
    persist({ ...match, hand: applyBalootBid(match.hand, 'south', choice), updatedAt: Date.now() });
  }

  function handlePass() {
    if (!match || match.hand.turnSeat !== 'south' || match.hand.phase !== 'bidding') return;
    persist({ ...match, hand: applyBalootBid(match.hand, 'south', null), updatedAt: Date.now() });
  }

  function handlePlayerCard(cardId: string) {
    if (!match || match.hand.turnSeat !== 'south' || match.hand.phase !== 'playing') return;
    persist({ ...match, hand: playBalootCard(match.hand, 'south', cardId), updatedAt: Date.now() });
  }

  function handlePlayerDouble() {
    if (!match || !canDeclareDouble(match.hand, 'south')) return;
    persist({ ...match, hand: declareBalootDouble(match.hand, 'south'), updatedAt: Date.now() });
  }

  function handlePlayerRedouble() {
    if (!match || !canDeclareRedouble(match.hand, 'south')) return;
    persist({ ...match, hand: declareBalootRedouble(match.hand, 'south'), updatedAt: Date.now() });
  }

  function handleSkipDoubling() {
    if (!match || match.hand.phase !== 'doubling') return;
    persist({ ...match, hand: startBalootPlayAfterDoubling(match.hand), updatedAt: Date.now() });
  }

  if (view === 'landing') {
    return (
      <div dir="rtl" className="min-h-screen" style={{ background: 'linear-gradient(180deg, #05141a 0%, #0a1f26 100%)' }}>
        <div className="sticky top-0 z-30 border-b border-[#1f4a52] bg-[#05141a]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.HOME)}
              className="flex items-center gap-2 text-sm font-bold text-[#8aa6a8] transition-colors hover:text-[#e7f4f2]"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              {BALOOT_ARENA_COPY.backHomeAr}
            </button>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#d8ac52]" />
              <span className="text-sm font-black text-[#e7f4f2]">{BALOOT_ARENA_COPY.heroBadgeAr}</span>
            </div>
            <span className="h-8 w-8" />
          </div>
        </div>

        <main className="w-full px-4 pb-16 pt-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d8ac52]/40 bg-[#d8ac52]/10">
                <Crown className="h-7 w-7 text-[#d8ac52]" />
              </div>
              <h1 className="text-2xl font-black text-[#e7f4f2] sm:text-3xl">{BALOOT_ARENA_COPY.heroTitleAr}</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#8aa6a8] sm:text-base">
                {BALOOT_ARENA_COPY.heroSubtitleAr}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-xs text-[#d8ac52]/70">{BALOOT_ARENA_COPY.heroNoteAr}</p>
            </header>

            {resumableMatch && resumableMatch.status === 'playing' && (
              <div className="mb-8 rounded-2xl border-2 border-[#d8ac52] bg-[#d8ac52]/10 p-4 text-center shadow-[0_0_24px_rgba(216,172,82,0.12)]">
                <p className="mb-3 text-sm font-black text-[#e7f4f2]">{BALOOT_ARENA_COPY.resumeBannerAr}</p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={resumeMatch}
                    className="rounded-full bg-[#d8ac52] px-5 py-2.5 text-sm font-bold text-[#061018]"
                  >
                    {BALOOT_ARENA_COPY.resumeMatchAr}
                  </button>
                  <button
                    type="button"
                    onClick={beginNewMatch}
                    className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/85"
                  >
                    {BALOOT_ARENA_COPY.newMatchAr}
                  </button>
                </div>
              </div>
            )}

            {!resumableMatch && (
              <div className="mb-8 text-center">
                <button
                  type="button"
                  onClick={beginNewMatch}
                  className="rounded-full bg-[#d8ac52] px-8 py-3 text-base font-black text-[#061018]"
                >
                  {BALOOT_ARENA_COPY.startMatchAr}
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
              <p className="text-sm font-black text-[#d8ac52]">
                {BALOOT_ARENA_COPY.comingSoonBadgeAr} — {BALOOT_ARENA_COPY.comingSoonTitleAr}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#8aa6a8]">{BALOOT_ARENA_COPY.comingSoonBodyAr}</p>
            </div>

            <div className="mx-auto mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-[#d8ac52]/40 bg-[#d8ac52]/10 p-4">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#d8ac52]" />
              <div className="flex-1">
                <p className="text-xs font-black text-[#d8ac52]">مدرسة البلوت — منتج تعليمي مستقل</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8aa6a8]">
                  القواعد وترتيب الورق والحسبة بالتفصيل، مع صفحة خاصة بك تعود إليها دائماً — 199 ر.س، دفعة واحدة.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.BALOOT_SCHOOL_LANDING)}
                  className="mt-2 rounded-lg bg-[#d8ac52] px-3 py-1.5 text-[0.65rem] font-black text-[#0b1f26]"
                >
                  اكتشف المدرسة
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!match) return null;

  const hand = match.hand;
  const isPlayerBidTurn = hand.phase === 'bidding' && hand.turnSeat === 'south';
  const isPlayerCardTurn = hand.phase === 'playing' && hand.turnSeat === 'south';
  const legalIds = new Set(isPlayerCardTurn ? legalBalootMoves(hand, 'south').map((c) => c.id) : []);
  const matchOver = match.status !== 'playing';

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'linear-gradient(180deg, #05141a 0%, #0a1f26 100%)' }}>
      <div className="sticky top-0 z-30 border-b border-[#1f4a52] bg-[#05141a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-sm font-bold text-[#8aa6a8] transition-colors hover:text-[#e7f4f2]"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            {BALOOT_ARENA_COPY.backHomeAr}
          </button>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#d8ac52]" />
            <span className="text-sm font-black text-[#e7f4f2]">{BALOOT_ARENA_COPY.heroBadgeAr}</span>
          </div>
          <button
            type="button"
            onClick={beginNewMatch}
            aria-label={BALOOT_ARENA_COPY.newMatchAr}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8aa6a8] transition-colors hover:bg-[#0e262d] hover:text-[#e7f4f2]"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <BalootScoreboard match={match} />

        {matchOver ? (
          <div className="mt-6 rounded-2xl border-2 border-[#d8ac52] bg-[#d8ac52]/10 p-6 text-center">
            <p className="text-xl font-black text-[#e7f4f2]">
              {match.status === 'player_team_won' ? BALOOT_ARENA_COPY.matchWonAr : BALOOT_ARENA_COPY.matchLostAr}
            </p>
            <button
              type="button"
              onClick={beginNewMatch}
              className="mt-4 rounded-full bg-[#d8ac52] px-6 py-2.5 text-sm font-black text-[#061018]"
            >
              {BALOOT_ARENA_COPY.newMatchAr}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-[#1f4a52] bg-[#0a1f26]/70 p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-[#8aa6a8]">
                <span>{BALOOT_SEAT_LABELS_AR.north} (شريكك)</span>
                <span>{BALOOT_SEAT_LABELS_AR.west}</span>
                <span>{BALOOT_SEAT_LABELS_AR.east}</span>
              </div>
              <div className="mb-4 flex items-center justify-center gap-6 text-[10px] text-[#8aa6a8]">
                <span>{hand.hands.north.length} أوراق</span>
                <span>{hand.hands.west.length} أوراق</span>
                <span>{hand.hands.east.length} أوراق</span>
              </div>

              <div className="flex min-h-[7rem] items-center justify-center gap-3">
                {hand.currentTrick.length === 0 && hand.phase === 'playing' && (
                  <p className="text-xs text-[#8aa6a8]">بانتظار أول ورقة في هذا الشوط…</p>
                )}
                {hand.currentTrick.map((entry) => (
                  <div key={entry.seat} className="flex flex-col items-center gap-1">
                    <BalootCardFace card={entry.card} trumpSuit={hand.trumpSuit} size="md" />
                    <span className="text-[10px] text-[#8aa6a8]">{BALOOT_SEAT_LABELS_AR[entry.seat]}</span>
                  </div>
                ))}
              </div>

              {hand.biddingTeam && (
                <p className="mt-3 text-center text-xs font-bold text-[#d8ac52]">
                  {hand.mode === 'sun'
                    ? BALOOT_ARENA_COPY.sunModeLabelAr
                    : `الحكم: ${BALOOT_SUIT_SYMBOLS[hand.trumpSuit as BalootSuit]} ${BALOOT_SUIT_LABELS_AR[hand.trumpSuit as BalootSuit]}`}
                  <span className="text-[#8aa6a8]"> — أعلن {hand.biddingTeam === 'playerTeam' ? BALOOT_ARENA_COPY.playerTeamLabelAr : BALOOT_ARENA_COPY.opponentTeamLabelAr}</span>
                  {hand.doubleLevel > 1 && (
                    <span className="mr-1 rounded-full border border-[#c45c7a]/60 bg-[#c45c7a]/10 px-2 py-0.5 text-[10px] font-black text-[#c45c7a]">
                      {hand.doubleLevel === 4 ? BALOOT_ARENA_COPY.redoubledBadgeAr : BALOOT_ARENA_COPY.doubledBadgeAr}
                    </span>
                  )}
                </p>
              )}

              {hand.phase === 'hand_scored' && hand.handPoints && (
                <p className="mt-3 text-center text-sm font-black text-[#e7f4f2]">
                  {BALOOT_ARENA_COPY.handScoredAr} — {BALOOT_ARENA_COPY.playerTeamLabelAr} {hand.handPoints.playerTeam} ·{' '}
                  {BALOOT_ARENA_COPY.opponentTeamLabelAr} {hand.handPoints.opponentTeam}
                </p>
              )}
            </div>

            {isPlayerBidTurn && (
              <div className="mt-4">
                <BalootBiddingPanel onDeclare={(choice) => handlePlayerBid(choice)} onPass={handlePass} />
              </div>
            )}

            {!isPlayerBidTurn && hand.phase === 'bidding' && (
              <p className="mt-4 text-center text-sm text-[#8aa6a8]">{BALOOT_ARENA_COPY.waitingForBidAr}</p>
            )}

            {hand.phase === 'doubling' && (
              <div className="mt-4">
                <BalootDoublingPanel
                  canDouble={canDeclareDouble(hand, 'south')}
                  canRedouble={canDeclareRedouble(hand, 'south')}
                  onDouble={handlePlayerDouble}
                  onRedouble={handlePlayerRedouble}
                  onSkip={handleSkipDoubling}
                />
                {!canDeclareDouble(hand, 'south') && !canDeclareRedouble(hand, 'south') && (
                  <p className="mt-2 text-center text-sm text-[#8aa6a8]">{BALOOT_ARENA_COPY.waitingForDoublingAr}</p>
                )}
              </div>
            )}

            <div className="mt-6">
              <p className="mb-2 text-center text-xs text-[#8aa6a8]">
                {isPlayerCardTurn ? BALOOT_ARENA_COPY.yourTurnToPlayAr : BALOOT_SEAT_LABELS_AR.south}
              </p>
              <BalootHandFan
                cards={hand.hands.south}
                legalCardIds={legalIds}
                trumpSuit={hand.trumpSuit}
                onPlayCard={handlePlayerCard}
                interactive={isPlayerCardTurn}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
