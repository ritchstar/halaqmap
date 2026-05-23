/**
 * PublicMediaSpokesperson — المتحدث الإعلامي على الصفحة الرئيسية
 *
 * نفس شخصية المتحدث الإعلامي في لوحة التحكم،
 * مُندَب لاستقبال المستخدمين على الصفحة الرئيسية.
 *
 * أيقونة: ميكروفون ذهبي فخم (✦ متمايز عن مساعد الشركاء)
 * موضع: أسفل يمين الشاشة (فوق FloatingPlatformActions)
 * لا يحتاج تسجيل دخول — مفتوح للجميع
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'كيف أبحث عن حلاق؟',
  'هل الخدمة مجانية؟',
  'كم صالون في المنصة؟',
  'ما الفرق بين الباقات؟',
];

// ─── Greeting generator ───────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  const timeGreet = h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
  return `${timeGreet}! 🌟 أنا المتحدث الإعلامي لحلاق ماب — هلا والله! كيف أخدمك اليوم؟`;
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function sendMessage(message: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-media-spokesperson-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    if (!res.ok) return 'عذراً، صار خلل بسيط. عاود بعد لحظة. 🙏';
    const data = (await res.json()) as { reply?: string; error?: string };
    return data.reply || 'ما وصلني الرد — ممكن تعيد؟';
  } catch {
    return 'يبدو في مشكلة في الاتصال. جرّب مرة ثانية. 🛜';
  }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.7rem] text-amber-300/60">المتحدث يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── The floating button icon ─────────────────────────────────────────────────
function SpokespersonIcon({ pulse }: { pulse: boolean }) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border-2 border-amber-400/35 bg-gradient-to-br from-[#1a1000] to-[#0a0800]
        shadow-[0_0_30px_rgba(245,158,11,0.35),0_0_60px_rgba(245,158,11,0.12)]" />

      {/* Pulse ring when new message */}
      {pulse && (
        <motion.div className="absolute inset-0 rounded-full border-2 border-amber-400/50"
          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
          transition={{ duration: 1.2, repeat: 3 }} />
      )}

      {/* Mic icon */}
      <div className="relative z-10 flex flex-col items-center">
        <Mic className="h-5 w-5 text-amber-300" strokeWidth={2} />
        {/* ن below mic — initial of متحدث */}
        <div className="mt-0.5 text-[0.45rem] font-black tracking-widest text-amber-400/70">م.إ</div>
      </div>

      {/* Gold shine */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-amber-400/8 to-amber-300/12" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PublicMediaSpokesperson() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [unread, setUnread] = useState(1); // shows badge on first load
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  // Auto-scroll
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading, open]);

  // Focus textarea on open
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Keyboard close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const id = `u-${++seq.current}`;
    const nextTurns: Turn[] = [...turns, { role: 'user', content: msg, id }];
    setTurns(nextTurns);
    setLoading(true);

    const reply = await sendMessage(msg, nextTurns);

    const aId = `a-${++seq.current}`;
    setTurns((prev) => [...prev, { role: 'assistant', content: reply, id: aId }]);
    setLoading(false);
    if (!open) { setPulse(true); setUnread((u) => u + 1); setTimeout(() => setPulse(false), 4000); }
  }, [draft, loading, turns, open]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[56] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Chat modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="fixed bottom-[88px] left-4 z-[57] flex w-[min(90vw,380px)] flex-col overflow-hidden rounded-2xl
              border border-amber-400/30 bg-[#0a0800]/97 shadow-[0_-4px_40px_rgba(245,158,11,0.18)] backdrop-blur-xl
              sm:left-6 sm:bottom-[96px]"
            style={{ maxHeight: 'min(85dvh, 580px)' }}
          >
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-400/15 bg-gradient-to-l from-amber-500/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                  border border-amber-400/30 bg-gradient-to-br from-[#1a1000] to-[#060400]
                  shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Mic className="h-4.5 w-4.5 text-amber-300" strokeWidth={2} />
                  <motion.div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0a0800]"
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-100 leading-tight">المتحدث الإعلامي</p>
                  <p className="text-[0.6rem] text-amber-400/60">حلاق ماب · متاح الآن</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-200 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="flex flex-col gap-2.5">
                {turns.map((t) => (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={t.role === 'assistant'
                      ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm border border-amber-400/18 bg-amber-500/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-amber-50'
                      : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-slate-100'}
                  >
                    <p className="mb-1 text-[0.58rem] font-bold opacity-50">
                      {t.role === 'assistant' ? 'المتحدث' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>
                      {t.content}
                    </p>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="self-start rounded-2xl rounded-tr-sm border border-amber-400/18 bg-amber-500/8">
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={endRef} className="h-1" />
              </div>
            </div>

            {/* ── Quick prompts ────────────────────────────── */}
            {turns.length <= 2 && !loading && (
              <div className="shrink-0 border-t border-amber-400/10 px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} type="button"
                      onClick={() => void handleSend(q)}
                      className="rounded-full border border-amber-400/25 bg-amber-500/8 px-3 py-1 text-[0.65rem] font-semibold text-amber-300/80 hover:border-amber-400/50 hover:bg-amber-500/15 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input ───────────────────────────────────── */}
            <div className="shrink-0 border-t border-amber-400/15 bg-[#060400]/95 px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={handleInput}
                  onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="اكتب سؤالك… (Enter للإرسال)"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                  className="flex-1 rounded-xl border border-amber-400/20 bg-[#100c00] px-3.5 py-2.5 text-sm leading-6 text-white placeholder:text-amber-400/30 outline-none focus:border-amber-400/45 focus:ring-1 focus:ring-amber-400/25 transition-all disabled:opacity-50"
                  dir="rtl"
                />
                <motion.button type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow shadow-amber-500/25 transition-all hover:from-amber-400 disabled:cursor-not-allowed disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.55rem] text-amber-400/25">
                محادثة عامة · خارج نطاق الخصوصية الرسمية
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Floating trigger button ──────────────────────── */}
      <div className="fixed bottom-6 right-20 z-[55] sm:right-24 md:bottom-8 md:right-28">
        <div className="relative">
          {/* Unread badge */}
          {!open && unread > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[0.55rem] font-black text-white ring-2 ring-[#020912]">
              {unread > 9 ? '9+' : unread}
            </motion.div>
          )}

          {/* Main button */}
          <motion.button
            type="button"
            onClick={() => setOpen((o) => !o)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 380, damping: 28 }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="فتح المتحدث الإعلامي"
            aria-expanded={open}
          >
            <SpokespersonIcon pulse={pulse} />
          </motion.button>

          {/* Tooltip on hover */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="pointer-events-none absolute left-full top-1/2 ms-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-amber-400/25 bg-[#0a0800]/90 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-200 backdrop-blur-sm opacity-0"
          >
            المتحدث الإعلامي 🎙
          </motion.div>
        </div>
      </div>
    </>
  );
}
