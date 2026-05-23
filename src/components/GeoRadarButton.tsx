/**
 * GeoRadarButton — زر تحديد الموقع الجغرافي الاستثنائي
 *
 * رادار جيو-مكاني تكتيكي يُحاكي لحظة الاكتشاف الزمني والمكاني.
 * ثلاث مراحل: خامل ⟶ اكتساب الإشارة ⟶ تثبيت الإحداثيات
 *
 * المكوّنات البصرية:
 *  · حلقات متحدة المركز متعددة السرعات (رادار)
 *  · قطاع مسح دوّار (sweep sector)
 *  · شبكة إحداثيات (graticule)
 *  · نقاط اتجاه عربية (ش · ج · غ · ق)
 *  · نبضات توسّعية من المركز
 *  · لحظة ظهور الإحداثيات عند النجاح
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/sonner';

// ─── Types ──────────────────────────────────────────────────────────────────
type GeoPhase = 'idle' | 'searching' | 'found' | 'denied';

interface Props {
  onLocationDetected: (loc: { lat: number; lng: number }) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) {
  return Math.floor(n).toString().padStart(2, '0');
}

function toDMS(val: number, posLabel: string, negLabel: string): string {
  const abs = Math.abs(val);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.floor(((abs - d) * 60 - m) * 60);
  return `${pad(d)}° ${pad(m)}' ${pad(s)}" ${val >= 0 ? posLabel : negLabel}`;
}

// ─── Animated sweep sector ────────────────────────────────────────────────────
function RadarSweep({ phase }: { phase: GeoPhase }) {
  const CX = 100, CY = 100, R = 80;
  const spanDeg = 55; // sector width in degrees
  const spanRad = (spanDeg * Math.PI) / 180;
  // Tip of the leading edge (pointing at -90° = up)
  const leadX = CX + R * Math.cos(-Math.PI / 2);
  const leadY = CY + R * Math.sin(-Math.PI / 2);
  // Trailing edge
  const trailAngle = -Math.PI / 2 - spanRad;
  const trailX = CX + R * Math.cos(trailAngle);
  const trailY = CY + R * Math.sin(trailAngle);

  const dur = phase === 'searching' ? '1.8s' : phase === 'found' ? '1.2s' : '3.5s';

  return (
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: parseFloat(dur), repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <defs>
        <radialGradient id="sw" cx="0%" cy="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Fading sector */}
      <path
        d={`M${CX},${CY} L${leadX.toFixed(2)},${leadY.toFixed(2)} A${R},${R},0,0,0,${trailX.toFixed(2)},${trailY.toFixed(2)} Z`}
        fill="url(#sw)"
        opacity={phase === 'found' ? 0.9 : 0.6}
      />
      {/* Leading scan line */}
      <line
        x1={CX} y1={CY}
        x2={leadX.toFixed(2)} y2={leadY.toFixed(2)}
        stroke={phase === 'found' ? '#5eead4' : '#2dd4bf'}
        strokeWidth={phase === 'found' ? 2.5 : 1.8}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

