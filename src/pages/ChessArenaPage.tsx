/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة الشطرنج — صفحة الهبوط ولعب المرحلة الأولى (مطوَّرة): ضد الذكاء
 * الاصطناعي بثلاث مستويات (محرك Stockfish الحقيقي لمستوى «محترف» مع
 * تراجع تلقائي للمحرك المحلي)، رقعة بإحداثيات وتظليل آخر نقلة، شريط قطع
 * مأسورة، سجل نقلات مُرقَّم بتبويب تحليل حقيقي، تراجع حقيقي، تلميح حقيقي
 * (نفس محرك المستوى الحالي)، ساعة لاعب حقيقية تنازلية (تخسر المباراة عند
 * نفادها)، بطاقة خصم صادقة (مستوى + حالة محرك حقيقية — بلا اسم أو تقييم
 * وهميين)، بطاقة نتيجة، وأصوات خفيفة قابلة للكتم — كل ذلك بجلسة محفوظة
 * محلياً. المرحلتان التشاركية والاشتراكات غير مفعّلتين بعد. Route: /chess
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Crown,
  Flag,
  GraduationCap,
  Lightbulb,
  RefreshCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CHESS_ARENA_COPY,
  type ChessDifficultyId,
  getChessDifficultyLevel,
  getChessTimeControl,
  type ChessTimeControlId,
} from '@/config/chessArena';
import {
  clearChessSession,
  readChessSession,
  writeChessSession,
  type ChessGameStatus,
  type ChessSessionState,
} from '@/lib/chessSessionLab';
import { checkStockfishReadiness, resolveAiMove, type ChessEngineKind } from '@/lib/chessEngine';
import { terminateStockfish } from '@/lib/stockfishEngine';
import { isChessSoundEnabled, playChessSound, setChessSoundEnabled } from '@/lib/chessSound';
import { outcomeFromStatus, readChessStats, recordChessMatchResult, type ChessStatsState } from '@/lib/chessStatsLab';
import { ChessBoardView } from '@/components/chess/ChessBoardView';
import { ChessLevelPicker } from '@/components/chess/ChessLevelPicker';
import { ChessTimeControlPicker } from '@/components/chess/ChessTimeControlPicker';
import { ChessStatsSummary } from '@/components/chess/ChessStatsSummary';
import { ChessCapturedTray } from '@/components/chess/ChessCapturedTray';
import { ChessMoveList } from '@/components/chess/ChessMoveList';
import { ChessResultOverlay } from '@/components/chess/ChessResultOverlay';

type ChessArenaView = 'landing' | 'playing';
type LastMove = { from: string; to: string } | null;
type MatchLogTab = 'moves' | 'analysis';

interface MoveResultLike {
  captured?: string;
}

const MATERIAL_POINT_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function deriveStatusAfterMove(chess: Chess): ChessGameStatus {
  if (chess.isCheckmate()) {
    // الطرف الذي حان دوره الآن (chess.turn) هو من وقع تحت كش الملك.
    return chess.turn() === 'w' ? 'ai_won' : 'player_won';
  }
  if (chess.isDraw()) return 'draw';
  return 'playing';
}

/** رصيد المادة الحقيقي من سجل النقلات فعلياً — موجب لصالح اللاعب، سالب لصالح الذكاء الاصطناعي. */
function computeMaterialBalance(chess: Chess): number {
  const history = chess.history({ verbose: true }) as unknown as { color: 'w' | 'b'; captured?: string }[];
  let playerMaterial = 0;
  let aiMaterial = 0;
  for (const m of history) {
    if (!m.captured) continue;
    if (m.color === 'w') playerMaterial += MATERIAL_POINT_VALUES[m.captured] ?? 0;
    else aiMaterial += MATERIAL_POINT_VALUES[m.captured] ?? 0;
  }
  return playerMaterial - aiMaterial;
}

