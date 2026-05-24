/**
 * B2BSalesManagerChat — مدير مبيعات B2B 💼
 *
 * يحلّ محل مساعد الشركاء على كل صفحات مسار الشركاء
 * خبير B2B متكامل — يُقنع بالعلم والأرقام
 * أيقونة: حقيبة ذهبية مع نجمة B2B
 * موضع: أسفل يسار (كمساعد الشركاء السابق)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Briefcase, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'ما الفرق بين الباقات؟ 💎',
  'ما العائد الاقتصادي؟ 📈',
  'كيف يعمل نظام الظهور؟',
  'ما تكلفة الانضمام؟ 💼',
  'هل تأخذون عمولة؟',
];

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  const time = h < 12 ? 'صباح النشاط' : h < 17 ? 'مساء التوفيق' : 'مساء الخير';
  return `${time} يا صاحبي! 💼
أنا مدير مبيعات B2B في حلاق ماب — وش الجديد؟
جاهز أشرح لك بالأرقام والحقائق كيف تحوّل صالونك من مكان محلي إلى وجهة رقمية يجدها الزبائن.`;
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.68rem] text-amber-300/55">مدير المبيعات يفكّر</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.16, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function sendMsg(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-b2b-sales-manager-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(-10).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    const data = (await res.json()) as { reply?: string };
    return data.reply || 'ما وصلني الرد — حاول مجدداً.';
  } catch {
    return 'خلل في الاتصال — عاود المحاولة بعد ثانية.';
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function B2BSalesManagerChat() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

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
    const reply = await sendMsg(msg, next);
    setTurns((p) => [...p, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    setLoading(false);
    if (!open) setUnread((u) => u + 1);
  }, [draft, loading, turns, open]);

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
            className="fixed inset-0 z-[58] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.aside key="modal" dir="rtl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-[88px] left-4 z-[59] flex w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl
              border border-amber-500/35 bg-[#0a0700]/97
              shadow-[0_-4px_60px_rgba(245,158,11,0.25),0_20px_60px_rgba(0,0,0,0.6)]
              backdrop-blur-xl sm:left-6 sm:bottom-[96px]"
            style={{ maxHeight: 'min(90dvh, 620px)' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/15 bg-gradient-to-l from-amber-500/12 to-transparent px-4 py-3.5">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-700/20 blur-sm" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl
                    border border-amber-400/40 bg-gradient-to-br from-[#1a0e00] to-[#080500]
                    shadow-[0_0_20px_rgba(245,158,11,0.30),inset_0_1px_0_rgba(251,191,36,0.18)]">
                    <Briefcase className="h-5 w-5 text-amber-300" strokeWidth={1.8} />
                    <motion.span
                      className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[0.42rem] font-black text-black ring-2 ring-[#0a0700]"
                      animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                      B2B
                    </motion.span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-amber-100">مدير مبيعات B2B</p>
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <p className="text-[0.58rem] text-amber-400/55">حلاق ماب · خبير الانضمام والنمو</p>
                </div>
              </div>

              <button onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400/55 hover:bg-amber-500/12 hover:text-amber-200 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="flex flex-col gap-2.5">
                {turns.map((t) => (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={t.role === 'assistant'
                      ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm border border-amber-500/18 bg-amber-500/8 px-3.5 py-2.5 text-[0.875rem] leading-6 text-amber-50'
                      : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.875rem] leading-6 text-slate-100'}
                  >
                    <p className="mb-1 text-[0.57rem] font-bold opacity-40">
                      {t.role === 'assistant' ? 'مدير مبيعات B2B 💼' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="self-start rounded-2xl rounded-tr-sm border border-amber-500/18 bg-amber-500/8">
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={endRef} className="h-1" />
              </div>
            </div>

            {/* Quick prompts */}
            {turns.length <= 2 && !loading && (
              <div className="shrink-0 border-t border-amber-500/10 px-3 py-2.5">
                <p className="mb-2 text-[0.6rem] text-amber-400/45">أسئلة مباشرة:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} type="button" onClick={() => void handleSend(q)}
                      className="rounded-full border border-amber-400/28 bg-amber-500/8 px-3 py-1.5 text-[0.65rem] font-semibold text-amber-300/85 hover:border-amber-400/55 hover:bg-amber-500/16 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Register CTA */}
            <div className="shrink-0 mx-3 mb-1 rounded-xl border border-amber-400/18 bg-amber-500/6 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.62rem] text-amber-300/70">مستعد للانضمام؟</p>
                <button
                  onClick={() => { setOpen(false); navigate(ROUTE_PATHS.REGISTER); }}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 px-3 py-1.5 text-[0.65rem] font-bold text-black hover:from-amber-400 transition-all"
                >
                  سجّل الآن <ArrowLeft className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-amber-500/15 bg-[#060400]/95 px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="اسألني عن الباقات، العائد، الانضمام… (Enter للإرسال)"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                  className="flex-1 rounded-xl border border-amber-400/20 bg-[#100800] px-3.5 py-2.5 text-sm leading-6 text-white placeholder:text-amber-400/28 outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/22 transition-all disabled:opacity-50"
                  dir="rtl"
                />
                <motion.button type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow shadow-amber-500/30 transition-all hover:from-amber-400 disabled:cursor-not-allowed disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.53rem] text-amber-400/18">
                مدير مبيعات B2B · حلاق ماب · مزوّد حلول تقنية
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Floating button ───────────────────────────────────── */}
      <div className="fixed bottom-6 left-4 z-[57] sm:left-6 md:bottom-8">
        <div className="relative">
          {/* Version badge */}
          <span className="pointer-events-none absolute -top-1 z-10 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-black shadow right-0">
            B2B
          </span>

          {/* Unread badge */}
          {!open && unread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -right-1 top-4 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[0.5rem] font-black text-white ring-2 ring-[#0a0700]">
              {unread}
            </motion.div>
          )}

          <motion.button type="button"
            onClick={() => setOpen((o) => !o)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 380, damping: 28 }}
            aria-label="فتح مدير مبيعات B2B"
            aria-expanded={open}
            className="relative flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {/* Pulse ring on first load */}
            <motion.div className="absolute inset-0 rounded-full border-2 border-amber-400/40"
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: 3, delay: 2 }} />

            {/* Button body */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/45 bg-gradient-to-br from-[#1a0e00] to-[#070400]
              shadow-[0_0_35px_rgba(245,158,11,0.45),0_0_70px_rgba(245,158,11,0.12)]" />

            {/* Briefcase icon */}
            <div className="relative z-10 flex flex-col items-center">
              <Briefcase className="h-5 w-5 text-amber-300" strokeWidth={1.8} />
              <span className="mt-0.5 text-[0.4rem] font-black tracking-wider text-amber-400/65">مبيعات</span>
            </div>

            {/* Shine */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-amber-400/6 to-amber-300/14" />
          </motion.button>
        </div>
      </div>
    </>
  );
}
