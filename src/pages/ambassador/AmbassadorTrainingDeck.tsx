import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, X } from 'lucide-react';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import {
  AMBASSADOR_SLIDES_PDF_FILENAME,
  ambassadorPublicDocUrl,
} from '@/config/ambassadorMarketingKit';
import {
  AMBASSADOR_TRAINING_SLIDE_COUNT,
  AMBASSADOR_TRAINING_SLIDE_HEIGHT,
  AMBASSADOR_TRAINING_SLIDE_WIDTH,
  AMBASSADOR_TRAINING_SLIDES,
} from '@/config/ambassadorTrainingSlides';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import { cn } from '@/lib/utils';

/**
 * عارض تدريب السفراء داخل المنصة — شرائح HTML ثابتة (1280×720) مع تحجيم للجوال.
 * المسار: ROUTE_PATHS.AMBASSADOR_TRAINING
 */
export default function AmbassadorTrainingDeck() {
  useDocumentTitle('تدريب السفراء الميداني · حلاق ماب');

  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);

  const total = AMBASSADOR_TRAINING_SLIDE_COUNT;
  const slide = AMBASSADOR_TRAINING_SLIDES[index];
  const progress = ((index + 1) / total) * 100;
  const slidesPdf = ambassadorPublicDocUrl(AMBASSADOR_SLIDES_PDF_FILENAME);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));
    },
    [total],
  );

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      const pad = 8;
      const w = Math.max(0, el.clientWidth - pad);
      const h = Math.max(0, el.clientHeight - pad);
      const next = Math.min(w / AMBASSADOR_TRAINING_SLIDE_WIDTH, h / AMBASSADOR_TRAINING_SLIDE_HEIGHT);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      } else if (e.key === 'Escape' && document.fullscreenElement) {
        void document.exitFullscreen();
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

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col bg-[#07070a] text-white select-none"
      dir="rtl"
      data-bidi="off"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#07070a] to-slate-950" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <HalaqmapBrandMark className="h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15" />
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold tracking-wide text-teal-400/90">تدريب السفراء الميداني</p>
            <p className="truncate text-[0.65rem] text-slate-500">{slide.titleAr}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="text-sm font-mono text-slate-400 tabular-nums">
            {index + 1}/{total}
          </span>
          <a
            href={slidesPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-2 text-[0.7rem] font-semibold text-slate-300 hover:bg-white/5 sm:inline-flex"
            title="تحميل PDF اختياري — إن وُجد الملف"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>
          <button
            type="button"
            className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/5"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen?.().catch(() => {});
            }}
            aria-label={fullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <Link
            to={ROUTE_PATHS.AMBASSADOR_ENTER}
            className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/5"
            aria-label="إغلاق والعودة"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main ref={stageRef} className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-2 py-2 sm:px-4">
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-20 w-10 sm:w-14"
          aria-label="الشريحة السابقة"
          onClick={() => go(-1)}
          disabled={index === 0}
        />
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-20 w-10 sm:w-14"
          aria-label="الشريحة التالية"
          onClick={() => go(1)}
          disabled={index === total - 1}
        />

        <div
          className="relative shrink-0 overflow-hidden rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10"
          style={{
            width: AMBASSADOR_TRAINING_SLIDE_WIDTH * scale,
            height: AMBASSADOR_TRAINING_SLIDE_HEIGHT * scale,
          }}
        >
          <iframe
            key={slide.id}
            title={slide.titleAr}
            src={slide.src}
            className="absolute left-0 top-0 origin-top-left border-0 bg-black"
            style={{
              width: AMBASSADOR_TRAINING_SLIDE_WIDTH,
              height: AMBASSADOR_TRAINING_SLIDE_HEIGHT,
              transform: `scale(${scale})`,
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </main>

      <footer className="relative z-10 space-y-2 border-t border-white/10 px-3 py-2.5 sm:px-6">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-400 via-cyan-400 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </button>
          <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
            {AMBASSADOR_TRAINING_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`شريحة ${i + 1}: ${s.titleAr}`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-7 bg-teal-400' : 'w-2 bg-white/20 hover:bg-white/45',
                )}
              />
            ))}
          </div>
          <p className="max-w-[40%] truncate text-center text-[0.65rem] text-slate-500 sm:hidden">
            {slide.titleAr}
          </p>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => go(1)}
            className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/5"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[0.62rem] text-slate-600">← → · مسافة · F ملء الشاشة</p>
      </footer>
    </div>
  );
}
