/**
 * LegalObserverChat — الناظر القانوني ⚖️
 *
 * زر عائم ذهبي التوهج يظهر في:
 *  - صفحة سياسة الخصوصية
 *  - صفحة شروط الاستخدام
 *  - صفحة من نحن
 *
 * يستجيب لأسئلة الخصوصية والامتثال والشروط القانونية
 * مهمة سرية: يُسجِّل كل استفسار للمدعي العام
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Scale } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };
type Props = { page: string }; // e.g. "سياسة الخصوصية"

// ─── Quick prompts by page ────────────────────────────────────────────────────
const QUICK_BY_PAGE: Record<string, string[]> = {
  'سياسة الخصوصية': [
    'ماذا تجمع المنصة من بياناتي؟',
    'هل تُشارَك بياناتي مع أطراف ثالثة؟',
    'كيف أحذف بياناتي؟',
    'هل تتبع المنصة موقعي باستمرار؟',
  ],
  'شروط الاستخدام': [
    'هل يمكنني استرداد المبلغ؟',
    'ما مدة صلاحية الباقة؟',
    'ماذا يحدث بعد انتهاء الباقة؟',
    'ما هي حقوقي كمستخدم؟',
  ],
  'من نحن': [
    'هل حلاق ماب تأخذ عمولة؟',
    'ما الفرق بينها وبين تطبيقات الحجز؟',
    'أين مقر الشركة؟',
    'كيف تكسب المنصة؟',
  ],
};

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(page: string): string {
  return `مرحباً، أنا الناظر القانوني لحلاق ماب ⚖️
أتواجد هنا في صفحة "${page}" لأجيب عن أسئلتك المتعلقة بالخصوصية والشروط القانونية.
كيف يمكنني مساعدتك؟`;
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function sendMsg(msg: string, history: Turn[], page: string): Promise<string> {
  try {
    const res = await fetch('/api/public-legal-observer-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        page,
        history: history.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    const data = (await res.json()) as { reply?: string };
    return data.reply || 'لم أتمكن من الرد — حاول مجدداً.';
  } catch {
    return 'حصل خلل في الاتصال — عاود المحاولة.';
  }
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.68rem] text-yellow-300/55">الناظر يقرأ…</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-yellow-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.16, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LegalObserverChat({ page }: Props) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(page), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);
  const quickPrompts = QUICK_BY_PAGE[page] ?? QUICK_BY_PAGE['سياسة الخصوصية'];

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => textRef.current?.focus(), 150); }
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';

    const next: Turn[] = [...turns, { role: 'user', content: msg, id: `u-${++seq.current}` }];
    setTurns(next);
    setLoading(true);

    const reply = await sendMsg(msg, next, page);
    setTurns((p) => [...p, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    setLoading(false);
    if (!open) setUnread((u) => u + 1);
  }, [draft, loading, turns, open, page]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }, []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[56] bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.aside key="modal" dir="rtl"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-[88px] right-4 z-[57] flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl
              border border-yellow-500/30 bg-[#100a00]/97 shadow-[0_-4px_50px_rgba(234,179,8,0.20)] backdrop-blur-xl
              sm:right-6 sm:bottom-[96px]"
            style={{ maxHeight: 'min(88dvh, 580px)' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-yellow-500/15 bg-gradient-to-l from-yellow-500/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                  border border-yellow-500/40 bg-gradient-to-br from-[#1a1200] to-[#080500]
                  shadow-[0_0_18px_rgba(234,179,8,0.28)]">
                  <Scale className="h-5 w-5 text-yellow-300" strokeWidth={1.8} />
                  <motion.div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#100a00]"
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div>
                  <p className="text-sm font-black text-yellow-100 leading-tight">الناظر القانوني ⚖️</p>
                  <p className="text-[0.58rem] text-yellow-400/55">صفحة: {page} · متاح الآن</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-yellow-400/55 hover:bg-yellow-500/10 hover:text-yellow-200 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="flex flex-col gap-2.5">
                {turns.map((t) => (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={t.role === 'assistant'
                      ? 'self-start max-w-[92%] rounded-2xl rounded-tr-sm border border-yellow-500/18 bg-yellow-500/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-yellow-50'
                      : 'self-end max-w-[92%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-slate-100'}
                  >
                    <p className="mb-1 text-[0.57rem] font-bold opacity-45">
                      {t.role === 'assistant' ? 'الناظر القانوني ⚖️' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="self-start rounded-2xl rounded-tr-sm border border-yellow-500/18 bg-yellow-500/8">
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={endRef} className="h-1" />
              </div>
            </div>

            {/* Quick prompts */}
            {turns.length <= 2 && !loading && (
              <div className="shrink-0 border-t border-yellow-500/10 px-3 py-2">
                <p className="mb-1.5 text-[0.6rem] text-yellow-400/45">اسألني:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((q) => (
                    <button key={q} type="button" onClick={() => void handleSend(q)}
                      className="rounded-full border border-yellow-500/25 bg-yellow-500/8 px-3 py-1 text-[0.64rem] font-semibold text-yellow-300/85 hover:border-yellow-500/50 hover:bg-yellow-500/15 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-yellow-500/15 bg-[#080500]/95 px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="سؤالك القانوني… (Enter للإرسال)"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                  className="flex-1 rounded-xl border border-yellow-500/20 bg-[#100800] px-3.5 py-2.5 text-sm leading-6 text-white
                    placeholder:text-yellow-400/28 outline-none focus:border-yellow-500/45 focus:ring-1 focus:ring-yellow-500/22 transition-all
                    disabled:opacity-50"
                  dir="rtl"
                />
                <motion.button type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                    bg-gradient-to-br from-yellow-500 to-yellow-700 text-black
                    shadow shadow-yellow-500/25 transition-all hover:from-yellow-400
                    disabled:cursor-not-allowed disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.53rem] text-yellow-400/18">
                الناظر القانوني · مهمة سرية: يُسجِّل الاستفسارات للمدعي العام
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Floating trigger ─────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-[55] sm:right-6 md:bottom-8">
        <div className="relative">
          {!open && unread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[0.55rem] font-black text-white ring-2 ring-[#100a00]">
              {unread}
            </motion.div>
          )}

          <motion.button type="button"
            onClick={() => setOpen((o) => !o)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 380, damping: 28 }}
            aria-label="فتح الناظر القانوني"
            className="relative flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/45 bg-gradient-to-br from-[#1a1200] to-[#060400]
              shadow-[0_0_32px_rgba(234,179,8,0.40),0_0_64px_rgba(234,179,8,0.12)]" />
            <div className="relative z-10 flex flex-col items-center">
              <Scale className="h-5 w-5 text-yellow-300" strokeWidth={1.8} />
              <span className="mt-0.5 text-[0.42rem] font-black tracking-wider text-yellow-400/65">قانوني</span>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-yellow-400/5 to-yellow-300/12" />
          </motion.button>
        </div>
      </div>
    </>
  );
}
