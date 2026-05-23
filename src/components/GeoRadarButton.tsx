/**
 * GeoRadarButton — "دبوس الملك الجغرافي"
 *
 * تركيب المفاهيم الخمسة في أيقونة واحدة متناسقة:
 *  ① شكل دبوس الخريطة  — مفهوم فوري لدى كل مستخدم
 *  ② تاج 5 أسنان       — أسنان GPS تبثّ إشارات (المنشأة ملكة حيّها)
 *  ③ مقص البوصلة       — ينفتح للبحث · يُغلَق لحظة الإيجاد
 *  ④ أقمار اصطناعية   — 3 جسيمات مدارية تنجذب للمركز عند التثبيت
 *  ⑤ LOCK ذهبية       — تظهر على إبرة الدبوس لحظة الاكتشاف
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type GeoPhase = 'idle' | 'searching' | 'found' | 'denied';
interface Props { onLocationDetected: (loc: { lat: number; lng: number }) => void; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return Math.floor(n).toString().padStart(2, '0'); }
function toDMS(val: number, pos: string, neg: string): string {
  const abs = Math.abs(val);
  const d = Math.floor(abs), m = Math.floor((abs - d) * 60);
  const s = Math.floor(((abs - d) * 60 - m) * 60);
  return `${pad(d)}° ${pad(m)}' ${pad(s)}" ${val >= 0 ? pos : neg}`;
}

// ─── Pin geometry ─────────────────────────────────────────────────────────────
const CX = 100, CY = 92, R = 70;           // circle head center + radius
const TIP_Y = 232;                           // needle tip Y
// The pin path: left curve → top arc → right curve → tip
const PIN_PATH = `M100,${TIP_Y} C78,212 28,172 28,${CY} A${R},${R} 0 1 1 172,${CY} C172,172 122,212 100,${TIP_Y}Z`;

// Crown spike positions (5 spikes at -150°,-120°,-90°,-60°,-30°)
const SPIKES = [-150, -120, -90, -60, -30].map((deg) => {
  const θ = (deg * Math.PI) / 180;
  const δ = (8 * Math.PI) / 180;
  return {
    b1: { x: +(CX + R * Math.cos(θ - δ)).toFixed(1), y: +(CY + R * Math.sin(θ - δ)).toFixed(1) },
    tip: { x: +(CX + (R + 14) * Math.cos(θ)).toFixed(1), y: +(CY + (R + 14) * Math.sin(θ)).toFixed(1) },
    b2: { x: +(CX + R * Math.cos(θ + δ)).toFixed(1), y: +(CY + R * Math.sin(θ + δ)).toFixed(1) },
  };
});

// Fixed stars
const STARS = Array.from({ length: 16 }, (_, i) => ({
  cx: (i * 31 + 11) % 196 + 2,
  cy: (i * 47 + 9) % 100 + 2,
  r:  [0.5, 0.8, 0.6, 0.9, 0.5][i % 5],
}));

// ─── Scissors inside pin circle ───────────────────────────────────────────────
function ScissorIcon({ phase }: { phase: GeoPhase }) {
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';
  const c = isDenied ? '#ef4444' : isFound ? '#fbbf24' : '#2dd4bf';

  return (
    <motion.g
      animate={{ rotate: isSearching ? 360 : isFound ? 45 : 0 }}
      transition={isSearching
        ? { duration: 1.8, repeat: Infinity, ease: 'linear' }
        : { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformOrigin: `${CX}px ${CY}px` }}
    >
      {/* North blade */}
      <path d={`M${CX},${CY} L${CX+10},${CY-24} L${CX+5},${CY-28} L${CX},${CY-12}Z`} fill={c} opacity={0.85} />
      {/* South blade */}
      <path d={`M${CX},${CY} L${CX-10},${CY+24} L${CX-5},${CY+28} L${CX},${CY+12}Z`} fill={c} opacity={0.80} />
      {/* West blade */}
      <path d={`M${CX},${CY} L${CX-24},${CY-10} L${CX-28},${CY-5} L${CX-12},${CY}Z`} fill={c} opacity={0.75} />
      {/* East blade */}
      <path d={`M${CX},${CY} L${CX+24},${CY+10} L${CX+28},${CY+5} L${CX+12},${CY}Z`} fill={c} opacity={0.80} />
      {/* Pivot screw */}
      <circle cx={CX} cy={CY} r={4} fill={`${isFound ? 'rgba(251,191,36,0.25)' : 'rgba(20,184,166,0.20)'}`} />
      <circle cx={CX} cy={CY} r={isFound ? 2.8 : 2.2} fill={c} opacity={isFound ? 1 : 0.85} />
      {/* Compass labels */}
      {!isDenied && (
        <g fill={c} opacity={isFound ? 0.65 : 0.32} fontSize="7.5"
          fontFamily="Tajawal,system-ui" fontWeight="700" textAnchor="middle">
          <text x={CX} y={CY - 52}>ش</text>
          <text x={CX} y={CY + 62}>ج</text>
          <text x={CX - 57} y={CY + 3}>غ</text>
          <text x={CX + 57} y={CY + 3}>ق</text>
        </g>
      )}
    </motion.g>
  );
}

