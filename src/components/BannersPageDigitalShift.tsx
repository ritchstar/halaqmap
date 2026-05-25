/**
 * BannersPageDigitalShift — المناوب الرقمي الذكي على صفحة البنرات
 *
 * زر عائم ذكي أسفل يسار الصفحة — يستقبل زوار صفحة "معاينة البنرات والمناوب الذكي"
 * أيقونة: قمر ذهبي 🌙 (شعار المناوب الذكي)
 * أسلوب: سعودي ضاحك ثقافي — يحيل لمساعد الشركاء عند الحاجة
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Moon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK = [
  'ما هو المناوب الرقمي الذكي؟ 🌙',
  'كيف يساعد صالوني؟',
  'بكم Add-on المناوب؟',
  'ما الفرق بين الباقات؟',
  'هل في عمولة على القصة؟',
  'كيف أشترك؟',
];

// ─── Greetings ────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'صباح النور يا طيب! 🌅 أنا المناوب الرقمي الذكي — خذلي دقيقة وأشرح لك كيف أشتغل!';
  if (h >= 12 && h < 17) return 'هلا والله! 🌟 أنا المناوب الذكي — شريكك اللي ما ينام. بكيفك كيف أخدمك؟';
  if (h >= 17 && h < 21) return 'مساء الخير يا صاحبي! 🌆 أنا المناوب — حتى الليل أنا في الخدمة. وش تبي تعرف؟';
  return 'يا هلا وغلا! 🌙 الليل صاحبي وأنا المناوب الرقمي اللي ما يعرف نوم. كيف أفيدك؟';
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.68rem] text-violet-300/60">المناوب يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.16, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function sendMsg(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-digital-shift-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: history.slice(-8).map((t) => ({ role: t.role, content: t.content })) }),
    });
    const data = (await res.json()) as { reply?: string };
    return data.reply || 'ما وصلني ردك — عاود! 🙏';
  } catch {
    return 'في مشكلة بالاتصال — جرّب بعد ثانية. 🔄';
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BannersPageDigitalShift() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const [hasPulsed, setHasPulsed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  // Auto-scroll
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading, open]);

  // Focus + clear badge
  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => textRef.current?.focus(), 150); }
  }, [open]);

  // Body lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Pulse after 5s to attract attention
  useEffect(() => {
    if (hasPulsed) return;
    const t = setTimeout(() => setHasPulsed(true), 5000);
    return () => clearTimeout(t);
  }, [hasPulsed]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';

    const id = `u-${++seq.current}`;
    const next: Turn[] = [...turns, { role: 'user', content: msg, id }];
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
            className="fixed bottom-[88px] left-4 z-[57] flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl
              border border-violet-400/35 bg-[#08050f]/97 shadow-[0_-4px_50px_rgba(139,92,246,0.25)] backdrop-blur-xl
              sm:left-6 sm:bottom-[96px]"
            style={{ maxHeight: 'min(88dvh, 600px)' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-violet-400/15 bg-gradient-to-l from-violet-500/12 to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                  border border-violet-400/35 bg-gradient-to-br from-[#1a0a2e] to-[#070410]
                  shadow-[0_0_18px_rgba(139,92,246,0.30)]">
                  <Moon className="h-5 w-5 text-violet-300" strokeWidth={1.8} />
                  <motion.div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#08050f]"
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div>
                  <p className="text-sm font-black text-violet-100 leading-tight">المناوب الرقمي الذكي 🌙</p>
                  <p className="text-[0.58rem] text-violet-400/55">Add-on ماسي · نموذج حي</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-violet-400/55 hover:bg-violet-500/10 hover:text-violet-200 transition-colors">
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
                      ? 'self-start max-w-[92%] rounded-2xl rounded-tr-sm border border-violet-400/18 bg-violet-500/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-violet-50'
                      : 'self-end max-w-[92%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-slate-100'}
                  >
                    <p className="mb-1 text-[0.57rem] font-bold opacity-45">
                      {t.role === 'assistant' ? 'المناوب الذكي 🌙' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="self-start rounded-2xl rounded-tr-sm border border-violet-400/18 bg-violet-500/8">
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={endRef} className="h-1" />
              </div>
            </div>

            {/* Quick prompts */}
            {!loading && (
              <div className="shrink-0 border-t border-violet-400/10 px-3 py-2">
                <p className="mb-1.5 text-[0.6rem] text-violet-400/50">اختر سؤالاً أو اكتب رسالتك:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK.map((q) => (
                    <button key={q} type="button" onClick={() => void handleSend(q)}
                      className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[0.64rem] font-semibold text-violet-300/85 hover:border-violet-400/50 hover:bg-violet-500/18 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Referral note */}
            <div className="shrink-0 mx-3 mb-1 rounded-lg border border-teal-400/15 bg-teal-500/5 px-3 py-1.5 text-[0.6rem] text-teal-300/60">
              💬 أسئلة الانضمام؟ مساعد الشركاء (الزر الأخضر) أخصائي في هذا!
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-violet-400/15 bg-[#05030a]/95 px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="اسألني أي شيء… (Enter للإرسال)"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                  className="flex-1 rounded-xl border border-violet-400/22 bg-[#0d0820] px-3.5 py-2.5 text-sm leading-6 text-white
                    placeholder:text-violet-400/30 outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/25 transition-all
                    disabled:opacity-50"
                  dir="rtl"
                />
                <motion.button type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                    bg-gradient-to-br from-violet-500 to-violet-800 text-white
                    shadow shadow-violet-500/25 transition-all hover:from-violet-400
                    disabled:cursor-not-allowed disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.54rem] text-violet-400/20">
                نموذج حي للمناوب الرقمي الذكي · Add-on ماسي من حلاق ماب
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <div className="fixed bottom-6 left-4 z-[55] sm:left-6 md:bottom-8">
        <div className="relative">
          {!open && unread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[0.55rem] font-black text-white ring-2 ring-[#08050f]">
              {unread > 9 ? '9+' : unread}
            </motion.div>
          )}

          <motion.button type="button"
            onClick={() => setOpen((o) => !o)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 380, damping: 28 }}
            aria-label="فتح المناوب الرقمي الذكي"
            className="relative flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {/* Pulse ring (initial attention) */}
            {hasPulsed && !open && (
              <motion.div className="absolute inset-0 rounded-full border-2 border-violet-400/50"
                animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                transition={{ duration: 1.5, repeat: 2 }} />
            )}

            {/* Button body */}
            <div className="absolute inset-0 rounded-full border-2 border-violet-400/40 bg-gradient-to-br from-[#1a0a2e] to-[#070410]
              shadow-[0_0_30px_rgba(139,92,246,0.40),0_0_60px_rgba(139,92,246,0.12)]" />

            {/* Moon icon */}
            <div className="relative z-10 flex flex-col items-center">
              <Moon className="h-5 w-5 text-violet-300" strokeWidth={1.8} />
              <span className="mt-0.5 text-[0.42rem] font-black tracking-wider text-violet-400/65">ذكي</span>
            </div>

            {/* Shine */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-violet-400/6 to-violet-300/14" />
          </motion.button>
        </div>
      </div>
    </>
  );
}
