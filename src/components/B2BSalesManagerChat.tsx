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

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useAgentChatInputFocus, useAgentChatOpenFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, TrendingUp, ChevronDown,
  ArrowLeft, Briefcase, Star, PhoneCall, Scissors, Store, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Rotating pitch lines ─────────────────────────────────────────────────────
const PITCH_LINES = [
  '💼 باقات واضحة ومسبقة الدفع — اختر الحزمة المناسبة وفق السياسة المعتمدة.',
  '✂️ الظهور عند الطلب يبدأ من رخصة النفاذ البرمجية — بلا عمولات على الخدمة.',
  '🏛️ الماسية + إضافة المكتب الخاص — مساعد داخلي + مناوب شات مترابطان',
  '📋 أعطِ تعليماتك بـ«تعليمة:» والمناوب ينفّذها — والتقارير تصلك تلقائياً',
  '📈 اختر الباقة بحسب جاهزية صالونك واحتياجك التشغيلي الفعلي.',
  '🔒 الأسعار والمدة والتفعيل تخضع دائمًا لما هو ظاهر في مسار الشراء المعتمد.',
  '🌙 إضافة المكتب الخاص توسّع قدرة الرد والتشغيل خارج أوقات الانشغال.',
];

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK = [
  'ما الفرق بين الباقات؟ 💎',
  'ما هي إضافة المكتب الخاص؟ 🏛️',
  'اشرح لي الوضع النظامي والتوثيق الرسمي 🧾',
  'هل في عمولة على القصة؟',
  'كيف يعمل نظام الظهور عند الطلب؟',
  'ما مدة صلاحية الحزمة؟',
  'هل أحتاج وثائق حكومية؟',
  'كيف أبدأ الانضمام؟ 🚀',
];

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  const t = h < 12 ? 'صباح النجاح' : h < 17 ? 'مساء التوفيق' : 'مساء الخير';
  return `${t} يا صاحبي! 💼

أنا مدير مبيعات B2B في حلاق ماب.

مهمتي أن أوضح لك الباقات الفعلية الحالية، وآلية الظهور عند الطلب، وما يناسب صالونك تشغيليًا وفق السياسة المعتمدة.

وش يهمّك أكثر؟ أشرح لك الفرق بين الباقات، أو إضافة المكتب الخاص، أو مسار التفعيل 👇`;
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
      <span className="text-[0.68rem] text-slate-500">مدير المبيعات يحضّر الرد</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-500"
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200/40 via-cyan-100/25 to-emerald-100/25 blur-md" />
      <div className={`relative flex ${dim} items-center justify-center rounded-2xl
        border border-amber-200 bg-[linear-gradient(145deg,#fffdf8,#f9f4e7)]
        shadow-[0_12px_28px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.85)]`}>
        <Scissors className={`${icon} text-amber-700`} strokeWidth={1.7} />
        {/* B2B badge */}
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200 bg-white text-[0.38rem] font-black text-cyan-700 ring-2 ring-white">
          B2B
        </span>
      </div>
    </div>
  );
}

/** صندوق حوار سعودي مرن — إطار مزدوج، زوايا سائلة، ارتفاع يتكيّف مع المحتوى والشاشة */
function SaudiFlexibleDialogShell({
  children,
  className,
  fluidHeight = false,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  fluidHeight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden',
        'rounded-[clamp(1.125rem,3.2vw,1.875rem)]',
        'border border-slate-200/90',
        'bg-[linear-gradient(165deg,#fffefa_0%,#fbf7ef_42%,#f8fbff_100%)]',
        'backdrop-blur-2xl',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_20px_60px_rgba(148,163,184,0.22)]',
        fluidHeight &&
          'min-h-[clamp(22rem,52dvh,28rem)] max-h-[min(90dvh,54rem)] h-[min(80dvh,54rem)]',
        compact && 'min-h-0 max-h-none h-auto',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/80" aria-hidden />
      <div
        className="pointer-events-none absolute inset-[clamp(4px,1.2vw,7px)] rounded-[clamp(0.875rem,2.6vw,1.5rem)] border border-amber-100/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90"
        style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.14), rgba(255,255,255,0))' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(15,23,42,0.7) 0, rgba(15,23,42,0.7) 1px, transparent 1px, transparent 12px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-6 top-5 flex gap-2 opacity-20"
        aria-hidden
      >
        <div className="h-8 w-8 rounded-full border border-amber-200 bg-white/80" />
        <div className="h-8 w-8 rounded-full border border-cyan-200 bg-white/70" />
        <div className="h-8 w-8 rounded-full border border-emerald-200 bg-white/70" />
      </div>
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * mode="panel" → لوحة ثابتة أسفل يسار الشاشة (لصفحات PartnerLayout)
 * mode="inline" → مدمج داخل تصميم الصفحة بلا fixed
 * mode="office" → مفتوح دائماً داخل صفحة مكتب مستقلة
 */
