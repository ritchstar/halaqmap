/**
 * GeoRadarButton — أيقونة تحديد الموقع الاستثنائية
 *
 * المفهوم: مقصّ حلاق ماب يتحوّل إلى بوصلة جيو-مكانية.
 * رمزية عميقة: الأداة الجوهرية للمنصة (المقص) تتحد مع مفهوم الاكتشاف الجغرافي
 * لتُجسِّد "نحن نجدك أينما كنت".
 *
 * الحالات:
 *  خامل  → مقص يومئ بنبضات هادئة
 *  يبحث → تحوّل ديناميكي — المقص يدور ليصير بوصلة مضيئة
 *  وجد   → اكتشاف — النقطة الذهبية تُثبَّت على الخريطة
 *  مرفوض → تحذير خفيف مع دعوة للإعادة
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type GeoPhase = 'idle' | 'searching' | 'found' | 'denied';

interface Props {
  onLocationDetected: (loc: { lat: number; lng: number }) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return Math.floor(n).toString().padStart(2, '0'); }

function toDMS(val: number, pos: string, neg: string): string {
  const abs = Math.abs(val);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.floor(((abs - d) * 60 - m) * 60);
  return `${pad(d)}° ${pad(m)}' ${pad(s)}" ${val >= 0 ? pos : neg}`;
}

// ─── Scissors-as-compass SVG icon ─────────────────────────────────────────────
function ScissorCompassIcon({ phase }: { phase: GeoPhase }) {
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';

  const bladeColor = isDenied ? '#ef4444' : isFound ? '#fbbf24' : '#2dd4bf';
  const coreColor = isDenied ? 'rgba(239,68,68,0.2)' : isFound ? 'rgba(251,191,36,0.2)' : 'rgba(20,184,166,0.15)';

  return (
    <motion.g
      animate={{ rotate: isSearching ? 360 : isFound ? 45 : 0 }}
      transition={
        isSearching
          ? { duration: 1.6, repeat: Infinity, ease: 'linear' }
          : { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
      }
      style={{ transformOrigin: '100px 100px' }}
    >
      {/* ── Blade A: NE–SW direction ─────────────────── */}
      {/* Upper blade */}
      <path
        d="M100,100 L112,72 L107,68 L100,90 Z"
        fill={bladeColor}
        opacity={isFound ? 0.9 : 0.75}
      />
      {/* Lower blade (mirrored) */}
      <path
        d="M100,100 L88,128 L93,132 L100,110 Z"
        fill={bladeColor}
        opacity={isFound ? 0.9 : 0.7}
      />

      {/* ── Blade B: NW–SE direction ─────────────────── */}
      {/* Left blade */}
      <path
        d="M100,100 L72,88 L68,93 L90,100 Z"
        fill={bladeColor}
        opacity={isFound ? 0.9 : 0.65}
      />
      {/* Right blade */}
      <path
        d="M100,100 L128,112 L132,107 L110,100 Z"
        fill={bladeColor}
        opacity={isFound ? 0.9 : 0.7}
      />

      {/* ── Pivot screw (center) ───────────────────── */}
      <circle cx="100" cy="100" r={isFound ? 5 : 4} fill={coreColor} />
      <circle
        cx="100" cy="100" r={isFound ? 3 : 2.5}
        fill={bladeColor}
        opacity={isFound ? 1 : 0.8}
      />

      {/* ── Compass rose tips (tiny) ──────────────── */}
      {!isDenied && (
        <g fill={bladeColor} opacity={isFound ? 0.6 : 0.35} fontSize="7" fontFamily="Tajawal,system-ui" fontWeight="700" textAnchor="middle">
          <text x="100" y="62">ش</text>
          <text x="100" y="144">ج</text>
          <text x="59" y="104">غ</text>
          <text x="142" y="104">ق</text>
        </g>
      )}
    </motion.g>
  );
}

// ─── Pulse rings ──────────────────────────────────────────────────────────────
function PulseRings({ phase }: { phase: GeoPhase }) {
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const dur = isSearching ? '1.4s' : '3.5s';
  const color = isFound ? 'rgba(251,191,36,' : isSearching ? 'rgba(20,184,166,' : 'rgba(20,184,166,';

  if (isFound) return (
    <>
      <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2">
        <animate attributeName="r" values="18;80;18" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="1.2">
        <animate attributeName="r" values="25;75;25" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
      </circle>
    </>
  );

  return (
    <>
      <circle cx="100" cy="100" r="5" fill={`${color}0.15)`}>
        <animate attributeName="r" values="10;78;10" dur={dur} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur={dur} repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="5" fill={`${color}0.1)`}>
        <animate attributeName="r" values="10;78;10" dur={dur} begin={isSearching ? '0.7s' : '1.75s'} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur={dur} begin={isSearching ? '0.7s' : '1.75s'} repeatCount="indefinite" />
      </circle>
    </>
  );
}

