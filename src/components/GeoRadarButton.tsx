/**
 * GeoRadarButton — رادار الموقع الجغرافي المتقدم
 *
 * المفهوم: مقصّ حلاق ماب × بوصلة جيو-مكانية × منظومة أقمار صناعية
 *
 * طبقات بصرية جديدة:
 *  · نجوم خلفية عشوائية
 *  · نص دوّار على الحلقة الخارجية (textPath)
 *  · مسارات أقمار صناعية (ellipses مائلة)
 *  · جسيمات مدارية (animateMotion)
 *  · حلقات مُصنَّفة بالمسافة (500م / 1كم)
 *  · حالة LOCK ذهبية عند الاكتشاف
 *  · إشارة نبضية متعددة التردد
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

// ─── Fixed star field (deterministic) ─────────────────────────────────────────
const STARS = Array.from({ length: 18 }, (_, i) => ({
  cx: (i * 29 + 13) % 194 + 3,
  cy: (i * 43 + 7)  % 194 + 3,
  r: [0.6, 0.8, 0.5, 0.9, 0.6][i % 5],
  opacity: [0.12, 0.18, 0.10, 0.22, 0.14][i % 5],
}));

// ─── Scissors compass icon ────────────────────────────────────────────────────
function ScissorCompassIcon({ phase }: { phase: GeoPhase }) {
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';
  const bladeColor = isDenied ? '#ef4444' : isFound ? '#fbbf24' : '#2dd4bf';

  return (
    <motion.g
      animate={{ rotate: isSearching ? 360 : isFound ? 45 : 0 }}
      transition={isSearching
        ? { duration: 1.6, repeat: Infinity, ease: 'linear' }
        : { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <path d="M100,100 L112,72 L107,68 L100,90 Z" fill={bladeColor} opacity={isFound ? 0.9 : 0.75} />
      <path d="M100,100 L88,128 L93,132 L100,110 Z" fill={bladeColor} opacity={isFound ? 0.9 : 0.70} />
      <path d="M100,100 L72,88 L68,93 L90,100 Z"  fill={bladeColor} opacity={isFound ? 0.9 : 0.65} />
      <path d="M100,100 L128,112 L132,107 L110,100 Z" fill={bladeColor} opacity={isFound ? 0.9 : 0.70} />
      <circle cx="100" cy="100" r={isFound ? 5 : 4} fill={`${isFound ? 'rgba(251,191,36,0.2)' : isDenied ? 'rgba(239,68,68,0.2)' : 'rgba(20,184,166,0.15)'}`} />
      <circle cx="100" cy="100" r={isFound ? 3 : 2.5} fill={bladeColor} opacity={isFound ? 1 : 0.8} />
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

// ─── Sweep sector ─────────────────────────────────────────────────────────────
function SweepSector({ phase }: { phase: GeoPhase }) {
  if (phase === 'idle' || phase === 'denied') return null;
  const isFound = phase === 'found';
  const R = 77; const CX = 100; const CY = 100;
  const span = 65 * Math.PI / 180;
  const a1 = -Math.PI / 2; const a2 = a1 - span;
  const x1 = CX + R * Math.cos(a1); const y1 = CY + R * Math.sin(a1);
  const x2 = CX + R * Math.cos(a2); const y2 = CY + R * Math.sin(a2);
  return (
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: isFound ? 1.2 : 2, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <path
        d={`M${CX},${CY} L${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R},0,0,0,${x2.toFixed(1)},${y2.toFixed(1)} Z`}
        fill={isFound ? 'rgba(251,191,36,0.20)' : 'rgba(20,184,166,0.16)'}
      />
      <line x1={CX} y1={CY} x2={x1.toFixed(1)} y2={y1.toFixed(1)}
        stroke={isFound ? 'rgba(251,191,36,0.90)' : 'rgba(45,212,191,0.90)'}
        strokeWidth="2.2" strokeLinecap="round" />
    </motion.g>
  );
}

// ─── Pulse rings ──────────────────────────────────────────────────────────────
function PulseRings({ phase }: { phase: GeoPhase }) {
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const dur = isSearching ? '1.4s' : '3.8s';
  const color = isFound ? 'rgba(251,191,36,' : 'rgba(20,184,166,';
  if (isFound) return (
    <>
      <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(251,191,36,0.75)" strokeWidth="2">
        <animate attributeName="r" values="18;82;18" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(251,191,36,0.40)" strokeWidth="1.2">
        <animate attributeName="r" values="25;78;25" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
      </circle>
    </>
  );
  return (
    <>
      <circle cx="100" cy="100" r="5" fill={`${color}0.14)`}>
        <animate attributeName="r" values="10;80;10" dur={dur} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur={dur} repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="5" fill={`${color}0.09)`}>
        <animate attributeName="r" values="10;80;10" dur={dur} begin={isSearching ? '0.7s' : '1.9s'} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur={dur} begin={isSearching ? '0.7s' : '1.9s'} repeatCount="indefinite" />
      </circle>
    </>
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
        toast.error(err.code === 1 ? 'تم رفض إذن الموقع — افتح إعدادات المتصفح' : 'تعذّر تحديد موقعك — حاول مجدداً');
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 60000 },
    );
  }, [phase, onLocationDetected]);

  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';

  const accentColor = isDenied ? 'rgba(239,68,68,0.45)' : isFound ? 'rgba(251,191,36,0.55)' : 'rgba(20,184,166,0.28)';
  const ringStr = isFound ? 'rgba(251,191,36,' : 'rgba(20,184,166,';

  return (
    <div className="flex flex-col items-center gap-5 select-none" dir="rtl">

      {/* ── Label ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2.5">
          <div className="h-px w-10 bg-gradient-to-l from-teal-400/50 to-transparent" />
          <span className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-teal-400/70">
            {isFound ? 'إحداثياتك مُثبَّتة — LOCK'
              : isSearching ? 'اكتساب إشارة الأقمار الصناعية…'
              : isDenied ? 'إشارة مرفوضة — انقر للإعادة'
              : 'مكانك على رادار حلاق ماب'}
          </span>
          <div className="h-px w-10 bg-gradient-to-r from-teal-400/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Radar canvas ─────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full transition-all duration-700"
          style={{ boxShadow: `0 0 50px 10px ${accentColor}, 0 0 100px 20px ${accentColor.replace('0.', '0.0')}` }} />

        <motion.button onClick={handleClick} disabled={isSearching}
          whileTap={!isSearching ? { scale: 0.93 } : undefined}
          whileHover={!isSearching && !isFound ? { scale: 1.04 } : undefined}
          className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full cursor-pointer"
          aria-label="تحديد موقعي الجغرافي">

          <svg viewBox="0 0 200 200" width="220" height="220" className="overflow-visible">
            <defs>
              <radialGradient id="bg2" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#0d1b2e" />
                <stop offset="100%" stopColor="#020912" />
              </radialGradient>
              <radialGradient id="coreH2" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0" />
              </radialGradient>
              <filter id="glo2">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="starGlo">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="clip2"><circle cx="100" cy="100" r="91" /></clipPath>
              {/* Paths for textPath + orbital particles */}
              <path id="outerTextRing" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
              <path id="orbit1Path" d="M100,100 m-106,0 a106,40 0 1,1 212,0 a106,40 0 1,1 -212,0" />
              <path id="orbit2Path" d="M100,100 m-104,0 a104,36 0 1,1 208,0 a104,36 0 1,1 -208,0" />
            </defs>

            {/* ── Disc background ─────────────────────── */}
            <circle cx="100" cy="100" r="91" fill="url(#bg2)"
              stroke={`${ringStr}0.22)`} strokeWidth="1.2" />

            {/* ── Star field ──────────────────────────── */}
            {STARS.map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.opacity} filter="url(#starGlo)" />
            ))}

            {/* ── Grid ────────────────────────────────── */}
            <g clipPath="url(#clip2)" opacity="0.055">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`h${i}`} x1="9" y1={22 + i * 31} x2="191" y2={22 + i * 31} stroke="#2dd4bf" strokeWidth="0.4" />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`v${i}`} x1={22 + i * 31} y1="9" x2={22 + i * 31} y2="191" stroke="#2dd4bf" strokeWidth="0.4" />
              ))}
            </g>

            {/* ── Axis lines ──────────────────────────── */}
            <line x1="9" y1="100" x2="191" y2="100" stroke={`${ringStr}0.08)`} strokeWidth="0.6" />
            <line x1="100" y1="9" x2="100" y2="191" stroke={`${ringStr}0.08)`} strokeWidth="0.6" />

            {/* ── Satellite orbit ellipses ─────────────── */}
            <ellipse cx="100" cy="100" rx="106" ry="40" fill="none"
              stroke={`${ringStr}0.14)`} strokeWidth="0.6" strokeDasharray="3 6"
              transform="rotate(28, 100, 100)" />
            <ellipse cx="100" cy="100" rx="104" ry="36" fill="none"
              stroke={`${ringStr}0.10)`} strokeWidth="0.5" strokeDasharray="2 8"
              transform="rotate(-42, 100, 100)" />

            {/* ── Orbital particles ────────────────────── */}
            <circle r="2.5" fill={`${ringStr}0.80)`} filter="url(#glo2)">
              <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                <mpath href="#orbit1Path" />
              </animateMotion>
            </circle>
            <circle r="1.8" fill={`${ringStr}0.55)`}>
              <animateMotion dur="12s" repeatCount="indefinite" rotate="auto" keyPoints="0.5;1;0.5" keyTimes="0;0.5;1" calcMode="linear">
                <mpath href="#orbit2Path" />
              </animateMotion>
            </circle>
            <circle r="1.5" fill={`${ringStr}0.40)`}>
              <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" keyPoints="0.75;1;0;0.75" keyTimes="0;0.25;0.75;1" calcMode="linear">
                <mpath href="#orbit1Path" />
              </animateMotion>
            </circle>

            {/* ── Concentric rings with distance labels ── */}
            <circle cx="100" cy="100" r="77" fill="none" stroke={`${ringStr}0.08)`} strokeWidth="0.7" />
            <circle cx="100" cy="100" r="58" fill="none" stroke={`${ringStr}0.10)`} strokeWidth="0.7" strokeDasharray="2 5" />
            <circle cx="100" cy="100" r="39" fill="none" stroke={`${ringStr}0.12)`} strokeWidth="0.8" />
            <circle cx="100" cy="100" r="22" fill="none" stroke={`${ringStr}0.14)`} strokeWidth="0.8" strokeDasharray="1 3" />

            {/* Distance labels */}
            <text x="178" y="98" fontSize="6" fill={`${ringStr}0.30)`} fontFamily="JetBrains Mono,monospace" textAnchor="start">1كم</text>
            <text x="159" y="98" fontSize="6" fill={`${ringStr}0.22)`} fontFamily="JetBrains Mono,monospace" textAnchor="start">500م</text>
            <text x="140" y="98" fontSize="6" fill={`${ringStr}0.18)`} fontFamily="JetBrains Mono,monospace" textAnchor="start">250م</text>

            {/* ── Outer rotating ring ──────────────────── */}
            <motion.g
              animate={{ rotate: isSearching || isFound ? -360 : -180 }}
              transition={{ duration: isFound ? 5 : 12, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '100px 100px' }}
            >
              <circle cx="100" cy="100" r="89" fill="none"
                stroke={`${ringStr}0.28)`} strokeWidth="1.2"
                strokeDasharray={isFound ? "3 7 1 7" : "5 9 2 9"} />
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10 * Math.PI) / 180;
                const isMain = i % 9 === 0;
                return (
                  <line key={i}
                    x1={100 + 89 * Math.cos(angle)} y1={100 + 89 * Math.sin(angle)}
                    x2={100 + (isMain ? 82 : 86) * Math.cos(angle)} y2={100 + (isMain ? 82 : 86) * Math.sin(angle)}
                    stroke={`${ringStr}${isMain ? 0.55 : 0.20})`}
                    strokeWidth={isMain ? 1.8 : 0.8} />
                );
              })}
            </motion.g>

            {/* ── Rotating text ring ───────────────────── */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '100px 100px' }}
            >
              <text fontSize="6.5" fill={`${ringStr}${isFound ? 0.55 : 0.22})`}
                fontFamily="JetBrains Mono,monospace" fontWeight="600" letterSpacing="2">
                <textPath href="#outerTextRing" startOffset="0%">
                  ★ HALAQ MAP ★ GEODETIC NAVIGATION ★ ON-DEMAND VISIBILITY ★ KSA ★
                </textPath>
              </text>
            </motion.g>

            {/* ── LOCK indicator (found state) ─────────── */}
            {isFound && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: '100px 12px' }}>
                <rect x="72" y="6" width="56" height="12" rx="3"
                  fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.50)" strokeWidth="0.8" />
                <text x="100" y="15" textAnchor="middle" fontSize="7.5" fontFamily="JetBrains Mono,monospace"
                  fontWeight="800" fill="rgba(251,191,36,0.95)" letterSpacing="2">
                  ✓ LOCK
                </text>
              </motion.g>
            )}

            {/* ── Sweep sector ─────────────────────────── */}
            <SweepSector phase={phase} />

            {/* ── Pulse rings ──────────────────────────── */}
            <PulseRings phase={phase} />

            {/* ── Core halo ────────────────────────────── */}
            <circle cx="100" cy="100" r="22" fill="url(#coreH2)" />

            {/* ── Scissors compass icon ────────────────── */}
            <g filter="url(#glo2)">
              <ScissorCompassIcon phase={phase} />
            </g>

            {/* ── Denied indicator ─────────────────────── */}
            {isDenied && (
              <circle cx="100" cy="100" r="28" fill="none"
                stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* ── Center lock point (found) ─────────────── */}
            {isFound && (
              <>
                <circle cx="100" cy="100" r="4" fill="#fbbf24" filter="url(#glo2)">
                  <animate attributeName="r" values="3;6;3" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="100" r="1.8" fill="white" />
              </>
            )}

            {/* ── Enhanced crosshair ───────────────────── */}
            {[[-12,-6], [6,12], [0,0], [0,0]].slice(0,2).map(([x1off, x2off], i) => (
              <g key={i}>
                <line x1={100 + (i === 0 ? -12 : 6)} y1="100"
                  x2={100 + (i === 0 ? -6 : 12)} y2="100"
                  stroke={`${ringStr}0.7)`} strokeWidth="1.5" />
                <line x1="100" y1={100 + (i === 0 ? -12 : 6)}
                  x2="100" y2={100 + (i === 0 ? -6 : 12)}
                  stroke={`${ringStr}0.7)`} strokeWidth="1.5" />
              </g>
            ))}

            {/* ── HUD corner brackets ──────────────────── */}
            {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => {
              const ox = 100 + sx * 15, oy = 100 + sy * 15;
              return (
                <motion.g key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                  stroke={isFound ? 'rgba(251,191,36,0.90)' : `${ringStr}0.55)`}
                  strokeWidth="1.8" fill="none">
                  <path d={`M${ox},${oy + sy * 7} L${ox},${oy} L${ox + sx * 7},${oy}`} />
                </motion.g>
              );
            })}

            {/* ── Signal strength bars (bottom) ──────────── */}
            {[3, 5, 7, 9, 7].map((h, i) => {
              const active = isSearching ? i <= 2 : isFound ? true : i <= 1;
              return (
                <rect key={i}
                  x={83 + i * 8} y={193 - h} width="5" height={h} rx="1"
                  fill={active ? (isFound ? 'rgba(251,191,36,0.70)' : 'rgba(20,184,166,0.60)') : 'rgba(255,255,255,0.08)'} />
              );
            })}
          </svg>
        </motion.button>
      </div>

      {/* ── Coordinate readout / status ───────────────────── */}
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
              <p className="mt-0.5 text-[0.56rem] text-amber-500/50">
                ● دقة الإشارة ±{accuracy}م · UTC+3
              </p>
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
              اضغط على مقص البوصلة لاكتشاف أقرب الصالونات إليك لحظياً
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Decorative scan line ─────────────────────────── */}
      <motion.div
        className="h-px w-36 bg-gradient-to-l from-transparent via-teal-400/25 to-transparent"
        animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
