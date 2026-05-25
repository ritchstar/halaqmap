/**
 * B2BSalesManagerChat — مكتب مدير مبيعات B2B الفاخر
 *
 * ليس زراً عائماً — بل مكتب تفاوض حقيقي مدمج في الصفحة
 * يتواجد على جميع صفحات مسار الشركاء
 *
 * حالتان:
 *  TEASER: لوحة ذهبية بنصوص متحركة تستقطب الزائر
 *  OPEN:   شات موسّع زجاجي فاخر مع كل مزايا المفاوضة
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Building2, TrendingUp, ChevronDown,
  ArrowLeft, Briefcase, Star, PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Rotating pitch lines ─────────────────────────────────────────────────────
const PITCH_LINES = [
  '⚡ عرض محدود: اشترِ ٦ حزم واحصل على ٦ مجاناً — سنة كاملة بنصف السعر!',
  '🎁 مضاعفة الرخص التأسيسية — الألف الرواد · احجز مقعدك قبل اكتماله',
  '🏛️ الماسية + إضافة المكتب الخاص — مساعد داخلي + مناوب شات مترابطان',
  '📋 أعطِ تعليماتك بـ«تعليمة:» والمناوب ينفّذها — والتقارير تصلك تلقائياً',
  '📈 اشترِ ١٢ حزمة + ١٢ مجاناً = سنتان بسعر سنة واحدة!',
  'استثمار بـ١٠٠ ر.س يُغطّيه زبون واحد — والباقي ربح صافٍ',
  '🚨 المقاعد تنفد — منافسك قد يسبقك، تصرّف الآن',
  '🔥 الذهبي ٦+٦ مجاناً = ١,٨٠٠ ر.س توفيراً مضموناً',
];

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK = [
  'فسّر لي عرض المضاعفة 🎁',
  'ما هي إضافة المكتب الخاص؟ 🏛️',
  'ما الفرق بين الباقات؟ 💎',
  'هل في عمولة على القصة؟',
  'كيف يعمل نظام الظهور الجغرافي؟',
  'ما مدة صلاحية الحزمة؟',
  'كيف أبدأ الانضمام؟ 🚀',
];

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  const t = h < 12 ? 'صباح النجاح' : h < 17 ? 'مساء التوفيق' : 'مساء الخير';
  return `${t} يا صاحبي! 💼

أنا مدير مبيعات B2B في حلاق ماب — وعندي لك خبر مهم:

⚡ العرض التشغيلي التأسيسي لمضاعفة الرخص نشط الآن!
اشترِ أي حزمة واحصل على ضعفها مجاناً — ٣+٣، ٦+٦، أو ١٢+١٢.
العرض حصري للألف الرواد (١٠٠٠ صالون فقط) — والمقاعد تنفد. كل مشترك يحصل على ⭐ شارة رائد لامعة على بنره.

وش يهمّك أكثر؟ أشرح لك التوفير بالأرقام الآن 👇`;
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
    return 'خلل في الاتصال — عاود المحاولة.';
  }
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

// ─── The Office Icon ──────────────────────────────────────────────────────────
function OfficeIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-12 w-12' : 'h-9 w-9';
  const icon = size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className={`relative flex shrink-0 items-center justify-center ${dim}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-700/20 blur-md" />
      <div className={`relative flex ${dim} items-center justify-center rounded-2xl
        border-2 border-amber-400/50 bg-gradient-to-br from-[#1e1000] to-[#080400]
        shadow-[0_0_24px_rgba(245,158,11,0.40),inset_0_1px_0_rgba(251,191,36,0.22)]`}>
        <Building2 className={`${icon} text-amber-300`} strokeWidth={1.5} />
        {/* B2B badge */}
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[0.38rem] font-black text-black ring-2 ring-[#080400]">
          B2B
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * mode="panel" → لوحة ثابتة أسفل يسار الشاشة (لصفحات PartnerLayout)
 * mode="inline" → مدمج داخل تصميم الصفحة بلا fixed (لـ PartnerMarketingPreview)
 */
export function B2BSalesManagerChat({ mode = 'panel', startMinimized = false }: { mode?: 'panel' | 'inline'; startMinimized?: boolean }) {
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

  // Rotate pitch lines
  useEffect(() => {
    const id = setInterval(() => setPitchIdx((i) => (i + 1) % PITCH_LINES.length), 3200);
    return () => clearInterval(id);
  }, []);

  // تكمّش تلقائي عند دخول قسم البنرات (panel mode فقط)
  useEffect(() => {
    if (mode !== 'panel') return;
    const handleScroll = () => {
      const bannersEl = document.getElementById('معاينة البنرات');
      if (!bannersEl) {
        // fallback: threshold 2.8 screens
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
    if (open) { setTimeout(() => textRef.current?.focus(), 150); }
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

  // Panel mode: fixed bottom-left — مخفي على الجوال في الوضع المصغّر
  const wrapClass = mode === 'inline'
    ? `relative w-full ${open ? 'z-[50]' : 'z-10'}`
    : 'hidden sm:block fixed bottom-24 left-0 z-[49] md:bottom-6';

  // وضع التكمّش — يظهر فقط في panel mode عند الدخول لقسم البنرات
  if (mode === 'panel' && minimized && !open) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        onClick={() => { setMinimized(false); setOpen(true); }}
        className="hidden sm:flex fixed bottom-6 left-4 z-[49] h-10 w-10 items-center justify-center rounded-full border-2 border-amber-400/60 bg-[#0a0600] shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        title="مدير مبيعات B2B"
      >
        <Building2 className="h-5 w-5 text-amber-300" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[0.38rem] font-black text-black">
          B2B
        </span>
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-amber-400/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  return (
    <>
      {/* ── Backdrop — panel mode فقط ─────────────── */}
      <AnimatePresence>
        {open && mode === 'panel' && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[48] bg-black/55 backdrop-blur-[3px]"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── OFFICE PANEL ─────────────────────────────── */}
      <div
        dir="rtl"
        className={wrapClass}
        style={{ pointerEvents: 'auto', position: mode === 'inline' ? 'relative' : undefined }}
      >
        <AnimatePresence mode="wait">
          {!open ? (
              /* ═══════════ TEASER PANEL ═══════════ */
            <motion.div
              key="teaser"
              initial={mode === 'inline' ? { opacity: 0, y: 10 } : { x: -320, opacity: 0 }}
              animate={mode === 'inline' ? { opacity: 1, y: 0 } : { x: 0, opacity: 1 }}
              exit={mode === 'inline' ? { opacity: 0, y: 10 } : { x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className={`relative overflow-hidden rounded-[22px] ${mode === 'inline' ? 'w-full' : ''}`}
              style={mode === 'panel' ? { width: '210px' } : {}}
            >
              {/* Main glass background — بيضاوي */}
              <div className="absolute inset-0 rounded-[22px] border border-amber-400/40
                bg-[#0a0600]/90 backdrop-blur-2xl" />

              {/* توهج ذهبي من اليمين */}
              <div className="pointer-events-none absolute right-0 top-1/2 h-[70%] w-4 -translate-y-1/2 rounded-r-full"
                style={{ background: 'radial-gradient(ellipse at right, rgba(245,158,11,0.55) 0%, transparent 70%)' }} />

              {/* توهج ذهبي من اليسار */}
              <div className="pointer-events-none absolute left-0 top-1/2 h-[70%] w-4 -translate-y-1/2 rounded-l-full"
                style={{ background: 'radial-gradient(ellipse at left, rgba(245,158,11,0.55) 0%, transparent 70%)' }} />

              {/* ظل خارجي من الجانبين */}
              <div className="pointer-events-none absolute inset-0 rounded-[22px]"
                style={{ boxShadow: '-4px 0 16px rgba(245,158,11,0.15), 4px 0 16px rgba(245,158,11,0.15), 0 6px 24px rgba(0,0,0,0.5)' }} />

              {/* Shimmer sweep */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-l-2xl"
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(245,158,11,0.04) 50%, transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />

              <div className="relative px-3 py-3">
                {/* Header */}
                <div className="mb-2.5 flex items-center gap-2">
                  <OfficeIcon size="sm" />
                  <div className="min-w-0">
                    <p className="text-[0.55rem] font-bold tracking-widest text-amber-400/55 uppercase">حلاق ماب</p>
                    <p className="text-[0.72rem] font-black leading-tight text-amber-100">مدير مبيعات B2B</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      <span className="text-[0.48rem] font-semibold text-emerald-300/80">متاح للتفاوض</span>
                    </div>
                  </div>
                </div>

                {/* Animated pitch line */}
                <div className="mb-3 min-h-[36px] overflow-hidden rounded-lg border border-amber-400/20 bg-amber-500/8 px-2 py-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={pitchIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-[0.65rem] font-bold leading-snug text-amber-100"
                      style={{ unicodeBidi: 'plaintext' }}
                    >
                      {PITCH_LINES[pitchIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Stats row — مخفي في الوضع المصغّر */}
                <div className="mb-3 grid grid-cols-3 gap-1">
                  {[
                    { icon: TrendingUp, label: 'عائد', val: '100%' },
                    { icon: Star, label: 'باقات', val: '3' },
                    { icon: PhoneCall, label: 'ردّ', val: 'فوري' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-md border border-amber-400/15 bg-amber-500/6 px-1 py-1.5">
                      <s.icon className="h-3 w-3 text-amber-400" strokeWidth={2} />
                      <span className="text-[0.58rem] font-black text-amber-100">{s.val}</span>
                      <span className="text-[0.45rem] text-amber-400/50">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 py-2 text-[0.72rem] font-black text-black shadow-[0_3px_12px_rgba(245,158,11,0.35)] transition-all hover:shadow-[0_3px_16px_rgba(245,158,11,0.50)]"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    تحدث مع مدير المبيعات
                  </span>
                </motion.button>

                {/* Register shortcut */}
                <button
                  onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[0.65rem] text-amber-400/50 hover:text-amber-300 transition-colors"
                >
                  أو سجّل مباشرة <ArrowLeft className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ) : (
              /* ═══════════ CHAT PANEL ═══════════ */
            <motion.aside
              key="chat"
              dir="rtl"
              initial={mode === 'inline' ? { opacity: 0, y: 12 } : { x: -440, opacity: 0, scale: 0.97 }}
              animate={mode === 'inline' ? { opacity: 1, y: 0 } : { x: 0, opacity: 1, scale: 1 }}
              exit={mode === 'inline' ? { opacity: 0, y: 12 } : { x: -440, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col overflow-hidden rounded-[28px] ${mode === 'inline' ? 'w-full' : ''}`}
              style={mode === 'inline' ? { height: 'min(75dvh, 480px)' } : { width: '300px', height: 'min(75dvh, 480px)' }}
            >
              {/* Chat panel background */}
              <div className="absolute inset-0 rounded-[28px] border border-amber-400/35
                bg-[#0a0600]/95 backdrop-blur-2xl
                shadow-[-8px_0_30px_rgba(245,158,11,0.20),8px_0_30px_rgba(245,158,11,0.20),0_8px_60px_rgba(0,0,0,0.7)]" />
              {/* Side glows on chat too */}
              <div className="pointer-events-none absolute right-0 top-1/4 h-1/2 w-3 rounded-r-full"
                style={{ background: 'radial-gradient(ellipse at right, rgba(245,158,11,0.40) 0%, transparent 80%)' }} />
              <div className="pointer-events-none absolute left-0 top-1/4 h-1/2 w-3 rounded-l-full"
                style={{ background: 'radial-gradient(ellipse at left, rgba(245,158,11,0.40) 0%, transparent 80%)' }} />

              {/* ── Header ── */}
              <div className="relative shrink-0 flex items-center justify-between gap-3 border-b border-amber-500/18 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <OfficeIcon size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-amber-100">مدير مبيعات B2B</p>
                      <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <p className="text-[0.55rem] text-amber-400/50">حلاق ماب · خبير الانضمام والنمو</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-400/50 hover:bg-amber-500/12 hover:text-amber-200 transition-colors">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* ── Messages ── */}
              <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                {/* Subtle inner glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(245,158,11,0.04),transparent)]" />
                <div className="relative flex flex-col gap-2.5">
                  {turns.map((t) => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={t.role === 'assistant'
                        ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-800/5 px-4 py-3 text-[0.875rem] leading-6 text-amber-50 shadow-[0_2px_12px_rgba(245,158,11,0.08)]'
                        : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm border border-white/12 bg-white/8 px-4 py-3 text-[0.875rem] leading-6 text-slate-100'}
                    >
                      <p className="mb-1 text-[0.55rem] font-bold opacity-40">
                        {t.role === 'assistant' ? 'مدير مبيعات B2B 💼' : 'أنت'}
                      </p>
                      <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="self-start rounded-2xl rounded-tr-sm border border-amber-500/20 bg-amber-500/8">
                      <TypingDots />
                    </motion.div>
                  )}
                  <div ref={endRef} className="h-1" />
                </div>
              </div>

              {/* ── Quick prompts ── */}
              {!loading && (
                <div className="relative shrink-0 border-t border-amber-500/12 px-3 py-2.5">
                  <p className="mb-2 text-[0.58rem] text-amber-400/40">اختر سؤالاً أو اكتب رسالتك:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK.map((q) => (
                      <button key={q} type="button" onClick={() => void handleSend(q)}
                        className="rounded-full border border-amber-400/25 bg-amber-500/8 px-3 py-1 text-[0.64rem] font-semibold text-amber-300/85 hover:border-amber-400/55 hover:bg-amber-500/15 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Register CTA — ثابت وبارز ── */}
              <div className="relative shrink-0 mx-3 mb-1.5 overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-l from-amber-500/14 via-amber-900/12 to-transparent px-4 py-3">
                {/* Shimmer */}
                <motion.div className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(245,158,11,0.07),transparent)' }}
                  animate={{ x: ['-100%','200%'] }} transition={{ duration: 3, repeat: Infinity, ease:'linear', repeatDelay: 2 }} />
                <div className="relative flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[0.72rem] font-black text-amber-200">جاهز للانضمام؟ 🚀</p>
                    <p className="text-[0.58rem] text-amber-400/55">النموذج الرسمي يستغرق 3 دقائق فقط</p>
                  </div>
                  <motion.button
                    onClick={() => { setOpen(false); navigate(ROUTE_PATHS.REGISTER); }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-4 py-2.5 text-[0.72rem] font-black text-black shadow-[0_2px_14px_rgba(245,158,11,0.40)] hover:from-amber-400 transition-all">
                    سجّل الآن <ArrowLeft className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* ── Input ── */}
              <div className="relative shrink-0 border-t border-amber-500/18 px-3 py-3">
                <div className="flex items-end gap-2">
                  <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="اسألني عن الباقات، العائد، أي شيء… (Enter للإرسال)"
                    rows={1}
                    style={{ minHeight: '46px', maxHeight: '130px', resize: 'none', overflowY: 'auto' }}
                    className="flex-1 rounded-xl border border-amber-400/22 bg-[#120900] px-4 py-3 text-sm leading-6 text-white placeholder:text-amber-400/28 outline-none focus:border-amber-400/55 focus:ring-1 focus:ring-amber-400/25 transition-all disabled:opacity-50"
                    dir="rtl"
                  />
                  <motion.button type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || loading}
                    whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all hover:from-amber-400 hover:shadow-[0_4px_22px_rgba(245,158,11,0.50)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Send className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <p className="mt-1.5 text-center text-[0.52rem] text-amber-400/18">
                  مدير مبيعات B2B · حلاق ماب
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
