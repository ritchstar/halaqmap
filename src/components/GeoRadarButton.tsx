/**
 * GeoRadarButton — تصميم تطبيق سعودي راقٍ
 *
 * دائرة ضخمة نظيفة · مقص أيقوني · نص عربي · تحولات ناعمة
 * لا تعقيد مرئي · لا خرائط · لا أقمار · مجرد جمال ووظيفة
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  clearStoredUserCoords,
  readStoredUserCoords,
  storeUserCoords,
} from '@/lib/userRegionWeather';
import { resolveStrictUserLocation } from '@/lib/strictGeolocation';

// ─── Types ────────────────────────────────────────────────────────────────────
type GeoPhase = 'idle' | 'searching' | 'found' | 'denied';
interface Props {
  onLocationDetected: (loc: { lat: number; lng: number }) => void;
  onLocationReset?: () => void;
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
            className="absolute h-2 w-2 rounded-full bg-teal-400"
            style={{ left: x - 4, top: y - 4 }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.6, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function GeoRadarButton({ onLocationDetected, onLocationReset }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<GeoPhase>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const busy = useRef(false);

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

  // Theme by state
  const theme = {
    idle:      { ring: 'rgba(20,184,166,', border: 'rgba(20,184,166,0.40)', glow: 'rgba(20,184,166,0.28)', bg: 'radial-gradient(circle at 42% 38%, #0d2a28 0%, #061a18 45%, #020912 100%)', icon: '#2dd4bf', text: 'text-white', sub: 'text-teal-400/65' },
    searching: { ring: 'rgba(20,184,166,', border: 'rgba(20,184,166,0.55)', glow: 'rgba(20,184,166,0.40)', bg: 'radial-gradient(circle at 42% 38%, #0d2a28 0%, #061a18 45%, #020912 100%)', icon: '#14b8a6', text: 'text-teal-100', sub: 'text-teal-400/65' },
    found:     { ring: 'rgba(16,185,129,', border: 'rgba(16,185,129,0.55)', glow: 'rgba(16,185,129,0.38)', bg: 'radial-gradient(circle at 42% 38%, #052e1f 0%, #031a12 45%, #020912 100%)', icon: '#34d399', text: 'text-emerald-100', sub: 'text-emerald-400/70' },
    denied:    { ring: 'rgba(239,68,68,',  border: 'rgba(239,68,68,0.50)',  glow: 'rgba(239,68,68,0.32)',  bg: 'radial-gradient(circle at 42% 38%, #2d0a0a 0%, #1a0505 45%, #020912 100%)', icon: '#f87171', text: 'text-rose-100', sub: 'text-rose-400/65' },
  }[phase];

  const SIZE = isMobile ? 184 : 220;

  return (
    <div className="flex flex-col items-center gap-4 select-none" dir="rtl">

      {/* ── The button ───────────────────────────────────── */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>

        {/* Pulse rings — idle & searching */}
        <AnimatePresence>
          {(isIdle || isSearching) && !isMobile && (
            <>
              <motion.div key="ring1"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: `${theme.ring}0.25)` }}
                animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                transition={{ duration: isSearching ? 1.4 : 2.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div key="ring2"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: `${theme.ring}0.15)` }}
                animate={{ scale: [1, 1.70], opacity: [0.35, 0] }}
                transition={{ duration: isSearching ? 1.4 : 2.8, delay: isSearching ? 0.35 : 0.7, repeat: Infinity, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Found: green ripple */}
        {isFound && (
          <motion.div className="pointer-events-none absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(52,211,153,0.55)' }}
            animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
        )}

        {/* Searching: dots orbit */}
        {isSearching && !isMobile && <SearchingRing />}

        {/* ── Main circle button ─────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => void handleClick()}
          disabled={isSearching}
          whileHover={!isSearching ? { scale: 1.04 } : undefined}
          whileTap={!isSearching ? { scale: 0.96 } : undefined}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full border focus:outline-none overflow-hidden cursor-pointer touch-manipulation"
          style={{
            background: theme.bg,
            borderColor: theme.border,
            boxShadow: `0 0 55px 12px ${theme.glow}, 0 0 110px 24px ${theme.glow.replace('0.', '0.0')}`,
          }}
          aria-label="ابدأ الاستعلام"
          aria-busy={isSearching}
        >
          {/* Inner subtle radial accent */}
          <div className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle at 42% 35%, ${theme.ring}0.08) 0%, transparent 65%)` }} />

          {/* Inner ring */}
          <div className="pointer-events-none absolute inset-3 rounded-full border"
            style={{ borderColor: `${theme.ring}0.12)` }} />

          {/* ── Icon zone ──────────────────────────────────── */}
          <div className="relative z-10 mb-4 flex items-center justify-center">
            {isFound ? (
              <div className={`flex items-center justify-center rounded-full border-2 border-emerald-400/50 bg-emerald-500/15 ${isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]'}`}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none">
                  <path d="M5 14 L11 20 L23 8" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : isDenied ? (
              <div className={`flex items-center justify-center rounded-full border-2 border-rose-400/50 bg-rose-500/15 ${isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]'}`}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none">
                  <line x1="7" y1="7" x2="21" y2="21" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                  <line x1="21" y1="7" x2="7" y2="21" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <motion.div
                animate={isSearching
                  ? { rotate: [-18, 18, -18], scale: [1, 1.08, 1] }
                  : { rotate: 0, scale: 1 }}
                transition={isSearching
                  ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.4 }}>
                <Scissors
                  style={{ color: theme.icon, width: isMobile ? 56 : 68, height: isMobile ? 56 : 68 }}
                  strokeWidth={1.35}
                />
              </motion.div>
            )}
          </div>

          {/* ── Text zone ──────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <p className={`${isMobile ? 'text-[0.95rem]' : 'text-[1.05rem]'} font-black leading-tight ${theme.text}`}>
              {isFound ? 'جاري تصنيف الخدمات' : isSearching ? 'يجري الاستعلام…' : isDenied ? 'تعذّر الاستعلام' : 'ابدأ الآن'}
            </p>
            {isIdle && (
              <p className={`${isMobile ? 'text-[0.58rem]' : 'text-[0.62rem]'} font-semibold ${theme.sub}`}>
                ابدأ الاستعلام
              </p>
            )}
            {isSearching && (
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-teal-400"
                    animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1.2, 0.7] }}
                    transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }} />
                ))}
              </div>
            )}
            {isFound && (
              <p className={`text-[0.62rem] font-semibold ${theme.sub}`}>
                النتائج بالأسفل ↓
              </p>
            )}
            {isDenied && (
              <p className={`text-[0.62rem] font-semibold ${theme.sub}`}>
                اضغط للمحاولة مجدداً
              </p>
            )}
          </div>
        </motion.button>
      </div>

      {/* ── After found: coordinates + verify button ─────── */}
      <AnimatePresence>
        {isFound && coords && (
          <motion.div key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col items-center gap-3">

            {/* Map verification button */}
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/10 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/60 hover:bg-emerald-500/18 hover:shadow-[0_0_24px_rgba(16,185,129,0.28)]"
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" className="shrink-0 text-emerald-400">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"/>
              </svg>
            </motion.a>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scan line decoration ─────────────────────────── */}
      {!isMobile ? (
        <motion.div
          className="h-px w-32 bg-gradient-to-l from-transparent via-teal-400/20 to-transparent"
          animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <p className="max-w-[19rem] text-center text-[0.72rem] leading-5 text-slate-400">
        هذه الخدمة تتطلب إذن الموقع لإكمال الاستعلام وعرض الخدمات المناسبة لك، وفق سياسة الخصوصية.
      </p>
    </div>
  );
}
