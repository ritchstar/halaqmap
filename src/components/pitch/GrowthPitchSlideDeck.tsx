import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import {
  GROWTH_PITCH_SLIDES,
  type GrowthPitchSlide,
  type GrowthPitchSlideAccent,
} from '@/config/growthPitchSlides';
import { cn } from '@/lib/utils';

const ACCENT: Record<
  GrowthPitchSlideAccent,
  { ring: string; eyebrow: string; glow: string; btn: string }
> = {
  teal: {
    ring: 'border-teal-400/35',
    eyebrow: 'text-teal-300/90',
    glow: 'shadow-teal-500/10',
    btn: 'bg-teal-600 hover:bg-teal-500',
  },
  amber: {
    ring: 'border-amber-400/35',
    eyebrow: 'text-amber-300/90',
    glow: 'shadow-amber-500/10',
    btn: 'bg-amber-600 hover:bg-amber-500',
  },
  violet: {
    ring: 'border-violet-400/35',
    eyebrow: 'text-violet-300/90',
    glow: 'shadow-violet-500/10',
    btn: 'bg-violet-600 hover:bg-violet-500',
  },
  slate: {
    ring: 'border-slate-400/25',
    eyebrow: 'text-slate-300/80',
    glow: 'shadow-slate-500/5',
    btn: 'bg-slate-600 hover:bg-slate-500',
  },
};

function SlideBody({ slide }: { slide: GrowthPitchSlide }) {
  const accent = ACCENT[slide.accent];

  if (slide.kind === 'hero') {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-6 max-w-4xl mx-auto">
        <p className={cn('text-xs font-bold uppercase tracking-[0.2em]', accent.eyebrow)}>{slide.eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">{slide.title}</h1>
        <p className="text-base sm:text-lg leading-relaxed text-slate-300 whitespace-pre-line">{slide.subtitle}</p>
      </div>
    );
  }

  if (slide.kind === 'bullets') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className={cn('text-xs font-bold uppercase tracking-[0.18em] mb-3', accent.eyebrow)}>{slide.eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-snug text-white">{slide.title}</h2>
          {slide.subtitle ? <p className="mt-3 text-sm sm:text-base text-slate-400">{slide.subtitle}</p> : null}
        </div>
        <ul className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-200">
          {slide.bullets.map((line) => (
            <li key={line.slice(0, 48)} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (slide.kind === 'steps') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className={cn('text-xs font-bold uppercase tracking-[0.18em] mb-3', accent.eyebrow)}>{slide.eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{slide.title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {slide.steps.map((step) => (
            <div
              key={step.step}
              className={cn(
                'rounded-2xl border bg-white/[0.04] p-4 sm:p-5 backdrop-blur-sm',
                accent.ring,
              )}
            >
              <span className="text-2xl font-black text-teal-300">{step.step}</span>
              <h3 className="mt-2 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.kind === 'comparison') {
    return (
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <p className={cn('text-xs font-bold uppercase tracking-[0.18em] mb-2', accent.eyebrow)}>{slide.eyebrow}</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">{slide.title}</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">{slide.subtitle}</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {slide.tiers.map((tier) => (
            <div
              key={tier.tier}
              className={cn(
                'rounded-2xl border bg-white/[0.03] p-4 flex flex-col',
                accent.ring,
                tier.tier === 'diamond' && 'ring-1 ring-cyan-400/40',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{tier.badge}</span>
                <span className="font-black text-white">{tier.title}</span>
              </div>
              <p className="text-sm font-bold text-teal-300 mb-3">{tier.priceLabel}</p>
              <ul className="space-y-2 text-[0.72rem] sm:text-xs leading-relaxed text-slate-300 flex-1">
                {tier.highlights.map((h) => (
                  <li key={h.slice(0, 40)} className="flex gap-2">
                    <span className="text-teal-400 shrink-0">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {slide.footnote ? (
          <p className="text-center text-[0.7rem] sm:text-xs text-slate-500">{slide.footnote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 max-w-3xl mx-auto">
      <div>
        <p className={cn('text-xs font-bold uppercase tracking-[0.18em] mb-3', accent.eyebrow)}>{slide.eyebrow}</p>
        <h2 className="text-2xl sm:text-4xl font-black text-white">{slide.title}</h2>
        <p className="mt-4 text-sm sm:text-base text-slate-400">{slide.subtitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <Link
          to={slide.consumerCta.href}
          className={cn(
            'flex-1 rounded-xl px-5 py-3 text-sm font-bold text-white text-center transition-colors',
            accent.btn,
          )}
        >
          {slide.consumerCta.label}
        </Link>
        <Link
          to={slide.partnerCta.href}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white text-center hover:bg-white/10 transition-colors"
        >
          {slide.partnerCta.label}
        </Link>
      </div>
    </div>
  );
}

export function GrowthPitchSlideDeck() {
  const total = GROWTH_PITCH_SLIDES.length;
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

  const slide = GROWTH_PITCH_SLIDES[index];
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col bg-[#020912] text-white select-none"
      dir="rtl"
      data-bidi="off"
    >
      {/* خلفية */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* شريط علوي */}
      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-teal-400/70">Growth Pitch Deck</p>
          <p className="truncate text-xs text-slate-500">← → للتنقل · F ملء الشاشة</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {index + 1}/{total}
          </span>
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
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

      {/* منطقة الشريحة */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto">
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-20 w-12 sm:w-16 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="الشريحة السابقة"
          onClick={() => go(-1)}
          disabled={index === 0}
        />
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-20 w-12 sm:w-16 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="الشريحة التالية"
          onClick={() => go(1)}
          disabled={index === total - 1}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }}
            className={cn('w-full', ACCENT[slide.accent].glow)}
          >
            <SlideBody slide={slide} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* تنقل سفلي */}
      <footer className="relative z-10 border-t border-white/10 px-4 py-3 sm:px-6 space-y-3">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-400 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </button>
          <div className="hidden sm:flex gap-1.5">
            {GROWTH_PITCH_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`شريحة ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-teal-400' : 'w-2 bg-white/20 hover:bg-white/40',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => go(1)}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