// ─── Outer ring (slow rotation) ───────────────────────────────────────────────
function OuterRing({ phase }: { phase: GeoPhase }) {
  return (
    <motion.g
      animate={{ rotate: -360 }}
      transition={{ duration: phase === 'searching' ? 8 : 18, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '100px 100px' }}
    >
      <circle
        cx="100" cy="100" r="91"
        fill="none"
        stroke="rgba(20,184,166,0.25)"
        strokeWidth="1.2"
        strokeDasharray="6 10 2 10"
      />
      {/* Distance tick marks */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const isMain = i % 6 === 0;
        const r1 = 91, r2 = isMain ? 85 : 88;
        return (
          <line
            key={i}
            x1={100 + r1 * Math.cos(angle)} y1={100 + r1 * Math.sin(angle)}
            x2={100 + r2 * Math.cos(angle)} y2={100 + r2 * Math.sin(angle)}
            stroke={`rgba(20,184,166,${isMain ? 0.5 : 0.2})`}
            strokeWidth={isMain ? 1.5 : 0.8}
          />
        );
      })}
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
    if (phase === 'denied') { setPhase('idle'); return; }
    busy.current = true;
    setPhase('searching');

    if (!navigator.geolocation) {
      setPhase('denied');
      toast.error('متصفحك لا يدعم تحديد الموقع الجغرافي');
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
        if (err.code === 1) toast.error('الإذن مرفوض — افتح إعدادات المتصفح وأتح الموقع');
        else toast.error('تعذّر تحديد موقعك — تأكد من الاتصال وحاول مجدداً');
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 60000 },
    );
  }, [phase, onLocationDetected]);

  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';

  // Glow colour
  const glowColor = isDenied
    ? 'rgba(239,68,68,0.4)'
    : isFound
      ? 'rgba(20,184,166,0.55)'
      : 'rgba(20,184,166,0.25)';

  return (
    <div className="flex flex-col items-center gap-5" dir="rtl">

      {/* ── Label above ─────────────────────────────────────── */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5"
      >
        <div className="h-px w-10 bg-gradient-to-l from-teal-400/60 to-transparent" />
        <span className="text-[0.58rem] font-black uppercase tracking-[0.25em] text-teal-400/70">
          {isFound
            ? 'تم تثبيت الإحداثيات'
            : isSearching
              ? 'اكتساب الإشارة…'
              : isDenied
                ? 'إشارة مرفوضة — انقر للمحاولة'
                : 'مكانك على الرادار'}
        </span>
        <div className="h-px w-10 bg-gradient-to-r from-teal-400/60 to-transparent" />
      </motion.div>

      {/* ── Radar canvas ─────────────────────────────────────── */}
      <div className="relative">
        {/* Outer glow ring (CSS) */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{ boxShadow: `0 0 40px 8px ${glowColor}, 0 0 80px 16px ${glowColor.replace('0.', '0.0')}` }}
        />

        <motion.button
          onClick={handleClick}
          disabled={isSearching}
          whileTap={!isSearching ? { scale: 0.97 } : undefined}
          whileHover={!isSearching && !isFound ? { scale: 1.02 } : undefined}
          className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full"
          aria-label={isFound ? 'تم تحديد الموقع' : 'تحديد موقعي الجغرافي'}
        >
          <svg
            viewBox="0 0 200 200"
            width="210"
            height="210"
            className="overflow-visible"
          >
            <defs>
              <radialGradient id="bgGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#0d1b2e" />
                <stop offset="100%" stopColor="#020912" />
              </radialGradient>
              <radialGradient id="coreGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={isFound ? 0.9 : 0.5} />
                <stop offset="60%" stopColor="#14b8a6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </radialGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="sharpGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="circleClip">
                <circle cx="100" cy="100" r="92" />
              </clipPath>
            </defs>

            {/* ── Background disc ─────────────────────────── */}
            <circle cx="100" cy="100" r="92" fill="url(#bgGrad)" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />

            {/* ── Graticule grid ──────────────────────────── */}
            <g clipPath="url(#circleClip)" opacity="0.07">
              {Array.from({ length: 7 }).map((_, i) => {
                const y = 20 + i * 27;
                return <line key={`h${i}`} x1="8" y1={y} x2="192" y2={y} stroke="#2dd4bf" strokeWidth="0.5" />;
              })}
              {Array.from({ length: 7 }).map((_, i) => {
                const x = 20 + i * 27;
                return <line key={`v${i}`} x1={x} y1="8" x2={x} y2="192" stroke="#2dd4bf" strokeWidth="0.5" />;
              })}
            </g>

            {/* ── Axis lines ──────────────────────────────── */}
            <line x1="8" y1="100" x2="192" y2="100" stroke="rgba(20,184,166,0.1)" strokeWidth="0.7" />
            <line x1="100" y1="8" x2="100" y2="192" stroke="rgba(20,184,166,0.1)" strokeWidth="0.7" />
            <line x1="35" y1="35" x2="165" y2="165" stroke="rgba(20,184,166,0.05)" strokeWidth="0.5" />
            <line x1="165" y1="35" x2="35" y2="165" stroke="rgba(20,184,166,0.05)" strokeWidth="0.5" />

            {/* ── Concentric rings ────────────────────────── */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(20,184,166,0.08)" strokeWidth="0.7" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(20,184,166,0.10)" strokeWidth="0.7" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="0.8" strokeDasharray="1 3" />

            {/* ── Outer rotating ring ─────────────────────── */}
            <OuterRing phase={phase} />

            {/* ── Radar sweep sector ──────────────────────── */}
            <RadarSweep phase={phase} />

            {/* ── Pulse rings (idle / searching) ─────────── */}
            {!isFound && (
              <>
                <circle cx="100" cy="100" r="5" fill="rgba(20,184,166,0.2)">
                  <animate attributeName="r" values="8;75;8" dur={isSearching ? '2.2s' : '4s'} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur={isSearching ? '2.2s' : '4s'} repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="100" r="5" fill="rgba(20,184,166,0.15)">
                  <animate attributeName="r" values="8;75;8" dur={isSearching ? '2.2s' : '4s'} begin={isSearching ? '1.1s' : '2s'} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur={isSearching ? '2.2s' : '4s'} begin={isSearching ? '1.1s' : '2s'} repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* ── Found: bright expanding ring ────────────── */}
            {isFound && (
              <>
                <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(45,212,191,0.8)" strokeWidth="2">
                  <animate attributeName="r" values="15;80;15" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="1.2">
                  <animate attributeName="r" values="20;80;20" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* ── Denied: red indicator ────────────────────── */}
            {isDenied && (
              <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* ── Core glow ───────────────────────────────── */}
            <circle cx="100" cy="100" r="18" fill="url(#coreGlow)" />

            {/* ── Crosshair ───────────────────────────────── */}
            <line x1="88" y1="100" x2="94" y2="100" stroke="rgba(20,184,166,0.8)" strokeWidth="1.5" />
            <line x1="106" y1="100" x2="112" y2="100" stroke="rgba(20,184,166,0.8)" strokeWidth="1.5" />
            <line x1="100" y1="88" x2="100" y2="94" stroke="rgba(20,184,166,0.8)" strokeWidth="1.5" />
            <line x1="100" y1="106" x2="100" y2="112" stroke="rgba(20,184,166,0.8)" strokeWidth="1.5" />

            {/* Corner brackets (tactical HUD) */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
              const ox = 100 + sx * 14, oy = 100 + sy * 14;
              return (
                <g key={i} stroke={isFound ? 'rgba(45,212,191,0.9)' : 'rgba(20,184,166,0.5)'} strokeWidth="1.5" fill="none">
                  <path d={`M${ox},${oy + sy * 6} L${ox},${oy} L${ox + sx * 6},${oy}`} />
                </g>
              );
            })}

            {/* ── Central dot ─────────────────────────────── */}
            {isFound ? (
              <>
                <circle cx="100" cy="100" r="7" fill="#14b8a6" filter="url(#softGlow)">
                  <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="100" r="3" fill="white" />
                <circle cx="100" cy="100" r="1.5" fill="#14b8a6" />
              </>
            ) : isDenied ? (
              <circle cx="100" cy="100" r="5" fill="rgba(239,68,68,0.8)" />
            ) : (
              <>
                <circle cx="100" cy="100" r="5" fill={isSearching ? '#14b8a6' : 'rgba(20,184,166,0.4)'} filter="url(#sharpGlow)">
                  {isSearching && <animate attributeName="r" values="3;7;3" dur="0.9s" repeatCount="indefinite" />}
                </circle>
                <circle cx="100" cy="100" r="2" fill={isSearching ? 'white' : 'rgba(20,184,166,0.6)'} />
              </>
            )}

            {/* ── Compass labels ───────────────────────────── */}
            <text x="100" y="5" textAnchor="middle" fontSize="8" fill="rgba(45,212,191,0.75)" fontFamily="Tajawal,system-ui" fontWeight="700">ش</text>
            <text x="100" y="201" textAnchor="middle" fontSize="8" fill="rgba(45,212,191,0.45)" fontFamily="Tajawal,system-ui">ج</text>
            <text x="3" y="103" textAnchor="middle" fontSize="8" fill="rgba(45,212,191,0.45)" fontFamily="Tajawal,system-ui">غ</text>
            <text x="198" y="103" textAnchor="middle" fontSize="8" fill="rgba(45,212,191,0.45)" fontFamily="Tajawal,system-ui">ق</text>

            {/* ── Ghost coordinate hints (idle) ────────────── */}
            {phase === 'idle' && (
              <g opacity="0.18" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill="#2dd4bf">
                <text x="14" y="80">24°41'00" ش</text>
                <text x="14" y="125">46°43'00" ق</text>
              </g>
            )}
          </svg>
        </motion.button>
      </div>

      {/* ── Coordinate readout ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isFound && coords ? (
          <motion.div
            key="coords"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1.5"
          >
            {/* Coordinate lines */}
            <div className="flex items-center gap-4 font-mono text-[0.65rem] tabular-nums">
              <span className="text-teal-400/60">LAT</span>
              <span className="text-teal-200 tracking-wider">
                {toDMS(coords.lat, 'ش', 'ج')}
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[0.65rem] tabular-nums">
              <span className="text-teal-400/60">LNG</span>
              <span className="text-teal-200 tracking-wider">
                {toDMS(coords.lng, 'ق', 'غ')}
              </span>
            </div>
            {accuracy !== null && (
              <div className="mt-1 flex items-center gap-1.5 text-[0.58rem] text-teal-500/60">
                <span className="h-1 w-1 rounded-full bg-teal-400" />
                دقة الإشارة ±{accuracy}م
              </div>
            )}
          </motion.div>
        ) : isSearching ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-mono text-[0.65rem] text-teal-400/60"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >▋</motion.span>
            <span>جاري اكتساب إشارة الأقمار الصناعية…</span>
          </motion.div>
        ) : isDenied ? (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <p className="text-[0.68rem] text-rose-400">⚠ تعذّر اكتساب الإشارة</p>
            <button
              onClick={handleClick}
              className="text-[0.62rem] text-teal-400/60 underline hover:text-teal-300"
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
            <p className="text-sm font-bold text-white">
              ابدأ الاستجابة الذكية — حدّد موقعك
            </p>
            <p className="text-[0.65rem] text-slate-500">
              اضغط على الرادار لتحديد إحداثياتك ورؤية أقرب الصالونات
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Decorative scan line ─────────────────────────────── */}
      <motion.div
        className="h-px w-40 bg-gradient-to-l from-transparent via-teal-400/30 to-transparent"
        animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
