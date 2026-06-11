/**
 * مخيم النجوم الصامت — صفحة هبوط تجريبية مستقلة
 * المسار: /lab/silent-star-camp
 *
 * تجربة بصرية: مرصد صحراوي خيالي للسكون ومراقبة النجوم.
 * لا علاقة لها بمنصة حلاق ماب — معمل تصميم فقط.
 */

import { useMemo, useState, useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Moon, Sparkles, Compass, Telescope, Wind, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const HOME_HREF = '/#/';

// ─── Deterministic pseudo-random (ثابت بين الزيارات) ───────────────────────
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Star = { id: number; x: number; y: number; r: number; delay: number; bright: boolean };

function buildStars(count: number): Star[] {
  const rnd = seeded(42);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rnd() * 100,
    y: rnd() * 72,
    r: rnd() * 1.6 + 0.4,
    delay: rnd() * 5,
    bright: rnd() > 0.92,
  }));
}

const CONSTELLATIONS = [
  {
    id: 'thuraya',
    name: 'الثريا',
    verse: 'نورٌ يُرى من بعيدٍ قبل أن تصل — كأنّ الطريق يعرفك.',
    points: [
      [38, 22],
      [42, 18],
      [46, 22],
      [44, 28],
      [40, 28],
    ] as [number, number][],
  },
  {
    id: 'jawza',
    name: 'الجوزاء',
    verse: 'توأمان في السماء — وفي الأرض صمتٌ يكفي للاثنين.',
    points: [
      [58, 14],
      [62, 18],
      [66, 16],
      [64, 24],
      [60, 26],
    ] as [number, number][],
  },
  {
    id: 'otared',
    name: 'العقرب',
    verse: 'حادّ في الظهور — لكنّه يعلّم الصبر لليل.',
    points: [
      [72, 32],
      [76, 28],
      [80, 30],
      [78, 36],
      [74, 38],
    ] as [number, number][],
  },
] as const;

const NIGHT_PHASES = [
  { label: 'الغسق', tint: 'rgba(251,146,60,0.18)', desc: 'أول وهج يختفي خلف الكثبان.' },
  { label: 'السكون', tint: 'rgba(99,102,241,0.22)', desc: 'الريح تهدأ — والنجوم تتقدّم.' },
  { label: 'العمق', tint: 'rgba(30,27,75,0.55)', desc: 'سماءٌ كاملة — بلا ضجيج ولا إشارة.' },
] as const;

function StarCanvas({ lite }: { lite: boolean }) {
  const stars = useMemo(() => buildStars(lite ? 48 : 110), [lite]);
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="sky-glow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(129,140,248,0.35)" />
          <stop offset="55%" stopColor="rgba(15,23,42,0.05)" />
          <stop offset="100%" stopColor="rgba(2,6,23,0)" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#sky-glow)" />
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.bright ? '#fde68a' : '#e2e8f0'}
          opacity={s.bright ? 0.95 : 0.55}
        >
          {!reduceMotion ? (
            <>
              <animate
                attributeName="opacity"
                values={s.bright ? '0.5;1;0.5' : '0.25;0.7;0.25'}
                dur={`${2.8 + s.delay * 0.4}s`}
                begin={`${s.delay}s`}
                repeatCount="indefinite"
              />
              {s.bright ? (
                <animate
                  attributeName="r"
                  values={`${s.r};${s.r * 1.35};${s.r}`}
                  dur={`${3.2 + s.delay * 0.3}s`}
                  begin={`${s.delay}s`}
                  repeatCount="indefinite"
                />
              ) : null}
            </>
          ) : null}
        </circle>
      ))}
    </svg>
  );
}

function SandHorizon() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh]" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(120,53,15,0.95) 0%, rgba(146,64,14,0.55) 28%, rgba(30,27,75,0) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-[-10%] h-32 w-[120%] rounded-[50%] opacity-80"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(217,119,6,0.45), transparent 70%)' }}
      />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#1c0f08] to-transparent" />
    </div>
  );
}

function ConstellationMap({
  activeId,
  onSelect,
  reduceMotion,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  reduceMotion: boolean | null;
}) {
  const active = CONSTELLATIONS.find((c) => c.id === activeId) ?? CONSTELLATIONS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-violet-400/20 bg-slate-950/60 shadow-[0_0_60px_rgba(99,102,241,0.12)]">
        <StarCanvas lite />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 72" aria-hidden>
          {CONSTELLATIONS.map((c) => {
            const isActive = c.id === activeId;
            const pts = c.points.map(([x, y]) => `${x},${y}`).join(' ');
            return (
              <g key={c.id} opacity={isActive ? 1 : 0.35}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={isActive ? '#c4b5fd' : '#64748b'}
                  strokeWidth="0.35"
                  strokeLinecap="round"
                />
                {c.points.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={isActive ? 1.1 : 0.7} fill={isActive ? '#fde68a' : '#94a3b8'} />
                ))}
              </g>
            );
          })}
        </svg>
        <SandHorizon />
      </div>

      <div className="space-y-5">
        <p className="text-sm font-semibold tracking-wide text-violet-300/90">خريطة الليل</p>
        <div className="flex flex-wrap gap-2">
          {CONSTELLATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-bold transition-all',
                c.id === activeId
                  ? 'border-amber-300/50 bg-amber-400/15 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-400/40 hover:text-white',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
        <motion.blockquote
          key={active.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-lg leading-relaxed text-slate-200"
        >
          {active.verse}
        </motion.blockquote>
      </div>
    </div>
  );
}

