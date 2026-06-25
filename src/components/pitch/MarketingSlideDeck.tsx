import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Radio } from 'lucide-react';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import type { GrowthPitchSlide } from '@/config/growthPitchSlides';
import {
  GROWTH_PITCH_ACCENT,
  GROWTH_PITCH_FRAME_CLASS,
  GROWTH_PITCH_TYPO,
  type GrowthPitchAccentStyle,
  type GrowthPitchLane,
  type GrowthPitchSlideLayout,
} from '@/config/growthPitchTheme';
import { cn } from '@/lib/utils';

export type MarketingSlideDeckTheme = {
  laneLabels: Record<GrowthPitchLane, string>;
  layoutForSlide: (slideId: string) => GrowthPitchSlideLayout;
  laneForSlide: (slideId: string) => GrowthPitchLane;
};

type Props = {
  slides: readonly GrowthPitchSlide[];
  headerTitle: string;
  headerHint: string;
  theme: MarketingSlideDeckTheme;
};

function PitchDeckBackdrop({ accentGradient }: { accentGradient: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={cn('absolute inset-0 opacity-80 bg-gradient-to-br', accentGradient)} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(45,212,191,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-teal-500/12 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute top-1/3 right-0 h-48 w-48 rounded-full bg-cyan-500/8 blur-2xl" />
    </div>
  );
}

function LaneBadge({
  slideId,
  theme,
}: {
  slideId: string;
  theme: MarketingSlideDeckTheme;
}) {
  const lane = theme.laneForSlide(slideId);
  const label = theme.laneLabels[lane];
  const accent = GROWTH_PITCH_ACCENT.teal;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-bold sm:text-xs',
        lane === 'b2c' && GROWTH_PITCH_ACCENT.teal.lane,
        lane === 'b2b' && GROWTH_PITCH_ACCENT.amber.lane,
        lane === 'neutral' && accent.lane,
      )}
    >
      {lane === 'neutral' ? (
        <HalaqmapBrandMark className="h-4 w-4 shrink-0 overflow-hidden rounded-full" />
      ) : (
        <Radio className="h-3 w-3 shrink-0 opacity-80" />
      )}
      {label}
    </span>
  );
}

function SlideFrame({
  slide,
  accent,
  layout,
  theme,
  children,
}: {
  slide: GrowthPitchSlide;
  accent: GrowthPitchAccentStyle;
  layout: GrowthPitchSlideLayout;
  theme: MarketingSlideDeckTheme;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        GROWTH_PITCH_FRAME_CLASS,
        accent.ring,
        accent.panel,
        accent.glow,
        layout === 'hero-spotlight' && 'text-center',
        layout === 'comparison-wide' && 'max-w-[min(96vw,1400px)]',
      )}
    >
      <div className="mb-[clamp(1rem,2.5vh,1.75rem)] flex flex-wrap items-center justify-between gap-3">
        <LaneBadge slideId={slide.id} theme={theme} />
        <span className={cn(GROWTH_PITCH_TYPO.eyebrow, accent.eyebrow)}>{slide.eyebrow}</span>
      </div>
      {children}
    </div>
  );
}

