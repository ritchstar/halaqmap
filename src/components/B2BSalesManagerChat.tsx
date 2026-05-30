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
  X, Send, Building2, TrendingUp, ChevronDown,
  ArrowLeft, Briefcase, Star, PhoneCall
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { cn } from '@/lib/utils';

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
        'border border-amber-400/38',
        'bg-[linear-gradient(168deg,#0d0803_0%,#060300_42%,#0a0600_100%)]',
        'backdrop-blur-2xl',
        'shadow-[inset_0_1px_0_rgba(251,191,36,0.16),inset_0_-1px_0_rgba(0,0,0,0.35),0_14px_48px_rgba(0,0,0,0.5)]',
        fluidHeight &&
          'min-h-[clamp(18rem,48dvh,22rem)] max-h-[min(94dvh,52rem)] h-[clamp(22rem,min(82dvh,44rem),48rem)]',
        compact && 'min-h-0 max-h-none h-auto',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-amber-500/12" aria-hidden />
      <div
        className="pointer-events-none absolute inset-[clamp(4px,1.2vw,7px)] rounded-[clamp(0.875rem,2.6vw,1.5rem)] border border-amber-400/14"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[10%] h-[80%] w-[3px] rounded-full opacity-80"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(245,158,11,0.45), transparent)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-[10%] h-[80%] w-[3px] rounded-full opacity-80"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(245,158,11,0.45), transparent)' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
        style={{ background: 'linear-gradient(118deg, transparent 42%, rgba(245,158,11,0.05) 50%, transparent 58%)' }}
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>
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
  const [open, setOpen] = useState(mode === 'inline');
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

  /** استعادة التمرير عند مغادرة المكوّن — يمنع شاشة «عالقة» بعد التنقّل */
  useEffect(() => () => { document.body.style.removeProperty('overflow'); }, []);

  const goToRegister = useCallback(() => {
    document.body.style.removeProperty('overflow');
    navigate(ROUTE_PATHS.REGISTER);
  }, [navigate]);

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
    ? `relative w-full max-w-full ${open ? 'z-[50]' : 'z-10'}`
    : 'hidden sm:block fixed bottom-24 left-0 z-[49] md:bottom-6';

  // وضع التكمّش — لسان ذهبي يسار
  if (mode === 'panel' && minimized && !open) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -22 }}
        onClick={() => { setMinimized(false); setOpen(true); }}
        className="hidden sm:flex fixed left-0 z-[49] flex-col items-center gap-1.5 py-3 px-2.5"
        style={{
          top: '38%',
          background: 'linear-gradient(180deg,#1c0800 0%,#2a1100 50%,#1c0800 100%)',
          border: '1.5px solid rgba(245,158,11,0.42)',
          borderRight: 'none',
          borderRadius: '0 0 0 14px',
          boxShadow: '4px 0 20px rgba(245,158,11,0.22)',
        }}
        title="مدير مبيعات B2B"
      >
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(245,158,11,0.06)', borderRadius: 'inherit' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <span className="relative z-10 text-lg" style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.8))' }}>💼</span>
        <motion.span
          className="relative z-10 h-1.5 w-1.5 rounded-full bg-amber-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ boxShadow: '0 0 5px rgba(245,158,11,0.8)' }}
        />
        <span
          className="relative z-10 text-[0.5rem] font-black tracking-widest text-amber-400/70"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          المبيعات
        </span>
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
              className={mode === 'inline' ? 'w-full' : 'w-[min(100vw-0.75rem,13.5rem)]'}
            >
              <SaudiFlexibleDialogShell compact>
              <div className="px-[clamp(0.65rem,2vw,0.85rem)] py-[clamp(0.65rem,2vw,0.85rem)]">
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
                <Link
                  to={ROUTE_PATHS.REGISTER}
                  onClick={() => document.body.style.removeProperty('overflow')}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[0.65rem] text-amber-400/50 hover:text-amber-300 transition-colors"
                >
                  أو سجّل مباشرة <ArrowLeft className="h-3 w-3" />
                </Link>
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
                mode === 'panel' && 'w-[min(calc(100vw-1rem),38rem)]',
              )}
            >
              <SaudiFlexibleDialogShell fluidHeight>
              {/* ── Header ── */}
              <div className="relative shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 bg-gradient-to-l from-amber-500/8 via-transparent to-transparent px-[clamp(0.85rem,2.5vw,1.25rem)] py-[clamp(0.75rem,2vw,1rem)]">
                <div className="flex items-center gap-3">
                  <OfficeIcon size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-amber-100">مدير مبيعات B2B</p>
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ boxShadow: '0 0 6px rgba(52,211,153,0.7)' }}
                      />
                    </div>
                    <p className="text-xs text-amber-400/45">حلاق ماب · Enter للإرسال · Shift+Enter سطر جديد</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 text-amber-400/60 hover:border-amber-400/50 hover:bg-amber-500/12 hover:text-amber-200 transition-all">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* ── Messages ── */}
              <div
                ref={messagesRef}
                className="relative min-h-[clamp(10rem,28dvh,16rem)] flex-1 overflow-y-auto overscroll-contain px-[clamp(0.85rem,2.5vw,1.25rem)] py-[clamp(0.75rem,2vw,1.1rem)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_35%_at_50%_0%,rgba(245,158,11,0.04),transparent)]" />
                <div className="relative flex flex-col gap-3 sm:gap-4">
                  {turns.map((t) => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={cn(
                        'w-fit max-w-[min(100%,34rem)] rounded-[clamp(0.875rem,2vw,1.125rem)] px-[clamp(0.85rem,2.2vw,1.15rem)] py-[clamp(0.65rem,1.8vw,1rem)]',
                        'text-[clamp(0.9rem,2.2vw,1rem)] leading-[1.65]',
                        t.role === 'assistant'
                          ? 'self-start rounded-tr-sm border border-amber-500/24 bg-gradient-to-br from-amber-500/14 to-amber-900/10 text-amber-50 shadow-[0_2px_16px_rgba(245,158,11,0.09)]'
                          : 'self-end rounded-tl-sm border border-white/14 bg-white/10 text-slate-100',
                      )}
                    >
                      <p className="mb-1.5 text-[0.62rem] font-bold opacity-45">
                        {t.role === 'assistant' ? 'مدير مبيعات B2B 💼' : 'أنت'}
                      </p>
                      <div dir="rtl" className="chat-arabic-text whitespace-pre-wrap break-words">{t.content}</div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="self-start rounded-2xl rounded-tr-sm border border-amber-500/20 bg-amber-500/8">
                      <TypingDots />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ── Quick prompts ── */}
              {!loading && (
                <div className="relative shrink-0 border-t border-amber-500/10 bg-[#060300]/60 px-[clamp(0.75rem,2.2vw,1rem)] py-[clamp(0.65rem,1.8vw,0.85rem)]">
                  <p className="mb-2 text-[0.65rem] font-semibold text-amber-400/40">اختر سؤالاً أو اكتب رسالتك:</p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.25rem),1fr))] gap-2">
                    {QUICK.map((q) => (
                      <button key={q} type="button" onClick={() => void handleSend(q)}
                        className="min-h-[2.35rem] rounded-[clamp(0.65rem,1.8vw,1rem)] border border-amber-400/28 bg-amber-500/10 px-2.5 py-1.5 text-center text-[clamp(0.65rem,1.8vw,0.72rem)] font-semibold leading-snug text-amber-300/90 transition-all hover:border-amber-400/60 hover:bg-amber-500/18 hover:text-amber-200">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Register CTA ── */}
              <div className="relative mx-[clamp(0.65rem,2vw,1rem)] mb-2 shrink-0 overflow-hidden rounded-[clamp(0.75rem,2vw,1rem)] border border-amber-400/35 bg-gradient-to-l from-amber-500/14 via-amber-900/10 to-transparent px-[clamp(0.75rem,2.2vw,1.15rem)] py-[clamp(0.65rem,1.8vw,0.9rem)]">
                <motion.div className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(245,158,11,0.06),transparent)' }}
                  animate={{ x: ['-100%','200%'] }} transition={{ duration: 3, repeat: Infinity, ease:'linear', repeatDelay: 2 }} />
                <div className="relative flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 text-center sm:text-start">
                    <p className="text-[clamp(0.82rem,2vw,0.9rem)] font-black text-amber-200">جاهز للانضمام؟ 🚀</p>
                    <p className="text-[0.65rem] text-amber-400/55">✅ التفعيل بعد اتمام تعبئة الطلب والدفع</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={goToRegister}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-5 py-3 text-sm font-black text-black shadow-[0_2px_16px_rgba(245,158,11,0.40)] transition-all hover:from-amber-400 sm:w-auto">
                    انضم الآن <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* ── Input ── */}
              <div className="relative shrink-0 border-t border-amber-500/15 bg-[#060300]/80 px-[clamp(0.75rem,2.2vw,1rem)] py-[clamp(0.75rem,2vw,1rem)]">
                <div className="flex items-end gap-3">
                  <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="اسألني عن الباقات، العائد، المكتب الخاص، أي شيء… (Enter للإرسال)"
                    rows={2}
                    style={{ minHeight: '60px', maxHeight: '180px', resize: 'none', overflowY: 'auto' }}
                    className="flex-1 rounded-2xl border border-amber-400/25 bg-[#0e0700] px-5 py-3.5 text-[1rem] leading-7 text-white placeholder:text-amber-400/30 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all disabled:opacity-50"
                    dir="rtl"
                  />
                  <motion.button type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || loading}
                    whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-[0_4px_20px_rgba(245,158,11,0.40)] transition-all hover:from-amber-400 hover:shadow-[0_4px_28px_rgba(245,158,11,0.55)] disabled:cursor-not-allowed disabled:opacity-40">
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
                <p className="mt-2 text-center text-[0.58rem] text-amber-400/20">
                  Enter للإرسال · Shift+Enter سطر جديد
                </p>
              </div>
              </SaudiFlexibleDialogShell>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
