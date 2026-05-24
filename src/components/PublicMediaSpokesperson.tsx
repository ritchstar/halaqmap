/**
 * PublicMediaSpokesperson — المتحدث الإعلامي
 *
 * mode="hero"   → مدمج في الهيرو بطابع ضيافة فاخر
 * mode="float"  → زر عائم (احتياطي)
 *
 * التصميم: أيقونة ميكروفون ذهبي (+25%) + اسم متوهج براق + طابع ضيافة
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic } from 'lucide-react';

type Turn = { role: 'user' | 'assistant'; content: string; id: string };
interface Props { mode?: 'hero' | 'float' }

const QUICK_PROMPTS = [
  'كيف أبحث عن حلاق؟',
  'هل الخدمة مجانية؟',
  'كم صالون في المنصة؟',
  'ما أفضل باقة للمستخدم؟',
];

function getGreeting(): string {
  const h = new Date().getHours();
  const t = h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
  return `${t}! 🌟 أنا المتحدث الإعلامي لحلاق ماب — هلا والله! كيف أخدمك اليوم؟`;
}

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
    const data = (await res.json()) as { reply?: string; error?: string };
    return data.reply || 'ما وصلني الرد — عاود المحاولة. 🙏';
  } catch {
    return 'في مشكلة بالاتصال. جرّب مرة ثانية. 🛜';
  }
}

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

// ─── Sparkle stars around the icon ────────────────────────────────────────────
function Sparkles() {
  const stars = [
    { x: -24, y: -18, size: 6, delay: 0 },
    { x: 28, y: -20, size: 4, delay: 0.5 },
    { x: -28, y: 10, size: 5, delay: 1.0 },
    { x: 26, y: 16, size: 4, delay: 1.5 },
    { x: 2, y: -30, size: 5, delay: 0.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)` }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 8 8">
            <path d="M4 0L4.5 3.5L8 4L4.5 4.5L4 8L3.5 4.5L0 4L3.5 3.5Z"
              fill="#fbbf24" opacity="0.9" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function PublicMediaSpokesperson({ mode = 'float' }: Props) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(mode === 'float' ? 1 : 0);
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
    const reply = await sendMessage(msg, next);
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
    <div dir="rtl">
      {/* ── Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[56] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.aside key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="fixed bottom-6 left-4 z-[57] flex w-[min(90vw,380px)] flex-col overflow-hidden rounded-2xl
              border border-amber-400/30 bg-[#030d1a]/97 shadow-2xl backdrop-blur-xl sm:left-6"
            style={{ maxHeight: 'min(88dvh, 560px)' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-400/15 bg-gradient-to-l from-amber-500/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-[#1a0e00] shadow-[0_0_14px_rgba(245,158,11,0.25)]">
                  <Mic className="h-5 w-5 text-amber-300" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-100">المتحدث الإعلامي</p>
                  <p className="text-[0.58rem] text-amber-400/55">حلاق ماب · متاح الآن</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400/50 hover:bg-amber-500/10 hover:text-amber-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <div className="flex flex-col gap-2.5">
                {turns.map((t) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={t.role === 'assistant'
                      ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm border border-amber-400/18 bg-amber-500/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-amber-50'
                      : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-3.5 py-2.5 text-[0.85rem] leading-6 text-slate-100'}
                  >
                    <p className="mb-1 text-[0.55rem] font-bold opacity-40">
                      {t.role === 'assistant' ? 'المتحدث الإعلامي 🌟' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
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

            {/* Quick prompts */}
            {turns.length <= 2 && !loading && (
              <div className="shrink-0 border-t border-amber-400/10 px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} type="button" onClick={() => void handleSend(q)}
                      className="rounded-full border border-amber-400/25 bg-amber-500/8 px-3 py-1 text-[0.64rem] font-semibold text-amber-300/85 hover:border-amber-400/50 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-amber-400/15 bg-[#060400]/95 px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                  disabled={loading} placeholder="اكتب سؤالك… (Enter للإرسال)"
                  rows={1} style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
                  className="flex-1 rounded-xl border border-amber-400/20 bg-[#100800] px-3.5 py-2.5 text-sm text-white placeholder:text-amber-400/28 outline-none focus:border-amber-400/45 transition-all disabled:opacity-50"
                  dir="rtl"
                />
                <motion.button type="button" onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow shadow-amber-500/25 disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── HERO MODE — مدمج في الهيرو بطابع ضيافة ─────────────────────── */}
      {mode === 'hero' && !open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}
          className="flex flex-col items-center gap-2 cursor-pointer select-none"
          onClick={() => setOpen(true)}
        >
          {/* Outer glow rings — طابع ضيافة */}
          <div className="relative flex items-center justify-center">
            {/* Ring 1 — بطيء */}
            <motion.div
              className="absolute rounded-full border border-amber-400/20"
              style={{ width: 100, height: 100 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' }}
            />
            {/* Ring 2 — متأخر */}
            <motion.div
              className="absolute rounded-full border border-amber-300/15"
              style={{ width: 100, height: 100 }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3.5, delay: 0.7, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Icon — 25% bigger than 56px = ~70px */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="relative flex h-[70px] w-[70px] items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #1a0e00, #0a0500)',
                border: '2px solid rgba(245,158,11,0.55)',
                boxShadow: '0 0 32px rgba(245,158,11,0.40), 0 0 64px rgba(245,158,11,0.14), inset 0 1px 0 rgba(251,191,36,0.22)',
              }}
            >
              {/* Sparkles */}
              <Sparkles />

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

              {/* Mic icon — slightly bigger */}
              <Mic className="relative z-10 h-8 w-8 text-amber-300" strokeWidth={1.8} />

              {/* Pulse dot — متاح */}
              <motion.div
                className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
                style={{ background: '#4ade80', borderColor: '#030912' }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Name label — براق خافت */}
          <div className="flex flex-col items-center gap-0.5">
            <motion.p
              className="text-[0.72rem] font-black tracking-wider"
              style={{ color: 'rgba(245,158,11,0.80)' }}
              animate={{ opacity: [0.65, 0.95, 0.65] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              المتحدث الإعلامي
            </motion.p>
            <motion.p
              className="text-[0.55rem] font-semibold tracking-widest"
              style={{ color: 'rgba(245,158,11,0.40)' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
            >
              اضغط للحديث ✦
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* ── FLOAT MODE — زر احتياطي (if mode=float) ──────────────────────── */}
      {mode === 'float' && !open && (
        <div className="fixed bottom-6 right-20 z-[55] sm:right-24 md:bottom-8 md:right-28">
          <div className="relative">
            {!open && unread > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[0.55rem] font-black text-white ring-2 ring-[#020912]">
                {unread > 9 ? '9+' : unread}
              </motion.div>
            )}
            <motion.button type="button" onClick={() => setOpen(true)}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, type: 'spring' }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400/40 bg-gradient-to-br from-[#1a1000] to-[#070400] shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              <Mic className="h-5 w-5 text-amber-300" strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
