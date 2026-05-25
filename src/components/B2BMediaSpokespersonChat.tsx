/**
 * B2BMediaSpokespersonChat — مكتب المتحدث الإعلامي (مسار الشركاء)
 *
 * تصميم موازٍ لـ B2BSalesManagerChat — لوحة ثابتة أسفل يمين الشاشة
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, ChevronDown, ArrowLeft, Megaphone, Star, Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

type Turn = { role: 'user' | 'assistant'; content: string; id: string };

const PITCH_LINES = [
  '🎙️ من الفكرة إلى الاستجابة الذكية — هذا مسار حلاق ماب',
  'رؤية واضحة: رقمنة قطاع الحلاقة بدون وساطة تجارية',
  'حلاق ماب مزوّد حلول تقنية — لا عمولة على خدمة الحلاقة',
  'الظهور عند الطلب — كل ظهور فرصة حقيقية لا وجود شكلي',
  'شريك اليوم — رائد في قطاع الحلاقة الرقمي بالمملكة',
  'قصة المنصة: من الرادار الجغرافي إلى نظام الاستجابة الذكية',
];

const QUICK = [
  'ما قصة مسار المنصة؟ 🎙️',
  'لماذا الاستجابة الذكية؟',
  'هل حلاق ماب وسيط تجاري؟',
  'كيف أبدأ كشريك؟ 🚀',
];

function getGreeting(): string {
  const h = new Date().getHours();
  const t = h < 12 ? 'صباح الخير' : h < 17 ? 'مساء النور' : 'مساء الخير';
  return `${t}! 🎙️

أنا المتحدث الإعلامي لحلاق ماب — أشرح لك رؤية المنصة ومسار الشركاء بوضوح:

من فكرة «الظهور عند الطلب» إلى نظام الاستجابة الذكية — بدون وساطة تجارية ولا عمولة على القصة.

ما الذي تريد معرفته عن القصة أو المسار؟ 👇`;
}

async function sendMsg(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-media-spokesperson-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(-10).map((t) => ({ role: t.role, content: t.content })),
        audience: 'partner',
      }),
    });
    const data = (await res.json()) as { reply?: string };
    return data.reply || 'ما وصلني الرد — حاول مجدداً.';
  } catch {
    return 'خلل في الاتصال — عاود المحاولة.';
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.68rem] text-cyan-300/55">المتحدث يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.16, repeat: Infinity }} />
      ))}
    </div>
  );
}

function SpokespersonIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-12 w-12' : 'h-9 w-9';
  const icon = size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className={`relative flex shrink-0 items-center justify-center ${dim}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-teal-700/20 blur-md" />
      <div className={`relative flex ${dim} items-center justify-center rounded-2xl
        border-2 border-cyan-400/50 bg-gradient-to-br from-[#001018] to-[#020608]
        shadow-[0_0_24px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(103,232,249,0.22)]`}>
        <Mic className={`${icon} text-cyan-300`} strokeWidth={1.5} />
        <span className="absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[0.38rem] font-black text-black ring-2 ring-[#020608]">
          PR
        </span>
      </div>
    </div>
  );
}

export function B2BMediaSpokespersonChat({ mode = 'panel', startMinimized = false }: { mode?: 'panel' | 'inline'; startMinimized?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pitchIdx, setPitchIdx] = useState(0);
  const [minimized, setMinimized] = useState(startMinimized);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setPitchIdx((i) => (i + 1) % PITCH_LINES.length), 3400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (mode !== 'panel') return;
    const handleScroll = () => {
      const bannersEl = document.getElementById('معاينة البنرات');
      if (!bannersEl) {
        setMinimized(window.scrollY > window.innerHeight * 2.8);
        return;
      }
      const rect = bannersEl.getBoundingClientRect();
      setMinimized(rect.top < window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  useEffect(() => {
    if (open) setTimeout(() => textRef.current?.focus(), 150);
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
  }, [draft, loading, turns]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
  }, []);

  const wrapClass = mode === 'inline'
    ? `relative w-full ${open ? 'z-[50]' : 'z-10'}`
    : 'hidden sm:block fixed bottom-24 right-0 z-[49] md:bottom-6';

  if (mode === 'panel' && minimized && !open) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        onClick={() => { setMinimized(false); setOpen(true); }}
        className="hidden sm:flex fixed bottom-6 right-4 z-[49] h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-[#020912] shadow-[0_0_20px_rgba(34,211,238,0.35)]"
        title="المتحدث الإعلامي"
      >
        <Mic className="h-5 w-5 text-cyan-300" />
        <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[0.38rem] font-black text-black">
          PR
        </span>
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  return (
    <>
      <AnimatePresence>
        {open && mode === 'panel' && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[48] bg-black/55 backdrop-blur-[3px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <div dir="rtl" className={wrapClass} style={{ pointerEvents: 'auto', position: mode === 'inline' ? 'relative' : undefined }}>
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="teaser"
              initial={mode === 'inline' ? { opacity: 0, y: 10 } : { x: 320, opacity: 0 }}
              animate={mode === 'inline' ? { opacity: 1, y: 0 } : { x: 0, opacity: 1 }}
              exit={mode === 'inline' ? { opacity: 0, y: 10 } : { x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className={`relative overflow-hidden rounded-[22px] ${mode === 'inline' ? 'w-full' : 'mr-4'}`}
              style={mode === 'panel' ? { width: '210px' } : {}}
            >
              <div className="absolute inset-0 rounded-[22px] border border-cyan-400/40 bg-[#020912]/90 backdrop-blur-2xl" />
              <div className="pointer-events-none absolute right-0 top-1/2 h-[70%] w-4 -translate-y-1/2 rounded-r-full"
                style={{ background: 'radial-gradient(ellipse at right, rgba(34,211,238,0.45) 0%, transparent 70%)' }} />
              <div className="pointer-events-none absolute left-0 top-1/2 h-[70%] w-4 -translate-y-1/2 rounded-l-full"
                style={{ background: 'radial-gradient(ellipse at left, rgba(34,211,238,0.45) 0%, transparent 70%)' }} />
              <div className="pointer-events-none absolute inset-0 rounded-[22px]"
                style={{ boxShadow: '-4px 0 16px rgba(34,211,238,0.12), 4px 0 16px rgba(34,211,238,0.12), 0 6px 24px rgba(0,0,0,0.5)' }} />
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[22px]"
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(34,211,238,0.04) 50%, transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />

              <div className="relative px-3 py-3">
                <div className="mb-2.5 flex items-center gap-2">
                  <SpokespersonIcon size="sm" />
                  <div className="min-w-0">
                    <p className="text-[0.55rem] font-bold tracking-widest text-cyan-400/55 uppercase">حلاق ماب</p>
                    <p className="text-[0.72rem] font-black leading-tight text-cyan-50">المتحدث الإعلامي</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      <span className="text-[0.48rem] font-semibold text-emerald-300/80">متاح للحوار</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3 min-h-[36px] overflow-hidden rounded-lg border border-cyan-400/20 bg-cyan-500/8 px-2 py-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={pitchIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-[0.65rem] font-bold leading-snug text-cyan-50"
                      style={{ unicodeBidi: 'plaintext' }}
                    >
                      {PITCH_LINES[pitchIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-1">
                  {[
                    { icon: Megaphone, label: 'رؤية', val: '2030' },
                    { icon: Star, label: 'قصة', val: '✦' },
                    { icon: Radio, label: 'ردّ', val: 'فوري' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-md border border-cyan-400/15 bg-cyan-500/6 px-1 py-1.5">
                      <s.icon className="h-3 w-3 text-cyan-400" strokeWidth={2} />
                      <span className="text-[0.58rem] font-black text-cyan-50">{s.val}</span>
                      <span className="text-[0.45rem] text-cyan-400/50">{s.label}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-l from-cyan-500 to-teal-600 py-2 text-[0.72rem] font-black text-black shadow-[0_3px_12px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_3px_16px_rgba(34,211,238,0.50)]"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Mic className="h-4 w-4" />
                    تحدث مع المتحدث الإعلامي
                  </span>
                </motion.button>

                <button
                  onClick={() => navigate(ROUTE_PATHS.PARTNER_STORY)}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[0.65rem] text-cyan-400/50 hover:text-cyan-300 transition-colors"
                >
                  أو اقرأ القصة والمسار <ArrowLeft className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.aside
              key="chat"
              dir="rtl"
              initial={mode === 'inline' ? { opacity: 0, y: 12 } : { x: 440, opacity: 0, scale: 0.97 }}
              animate={mode === 'inline' ? { opacity: 1, y: 0 } : { x: 0, opacity: 1, scale: 1 }}
              exit={mode === 'inline' ? { opacity: 0, y: 12 } : { x: 440, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col overflow-hidden rounded-[28px] ${mode === 'inline' ? 'w-full' : 'mr-4'}`}
              style={mode === 'inline' ? { height: 'min(75dvh, 480px)' } : { width: '300px', height: 'min(75dvh, 480px)' }}
            >
              <div className="absolute inset-0 rounded-[28px] border border-cyan-400/35 bg-[#020912]/95 backdrop-blur-2xl
                shadow-[-8px_0_30px_rgba(34,211,238,0.18),8px_0_30px_rgba(34,211,238,0.18),0_8px_60px_rgba(0,0,0,0.7)]" />
              <div className="pointer-events-none absolute right-0 top-1/4 h-1/2 w-3 rounded-r-full"
                style={{ background: 'radial-gradient(ellipse at right, rgba(34,211,238,0.35) 0%, transparent 80%)' }} />
              <div className="pointer-events-none absolute left-0 top-1/4 h-1/2 w-3 rounded-l-full"
                style={{ background: 'radial-gradient(ellipse at left, rgba(34,211,238,0.35) 0%, transparent 80%)' }} />

              <div className="relative shrink-0 flex items-center justify-between gap-3 border-b border-cyan-500/18 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <SpokespersonIcon size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-cyan-50">المتحدث الإعلامي</p>
                      <Megaphone className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[0.55rem] text-cyan-400/50">حلاق ماب · الرؤية والقصة</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cyan-400/50 hover:bg-cyan-500/12 hover:text-cyan-200 transition-colors">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(34,211,238,0.04),transparent)]" />
                <div className="relative flex flex-col gap-2.5">
                  {turns.map((t) => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={t.role === 'assistant'
                        ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-teal-800/5 px-4 py-3 text-[0.875rem] leading-6 text-cyan-50 shadow-[0_2px_12px_rgba(34,211,238,0.08)]'
                        : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-4 py-3 text-[0.875rem] leading-6 text-slate-100'}
                    >
                      <p className="mb-1 text-[0.55rem] font-bold opacity-40">
                        {t.role === 'assistant' ? 'المتحدث الإعلامي 🎙️' : 'أنت'}
                      </p>
                      <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="self-start rounded-2xl rounded-tr-sm border border-cyan-500/20 bg-cyan-500/8">
                      <TypingDots />
                    </motion.div>
                  )}
                  <div ref={endRef} className="h-1" />
                </div>
              </div>

              {turns.length <= 2 && !loading && (
                <div className="relative shrink-0 border-t border-cyan-500/12 px-3 py-2.5">
                  <p className="mb-2 text-[0.58rem] text-cyan-400/40">اسألني مباشرة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK.map((q) => (
                      <button key={q} type="button" onClick={() => void handleSend(q)}
                        className="rounded-full border border-cyan-400/25 bg-cyan-500/8 px-3 py-1 text-[0.64rem] font-semibold text-cyan-300/85 hover:border-cyan-400/55 hover:bg-cyan-500/15 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative shrink-0 mx-3 mb-1.5 overflow-hidden rounded-2xl border border-cyan-400/35 bg-gradient-to-l from-cyan-500/14 via-teal-900/12 to-transparent px-4 py-3">
                <motion.div className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.07),transparent)' }}
                  animate={{ x: ['-100%','200%'] }} transition={{ duration: 3, repeat: Infinity, ease:'linear', repeatDelay: 2 }} />
                <div className="relative flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[0.72rem] font-black text-cyan-200">تريد معرفة المزيد؟ 📖</p>
                    <p className="text-[0.58rem] text-cyan-400/55">اقرأ قصة مسار الخدمات البرمجية</p>
                  </div>
                  <motion.button
                    onClick={() => { setOpen(false); navigate(ROUTE_PATHS.PARTNER_WHY); }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-600 px-4 py-2.5 text-[0.72rem] font-black text-black shadow-[0_2px_14px_rgba(34,211,238,0.40)] hover:from-cyan-400 transition-all">
                    لماذا تنضم؟ <ArrowLeft className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative shrink-0 border-t border-cyan-500/18 px-3 py-3">
                <div className="flex items-end gap-2">
                  <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="اسألني عن الرؤية، المسار، أو المنصة… (Enter للإرسال)"
                    rows={1}
                    style={{ minHeight: '46px', maxHeight: '130px', resize: 'none', overflowY: 'auto' }}
                    className="flex-1 rounded-xl border border-cyan-400/22 bg-[#041018] px-4 py-3 text-sm leading-6 text-white placeholder:text-cyan-400/28 outline-none focus:border-cyan-400/55 focus:ring-1 focus:ring-cyan-400/25 transition-all disabled:opacity-50"
                    dir="rtl"
                  />
                  <motion.button type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || loading}
                    whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-black shadow-[0_4px_16px_rgba(34,211,238,0.35)] transition-all hover:from-cyan-400 hover:shadow-[0_4px_22px_rgba(34,211,238,0.50)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Send className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <p className="mt-1.5 text-center text-[0.52rem] text-cyan-400/18">
                  المتحدث الإعلامي · حلاق ماب
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
