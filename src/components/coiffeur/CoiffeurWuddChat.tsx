/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import {
  COIFFEUR_WUDD_CHAT_API,
  COIFFEUR_WUDD_INQUIRE_PATH,
  COIFFEUR_WUDD_INTEREST_PATH,
  COIFFEUR_WUDD_NAME_AR,
  COIFFEUR_WUDD_PITCH_LINES_AR,
  COIFFEUR_WUDD_QUICK_TOPICS,
  COIFFEUR_WUDD_ROLE_AR,
  coiffeurWuddGreetingAr,
} from '@/config/coiffeurWuddCopy';
import { useAgentChatInputFocus, useAgentChatOpenFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { cn } from '@/lib/utils';

type Turn = { role: 'user' | 'assistant'; content: string; id: string };

async function sendWuddMessage(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch(COIFFEUR_WUDD_CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(-10).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    const data = (await res.json()) as { reply?: string; error?: string };
    return data.reply || data.error || 'ما وصلني الرد — حاولي مجدداً.';
  } catch {
    return 'خلل في الاتصال — عاودي المحاولة.';
  }
}

export function CoiffeurWuddChat() {
  const [open, setOpen] = useState(false);
  const [pitchIdx, setPitchIdx] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: coiffeurWuddGreetingAr(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setPitchIdx((i) => (i + 1) % COIFFEUR_WUDD_PITCH_LINES_AR.length),
      3400,
    );
    return () => window.clearInterval(id);
  }, []);

  useAgentChatOpenFocus(open, textRef);
  useAgentChatScroll(messagesRef, [turns, loading, open]);
  useAgentChatInputFocus(loading, textRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text ?? draft).trim();
      if (!msg || loading) return;
      setDraft('');
      if (textRef.current) textRef.current.style.height = 'auto';
      const next: Turn[] = [...turns, { role: 'user', content: msg, id: `u-${++seq.current}` }];
      setTurns(next);
      setLoading(true);
      const reply = await sendWuddMessage(msg, next);
      setTurns((prev) => [...prev, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
      setLoading(false);
    },
    [draft, loading, turns],
  );

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="wudd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#14080e]/55 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-5 left-1/2 z-[71] w-[min(100vw-1.25rem,26rem)] -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="teaser"
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={() => setOpen(true)}
              className="flex w-full items-center gap-3 rounded-[1.6rem] border border-[#f4d4c0]/45 bg-[linear-gradient(165deg,#2a1218_0%,#14080e_100%)] px-3.5 py-3 text-right shadow-[0_18px_40px_rgba(20,8,14,0.45)]"
            >
              <CoiffeurBrandMark className="h-12 w-12" sizes="48px" showWordmark={false} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-black text-[#f4d4c0]">{COIFFEUR_WUDD_NAME_AR}</span>
                <span className="block text-[10px] text-[#f7efe8]/80">{COIFFEUR_WUDD_ROLE_AR}</span>
                <span className="mt-1 block min-h-[2.4rem] text-[11px] font-semibold leading-5 text-[#f7efe8]">
                  {COIFFEUR_WUDD_PITCH_LINES_AR[pitchIdx]}
                </span>
              </span>
              <Sparkles className="h-4 w-4 shrink-0 text-[#f4d4c0]" />
            </motion.button>
          ) : (
            <motion.section
              key="desk"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="overflow-hidden rounded-[1.75rem] border border-[#f4d4c0]/50 bg-[linear-gradient(180deg,#1a0c12_0%,#14080e_100%)] shadow-[0_24px_60px_rgba(20,8,14,0.55)]"
            >
              <header className="flex items-center justify-between gap-2 border-b border-[#f4d4c0]/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CoiffeurBrandMark className="h-11 w-11" sizes="44px" showWordmark={false} />
                  <div>
                    <p className="text-sm font-black text-[#f7efe8]">{COIFFEUR_WUDD_NAME_AR}</p>
                    <p className="text-[11px] text-[#f4d4c0]">{COIFFEUR_WUDD_ROLE_AR}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[#f4d4c0]/30 p-1.5 text-[#f4d4c0]"
                  aria-label="إغلاق مكتب ود"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </header>

              <div
                ref={messagesRef}
                className="max-h-[min(52dvh,22rem)] space-y-2 overflow-y-auto px-3 py-3"
              >
                {turns.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      'max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-7',
                      t.role === 'assistant'
                        ? 'mr-auto border border-[#f4d4c0]/25 bg-[#2a1218] text-[#f7efe8]'
                        : 'ml-auto bg-[#f4d4c0] text-[#14080e]',
                    )}
                  >
                    <div dir="rtl" className="chat-arabic-text whitespace-pre-wrap">
                      {t.content}
                    </div>
                  </div>
                ))}
                {loading ? (
                  <p className="text-[11px] text-[#f4d4c0]/80">ود تجهّز الرد…</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {COIFFEUR_WUDD_QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    disabled={loading}
                    onClick={() => void handleSend(topic.prompt)}
                    className="rounded-full border border-[#f4d4c0]/35 px-2.5 py-1 text-[11px] font-bold text-[#f4d4c0] disabled:opacity-50"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              <form
                className="flex items-end gap-2 border-t border-[#f4d4c0]/20 px-3 py-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
              >
                <textarea
                  ref={textRef}
                  value={draft}
                  disabled={loading}
                  rows={1}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="اكتبي سؤالك لود…"
                  className="min-h-[2.6rem] flex-1 resize-none rounded-2xl border border-[#f4d4c0]/25 bg-[#14080e] px-3 py-2 text-sm text-[#f7efe8] outline-none placeholder:text-[#f4d4c0]/45"
                />
                <button
                  type="submit"
                  disabled={loading || !draft.trim()}
                  className="rounded-2xl bg-[#f4d4c0] p-2.5 text-[#14080e] disabled:opacity-40"
                  aria-label="إرسال"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <footer className="flex justify-between gap-2 px-4 pb-3 text-[10px] text-[#f4d4c0]/70">
                <Link to={COIFFEUR_WUDD_INQUIRE_PATH} className="underline-offset-2 hover:underline">
                  تجربة الاستعلام
                </Link>
                <Link to={COIFFEUR_WUDD_INTEREST_PATH} className="underline-offset-2 hover:underline">
                  هذه الصفحة
                </Link>
              </footer>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