function formatClock(ms: number | null): string {
  if (ms === null) return '∞';
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** ميزانية تفكير المستوى الحقيقية (من إعداداته الفعلية) — بصيغة ثوانٍ مقروءة، لا رقماً وهمياً. */
function formatThinkBudget(ms: number): string {
  return `${(ms / 1000).toFixed(2)} ث`;
}

const CHESS_MANIFEST_HREF = '/manifest-chess.json';

export default function ChessArenaPage() {
  useDocumentTitle(CHESS_ARENA_COPY.documentTitle);
  const navigate = useNavigate();

  /* غلاف أندرويد TWA (android-chess-twa) يفتح على هذا المسار مباشرة — نفس
     نمط تبديل المانيفست المستخدم في PartnerAppInstall لتطبيق الصالون: نحوّل
     link[rel=manifest] لمانيفست الشطرنج المخصّص أثناء وجود الزائر في هذه
     الصفحة فقط، ونعيده عند المغادرة حتى لا يتأثر تثبيت الموقع الرئيسي. */
  useEffect(() => {
    const existing = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prevHref = existing?.href || '/manifest.json';
    let link = existing;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = CHESS_MANIFEST_HREF;
    return () => {
      if (link) link.href = prevHref.includes('manifest-chess') ? '/manifest.json' : prevHref;
    };
  }, []);

  const [view, setView] = useState<ChessArenaView>('landing');
  const [pendingLevel, setPendingLevel] = useState<ChessDifficultyId | null>(null);
  const [pendingTimeControl, setPendingTimeControl] = useState<ChessTimeControlId>('rapid10');
  const [resumableSession, setResumableSession] = useState<ChessSessionState | null>(null);

  const chessRef = useRef<Chess>(new Chess());
  const sessionStartedAtRef = useRef<number>(Date.now());
  const copyFeedbackTimeoutRef = useRef<number | null>(null);

  const [, setFenTick] = useState(0);
  const [level, setLevel] = useState<ChessDifficultyId>('beginner');
  const [timeControl, setTimeControl] = useState<ChessTimeControlId>('rapid10');
  const [status, setStatus] = useState<ChessGameStatus>('playing');
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [hintMove, setHintMove] = useState<LastMove>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<ChessEngineKind | 'checking' | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [playerClockMs, setPlayerClockMs] = useState<number | null>(getChessTimeControl('rapid10').ms);
  const [matchLogTab, setMatchLogTab] = useState<MatchLogTab>('moves');
  const [chessStats, setChessStats] = useState<ChessStatsState>(() => readChessStats());
  const [reviewPly, setReviewPly] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'pgn' | 'fen' | 'error' | null>(null);

  useEffect(() => {
    setSoundOn(isChessSoundEnabled());
    const existing = readChessSession();
    if (existing && existing.status === 'playing') {
      setResumableSession(existing);
    } else if (existing) {
      clearChessSession();
    }
    return () => {
      terminateStockfish();
    };
  }, []);

  useEffect(() => {
    if (view !== 'playing') return;
    const levelDef = getChessDifficultyLevel(level);
    if (!levelDef.useStockfish) {
      setEngineStatus('local');
      return;
    }
    setEngineStatus('checking');
    let cancelled = false;
    void checkStockfishReadiness(level).then((kind) => {
      if (!cancelled) setEngineStatus(kind);
    });
    return () => {
      cancelled = true;
    };
  }, [view, level]);

  // ساعة اللاعب الحقيقية — تُعدّ تنازلياً فقط أثناء دور اللاعب الفعلي (لا أثناء تفكير الذكاء الاصطناعي).
  // playerClockMs === null يعني طريقة لعب «بلا وقت» — لا عدّاد إطلاقاً.
  useEffect(() => {
    if (view !== 'playing' || status !== 'playing' || aiThinking || playerClockMs === null) return;
    const interval = window.setInterval(() => {
      setPlayerClockMs((prev) => (prev === null ? null : Math.max(0, prev - 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [view, status, aiThinking, playerClockMs === null]);

  // نفاد الوقت الحقيقي — خسارة صادقة بالوقت، لا مجرد عرض بصري. لا يُطبَّق في وضع «بلا وقت».
  useEffect(() => {
    if (view !== 'playing' || status !== 'playing' || playerClockMs === null || playerClockMs > 0) return;
    setStatus('timeout');
    playChessSound('gameEnd');
    clearChessSession();
    setChessStats(recordChessMatchResult(level, 'loss'));
  }, [playerClockMs, view, status, level]);

  function forceRerender() {
    setFenTick((n) => n + 1);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setChessSoundEnabled(next);
  }

  function persistSession(
    chess: Chess,
    currentLevel: ChessDifficultyId,
    currentStatus: ChessGameStatus,
    clockRemainingMs: number | null,
    currentTimeControl: ChessTimeControlId,
  ) {
    if (currentStatus !== 'playing') {
      clearChessSession();
      return;
    }
    writeChessSession({
      fen: chess.fen(),
      level: currentLevel,
      playerColor: 'w',
      sanHistory: chess.history(),
      status: currentStatus,
      startedAt: sessionStartedAtRef.current,
      clockRemainingMs: clockRemainingMs ?? undefined,
      timeControl: currentTimeControl,
    });
  }

  function handleResume() {
    if (!resumableSession) return;
    chessRef.current = new Chess(resumableSession.fen);
    setLevel(resumableSession.level);
    setStatus('playing');
    sessionStartedAtRef.current = resumableSession.startedAt;
    const resumedTimeControl = resumableSession.timeControl ?? 'rapid10';
    setTimeControl(resumedTimeControl);
    setPlayerClockMs(
      resumedTimeControl === 'untimed'
        ? null
        : (resumableSession.clockRemainingMs ?? getChessTimeControl(resumedTimeControl).ms),
    );
    setResumableSession(null);
    setAiThinking(false);
    setLastMove(null);
    setHintMove(null);
    setMatchLogTab('moves');
    setReviewPly(null);
    setView('playing');
    forceRerender();
  }

  function handleDiscardResume() {
    clearChessSession();
    setResumableSession(null);
  }

  function handleStartNewGame() {
    if (!pendingLevel) return;
    chessRef.current = new Chess();
    sessionStartedAtRef.current = Date.now();
    setLevel(pendingLevel);
    setTimeControl(pendingTimeControl);
    setStatus('playing');
    setAiThinking(false);
    setLastMove(null);
    setHintMove(null);
    const startingClockMs = getChessTimeControl(pendingTimeControl).ms;
    setPlayerClockMs(startingClockMs);
    setMatchLogTab('moves');
    setReviewPly(null);
    setResumableSession(null);
    persistSession(chessRef.current, pendingLevel, 'playing', startingClockMs, pendingTimeControl);
    setView('playing');
    forceRerender();
  }

  function handlePlayerMove(from: string, to: string, promotion?: string) {
    if (status !== 'playing' || aiThinking) return;
    const chess = chessRef.current;

    let moveResult: MoveResultLike | null = null;
    try {
      moveResult = chess.move({ from, to, promotion }) as unknown as MoveResultLike;
      if (!moveResult) return;
    } catch {
      return;
    }

    setHintMove(null);
    setLastMove({ from, to });
    playChessSound(moveResult.captured ? 'capture' : 'move');
    forceRerender();

    const statusAfterPlayer = deriveStatusAfterMove(chess);
    if (statusAfterPlayer === 'playing' && chess.isCheck()) playChessSound('check');
    if (statusAfterPlayer !== 'playing') playChessSound('gameEnd');
    setStatus(statusAfterPlayer);
    persistSession(chess, level, statusAfterPlayer, playerClockMs, timeControl);

    if (statusAfterPlayer !== 'playing') {
      const outcome = outcomeFromStatus(statusAfterPlayer);
      if (outcome) setChessStats(recordChessMatchResult(level, outcome));
      return;
    }

    setAiThinking(true);
    void resolveAiMove(chess, level).then((outcome) => {
      if (outcome) {
        try {
          const aiResult = chess.move({
            from: outcome.move.from,
            to: outcome.move.to,
            promotion: outcome.move.promotion,
          }) as unknown as MoveResultLike | null;
          setLastMove({ from: outcome.move.from, to: outcome.move.to });
          playChessSound(aiResult?.captured ? 'capture' : 'move');
        } catch {
          // تجاهل دفاعياً — لا يفترض حدوثه لأن النقلة قادمة من قائمة النقلات الشرعية نفسها.
        }
        setEngineStatus(outcome.engine);
      }

      const statusAfterAi = deriveStatusAfterMove(chess);
      if (statusAfterAi === 'playing' && chess.isCheck()) playChessSound('check');
      if (statusAfterAi !== 'playing') playChessSound('gameEnd');
      setStatus(statusAfterAi);
      persistSession(chess, level, statusAfterAi, playerClockMs, timeControl);
      if (statusAfterAi !== 'playing') {
        const outcome = outcomeFromStatus(statusAfterAi);
        if (outcome) setChessStats(recordChessMatchResult(level, outcome));
      }
      setAiThinking(false);
      forceRerender();
    });
  }

  /** تراجع حقيقي (تراجع دبلن — نقلتك ونقلة الذكاء الاصطناعي معاً) ليعود الدور إليك فعلياً، لا مجرد عرض. */
  function handleUndo() {
    if (status !== 'playing' || aiThinking || reviewPly !== null) return;
    const chess = chessRef.current;
    if (chess.history().length < 2) return;
    chess.undo();
    chess.undo();
    setHintMove(null);
    setReviewPly(null);
    const verboseHistory = chess.history({ verbose: true }) as unknown as { from: string; to: string }[];
    const previous = verboseHistory[verboseHistory.length - 1];
    setLastMove(previous ? { from: previous.from, to: previous.to } : null);
    setStatus('playing');
    persistSession(chess, level, 'playing', playerClockMs, timeControl);
    forceRerender();
  }

  /** تلميح حقيقي — يسأل نفس محرك المستوى الحالي عن أفضل نقلة لدورك الآن، ويعرضها فقط بلا تنفيذ تلقائي. */
  async function handleHint() {
    if (status !== 'playing' || aiThinking || hintLoading || reviewPly !== null) return;
    setHintLoading(true);
    try {
      const outcome = await resolveAiMove(chessRef.current, level);
      if (outcome) setHintMove({ from: outcome.move.from, to: outcome.move.to });
    } finally {
      setHintLoading(false);
    }
  }

  /** نسخ حقيقي لسجل المباراة (PGN) أو وضع الرقعة الحالي (FEN) عبر chess.js — بلا خادم. */
  function showCopyFeedback(kind: 'pgn' | 'fen' | 'error') {
    setCopyFeedback(kind);
    if (copyFeedbackTimeoutRef.current !== null) window.clearTimeout(copyFeedbackTimeoutRef.current);
    copyFeedbackTimeoutRef.current = window.setTimeout(() => setCopyFeedback(null), 1800);
  }

  function handleCopyPgn() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      showCopyFeedback('error');
      return;
    }
    try {
      void navigator.clipboard
        .writeText(chessRef.current.pgn())
        .then(() => showCopyFeedback('pgn'))
        .catch(() => showCopyFeedback('error'));
    } catch {
      showCopyFeedback('error');
    }
  }

  function handleCopyFen() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      showCopyFeedback('error');
      return;
    }
    try {
      void navigator.clipboard
        .writeText(chessRef.current.fen())
        .then(() => showCopyFeedback('fen'))
        .catch(() => showCopyFeedback('error'));
    } catch {
      showCopyFeedback('error');
    }
  }

  function handleResign() {
    if (status !== 'playing') return;
    if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmResignAr)) return;
    setStatus('resigned');
    playChessSound('gameEnd');
    clearChessSession();
    setChessStats(recordChessMatchResult(level, 'loss'));
  }

  function handleBackToPicker() {
    if (status === 'playing') {
      if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmNewGameWhilePlayingAr)) return;
    }
    clearChessSession();
    setResumableSession(null);
    setPendingLevel(null);
    setLastMove(null);
    setHintMove(null);
    setReviewPly(null);
    setView('landing');
  }

  const isCheck = chessRef.current.isCheck();

  function getStatusMessage(): string {
    if (status === 'player_won') return CHESS_ARENA_COPY.checkmatePlayerWinsAr;
    if (status === 'ai_won') return CHESS_ARENA_COPY.checkmateAiWinsAr;
    if (status === 'draw') return CHESS_ARENA_COPY.drawAr;
    if (status === 'resigned') return CHESS_ARENA_COPY.resignedAr;
    if (status === 'timeout') return CHESS_ARENA_COPY.timeoutAr;
    if (aiThinking) return CHESS_ARENA_COPY.turnAiAr;
    if (isCheck) return CHESS_ARENA_COPY.checkAr;
    return CHESS_ARENA_COPY.turnPlayerAr;
  }

  function getEngineBadgeLabel(): string | null {
    if (level !== 'advanced') return null;
    if (engineStatus === 'checking' || engineStatus === null) return CHESS_ARENA_COPY.engineCheckingAr;
    if (engineStatus === 'stockfish') return CHESS_ARENA_COPY.engineStockfishActiveAr;
    return CHESS_ARENA_COPY.engineLocalFallbackAr;
  }

  const isGameOver = status !== 'playing';
  const isInteractiveNow = status === 'playing' && !aiThinking && reviewPly === null;
  const sanHistory = chessRef.current.history();
  const engineBadgeLabel = getEngineBadgeLabel();
  const materialBalance = computeMaterialBalance(chessRef.current);
  const isReviewing = reviewPly !== null;

  // أثناء استعراض نقلة سابقة: رقعة مُعاد بناؤها فعلياً من سجل النقلات الحقيقي حتى تلك النقطة
  // (اللعبة تبدأ دائماً من الوضع القياسي — لا وضع FEN مخصص — فالإعادة صحيحة دوماً).
  const displayedChess = useMemo(() => {
    if (reviewPly === null) return chessRef.current;
    const replay = new Chess();
    const moves = chessRef.current.history();
    for (let i = 0; i < reviewPly && i < moves.length; i += 1) {
      try {
        replay.move(moves[i]);
      } catch {
        break;
      }
    }
    return replay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewPly, sanHistory.length]);

  function handleReviewPrev() {
    setReviewPly((prev) => Math.max(0, (prev ?? sanHistory.length) - 1));
  }

  function handleReviewNext() {
    setReviewPly((prev) => {
      const next = (prev ?? sanHistory.length) + 1;
      return next >= sanHistory.length ? null : next;
    });
  }

  function handleReviewStart() {
    setReviewPly(0);
  }

  function handleReviewLive() {
    setReviewPly(null);
  }

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
            {CHESS_ARENA_COPY.backHomeAr}
          </button>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#d8ac52]" />
            <span className="text-sm font-black text-[#e7f4f2]">{CHESS_ARENA_COPY.heroBadgeAr}</span>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? CHESS_ARENA_COPY.soundOnAr : CHESS_ARENA_COPY.soundOffAr}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8aa6a8] transition-colors hover:bg-[#0e262d] hover:text-[#e7f4f2]"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <main className="w-full px-4 pb-16 pt-8">
        {view === 'landing' && (
          <div className="mx-auto max-w-3xl">
            <header className="mb-8 text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <img
                  src="/images/chess/chess-knight-brand-mark.webp"
                  alt="العلامة الرسمية لساحة الشطرنج"
                  loading="eager"
                  decoding="async"
                  className="h-24 w-24 rounded-2xl border border-[#d8ac52]/40 bg-black/25 object-contain p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-28 md:w-28"
                />
              </div>
              <h1 className="text-2xl font-black text-[#e7f4f2] sm:text-3xl">{CHESS_ARENA_COPY.heroTitleAr}</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#8aa6a8] sm:text-base">
                {CHESS_ARENA_COPY.heroSubtitleAr}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-xs text-[#d8ac52]/70">{CHESS_ARENA_COPY.heroNoteAr}</p>
            </header>

            {resumableSession && (
              <div className="mb-8 rounded-2xl border-2 border-[#d8ac52] bg-[#d8ac52]/10 p-4 text-center shadow-[0_0_24px_rgba(216,172,82,0.12)]">
                <p className="mb-3 text-sm font-black text-[#e7f4f2]">{CHESS_ARENA_COPY.resumeBannerAr}</p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="rounded-xl bg-[#d8ac52] px-5 py-2.5 text-sm font-black text-[#0b1f26]"
                  >
                    {CHESS_ARENA_COPY.resumeButtonAr}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardResume}
                    className="rounded-xl border border-[#1f4a52] bg-[#0b1f26] px-5 py-2.5 text-sm font-bold text-[#8aa6a8]"
                  >
                    {CHESS_ARENA_COPY.newGameFromResumeAr}
                  </button>
                </div>
              </div>
            )}

            <ChessLevelPicker selected={pendingLevel} onSelect={setPendingLevel} onStart={handleStartNewGame} />

            <ChessTimeControlPicker selected={pendingTimeControl} onSelect={setPendingTimeControl} />

            <ChessStatsSummary stats={chessStats} />

            <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-[#d8ac52]/40 bg-[#d8ac52]/10 p-4">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#d8ac52]" />
              <div className="flex-1">
                <p className="text-xs font-black text-[#d8ac52]">مدرسة الشطرنج الاحترافية — منتج تعليمي مستقل</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8aa6a8]">
                  منهج كامل (افتتاحيات، تكتيك، استراتيجية، نهايات) مع صفحة خاصة بك تعود إليها دائماً — 175 ر.س، دفعة
                  واحدة.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.CHESS_SCHOOL_LANDING)}
                  className="mt-2 rounded-lg bg-[#d8ac52] px-3 py-1.5 text-[0.65rem] font-black text-[#0b1f26]"
                >
                  اكتشف المدرسة
                </button>
              </div>
            </div>

            <div className="mx-auto mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-dashed border-[#00d6c8]/40 bg-[#0b1f26]/60 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#00d6c8]" />
              <div>
                <p className="text-xs font-black text-[#00d6c8]">
                  {CHESS_ARENA_COPY.comingSoonBadgeAr} — {CHESS_ARENA_COPY.comingSoonTitleAr}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#8aa6a8]">{CHESS_ARENA_COPY.comingSoonBodyAr}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'playing' && (
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[260px_1fr_260px] lg:items-start">
            {/* العمود الأيسر (يمين الشاشة بصرياً بحكم RTL): سجل المباراة + تبويب التحليل الحقيقي */}
            <aside className="order-3 lg:order-1">
              <div className="rounded-2xl border border-[#1f4a52] bg-[#0b1f26]/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#d8ac52]/30 bg-[#d8ac52]/10 text-[#d8ac52]">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-black text-[#e7f4f2]">{CHESS_ARENA_COPY.matchLogTitleAr}</p>
                </div>

                <div className="mb-3 flex gap-1 rounded-lg bg-[#05141a]/60 p-1">
                  <button
                    type="button"
                    onClick={() => setMatchLogTab('moves')}
                    className={[
                      'flex-1 rounded-md px-2 py-1 text-xs font-bold transition-colors',
                      matchLogTab === 'moves' ? 'bg-[#0e262d] text-[#e7f4f2]' : 'text-[#8aa6a8] hover:text-[#e7f4f2]',
                    ].join(' ')}
                  >
                    {CHESS_ARENA_COPY.movesLabelAr}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchLogTab('analysis')}
                    className={[
                      'flex-1 rounded-md px-2 py-1 text-xs font-bold transition-colors',
                      matchLogTab === 'analysis' ? 'bg-[#0e262d] text-[#e7f4f2]' : 'text-[#8aa6a8] hover:text-[#e7f4f2]',
                    ].join(' ')}
                  >
                    {CHESS_ARENA_COPY.analysisTabLabelAr}
                  </button>
                </div>

                {matchLogTab === 'moves' ? (
                  sanHistory.length === 0 ? (
                    <p className="text-xs leading-relaxed text-[#8aa6a8]">لم تُلعب أي نقلة بعد.</p>
                  ) : (
                    <ChessMoveList sanHistory={sanHistory} embedded />
                  )
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#8aa6a8]">{CHESS_ARENA_COPY.turnIndicatorLabelAr}</span>
                      <span className="font-bold text-[#e7f4f2]">
                        {aiThinking ? CHESS_ARENA_COPY.aiLabelAr : CHESS_ARENA_COPY.playerLabelAr}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#8aa6a8]">{CHESS_ARENA_COPY.checkAr}</span>
                      <span className={['font-bold', isCheck ? 'text-rose-400' : 'text-[#e7f4f2]'].join(' ')}>
                        {isCheck ? CHESS_ARENA_COPY.checkAr : '—'}
                      </span>
                    </div>
                    <p className="pt-1 text-[#8aa6a8]">
                      {materialBalance === 0
                        ? CHESS_ARENA_COPY.materialEvenAr
                        : materialBalance > 0
                          ? `${CHESS_ARENA_COPY.materialAdvantagePlayerAr} +${materialBalance}`
                          : `${CHESS_ARENA_COPY.materialAdvantageAiAr} +${Math.abs(materialBalance)}`}
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* العمود الأوسط: شريط الحالة، ساعتك، الرقعة، شريط القطع المأسورة */}
            <div className="order-1 lg:order-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#1f4a52] bg-[#0b1f26]/70 px-3 py-2">
                  <Clock className="h-3.5 w-3.5 text-[#00d6c8]" />
                  <span className="text-[0.65rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.yourClockLabelAr}</span>
                  <span
                    dir="ltr"
                    className={[
                      'font-mono text-sm font-black',
                      playerClockMs !== null && playerClockMs < 60_000 ? 'text-rose-400' : 'text-[#e7f4f2]',
                    ].join(' ')}
                  >
                    {formatClock(playerClockMs)}
                  </span>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#1f4a52] bg-[#0b1f26]/70 px-4 py-3">
                <span className="flex items-center gap-2 text-xs font-bold text-[#8aa6a8]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#00d6c8]/30 bg-[#00d6c8]/10 text-[#00d6c8]">
                    <Cpu className="h-3 w-3" />
                  </span>
                  {CHESS_ARENA_COPY.aiLabelAr} — {getChessDifficultyLevel(level).titleAr}
                  {engineBadgeLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d8ac52]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[#d8ac52] ring-1 ring-[#d8ac52]/30">
                      <Cpu className="h-2.5 w-2.5" />
                      {engineBadgeLabel}
                    </span>
                  )}
                </span>
                <span
                  className={[
                    'text-sm font-black',
                    status === 'player_won'
                      ? 'text-emerald-400'
                      : status === 'ai_won' || status === 'resigned' || status === 'timeout'
                        ? 'text-rose-400'
                        : isCheck
                          ? 'text-rose-300'
                          : 'text-[#e7f4f2]',
                  ].join(' ')}
                >
                  {getStatusMessage()}
                </span>
              </div>

              {sanHistory.length > 0 && (
                <div className="mb-3 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleReviewStart}
                    aria-label={CHESS_ARENA_COPY.reviewToStartAr}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f4a52] bg-[#0b1f26]/70 text-[#8aa6a8] transition-colors hover:text-[#e7f4f2]"
                  >
                    <SkipBack className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewPrev}
                    disabled={reviewPly === 0}
                    aria-label={CHESS_ARENA_COPY.reviewPrevAr}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f4a52] bg-[#0b1f26]/70 text-[#8aa6a8] transition-colors hover:text-[#e7f4f2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {isReviewing ? (
                    <span className="rounded-lg bg-[#00d6c8]/10 px-3 py-1.5 text-[0.65rem] font-bold text-[#00d6c8] ring-1 ring-[#00d6c8]/30">
                      {CHESS_ARENA_COPY.reviewingBadgeAr} ({reviewPly}/{sanHistory.length})
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 text-[0.65rem] font-bold text-[#5f8a8d]">
                      {CHESS_ARENA_COPY.reviewLiveAr}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleReviewNext}
                    disabled={!isReviewing}
                    aria-label={CHESS_ARENA_COPY.reviewNextAr}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f4a52] bg-[#0b1f26]/70 text-[#8aa6a8] transition-colors hover:text-[#e7f4f2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewLive}
                    disabled={!isReviewing}
                    aria-label={CHESS_ARENA_COPY.reviewLiveAr}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1f4a52] bg-[#0b1f26]/70 text-[#8aa6a8] transition-colors hover:text-[#e7f4f2] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="relative mx-auto max-w-[500px]">
                <ChessBoardView
                  key={sanHistory.length}
                  chess={displayedChess}
                  playerColor="w"
                  interactive={isInteractiveNow}
                  lastMove={isReviewing ? null : lastMove}
                  hintMove={isReviewing ? null : hintMove}
                  onPlayerMove={handlePlayerMove}
                />
                {isGameOver && !isReviewing && (
                  <ChessResultOverlay
                    status={status as Exclude<ChessGameStatus, 'playing'>}
                    onNewGame={handleBackToPicker}
                  />
                )}
              </div>

              <ChessCapturedTray chess={displayedChess} playerColor="w" />
            </div>

            {/* العمود الأيمن (يسار الشاشة بصرياً بحكم RTL): بطاقة الخصم الصادقة + لوحة القيادة */}
            <aside className="order-2 space-y-4 lg:order-3">
              <div className="rounded-2xl border border-[#1f4a52] bg-[#0b1f26]/70 p-4">
                <p className="mb-3 text-xs font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.opponentCardTitleAr}</p>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00d6c8]/30 bg-[#00d6c8]/10 text-[#00d6c8]">
                    <Cpu className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#e7f4f2]">{CHESS_ARENA_COPY.aiLabelAr}</p>
                    <p className="mt-0.5 text-xs text-[#8aa6a8]">{getChessDifficultyLevel(level).titleAr}</p>
                  </div>
                </div>
                {engineBadgeLabel && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#d8ac52]/10 px-2.5 py-1 text-[0.65rem] font-bold text-[#d8ac52] ring-1 ring-[#d8ac52]/30">
                    <Cpu className="h-3 w-3" />
                    {engineBadgeLabel}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-[#1f4a52] bg-[#05141a]/60 px-3 py-2">
                  <span className="text-[0.65rem] font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.aiThinkBudgetLabelAr}</span>
                  <span dir="ltr" className="text-xs font-bold text-[#e7f4f2]">
                    {formatThinkBudget(getChessDifficultyLevel(level).timeBudgetMs)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f4a52] bg-[#0b1f26]/70 p-4">
                <p className="mb-3 text-xs font-bold text-[#8aa6a8]">{CHESS_ARENA_COPY.controlPadTitleAr}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleHint()}
                    disabled={!isInteractiveNow || hintLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#00d6c8]/30 bg-[#00d6c8]/10 px-2 py-2.5 text-xs font-bold text-[#00d6c8] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {hintLoading ? CHESS_ARENA_COPY.hintLoadingAr : CHESS_ARENA_COPY.hintButtonAr}
                  </button>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!isInteractiveNow || sanHistory.length < 2}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1f4a52] bg-[#05141a]/60 px-2 py-2.5 text-xs font-bold text-[#e7f4f2] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    {CHESS_ARENA_COPY.undoButtonAr}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPgn}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1f4a52] bg-[#05141a]/60 px-2 py-2.5 text-xs font-bold text-[#e7f4f2] transition-opacity"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {CHESS_ARENA_COPY.copyPgnButtonAr}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyFen}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1f4a52] bg-[#05141a]/60 px-2 py-2.5 text-xs font-bold text-[#e7f4f2] transition-opacity"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {CHESS_ARENA_COPY.copyFenButtonAr}
                  </button>
                </div>
                {copyFeedback && (
                  <p
                    className={[
                      'mt-2 text-center text-[0.65rem] font-bold',
                      copyFeedback === 'error' ? 'text-rose-400' : 'text-[#00d6c8]',
                    ].join(' ')}
                  >
                    {copyFeedback === 'error' ? CHESS_ARENA_COPY.copyFailedFeedbackAr : CHESS_ARENA_COPY.copiedFeedbackAr}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleBackToPicker}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8ac52] px-5 py-2.5 text-sm font-black text-[#0b1f26]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {CHESS_ARENA_COPY.newGameButtonAr}
                </button>
                {!isGameOver && (
                  <button
                    type="button"
                    onClick={handleResign}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-300"
                  >
                    <Flag className="h-4 w-4" />
                    {CHESS_ARENA_COPY.resignButtonAr}
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