export function B2BSalesManagerChat({
  mode = 'panel',
  startMinimized = false,
}: {
  mode?: 'panel' | 'inline' | 'office';
  startMinimized?: boolean;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(mode === 'office');
  const [pitchIdx, setPitchIdx] = useState(0);
  const [minimized, setMinimized] = useState(startMinimized);
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'assistant', content: getGreeting(), id: 'welcome' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  // Rotate pitch lines
  useEffect(() => {
    const id = setInterval(() => setPitchIdx((i) => (i + 1) % PITCH_LINES.length), 3200);
    return () => clearInterval(id);
  }, []);

  // تكمّش تلقائي عند النزول (panel mode فقط)
  useEffect(() => {
    if (mode !== 'panel') return;
    const handleScroll = () => {
      const bannersEl = document.getElementById('معاينة البنرات');
      if (bannersEl) {
        const rect = bannersEl.getBoundingClientRect();
        setMinimized(rect.top < window.innerHeight * 0.6);
      } else {
        // الصفحات الفرعية: ينزل بعد شاشة واحدة
        setMinimized(window.scrollY > window.innerHeight * 1.0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  useAgentChatOpenFocus(open, textRef);

  useAgentChatScroll(messagesRef, [turns, loading, open]);
  useAgentChatInputFocus(loading, textRef, open);

  useEffect(() => {
    if (!open || mode !== 'panel') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open, mode]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mode === 'office') navigate(ROUTE_PATHS.BARBERS_LANDING);
      else setOpen(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [mode, navigate]);

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

  // Panel mode: teaser ثابت، وعند الفتح يصبح «مجلس ضيوف» أمامي كبير (3/4 الشاشة تقريباً)
  const wrapClass = mode === 'office'
    ? 'relative z-10 w-full max-w-full'
    : mode === 'inline'
    ? open
      ? 'fixed inset-0 z-[72] flex items-center justify-center px-2 py-3 sm:px-4 sm:py-5'
      : 'relative z-10 w-full max-w-full'
    : open
      ? 'fixed inset-0 z-[72] flex items-center justify-center px-2 py-3 sm:px-4 sm:py-6'
      : 'fixed bottom-24 left-0 z-[49] md:bottom-6';

  // وضع التكمّش — لسان ذهبي يسار
  if (mode === 'panel' && minimized && !open) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -22 }}
        onClick={() => { setMinimized(false); setOpen(true); }}
        className="fixed left-0 z-[49] flex flex-col items-center gap-1.5 py-3 px-2.5"
        style={{
          top: '38%',
          background: 'linear-gradient(180deg,#fffaf0 0%,#f9efdb 50%,#fffaf0 100%)',
          border: '1.5px solid rgba(245,158,11,0.24)',
          borderRight: 'none',
          borderRadius: '0 0 0 14px',
          boxShadow: '4px 0 20px rgba(245,158,11,0.10)',
        }}
        title="مدير مبيعات B2B"
      >
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(245,158,11,0.04)', borderRadius: 'inherit' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <span className="relative z-10 text-lg">💼</span>
        <motion.span
          className="relative z-10 h-1.5 w-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ boxShadow: '0 0 5px rgba(245,158,11,0.28)' }}
        />
        <span
          className="relative z-10 text-[0.5rem] font-black tracking-widest text-amber-700/80"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          المبيعات
        </span>
      </motion.button>
    );
  }

  return (
    <>
      {/* ── Backdrop ─────────────── */}
      <AnimatePresence>
        {open && mode !== 'office' && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 z-[48] backdrop-blur-[4px]',
              mode === 'inline'
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.58),rgba(248,250,252,0.74),rgba(15,23,42,0.22))]'
                : 'bg-black/55',
            )}
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
          {!open && mode !== 'office' ? (
              /* ═══════════ TEASER PANEL ═══════════ */
            <motion.div
              key="teaser"
              initial={mode === 'inline' ? { opacity: 0, y: 10 } : { x: -320, opacity: 0 }}
              animate={mode === 'inline' ? { opacity: 1, y: 0 } : { x: 0, opacity: 1 }}
              exit={mode === 'inline' ? { opacity: 0, y: 10 } : { x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className={mode === 'inline' ? 'w-full' : 'w-[min(100vw-0.75rem,18rem)]'}
            >
              <SaudiFlexibleDialogShell compact>
              <div className="px-[clamp(0.8rem,2vw,1rem)] py-[clamp(0.8rem,2vw,1rem)]">
                {/* Header */}
                <div className="mb-3 flex items-center gap-2.5">
                  <OfficeIcon size="sm" />
                  <div className="min-w-0">
                    <p className="text-[0.55rem] font-bold tracking-widest text-amber-700/70 uppercase">حلاق ماب</p>
                    <p className="text-[0.8rem] font-black leading-tight text-slate-950">مدير مبيعات B2B</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      <span className="text-[0.5rem] font-semibold text-emerald-700">متاح للتفاوض</span>
                    </div>
                  </div>
                </div>

                {/* Animated pitch line */}
                <div className="mb-3 min-h-[48px] overflow-hidden rounded-xl border border-amber-200 bg-white/90 px-3 py-2.5 shadow-[0_8px_18px_rgba(245,158,11,0.08)]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={pitchIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-[0.68rem] font-bold leading-snug text-slate-800"
                      style={{ unicodeBidi: 'plaintext' }}
                    >
                      {PITCH_LINES[pitchIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Stats row — مخفي في الوضع المصغّر */}
                <div className="mb-3 grid grid-cols-3 gap-1">
                  {[
                    { icon: TrendingUp, label: 'خيار', val: 'واضح' },
                    { icon: Star, label: 'باقات', val: '3' },
                    { icon: PhoneCall, label: 'ردّ', val: 'سريع' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white/88 px-1 py-1.5">
                      <s.icon className="h-3 w-3 text-amber-600" strokeWidth={2} />
                      <span className="text-[0.58rem] font-black text-slate-900">{s.val}</span>
                      <span className="text-[0.45rem] text-slate-500">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[
                    { icon: Scissors, label: 'صالونات' },
                    { icon: Store, label: 'رخصة نفاذ' },
                    { icon: MapPin, label: 'ظهور عند الطلب' },
                  ].map((item) => (
                    <div key={item.label} className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50/70 px-2 py-1 text-[0.52rem] font-bold text-cyan-800">
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 py-2.5 text-[0.76rem] font-black text-black shadow-[0_8px_18px_rgba(245,158,11,0.22)] transition-all hover:shadow-[0_10px_22px_rgba(245,158,11,0.28)]"
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
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[0.65rem] text-slate-500 hover:text-amber-700 transition-colors"
                >
                  أو سجّل مباشرة <ArrowLeft className="h-3 w-3" />
                </button>
              </div>
              </SaudiFlexibleDialogShell>
            </motion.div>
          ) : (
              /* ═══════════ CHAT PANEL ═══════════ */
            <motion.aside
              key="chat"
              dir="rtl"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full',
                mode === 'office' && 'w-[min(96vw,92rem)]',
                mode === 'inline' && 'w-[min(80vw,82rem)]',
                mode === 'panel' && 'w-[min(94vw,78rem)]',
              )}
            >
              <SaudiFlexibleDialogShell
                fluidHeight
                className={cn(
                  mode === 'office' && 'h-[min(82dvh,62rem)] max-h-[82dvh] rounded-[1rem]',
                  mode === 'inline' && 'h-[min(80dvh,56rem)] max-h-[80dvh] rounded-[1.15rem]',
                  mode === 'panel' && 'h-[min(80dvh,54rem)] max-h-[80dvh]',
                )}
              >
              {/* ── Header ── */}
              <div className="relative shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[linear-gradient(90deg,rgba(245,158,11,0.08),rgba(255,255,255,0.82),rgba(34,211,238,0.08))] px-[clamp(0.85rem,2.5vw,1.25rem)] py-[clamp(0.8rem,2vw,1rem)]">
                <div className="flex items-center gap-3">
                  <OfficeIcon size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-slate-950">مدير مبيعات B2B</p>
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ boxShadow: '0 0 6px rgba(52,211,153,0.35)' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">حلاق ماب · Enter للإرسال · Shift+Enter سطر جديد</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <div className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50/80 px-2.5 py-1 text-[0.62rem] font-bold text-cyan-800">
                    <Store className="h-3 w-3" />
                    صالونات · رخصة · تفعيل
                  </div>
                </div>
                <button onClick={() => (mode === 'office' ? navigate(ROUTE_PATHS.BARBERS_LANDING) : setOpen(false))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-all">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* ── Messages ── */}
              <div
                ref={messagesRef}
                className="relative min-h-[clamp(12rem,30dvh,18rem)] flex-1 overflow-y-auto overscroll-contain px-[clamp(0.85rem,2.5vw,1.25rem)] py-[clamp(0.85rem,2vw,1.1rem)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_38%_at_50%_0%,rgba(245,158,11,0.08),transparent),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.06),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-x-5 top-4 flex flex-wrap gap-2 opacity-80">
                  {[
                    'صندوق تفاوض واضح ومباشر',
                    'مبني على واقع الصالونات ورخص النفاذ',
                    'جاهز لشرح الباقات والتفعيل',
                  ].map((chip) => (
                    <span key={chip} className="rounded-full border border-amber-100 bg-white/80 px-3 py-1 text-[0.58rem] font-bold text-slate-600">
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="relative flex flex-col gap-3 sm:gap-4">
                  {turns.map((t) => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={cn(
                        'w-fit max-w-[min(100%,34rem)] rounded-[clamp(0.875rem,2vw,1.125rem)] px-[clamp(0.85rem,2.2vw,1.15rem)] py-[clamp(0.65rem,1.8vw,1rem)]',
                        'text-[clamp(0.9rem,2.2vw,1rem)] leading-[1.65]',
                        t.role === 'assistant'
                          ? 'self-start rounded-tr-sm border border-amber-200 bg-[linear-gradient(145deg,#fffdf7,#fbf4e6)] text-slate-800 shadow-[0_12px_28px_rgba(245,158,11,0.08)]'
                          : 'self-end rounded-tl-sm border border-cyan-200 bg-[linear-gradient(145deg,#f4fbfd,#eef8fb)] text-slate-800 shadow-[0_10px_24px_rgba(34,211,238,0.08)]',
                      )}
                    >
                      <p className="mb-1.5 text-[0.62rem] font-bold text-slate-500">
                        {t.role === 'assistant' ? 'مدير مبيعات B2B 💼' : 'أنت'}
                      </p>
                      <div dir="rtl" className="chat-arabic-text whitespace-pre-wrap break-words">{t.content}</div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="self-start rounded-2xl rounded-tr-sm border border-amber-200 bg-white/90 shadow-[0_8px_20px_rgba(245,158,11,0.08)]">
                      <TypingDots />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ── Quick prompts + CTA ── */}
              {!loading && (
                <div className="relative shrink-0 border-t border-slate-200 bg-white/80 px-[clamp(0.75rem,2.2vw,1rem)] py-[clamp(0.75rem,1.8vw,0.95rem)]">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.68rem] font-semibold text-slate-600">اختر سؤالاً أو اكتب رسالتك:</p>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-[0.54rem] font-bold text-amber-700">
                        <Briefcase className="h-3 w-3" />
                        مجلس حلاق ماب التجاري
                      </div>
                      <motion.button
                        onClick={() => { setOpen(false); navigate(ROUTE_PATHS.REGISTER); }}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-amber-500 to-amber-700 px-3 py-1.5 text-[0.66rem] font-black text-black shadow-[0_8px_16px_rgba(245,158,11,0.16)] transition-all hover:from-amber-400"
                      >
                        سجّل الآن
                        <ArrowLeft className="h-3 w-3" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.25rem),1fr))] gap-2">
                    {QUICK.map((q) => (
                      <button key={q} type="button" onClick={() => void handleSend(q)}
                        className="min-h-[2.5rem] rounded-[clamp(0.75rem,1.8vw,1rem)] border border-amber-200 bg-white px-2.5 py-1.5 text-center text-[clamp(0.66rem,1.8vw,0.74rem)] font-semibold leading-snug text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input Dock ── */}
              <div className="relative shrink-0 border-t border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.98))] px-[clamp(0.75rem,2.2vw,1rem)] py-[clamp(0.8rem,2vw,1rem)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[0.58rem] font-medium text-slate-500">اكتب هنا وسيبقى موضع القراءة محفوظًا تلقائيًا</p>
                  <p className="text-[0.58rem] text-slate-400">Enter للإرسال · Shift+Enter سطر جديد</p>
                </div>

                <div className="flex items-end gap-2.5 rounded-[1.15rem] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                  <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="اسألني عن الباقات، التفعيل، المكتب الخاص، أو أي تفصيل آخر…"
                    rows={3}
                    style={{ minHeight: '92px', maxHeight: '180px', resize: 'none', overflowY: 'auto' }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[0.98rem] leading-7 text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200/60 transition-all disabled:opacity-50"
                    dir="rtl"
                  />
                  <motion.button type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || loading}
                    whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-[0_8px_20px_rgba(245,158,11,0.18)] transition-all hover:from-amber-400 hover:shadow-[0_10px_24px_rgba(245,158,11,0.24)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              </SaudiFlexibleDialogShell>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
