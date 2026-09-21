/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * GeoRadarButton — أيقونة استعلام فاخرة لامعة
 *
 * دائرة لؤلؤية بإطار ذهبي زمردي · مقص كرومي · ومضة ضوء دوّارة فريدة
 * موضعها في الهيرو: أسفل العنوان والفلاتر وفوق ثلاثية الثقة
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  clearStoredUserCoords,
  readStoredUserCoords,
  storeUserCoords,
} from '@/lib/userRegionWeather';
import { resolveStrictUserLocation } from '@/lib/strictGeolocation';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type GeoPhase = 'idle' | 'searching' | 'found' | 'denied';
interface Props {
  onLocationDetected: (loc: { lat: number; lng: number }) => void;
  onLocationReset?: () => void;
  /** hero = فوق صورة الهيرو الداكنة · canvas = خلفية بيج */
  surface?: 'hero' | 'canvas';
}

function geoErrorMessage(code: number | undefined): string {
  if (code === 1) return 'تعذّر بدء الاستعلام — أعد المحاولة';
  if (code === 2) return 'الخدمة غير جاهزة الآن — أعد المحاولة بعد لحظة';
  if (code === 3) return 'انتهت مهلة الاستعلام — جرّب مجدداً';
  return 'تعذّر بدء الاستعلام — حاول مرة أخرى';
}

