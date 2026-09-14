/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة الشطرنج — صفحة الهبوط ولعب المرحلة الأولى: ضد الذكاء الاصطناعي
 * بثلاث مستويات، بجلسة محفوظة محلياً. المرحلتان التشاركية والاشتراكات
 * غير مفعّلتين بعد. Route: /chess
 */
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Flag, RefreshCcw, Sparkles } from 'lucide-react';
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
import { pickAiMove } from '@/lib/chessAi';
import { ChessBoardView } from '@/components/chess/ChessBoardView';
import { ChessLevelPicker } from '@/components/chess/ChessLevelPicker';

type ChessArenaView = 'landing' | 'playing';

const AI_MOVE_DELAY_MS = 260;

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

  useEffect(() => {
    const existing = readChessSession();
    if (existing && existing.status === 'playing') {
      setResumableSession(existing);
    } else if (existing) {
      clearChessSession();
    }
  }, []);

  function forceRerender() {
    setFenTick((n) => n + 1);
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
    setResumableSession(null);
    persistSession(chessRef.current, pendingLevel, 'playing');
    setView('playing');
    forceRerender();
  }

  function handlePlayerMove(from: string, to: string, promotion?: string) {
    if (status !== 'playing' || aiThinking) return;
    const chess = chessRef.current;

    try {
      const result = chess.move({ from, to, promotion });
      if (!result) return;
    } catch {
      return;
    }

    forceRerender();
    const statusAfterPlayer = deriveStatusAfterMove(chess);
    setStatus(statusAfterPlayer);
    persistSession(chess, level, statusAfterPlayer);

    if (statusAfterPlayer !== 'playing') return;

    setAiThinking(true);
    window.setTimeout(() => {
      const aiMove = pickAiMove(chess, level);
      if (aiMove) {
        try {
          chess.move({ from: aiMove.from, to: aiMove.to, promotion: aiMove.promotion });
        } catch {
          // تجاهل دفاعياً — لا يفترض حدوثه لأن النقلة قادمة من قائمة النقلات الشرعية نفسها.
        }
      }
      const statusAfterAi = deriveStatusAfterMove(chess);
      setStatus(statusAfterAi);
      persistSession(chess, level, statusAfterAi);
      setAiThinking(false);
      forceRerender();
    }, AI_MOVE_DELAY_MS);
  }

  function handleResign() {
    if (status !== 'playing') return;
    if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmResignAr)) return;
    setStatus('resigned');
    clearChessSession();
  }

  function handleBackToPicker() {
    if (status === 'playing') {
      if (typeof window !== 'undefined' && !window.confirm(CHESS_ARENA_COPY.confirmNewGameWhilePlayingAr)) return;
    }
    clearChessSession();
    setResumableSession(null);
    setPendingLevel(null);
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

  const isGameOver = status !== 'playing';
  const sanHistory = chessRef.current.history();

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf3e6 0%, #f0e2c4 100%)' }}>
      <div className="sticky top-0 z-30 border-b border-[#e3d5b8] bg-[#faf3e6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="flex items-center gap-2 text-sm font-bold text-[#7a6a4f] transition-colors hover:text-[#3a2c1a]"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            {CHESS_ARENA_COPY.backHomeAr}
          </button>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-black text-[#3a2c1a]">{CHESS_ARENA_COPY.heroBadgeAr}</span>
          </div>
          <span className="w-16" aria-hidden="true" />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        {view === 'landing' && (
          <>
            <header className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/10">
                <Crown className="h-7 w-7 text-amber-700" />
              </div>
              <h1 className="text-2xl font-black text-[#3a2c1a] sm:text-3xl">{CHESS_ARENA_COPY.heroTitleAr}</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#7a6a4f] sm:text-base">
                {CHESS_ARENA_COPY.heroSubtitleAr}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-xs text-amber-800/70">{CHESS_ARENA_COPY.heroNoteAr}</p>
            </header>

            {resumableSession && (
              <div className="mb-8 rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 text-center shadow-sm">
                <p className="mb-3 text-sm font-black text-[#3a2c1a]">{CHESS_ARENA_COPY.resumeBannerAr}</p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="rounded-xl bg-[#3a2c1a] px-5 py-2.5 text-sm font-black text-white"
                  >
                    {CHESS_ARENA_COPY.resumeButtonAr}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardResume}
                    className="rounded-xl border border-[#d8c6a1] bg-white px-5 py-2.5 text-sm font-bold text-[#7a6a4f]"
                  >
                    {CHESS_ARENA_COPY.newGameFromResumeAr}
                  </button>
                </div>
              </div>
            )}

            <ChessLevelPicker selected={pendingLevel} onSelect={setPendingLevel} onStart={handleStartNewGame} />

            <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-2xl border border-dashed border-amber-400/50 bg-white/60 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <p className="text-xs font-black text-amber-900">
                  {CHESS_ARENA_COPY.comingSoonBadgeAr} — {CHESS_ARENA_COPY.comingSoonTitleAr}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#8a7a5f]">{CHESS_ARENA_COPY.comingSoonBodyAr}</p>
              </div>
            </div>
          </>
        )}

        {view === 'playing' && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#e3d5b8] bg-white/70 px-4 py-3">
              <span className="text-xs font-bold text-[#7a6a4f]">
                {CHESS_ARENA_COPY.aiLabelAr} — {getChessDifficultyLevel(level).titleAr}
              </span>
              <span
                className={[
                  'text-sm font-black',
                  status === 'player_won'
                    ? 'text-emerald-700'
                    : status === 'ai_won' || status === 'resigned'
                      ? 'text-red-700'
                      : isCheck
                        ? 'text-red-600'
                        : 'text-[#3a2c1a]',
                ].join(' ')}
              >
                {getStatusMessage()}
              </span>
            </div>

            <ChessBoardView
              chess={chessRef.current}
              playerColor="w"
              interactive={status === 'playing' && !aiThinking}
              onPlayerMove={handlePlayerMove}
            />

            {sanHistory.length > 0 && (
              <div className="mx-auto mt-4 max-w-[480px] rounded-xl border border-[#e3d5b8] bg-white/70 p-3">
                <p className="mb-1 text-xs font-bold text-[#7a6a4f]">النقلات</p>
                <p className="text-xs leading-relaxed text-[#3a2c1a]" dir="ltr">
                  {sanHistory.join('  ')}
                </p>
              </div>
            )}

            <div className="mx-auto mt-6 flex max-w-[480px] flex-col justify-center gap-2 sm:flex-row">
              {!isGameOver && (
                <button
                  type="button"
                  onClick={handleResign}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700"
                >
                  <Flag className="h-4 w-4" />
                  {CHESS_ARENA_COPY.resignButtonAr}
                </button>
              )}
              <button
                type="button"
                onClick={handleBackToPicker}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#3a2c1a] px-5 py-2.5 text-sm font-black text-white"
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
