/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة الشطرنج — صفحة الهبوط ولعب المرحلة الأولى (مطوَّرة): ضد الذكاء
 * الاصطناعي بثلاث مستويات (محرك Stockfish الحقيقي لمستوى «محترف» مع
 * تراجع تلقائي للمحرك المحلي)، رقعة بإحداثيات وتظليل آخر نقلة، شريط قطع
 * مأسورة، سجل نقلات مُرقَّم، بطاقة نتيجة، وأصوات خفيفة قابلة للكتم — كل
 * ذلك بجلسة محفوظة محلياً. المرحلتان التشاركية والاشتراكات غير مفعّلتين
 * بعد. Route: /chess
 */
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Crown, Flag, RefreshCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CHESS_ARENA_COPY, type ChessDifficultyId, getChessDifficultyLevel } from '@/config/chessArena';
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
import { ChessBoardView } from '@/components/chess/ChessBoardView';
import { ChessLevelPicker } from '@/components/chess/ChessLevelPicker';
import { ChessCapturedTray } from '@/components/chess/ChessCapturedTray';
import { ChessMoveList } from '@/components/chess/ChessMoveList';
import { ChessResultOverlay } from '@/components/chess/ChessResultOverlay';

type ChessArenaView = 'landing' | 'playing';
type LastMove = { from: string; to: string } | null;

interface MoveResultLike {
  captured?: string;
}

function deriveStatusAfterMove(chess: Chess): ChessGameStatus {
  if (chess.isCheckmate()) {
    // الطرف الذي حان دوره الآن (chess.turn) هو من وقع تحت كش الملك.
    return chess.turn() === 'w' ? 'ai_won' : 'player_won';
  }
  if (chess.isDraw()) return 'draw';
  return 'playing';
}

export default function ChessArenaPage() {
  useDocumentTitle(CHESS_ARENA_COPY.documentTitle);
  const navigate = useNavigate();

  const [view, setView] = useState<ChessArenaView>('landing');
  const [pendingLevel, setPendingLevel] = useState<ChessDifficultyId | null>(null);
  const [resumableSession, setResumableSession] = useState<ChessSessionState | null>(null);

  const chessRef = useRef<Chess>(new Chess());
  const sessionStartedAtRef = useRef<number>(Date.now());

  const [, setFenTick] = useState(0);
  const [level, setLevel] = useState<ChessDifficultyId>('beginner');
  const [status, setStatus] = useState<ChessGameStatus>('playing');
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [engineStatus, setEngineStatus] = useState<ChessEngineKind | 'checking' | null>(null);
  const [soundOn, setSoundOn] = useState(true);

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

  function forceRerender() {
    setFenTick((n) => n + 1);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setChessSoundEnabled(next);
  }

  function persistSession(chess: Chess, currentLevel: ChessDifficultyId, currentStatus: ChessGameStatus) {
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
    });
  }

  function handleResume() {
    if (!resumableSession) return;
    chessRef.current = new Chess(resumableSession.fen);
    setLevel(resumableSession.level);
    setStatus('playing');
    sessionStartedAtRef.current = resumableSession.startedAt;
    setResumableSession(null);
    setAiThinking(false);
    setLastMove(null);
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
    setStatus('playing');
    setAiThinking(false);
    setLastMove(null);
    setResumableSession(null);
    persistSession(chessRef.current, pendingLevel, 'playing');
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

    setLastMove({ from, to });
    playChessSound(moveResult.captured ? 'capture' : 'move');
    forceRerender();

    const statusAfterPlayer = deriveStatusAfterMove(chess);
    if (statusAfterPlayer === 'playing' && chess.isCheck()) playChessSound('check');
    if (statusAfterPlayer !== 'playing') playChessSound('gameEnd');
    setStatus(statusAfterPlayer);
    persistSession(chess, level, statusAfterPlayer);

    if (statusAfterPlayer !== 'playing') return;

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
      persistSession(chess, level, statusAfterAi);
      setAiThinking(false);
      forceRerender();
    });
  }

  function handleResign() {
    if (status !== 'playing') return;
    if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmResignAr)) return;
    setStatus('resigned');
    playChessSound('gameEnd');
    clearChessSession();
  }

  function handleBackToPicker() {
    if (status === 'playing') {
      if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmNewGameWhilePlayingAr)) return;
    }
    clearChessSession();
    setResumableSession(null);
    setPendingLevel(null);
    setLastMove(null);
    setView('landing');
  }

  const isCheck = chessRef.current.isCheck();

  function getStatusMessage(): string {
    if (status === 'player_won') return CHESS_ARENA_COPY.checkmatePlayerWinsAr;
    if (status === 'ai_won') return CHESS_ARENA_COPY.checkmateAiWinsAr;
    if (status === 'draw') return CHESS_ARENA_COPY.drawAr;
    if (status === 'resigned') return CHESS_ARENA_COPY.resignedAr;
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
  const sanHistory = chessRef.current.history();
  const engineBadgeLabel = getEngineBadgeLabel();

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'linear-gradient(180deg, #05141a 0%, #0a1f26 100%)' }}>
      <div className="sticky top-0 z-30 border-b border-[#1f4a52] bg-[#05141a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
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

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        {view === 'landing' && (
          <>
            <header className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d8ac52]/40 bg-[#d8ac52]/10">
                <Crown className="h-7 w-7 text-[#d8ac52]" />
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

            <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-2xl border border-dashed border-[#00d6c8]/40 bg-[#0b1f26]/60 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#00d6c8]" />
              <div>
                <p className="text-xs font-black text-[#00d6c8]">
                  {CHESS_ARENA_COPY.comingSoonBadgeAr} — {CHESS_ARENA_COPY.comingSoonTitleAr}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#8aa6a8]">{CHESS_ARENA_COPY.comingSoonBodyAr}</p>
              </div>
            </div>
          </>
        )}

        {view === 'playing' && (
          <>
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
                    : status === 'ai_won' || status === 'resigned'
                      ? 'text-rose-400'
                      : isCheck
                        ? 'text-rose-300'
                        : 'text-[#e7f4f2]',
                ].join(' ')}
              >
                {getStatusMessage()}
              </span>
            </div>

            <div className="relative mx-auto max-w-[500px]">
              <ChessBoardView
                chess={chessRef.current}
                playerColor="w"
                interactive={status === 'playing' && !aiThinking}
                lastMove={lastMove}
                onPlayerMove={handlePlayerMove}
              />
              {isGameOver && (
                <ChessResultOverlay
                  status={status as Exclude<ChessGameStatus, 'playing'>}
                  onNewGame={handleBackToPicker}
                />
              )}
            </div>

            <ChessCapturedTray chess={chessRef.current} playerColor="w" />
            <ChessMoveList sanHistory={sanHistory} />

            <div className="mx-auto mt-6 flex max-w-[500px] flex-col justify-center gap-2 sm:flex-row">
              {!isGameOver && (
                <button
                  type="button"
                  onClick={handleResign}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-300"
                >
                  <Flag className="h-4 w-4" />
                  {CHESS_ARENA_COPY.resignButtonAr}
                </button>
              )}
              <button
                type="button"
                onClick={handleBackToPicker}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#d8ac52] px-5 py-2.5 text-sm font-black text-[#0b1f26]"
              >
                <RefreshCcw className="h-4 w-4" />
                {CHESS_ARENA_COPY.newGameButtonAr}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