// ─── Searching animation: rotating dots ring ──────────────────────────────────
function SearchingRing() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-full">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const r = 90;
        const x = 110 + r * Math.cos(angle);
        const y = 110 + r * Math.sin(angle);
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-amber-300"
            style={{ left: x - 4, top: y - 4 }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.6, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

/** ومضة ضوء فريدة: شعاع ذهبي يدور على الحافة كالواجهة الكرومية */
function LuxuryShineOrbit({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-full"
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
      style={{
        background:
          'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255,236,179,0.0) 310deg, rgba(255,248,220,0.95) 330deg, rgba(212,175,55,0.85) 345deg, transparent 360deg)',
        maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
        WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function GeoRadarButton({ onLocationDetected, onLocationReset, surface = 'canvas' }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<GeoPhase>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const busy = useRef(false);
  const onHero = surface === 'hero';

  const handleClick = useCallback(async () => {
    if (busy.current) return;

    if (!navigator.geolocation) {
      setPhase('denied');
      toast.error('الخدمة غير مدعومة في هذا المتصفح');
      return;
    }

    // Never keep stale coordinates when user asks for a new fix.
    onLocationReset?.();
    setCoords(null);
    clearStoredUserCoords();

    busy.current = true;
    setPhase('searching');

    try {
      const previousCoords = coords ?? readStoredUserCoords();
      const strict = await resolveStrictUserLocation({
        previousCoords,
        highAccuracyTimeoutMs: 12_000,
        sampleWindowMs: 9_000,
        minDesiredAccuracyM: 60,
        maxAcceptableAccuracyM: 350,
      });
      if (!strict.ok) {
        setPhase('denied');
        toast.error(strict.error || geoErrorMessage(undefined));
        return;
      }

      const loc = strict.coords;
      setCoords(loc);
      storeUserCoords(loc);
      setPhase('found');
      requestAnimationFrame(() => onLocationDetected(loc));
      toast.success('يجري تصنيف الخدمات المناسبة لك');
      if (strict.warning) {
        toast.message('تنبيه دقة', { description: strict.warning });
      }
    } catch (err) {
      setPhase('denied');
      toast.error(geoErrorMessage((err as GeolocationPositionError).code));
    } finally {
      busy.current = false;
    }
  }, [onLocationDetected, onLocationReset]);

  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';
  const isIdle = phase === 'idle';

  // ثيم فاخر: لؤلؤة + ذهب + زمرد
  const theme = {
    idle: {
      ring: 'rgba(212,175,55,',
      border: 'rgba(201,162,39,0.72)',
      glow: 'rgba(20,184,166,0.32)',
      goldGlow: 'rgba(212,175,55,0.45)',
      bg: 'radial-gradient(circle at 38% 28%, #fffdf6 0%, #f4ebe0 38%, #e8dcc8 72%, #d4c4a8 100%)',
      icon: '#0f766e',
      text: 'text-[#1c1810]',
      sub: 'text-teal-800/80',
    },
    searching: {
      ring: 'rgba(20,184,166,',
      border: 'rgba(20,184,166,0.65)',
      glow: 'rgba(20,184,166,0.48)',
      goldGlow: 'rgba(212,175,55,0.35)',
      bg: 'radial-gradient(circle at 38% 28%, #f0faf7 0%, #d8efe8 42%, #eee2ce 100%)',
      icon: '#0f766e',
      text: 'text-teal-900',
      sub: 'text-teal-800/80',
    },
    found: {
      ring: 'rgba(16,185,129,',
      border: 'rgba(16,185,129,0.6)',
      glow: 'rgba(16,185,129,0.42)',
      goldGlow: 'rgba(52,211,153,0.3)',
      bg: 'radial-gradient(circle at 38% 28%, #ecfdf5 0%, #d1fae5 45%, #eee2ce 100%)',
      icon: '#047857',
      text: 'text-emerald-900',
      sub: 'text-emerald-800/80',
    },
    denied: {
      ring: 'rgba(239,68,68,',
      border: 'rgba(239,68,68,0.55)',
      glow: 'rgba(239,68,68,0.35)',
      goldGlow: 'rgba(251,113,133,0.25)',
      bg: 'radial-gradient(circle at 38% 28%, #fff1f2 0%, #fecdd3 45%, #eee2ce 100%)',
      icon: '#dc2626',
      text: 'text-rose-900',
      sub: 'text-rose-800/80',
    },
  }[phase];

  const SIZE = isMobile ? 184 : 228;

  return (
    <div className="flex flex-col items-center gap-4 select-none" dir="rtl">

      {/* ── The button ───────────────────────────────────── */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>

        {/* Pulse rings — idle & searching */}
        <AnimatePresence>
          {(isIdle || isSearching) && !isMobile && (
            <>
              <motion.div
                key="ring1"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: `${theme.ring}0.35)` }}
                animate={{ scale: [1, 1.42], opacity: [0.55, 0] }}
                transition={{ duration: isSearching ? 1.4 : 2.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                key="ring2"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: 'rgba(20,184,166,0.22)' }}
                animate={{ scale: [1, 1.68], opacity: [0.4, 0] }}
                transition={{ duration: isSearching ? 1.4 : 2.8, delay: isSearching ? 0.35 : 0.7, repeat: Infinity, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Found: green ripple */}
        {isFound && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(52,211,153,0.55)' }}
            animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Searching: dots orbit */}
        {isSearching && !isMobile && <SearchingRing />}

        {/* ── Main circle button ─────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => void handleClick()}
          disabled={isSearching}
          whileHover={!isSearching ? { scale: 1.045 } : undefined}
          whileTap={!isSearching ? { scale: 0.96 } : undefined}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full border-[1.5px] focus:outline-none cursor-pointer touch-manipulation"
          style={{
            background: theme.bg,
            borderColor: theme.border,
            boxShadow: [
              `0 0 40px 10px ${theme.glow}`,
              `0 0 70px 18px ${theme.goldGlow}`,
              'inset 0 2px 10px rgba(255,255,255,0.75)',
              'inset 0 -10px 22px rgba(120,90,40,0.18)',
              '0 14px 36px rgba(0,0,0,0.28)',
            ].join(', '),
          }}
          aria-label="ابدأ الاستعلام"
          aria-busy={isSearching}
        >
          {/* إطار ذهبي داخلي */}
          <div
            className="pointer-events-none absolute inset-[5px] rounded-full"
            style={{
              border: '1px solid rgba(212,175,55,0.55)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
            }}
          />

          {/* ومضة كرومية دوّارة — الميزة الفريدة */}
          <LuxuryShineOrbit active={isIdle || isSearching} />

          {/* لمعة علوية ثابتة (bevel) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(155deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.12) 28%, transparent 48%, rgba(20,184,166,0.08) 100%)',
            }}
          />

          {/* شعاع قطري يمرّ عبر الوجه */}
          {(isIdle || isSearching) && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full"
              aria-hidden
              animate={{ x: ['-120%', '120%'] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
              style={{
                background:
                  'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 48%, rgba(255,236,179,0.4) 52%, transparent 65%)',
                mixBlendMode: 'soft-light',
              }}
            />
          )}

          {/* ── Icon zone ──────────────────────────────────── */}
          <div className="relative z-10 mb-3 flex items-center justify-center">
            {isFound ? (
              <div className={cn(
                'flex items-center justify-center rounded-full border-2 border-emerald-400/55 bg-emerald-500/15',
                isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]',
              )}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none">
                  <path d="M5 14 L11 20 L23 8" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : isDenied ? (
              <div className={cn(
                'flex items-center justify-center rounded-full border-2 border-rose-400/50 bg-rose-500/15',
                isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]',
              )}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none">
                  <line x1="7" y1="7" x2="21" y2="21" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                  <line x1="21" y1="7" x2="7" y2="21" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <div className="relative">
                {/* وهج خلف المقص */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.45) 0%, transparent 70%)' }}
                />
                <motion.div
                  animate={isSearching
                    ? { rotate: [-18, 18, -18], scale: [1, 1.08, 1] }
                    : { rotate: [0, -6, 0, 6, 0], scale: 1 }}
                  transition={isSearching
                    ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Scissors
                    style={{
                      color: theme.icon,
                      width: isMobile ? 56 : 70,
                      height: isMobile ? 56 : 70,
                      filter: 'drop-shadow(0 2px 4px rgba(15,118,110,0.35)) drop-shadow(0 0 10px rgba(212,175,55,0.45))',
                    }}
                    strokeWidth={1.25}
                  />
                </motion.div>
                {/* جوهرة صغيرة — لمسة فريدة */}
                {isIdle ? (
                  <motion.span
                    className="absolute -left-1 -top-1 text-amber-400"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  </motion.span>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Text zone ──────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <p className={cn(
              'font-black leading-tight tracking-wide',
              isMobile ? 'text-[0.95rem]' : 'text-[1.08rem]',
              theme.text,
            )}>
              {isFound ? 'جاري تصنيف الخدمات' : isSearching ? 'يجري الاستعلام…' : isDenied ? 'تعذّر الاستعلام' : 'ابدأ الآن'}
            </p>
            {isIdle && (
              <p className={cn(
                'font-semibold',
                isMobile ? 'text-[0.58rem]' : 'text-[0.64rem]',
                theme.sub,
              )}>
                ابدأ الاستعلام
              </p>
            )}
            {isSearching && (
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-amber-400"
                    animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1.2, 0.7] }}
                    transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
            {isFound && (
              <p className={cn('text-[0.62rem] font-semibold', theme.sub)}>
                النتائج بالأسفل ↓
              </p>
            )}
            {isDenied && (
              <p className={cn('text-[0.62rem] font-semibold', theme.sub)}>
                اضغط للمحاولة مجدداً
              </p>
            )}
          </div>
        </motion.button>
      </div>

      {/* ── After found: coordinates + verify button ─────── */}
      <AnimatePresence>
        {isFound && coords && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/10 text-emerald-700 shadow-[0_0_16px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/60 hover:bg-emerald-500/18 hover:shadow-[0_0_24px_rgba(16,185,129,0.28)]"
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" className="shrink-0 text-emerald-400">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
              </svg>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {!isMobile ? (
        <motion.div
          className="h-px w-36 bg-gradient-to-l from-transparent via-amber-300/45 to-transparent"
          animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <p className={cn(
        'max-w-[19rem] text-center text-[0.72rem] leading-5',
        onHero ? 'text-white/75 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]' : 'text-[#6f6250]',
      )}>
        هذه الخدمة تتطلب إذن الموقع لإكمال الاستعلام وعرض الخدمات المناسبة لك، وفق سياسة الخصوصية.
      </p>
    </div>
  );
}