function BulletList({
  bullets,
  twoColumn,
}: {
  bullets: readonly string[];
  twoColumn: boolean;
}) {
  return (
    <ul
      className={cn(
        'gap-x-8 gap-y-[clamp(0.65rem,1.5vh,1rem)]',
        twoColumn ? 'grid md:grid-cols-2' : 'flex flex-col',
      )}
    >
      {bullets.map((line) => (
        <li key={line.slice(0, 56)} className="flex gap-3">
          <span className="mt-[0.55rem] h-2 w-2 shrink-0 rounded-full bg-teal-400/90" />
          <span className={GROWTH_PITCH_TYPO.body}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function SlideBody({
  slide,
  accent,
  layout,
  theme,
}: {
  slide: GrowthPitchSlide;
  accent: GrowthPitchAccentStyle;
  layout: GrowthPitchSlideLayout;
  theme: MarketingSlideDeckTheme;
}) {
  if (slide.kind === 'hero') {
    return (
      <SlideFrame slide={slide} accent={accent} layout={layout} theme={theme}>
        <div className="flex flex-col items-center gap-[clamp(1.25rem,3vh,2rem)]">
          <HalaqmapBrandMark className="h-[clamp(3.5rem,8vw,5.5rem)] w-[clamp(3.5rem,8vw,5.5rem)] overflow-hidden rounded-2xl ring-2 ring-teal-400/40 shadow-lg shadow-teal-500/20" />
          <h1 className={GROWTH_PITCH_TYPO.heroTitle}>{slide.title}</h1>
          <p className={cn(GROWTH_PITCH_TYPO.slideSubtitle, 'max-w-3xl whitespace-pre-line')}>
            {slide.subtitle}
          </p>
        </div>
      </SlideFrame>
    );
  }

  if (slide.kind === 'bullets') {
    const twoCol = layout === 'two-column-bullets';
    return (
      <SlideFrame slide={slide} accent={accent} layout={layout} theme={theme}>
        <div className="space-y-[clamp(1rem,2.5vh,1.75rem)]">
          <div>
            <h2 className={GROWTH_PITCH_TYPO.slideTitle}>{slide.title}</h2>
            {slide.subtitle ? (
              <p className={cn('mt-3', GROWTH_PITCH_TYPO.bodyMuted)}>{slide.subtitle}</p>
            ) : null}
          </div>
          <BulletList bullets={slide.bullets} twoColumn={twoCol} />
        </div>
      </SlideFrame>
    );
  }

  if (slide.kind === 'steps') {
    return (
      <SlideFrame slide={slide} accent={accent} layout={layout} theme={theme}>
        <div className="space-y-[clamp(1.25rem,3vh,2rem)]">
          <h2 className={GROWTH_PITCH_TYPO.slideTitle}>{slide.title}</h2>
          <div className="grid gap-[clamp(0.75rem,2vw,1.25rem)] sm:grid-cols-3">
            {slide.steps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  'rounded-2xl border bg-black/20 p-[clamp(0.85rem,2vw,1.35rem)] backdrop-blur-sm',
                  accent.ring,
                )}
              >
                <span className={GROWTH_PITCH_TYPO.stepNumber}>{step.step}</span>
                <h3 className={cn('mt-2', GROWTH_PITCH_TYPO.stepTitle)}>{step.title}</h3>
                <p className={cn('mt-2', GROWTH_PITCH_TYPO.stepBody)}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SlideFrame>
    );
  }

  if (slide.kind === 'comparison') {
    return (
      <SlideFrame slide={slide} accent={accent} layout={layout} theme={theme}>
        <div className="space-y-[clamp(0.85rem,2vh,1.25rem)]">
          <div>
            <h2 className={GROWTH_PITCH_TYPO.slideTitle}>{slide.title}</h2>
            <p className={cn('mt-2', GROWTH_PITCH_TYPO.bodyMuted)}>{slide.subtitle}</p>
          </div>
          <div className="grid gap-[clamp(0.65rem,1.5vw,1rem)] lg:grid-cols-3">
            {slide.tiers.map((tier) => (
              <div
                key={tier.tier}
                className={cn(
                  'flex min-h-[min(42vh,420px)] flex-col rounded-2xl border bg-black/25 p-[clamp(0.75rem,1.8vw,1.15rem)]',
                  accent.ring,
                  tier.tier === 'diamond' && 'ring-2 ring-cyan-400/45 shadow-lg shadow-cyan-500/10',
                  tier.tier === 'gold' && 'ring-1 ring-amber-400/30',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[clamp(1.25rem,2vw,1.75rem)]">{tier.badge}</span>
                  <span className={cn('font-black text-white', GROWTH_PITCH_TYPO.stepTitle)}>
                    {tier.title}
                  </span>
                </div>
                <p className={cn('mb-3', GROWTH_PITCH_TYPO.tierPrice)}>{tier.priceLabel}</p>
                <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {tier.highlights.map((h) => (
                    <li key={h.slice(0, 48)} className="flex gap-2">
                      <span className="shrink-0 text-teal-400">✓</span>
                      <span className={GROWTH_PITCH_TYPO.tierHighlight}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {slide.footnote ? (
            <p className={cn('text-center pt-1', GROWTH_PITCH_TYPO.footnote)}>{slide.footnote}</p>
          ) : null}
        </div>
      </SlideFrame>
    );
  }

  return (
    <SlideFrame slide={slide} accent={accent} layout={layout} theme={theme}>
      <div className="flex flex-col items-center gap-[clamp(1.5rem,4vh,2.5rem)] text-center">
        <h2 className={GROWTH_PITCH_TYPO.slideTitle}>{slide.title}</h2>
        <p className={cn('max-w-2xl', GROWTH_PITCH_TYPO.slideSubtitle)}>{slide.subtitle}</p>
        <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
          <Link
            to={slide.consumerCta.href}
            className={cn(
              'flex-1 rounded-2xl px-6 py-[clamp(0.85rem,2vh,1.1rem)] text-white shadow-lg transition-all hover:scale-[1.02]',
              accent.btn,
              GROWTH_PITCH_TYPO.ctaButton,
            )}
          >
            {slide.consumerCta.label}
          </Link>
          <Link
            to={slide.partnerCta.href}
            className={cn(
              'flex-1 rounded-2xl border border-white/20 bg-white/[0.06] px-6 py-[clamp(0.85rem,2vh,1.1rem)] text-white transition-all hover:bg-white/10 hover:scale-[1.02]',
              GROWTH_PITCH_TYPO.ctaButton,
            )}
          >
            {slide.partnerCta.label}
          </Link>
        </div>
      </div>
    </SlideFrame>
  );
}

export function MarketingSlideDeck({ slides, headerTitle, headerHint, theme }: Props) {
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setIndex(total - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        void document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, total]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const slide = slides[index];
  const accent = GROWTH_PITCH_ACCENT[slide.accent];
  const layout = theme.layoutForSlide(slide.id);
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col bg-[#020912] text-white select-none"
      dir="rtl"
      data-bidi="off"
    >
      <PitchDeckBackdrop accentGradient={accent.gradient} />

      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <HalaqmapBrandMark className="h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15" />
          <div className="min-w-0">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-teal-400/80">
              {headerTitle}
            </p>
            <p className="truncate text-[0.68rem] text-slate-500">{headerHint}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-mono text-slate-400 tabular-nums">
            {index + 1}/{total}
          </span>
          <button
            type="button"
            className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/5"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen?.();
            }}
            aria-label={fullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-3 py-6 sm:px-6 sm:py-8">
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-20 w-14 opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="الشريحة السابقة"
          onClick={() => go(-1)}
          disabled={index === 0}
        />
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-20 w-14 opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="الشريحة التالية"
          onClick={() => go(1)}
          disabled={index === total - 1}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <SlideBody slide={slide} accent={accent} layout={layout} theme={theme} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 space-y-3 border-t border-white/10 px-4 py-3 sm:px-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-400 via-cyan-400 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </button>
          <div className="hidden flex-wrap justify-center gap-2 sm:flex">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`شريحة ${i + 1}`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  i === index ? 'w-8 bg-teal-400' : 'w-2.5 bg-white/20 hover:bg-white/45',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => go(1)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