function RevealSection({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function SilentStarCampLanding() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const lite = isMobile || Boolean(reduceMotion);
  const [activeConstellation, setActiveConstellation] = useState<string>(CONSTELLATIONS[0].id);
  const [phaseIdx, setPhaseIdx] = useState(1);

  const phase = NIGHT_PHASES[phaseIdx];

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#070312] text-slate-100 selection:bg-violet-500/30"
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, ${phase.tint}, transparent)`,
      }}
    >
      {/* ── Hero ── */}
      <header className="relative flex min-h-[92vh] flex-col">
        <StarCanvas lite={lite} />
        <SandHorizon />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
          <a
            href={HOME_HREF}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-sm transition hover:border-violet-400/40 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة
          </a>
          <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-200">
            معمل تصميم · مستقل
          </span>
        </nav>

        <div className="relative z-10 mx-auto flex flex-1 max-w-6xl flex-col justify-center px-5 pb-24 pt-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-100/90"
          >
            <Moon className="h-4 w-4 text-amber-300" />
            دعوة خاصة · ربع الخالي
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.75 }}
            className="max-w-3xl text-5xl font-black leading-[1.15] tracking-tight md:text-7xl"
            style={{
              background: 'linear-gradient(135deg, #e9d5ff 0%, #fde68a 45%, #c4b5fd 70%, #f8fafc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 48px rgba(167,139,250,0.35))',
            }}
          >
            مخيم النجوم الصامت
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.65 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300/90 md:text-xl"
          >
            مرصد صحراوي خيالي — لمن يبحث عن سماءٍ نظيفة، وهواءٍ بارد، و ليلٍ لا يُقاطَع.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#map"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-l from-violet-600 to-indigo-700 px-7 py-3.5 text-base font-black text-white shadow-[0_0_32px_rgba(99,102,241,0.35)] transition hover:shadow-[0_0_48px_rgba(99,102,241,0.5)]"
            >
              {!lite ? (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-l from-transparent via-white/15 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                  aria-hidden
                />
              ) : null}
              <span className="relative flex items-center gap-2">
                <Telescope className="h-5 w-5" />
                استكشف خريطة الليل
              </span>
            </a>
            <a
              href="#phases"
              className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold text-slate-200 backdrop-blur-sm transition hover:border-amber-400/35 hover:bg-white/10"
            >
              مراحل الليل
            </a>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-3 text-center text-xs text-slate-400"
          >
            {[
              { icon: Wind, label: 'بلا شبكة' },
              { icon: Compass, label: 'ملاحة نجمية' },
              { icon: Sparkles, label: 'سماء `Bortle 1`' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-xl border border-white/8 bg-black/25 px-2 py-3 backdrop-blur-sm"
              >
                <Icon className="mx-auto mb-1.5 h-4 w-4 text-violet-300" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ── Philosophy ── */}
      <main className="relative z-10 mx-auto max-w-6xl space-y-28 px-5 py-20">
        <RevealSection>
          <p className="mb-3 text-sm font-semibold text-violet-300">فلسفة المخيم</p>
          <h2 className="max-w-2xl text-3xl font-black text-white md:text-4xl">
            الصمت ليس غياباً — بل مساحةٌ تتسع للنجوم.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
            لا حجز ولا منصة ولا خدمة. هذه الصفحة تجربة بصرية مستقلة: طبقات سماء، كثبان، ونجوم
            تتنفس بإيقاع الليل. صُمّمت لتجرّب «السحر» دون أن تسرق منك السرعة.
          </p>
        </RevealSection>

        {/* ── Night phases ── */}
        <RevealSection id="phases" delay={0.05}>
          <p className="mb-3 text-sm font-semibold text-amber-200/80">مراحل الليل</p>
          <h2 className="mb-8 text-3xl font-black text-white">اختر عمق السماء</h2>
          <div className="flex flex-wrap gap-3">
            {NIGHT_PHASES.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPhaseIdx(i)}
                className={cn(
                  'rounded-2xl border px-5 py-3 text-sm font-bold transition-all',
                  phaseIdx === i
                    ? 'border-amber-300/45 bg-amber-400/12 text-amber-50'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <motion.p
            key={phase.label}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 max-w-xl text-lg text-slate-300"
          >
            {phase.desc}
          </motion.p>
        </RevealSection>

        {/* ── Constellation map ── */}
        <RevealSection id="map" delay={0.08}>
          <ConstellationMap
            activeId={activeConstellation}
            onSelect={setActiveConstellation}
            reduceMotion={reduceMotion}
          />
        </RevealSection>

        {/* ── CTA ── */}
        <RevealSection delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-950/80 via-slate-950 to-[#1c0f08] p-8 md:p-12">
            {!lite ? (
              <motion.div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[80px]"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
            ) : null}
            <h2 className="relative text-2xl font-black text-white md:text-3xl">
              الليلة القادمة — إن وُجدت — تبدأ بخطوة واحدة نحو الظلام.
            </h2>
            <p className="relative mt-4 max-w-lg text-slate-400">
              هذا زرٌ شكلي فقط. المخيم خيالي. لكنّ السماء في رُبْع الخالي حقيقية — وربما تستحق زيارة
              بلا شاشة.
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
              className="relative mt-8 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              اصعد إلى القمة
            </button>
          </div>
        </RevealSection>
      </main>

      <footer className="relative z-10 border-t border-white/8 px-5 py-10 text-center text-xs text-slate-500">
        <p>صفحة معمل · لا تمثّل منتجاً أو خدمة حقيقية</p>
        <p className="mt-2">
          <a href={HOME_HREF} className="text-violet-400/80 underline-offset-2 hover:underline">
            العودة إلى حلاق ماب
          </a>
        </p>
      </footer>
    </div>
  );
}