// ─── Sweep sector (scanning animation) ───────────────────────────────────────
function SweepSector({ phase }: { phase: GeoPhase }) {
  if (phase === 'idle' || phase === 'denied') return null;
  const isFound = phase === 'found';
  const R = 77;
  const CX = 100, CY = 100;
  const span = 60 * Math.PI / 180;
  const a1 = -Math.PI / 2;
  const a2 = a1 - span;
  const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
  const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);

  return (
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: isFound ? 1.2 : 2, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <path
        d={`M${CX},${CY} L${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R},0,0,0,${x2.toFixed(1)},${y2.toFixed(1)} Z`}
        fill={isFound ? 'rgba(251,191,36,0.22)' : 'rgba(20,184,166,0.18)'}
      />
      <line
        x1={CX} y1={CY} x2={x1.toFixed(1)} y2={y1.toFixed(1)}
        stroke={isFound ? 'rgba(251,191,36,0.85)' : 'rgba(45,212,191,0.85)'}
        strokeWidth="2" strokeLinecap="round"
      />
    </motion.g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function GeoRadarButton({ onLocationDetected }: Props) {
  const [phase, setPhase] = useState<GeoPhase>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const busy = useRef(false);

  const handleClick = useCallback(() => {
    if (busy.current || phase === 'found') return;
    if (phase === 'denied') { setPhase('idle'); busy.current = false; return; }
    busy.current = true;
    setPhase('searching');

    if (!navigator.geolocation) {
      setPhase('denied');
      toast.error('متصفحك لا يدعم تحديد الموقع');
      busy.current = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(loc);
        setAccuracy(Math.round(pos.coords.accuracy));
        setPhase('found');
        onLocationDetected(loc);
        busy.current = false;
      },
      (err) => {
        setPhase('denied');
        busy.current = false;
        toast.error(err.code === 1
          ? 'تم رفض إذن الموقع — افتح إعدادات المتصفح'
          : 'تعذّر تحديد موقعك — حاول مجدداً');
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 60000 },
    );
  }, [phase, onLocationDetected]);

  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';

  const outerGlow = isDenied
    ? 'rgba(239,68,68,0.35)'
    : isFound
      ? 'rgba(251,191,36,0.45)'
      : isSearching
        ? 'rgba(20,184,166,0.4)'
        : 'rgba(20,184,166,0.18)';

  const ringColor = isFound ? 'rgba(251,191,36,' : 'rgba(20,184,166,';

  return (
    <div className="flex flex-col items-center gap-5 select-none" dir="rtl">

      {/* ── Status label ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2.5"
        >
          <div className="h-px w-10 bg-gradient-to-l from-teal-400/50 to-transparent" />
          <span className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-teal-400/70">
            {isFound ? 'إحداثياتك مُثبَّتة على الرادار'
              : isSearching ? 'اكتساب إشارة الأقمار الصناعية…'
              : isDenied ? 'إشارة مرفوضة — انقر للإعادة'
              : 'مكانك على رادار حلاق ماب'}
          </span>
          <div className="h-px w-10 bg-gradient-to-r from-teal-400/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── The icon button ───────────────────────────────── */}
      <div className="relative">
        {/* External glow */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{ boxShadow: `0 0 45px 10px ${outerGlow}, 0 0 90px 20px ${outerGlow.replace('0.', '0.0')}` }}
        />

        <motion.button
          onClick={handleClick}
          disabled={isSearching}
          whileTap={!isSearching ? { scale: 0.93 } : undefined}
          whileHover={!isSearching && !isFound ? { scale: 1.05 } : undefined}
          className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full cursor-pointer"
          aria-label="تحديد موقعي الجغرافي"
        >
          <svg viewBox="0 0 200 200" width="200" height="200" className="overflow-visible">
            <defs>
              <radialGradient id="bg" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#0d1b2e" />
                <stop offset="100%" stopColor="#020912" />
              </radialGradient>
              <radialGradient id="coreHalo" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0" />
              </radialGradient>
              <filter id="iconGlow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="clip"><circle cx="100" cy="100" r="91" /></clipPath>
            </defs>

            {/* Background disc */}
            <circle cx="100" cy="100" r="91"
              fill="url(#bg)"
              stroke={`${ringColor}0.25)`}
              strokeWidth="1.2"
            />

            {/* Subtle grid inside */}
            <g clipPath="url(#clip)" opacity="0.06">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`h${i}`} x1="9" y1={22 + i * 31} x2="191" y2={22 + i * 31} stroke="#2dd4bf" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`v${i}`} x1={22 + i * 31} y1="9" x2={22 + i * 31} y2="191" stroke="#2dd4bf" strokeWidth="0.5" />
              ))}
            </g>

            {/* Axis cross lines */}
            <line x1="9" y1="100" x2="191" y2="100" stroke={`${ringColor}0.08)`} strokeWidth="0.7" />
            <line x1="100" y1="9" x2="100" y2="191" stroke={`${ringColor}0.08)`} strokeWidth="0.7" />

            {/* Concentric rings */}
            <circle cx="100" cy="100" r="77" fill="none" stroke={`${ringColor}0.08)`} strokeWidth="0.8" />
            <circle cx="100" cy="100" r="58" fill="none" stroke={`${ringColor}0.10)`} strokeWidth="0.8" strokeDasharray="2 5" />
            <circle cx="100" cy="100" r="39" fill="none" stroke={`${ringColor}0.12)`} strokeWidth="0.9" />
            <circle cx="100" cy="100" r="22" fill="none" stroke={`${ringColor}0.14)`} strokeWidth="0.9" strokeDasharray="1 3" />

            {/* Outer rotating ring */}
            <motion.g
              animate={{ rotate: isSearching || isFound ? -360 : -180 }}
              transition={
                isSearching || isFound
                  ? { duration: isFound ? 6 : 10, repeat: Infinity, ease: 'linear' }
                  : { duration: 25, repeat: Infinity, ease: 'linear' }
              }
              style={{ transformOrigin: '100px 100px' }}
            >
              <circle cx="100" cy="100" r="89"
                fill="none"
                stroke={`${ringColor}0.3)`}
                strokeWidth="1.2"
                strokeDasharray={isFound ? "3 7 1 7" : "5 9 2 9"}
              />
              {/* Distance tick marks */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10 * Math.PI) / 180;
                const isMain = i % 9 === 0;
                return (
                  <line key={i}
                    x1={100 + 89 * Math.cos(angle)} y1={100 + 89 * Math.sin(angle)}
                    x2={100 + (isMain ? 82 : 86) * Math.cos(angle)} y2={100 + (isMain ? 82 : 86) * Math.sin(angle)}
                    stroke={`${ringColor}${isMain ? 0.55 : 0.2})`}
                    strokeWidth={isMain ? 1.8 : 0.8}
                  />
                );
              })}
            </motion.g>

            {/* Radar sweep */}
            <SweepSector phase={phase} />

            {/* Pulse rings */}
            <PulseRings phase={phase} />

            {/* Core halo */}
            <circle cx="100" cy="100" r="22" fill="url(#coreHalo)" />

            {/* ── THE SCISSORS COMPASS ICON ── */}
            <g filter="url(#iconGlow)">
              <ScissorCompassIcon phase={phase} />
            </g>

            {/* Denied indicator */}
            {isDenied && (
              <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Found: golden lock point */}
            {isFound && (
              <g>
                <circle cx="100" cy="100" r="3.5" fill="#fbbf24" />
                <circle cx="100" cy="100" r="1.5" fill="white" />
              </g>
            )}
          </svg>
        </motion.button>
      </div>

      {/* ── Dynamic text below icon ───────────────────────── */}
      <AnimatePresence mode="wait">
        {isFound && coords ? (
          <motion.div
            key="coords"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-3 font-mono text-[0.62rem] tabular-nums">
              <span className="text-amber-400/60 tracking-widest">LAT</span>
              <span className="text-amber-200">{toDMS(coords.lat, 'ش', 'ج')}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[0.62rem] tabular-nums">
              <span className="text-amber-400/60 tracking-widest">LNG</span>
              <span className="text-amber-200">{toDMS(coords.lng, 'ق', 'غ')}</span>
            </div>
            {accuracy !== null && (
              <p className="mt-0.5 text-[0.56rem] text-amber-500/50">
                ● دقة الإشارة ±{accuracy}م · UTC+3
              </p>
            )}
          </motion.div>
        ) : isSearching ? (
          <motion.p
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[0.62rem] text-teal-400/60"
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >▋</motion.span>
            {' '}جاري اكتساب إشارة الأقمار الصناعية…
          </motion.p>
        ) : isDenied ? (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <p className="text-[0.66rem] text-rose-400">⚠ تعذّر اكتساب الإشارة</p>
            <button
              onClick={handleClick}
              className="text-[0.6rem] text-teal-400/60 underline hover:text-teal-300"
            >
              انقر للمحاولة مجدداً
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <p className="text-base font-black text-white">
              ابدأ الاستجابة الذكية — حدّد موقعك
            </p>
            <p className="text-[0.63rem] text-slate-500 max-w-xs">
              اضغط على مقص البوصلة لاكتشاف أقرب الصالونات إليك لحظياً
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative scan line */}
      <motion.div
        className="h-px w-36 bg-gradient-to-l from-transparent via-teal-400/25 to-transparent"
        animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