// ─── Crown spike ──────────────────────────────────────────────────────────────
function CrownSpike({ spike, phase, i }: { spike: typeof SPIKES[0]; phase: GeoPhase; i: number }) {
  const isFound = phase === 'found';
  const isSearching = phase === 'searching';
  const color = isFound ? 'rgba(251,191,36,0.90)' : 'rgba(20,184,166,0.60)';
  const fill = isFound ? 'rgba(251,191,36,0.30)' : 'rgba(20,184,166,0.12)';

  return (
    <motion.g
      animate={isSearching
        ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
        : isFound
          ? { scale: [1, 1.3, 1.15], opacity: [0.9, 1, 0.9] }
          : { scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
      transition={{ duration: isSearching ? 0.9 : 2.2, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: `${spike.tip.x}px ${spike.tip.y}px` }}
    >
      <polygon
        points={`${spike.b1.x},${spike.b1.y} ${spike.tip.x},${spike.tip.y} ${spike.b2.x},${spike.b2.y}`}
        fill={fill} stroke={color} strokeWidth="1.2" strokeLinejoin="round"
      />
      {/* Signal dot at spike tip */}
      {(isSearching || isFound) && (
        <circle cx={spike.tip.x} cy={spike.tip.y} r={2} fill={isFound ? '#fbbf24' : '#2dd4bf'} opacity={0.9}>
          <animate attributeName="r" values="1.5;3;1.5" dur={isFound ? '1.2s' : '0.9s'} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur={isFound ? '1.2s' : '0.9s'} repeatCount="indefinite" />
        </circle>
      )}
    </motion.g>
  );
}

// ─── Sweep sector ─────────────────────────────────────────────────────────────
function SweepSector({ phase }: { phase: GeoPhase }) {
  if (phase === 'idle' || phase === 'denied') return null;
  const isFound = phase === 'found';
  const span = 65 * Math.PI / 180;
  const a1 = -Math.PI / 2; const a2 = a1 - span;
  const r = 66;
  const x1 = CX + r * Math.cos(a1), y1 = CY + r * Math.sin(a1);
  const x2 = CX + r * Math.cos(a2), y2 = CY + r * Math.sin(a2);
  return (
    <motion.g animate={{ rotate: 360 }}
      transition={{ duration: isFound ? 1.1 : 2.0, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: `${CX}px ${CY}px` }}>
      <path d={`M${CX},${CY} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,0,0,${x2.toFixed(1)},${y2.toFixed(1)} Z`}
        fill={isFound ? 'rgba(251,191,36,0.18)' : 'rgba(20,184,166,0.15)'} />
      <line x1={CX} y1={CY} x2={x1.toFixed(1)} y2={y1.toFixed(1)}
        stroke={isFound ? 'rgba(251,191,36,0.92)' : 'rgba(45,212,191,0.92)'}
        strokeWidth="2.2" strokeLinecap="round" />
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
    busy.current = true; setPhase('searching');
    if (!navigator.geolocation) {
      setPhase('denied'); toast.error('متصفحك لا يدعم تحديد الموقع'); busy.current = false; return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(loc); setAccuracy(Math.round(pos.coords.accuracy));
        setPhase('found'); onLocationDetected(loc); busy.current = false;
      },
      (err) => {
        setPhase('denied'); busy.current = false;
        toast.error(err.code === 1 ? 'تم رفض إذن الموقع — افتح إعدادات المتصفح' : 'تعذّر تحديد موقعك');
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 60000 },
    );
  }, [phase, onLocationDetected]);

  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';

  const primaryColor = isDenied ? 'rgba(239,68,68,' : isFound ? 'rgba(251,191,36,' : 'rgba(20,184,166,';
  const glowColor = isDenied ? 'rgba(239,68,68,0.40)' : isFound ? 'rgba(251,191,36,0.50)' : 'rgba(20,184,166,0.28)';

  return (
    <div className="flex flex-col items-center gap-5 select-none" dir="rtl">

      {/* ── Status label ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2.5">
          <div className="h-px w-10 bg-gradient-to-l from-teal-400/50 to-transparent" />
          <span className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-teal-400/70">
            {isFound ? 'مكانك على الرادار · LOCK ✓'
              : isSearching ? 'اكتساب إشارة الأقمار الصناعية…'
              : isDenied ? 'إشارة مرفوضة — انقر للإعادة'
              : 'دبوس الملك الجغرافي · حلاق ماب'}
          </span>
          <div className="h-px w-10 bg-gradient-to-r from-teal-400/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Pin button ─────────────────────────────────── */}
      <div className="relative">
        {/* External glow */}
        <div className="absolute inset-0 rounded-full transition-all duration-700"
          style={{ boxShadow: `0 8px 60px 8px ${glowColor}, 0 0 120px 16px ${glowColor.replace('0.', '0.0')}` }} />

        <motion.button onClick={handleClick} disabled={isSearching}
          whileTap={!isSearching ? { scale: 0.94 } : undefined}
          whileHover={!isSearching && !isFound ? { scale: 1.03 } : undefined}
          className="relative block focus:outline-none rounded-full cursor-pointer"
          aria-label="تحديد موقعي الجغرافي">

          <svg viewBox="0 0 200 250" width="210" height="263" className="overflow-visible">
            <defs>
              <radialGradient id="pinBg" cx="50%" cy="38%">
                <stop offset="0%" stopColor="#0f2033" />
                <stop offset="100%" stopColor="#020912" />
              </radialGradient>
              <radialGradient id="coreHalo" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0.32" />
                <stop offset="100%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="tipGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0" />
              </radialGradient>
              <filter id="iconGlo">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="tipGlo">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="pinClip"><path d={PIN_PATH} /></clipPath>
              {/* Orbital paths for animateMotion */}
              <path id="op1" d={`M${CX},${CY} m-82,0 a82,30 0 1,1 164,0 a82,30 0 1,1 -164,0`} />
              <path id="op2" d={`M${CX},${CY} m-78,0 a78,26 0 1,1 156,0 a78,26 0 1,1 -156,0`} />
              <path id="op3" d={`M${CX},${CY} m-${R},0 a${R},${R} 0 1,1 ${R*2},0 a${R},${R} 0 1,1 -${R*2},0`} />
            </defs>

            {/* ── PIN SILHOUETTE ──────────────────────── */}
            <path d={PIN_PATH} fill="url(#pinBg)" />
            {/* Pin outline with primary color */}
            <path d={PIN_PATH} fill="none"
              stroke={`${primaryColor}0.35)`} strokeWidth="1.5" />

            {/* ── STAR FIELD (inside top of pin) ──────── */}
            <g clipPath="url(#pinClip)">
              {STARS.map((s, i) => (
                <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity="0.18" />
              ))}

              {/* Grid lines inside circle area */}
              <g opacity="0.05">
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`h${i}`} x1="30" y1={30 + i * 30} x2="170" y2={30 + i * 30}
                    stroke="#2dd4bf" strokeWidth="0.4" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={`v${i}`} x1={30 + i * 35} y1="22" x2={30 + i * 35} y2="162"
                    stroke="#2dd4bf" strokeWidth="0.4" />
                ))}
              </g>

              {/* Axis lines */}
              <line x1="30" y1={CY} x2="170" y2={CY} stroke={`${primaryColor}0.08)`} strokeWidth="0.6" />
              <line x1={CX} y1="22" x2={CX} y2="162" stroke={`${primaryColor}0.08)`} strokeWidth="0.6" />
            </g>

            {/* ── CONCENTRIC RINGS (inside circle) ────── */}
            <circle cx={CX} cy={CY} r={R}    fill="none" stroke={`${primaryColor}0.08)`} strokeWidth="0.7" />
            <circle cx={CX} cy={CY} r={R-14} fill="none" stroke={`${primaryColor}0.10)`} strokeWidth="0.7" strokeDasharray="2 5" />
            <circle cx={CX} cy={CY} r={R-28} fill="none" stroke={`${primaryColor}0.12)`} strokeWidth="0.8" />
            <circle cx={CX} cy={CY} r={R-44} fill="none" stroke={`${primaryColor}0.14)`} strokeWidth="0.8" strokeDasharray="1 3" />

            {/* ── CROWN SPIKES (5 teeth) ───────────────── */}
            {SPIKES.map((spike, i) => (
              <CrownSpike key={i} spike={spike} phase={phase} i={i} />
            ))}

            {/* ── SATELLITE ORBITS ─────────────────────── */}
            <ellipse cx={CX} cy={CY} rx={82} ry={30} fill="none"
              stroke={`${primaryColor}0.12)`} strokeWidth="0.6" strokeDasharray="3 7"
              transform={`rotate(28,${CX},${CY})`} />
            <ellipse cx={CX} cy={CY} rx={78} ry={26} fill="none"
              stroke={`${primaryColor}0.09)`} strokeWidth="0.5" strokeDasharray="2 9"
              transform={`rotate(-42,${CX},${CY})`} />

            {/* ── ORBITAL PARTICLES ────────────────────── */}
            {[
              { path: 'op1', dur: '7s', r: 2.8, delay: '0s' },
              { path: 'op2', dur: '11s', r: 2.0, delay: '3.5s' },
              { path: 'op3', dur: '5.5s', r: 1.6, delay: '1.5s' },
            ].map((sat, i) => (
              <circle key={i} r={sat.r}
                fill={`${primaryColor}${i === 0 ? 0.85 : i === 1 ? 0.60 : 0.45})`}
                filter="url(#iconGlo)">
                <animateMotion dur={sat.dur} repeatCount="indefinite" begin={sat.delay}>
                  <mpath href={`#${sat.path}`} />
                </animateMotion>
              </circle>
            ))}

            {/* ── SWEEP SECTOR ─────────────────────────── */}
            <SweepSector phase={phase} />

            {/* ── PULSE RINGS ──────────────────────────── */}
            {!isFound ? (
              <>
                <circle cx={CX} cy={CY} r="5" fill={`${primaryColor}0.14)`}>
                  <animate attributeName="r" values="8;68;8" dur={isSearching ? '1.3s' : '3.8s'} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur={isSearching ? '1.3s' : '3.8s'} repeatCount="indefinite" />
                </circle>
                <circle cx={CX} cy={CY} r="5" fill={`${primaryColor}0.09)`}>
                  <animate attributeName="r" values="8;68;8" dur={isSearching ? '1.3s' : '3.8s'} begin={isSearching ? '0.65s' : '1.9s'} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur={isSearching ? '1.3s' : '3.8s'} begin={isSearching ? '0.65s' : '1.9s'} repeatCount="indefinite" />
                </circle>
              </>
            ) : (
              <>
                <circle cx={CX} cy={CY} r="20" fill="none" stroke="rgba(251,191,36,0.80)" strokeWidth="2">
                  <animate attributeName="r" values="18;70;18" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={CX} cy={CY} r="30" fill="none" stroke="rgba(251,191,36,0.45)" strokeWidth="1.2">
                  <animate attributeName="r" values="22;65;22" dur="2s" begin="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="1s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* ── CORE HALO ────────────────────────────── */}
            <circle cx={CX} cy={CY} r="22" fill="url(#coreHalo)" />

            {/* ── SCISSORS ICON ────────────────────────── */}
            <g filter="url(#iconGlo)">
              <ScissorIcon phase={phase} />
            </g>

            {/* ── DENIED RING ──────────────────────────── */}
            {isDenied && (
              <circle cx={CX} cy={CY} r="30" fill="none"
                stroke="rgba(239,68,68,0.55)" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* ── FOUND: Gold center lock ───────────────── */}
            {isFound && (
              <>
                <circle cx={CX} cy={CY} r="5" fill="#fbbf24" filter="url(#iconGlo)">
                  <animate attributeName="r" values="3.5;7;3.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={CX} cy={CY} r="2.2" fill="white" />
              </>
            )}

            {/* ── HUD crosshair ────────────────────────── */}
            {[[-13, -7], [7, 13]].map(([a, b], i) => (
              <g key={i}>
                <line x1={CX + a} y1={CY} x2={CX + b} y2={CY}
                  stroke={`${primaryColor}0.70)`} strokeWidth="1.4" />
                <line x1={CX} y1={CY + a} x2={CX} y2={CY + b}
                  stroke={`${primaryColor}0.70)`} strokeWidth="1.4" />
              </g>
            ))}

            {/* ── HUD brackets ─────────────────────────── */}
            {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => (
              <g key={i} stroke={isFound ? 'rgba(251,191,36,0.90)' : `${primaryColor}0.55)`}
                strokeWidth="1.8" fill="none">
                <path d={`M${CX+sx*16},${CY+sy*16+sy*7} L${CX+sx*16},${CY+sy*16} L${CX+sx*16+sx*7},${CY+sy*16}`} />
              </g>
            ))}

            {/* ── PIN NEEDLE TIP GLOW ───────────────────── */}
            <circle cx={CX} cy={TIP_Y} r="6" fill="url(#tipGlow)" filter="url(#tipGlo)">
              <animate attributeName="r" values={isFound ? '6;10;6' : '4;7;4'}
                dur={isFound ? '1.2s' : '2.5s'} repeatCount="indefinite" />
            </circle>
            <circle cx={CX} cy={TIP_Y} r="2.5" fill={isFound ? '#fbbf24' : '#14b8a6'} />

            {/* ── LOCK BADGE on needle ──────────────────── */}
            {isFound && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: `${CX}px ${TIP_Y + 16}px` }}>
                <rect x={CX - 28} y={TIP_Y + 6} width="56" height="14" rx="4"
                  fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.60)" strokeWidth="0.9" />
                <text x={CX} y={TIP_Y + 16.5} textAnchor="middle" fontSize="8"
                  fontFamily="JetBrains Mono,monospace" fontWeight="800"
                  fill="rgba(251,191,36,0.95)" letterSpacing="1.5">
                  ✓ LOCK
                </text>
              </motion.g>
            )}

            {/* ── Signal strength bars ──────────────────── */}
            {[3,5,8,5,3].map((h, i) => {
              const lit = isSearching ? i <= 2 : isFound ? true : i <= 1;
              return (
                <rect key={i} x={82 + i * 9} y={TIP_Y + (isFound ? 28 : 10) - h}
                  width="6" height={h} rx="1.5"
                  fill={lit ? (isFound ? 'rgba(251,191,36,0.70)' : 'rgba(20,184,166,0.60)') : 'rgba(255,255,255,0.07)'} />
              );
            })}
          </svg>
        </motion.button>
      </div>

      {/* ── Coordinates / status ───────────────────────── */}
      <AnimatePresence mode="wait">
        {isFound && coords ? (
          <motion.div key="coords" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3 font-mono text-[0.62rem] tabular-nums">
              <span className="text-amber-400/60 tracking-widest">LAT</span>
              <span className="text-amber-200">{toDMS(coords.lat, 'ش', 'ج')}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[0.62rem] tabular-nums">
              <span className="text-amber-400/60 tracking-widest">LNG</span>
              <span className="text-amber-200">{toDMS(coords.lng, 'ق', 'غ')}</span>
            </div>
            {accuracy !== null && (
              <p className="text-[0.56rem] text-amber-500/50">● دقة الإشارة ±{accuracy}م · UTC+3</p>
            )}
          </motion.div>
        ) : isSearching ? (
          <motion.p key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-mono text-[0.62rem] text-teal-400/60">
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>▋</motion.span>
            {' '}جاري اكتساب إشارة الأقمار الصناعية…
          </motion.p>
        ) : isDenied ? (
          <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1 text-center">
            <p className="text-[0.66rem] text-rose-400">⚠ تعذّر اكتساب الإشارة</p>
            <button onClick={handleClick} className="text-[0.6rem] text-teal-400/60 underline hover:text-teal-300">
              انقر للمحاولة مجدداً
            </button>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-base font-black text-white">ابدأ الاستجابة الذكية — حدّد موقعك</p>
            <p className="text-[0.63rem] text-slate-500 max-w-xs">
              اضغط على دبوس الملك لاكتشاف أقرب الصالونات إليك لحظياً
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan line */}
      <motion.div className="h-px w-36 bg-gradient-to-l from-transparent via-teal-400/25 to-transparent"
        animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}
