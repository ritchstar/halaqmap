/**
 * GeoRadarButton — "دبوس الملك · خريطة المملكة"
 *
 * التخطيط الداخلي: مخطط المملكة العربية السعودية
 * الحالة الخاملة:
 *   · خريطة المملكة تنبض بتيل ذهبي
 *   · فقاعة زجاجية شفافة تطفو "اضغط هنا"
 *   · نص "لتحديد موقعك" يتبعها بتأخير
 *   · نجوم تتطاير حولهما
 * الحالة النشطة: مقص يدور + خريطة تنبض بسرعة
 * الاكتشاف: خريطة ذهبية + LOCK + إحداثيات
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

// ─── KSA Map outline ─────────────────────────────────────────────────────────
// مقياس: 4px/درجة · مرجع: 45.1°ش، 23.95°ع → نقطة (100, 92) على SVG
// الصيغة: x = 100 + (lng - 45.1) × 4 · y = 92 - (lat - 23.95) × 4
//
// الحدود (عكس اتجاه عقارب الساعة من الشمال الغربي):
//   الشمال الغربي (حقل)  → الشمال (الأردن، العراق)  → الخليج
//   → الإمارات → اليمن → الساحل الغربي (البحر الأحمر) → العودة
const KSA_PATH =
  'M58,70' +       // NW: حقل (34.6°ش، 29.5°ع)
  ' L68,59' +      // شمال: الحدود الأردنية (37°ش، 32.2°ع)
  ' L80,60' +      // الأردن/العراق (40°ش، 32.1°ع)
  ' L88,66' +      // الحدود العراقية (42°ش، 30.5°ع)
  ' L96,71' +      // العراق (44°ش، 29.2°ع)
  ' L104,72' +     // الكويت شمال (46°ش، 29°ع)
  ' L110,74' +     // الكويت (47.5°ش، 28.5°ع)
  ' L114,76' +     // الخليج (48.5°ش، 28°ع)
  ' L118,80' +     // الخليج جنوباً (49.5°ش، 27°ع)
  ' L120,87' +     // منطقة قطر (50.2°ش، 25°ع)
  ' L124,93' +     // جنوب قطر (51°ش، 23.5°ع)
  ' L126,99' +     // الخليج (51.5°ش، 22°ع)
  ' L140,99' +     // الإمارات شمال (55°ش، 22°ع)
  ' L142,107' +    // الإمارات شرق (55.7°ش، 20°ع)
  ' L142,117' +    // عُمان شمال (55.5°ش، 17.5°ع)
  ' L132,121' +    // عُمان جنوب غرب (53°ش، 16.5°ع)
  ' L124,128' +    // حدود اليمن شرق (51°ش، 15°ع)
  ' L91,128' +     // حدود اليمن غرب/جازان داخل (43°ش، 15°ع)
  ' L91,120' +     // ساحل جازان (43°ش، 17°ع)
  ' L76,102' +     // جدة / البحر الأحمر (39.2°ش، 21.5°ع)
  ' L72,91' +      // ينبع (38°ش، 24°ع)
  ' L64,78' +      // منطقة تبوك الساحلية (36°ش، 27.5°ع)
  ' Z';            // يغلق إلى حقل (58, 70)

// المدن الرئيسية — إحداثياتها محسوبة بنفس مقياس الخريطة
const KSA_CITIES = [
  { x: 106, y: 89,  r: 2.8, isCapital: true,  name: 'الرياض'  }, // 46.7°ش، 24.7°ع
  { x: 76,  y: 102, r: 2.0, isCapital: false, name: 'جدة'     }, // 39.2°ش، 21.5°ع
  { x: 78,  y: 90,  r: 1.6, isCapital: false, name: 'المدينة' }, // 39.6°ش، 24.5°ع
  { x: 120, y: 82,  r: 1.8, isCapital: false, name: 'الدمام'  }, // 50.1°ش، 26.4°ع
  { x: 90,  y: 115, r: 1.5, isCapital: false, name: 'أبها'    }, // 42.5°ش، 18.2°ع
  { x: 66,  y: 74,  r: 1.4, isCapital: false, name: 'تبوك'   }, // 36.6°ش، 28.4°ع
];

// Pin geometry
const CX = 100, CY = 92, R = 70, TIP_Y = 232;
const PIN_PATH = `M${CX},${TIP_Y} C78,212 28,172 28,${CY} A${R},${R} 0 1 1 172,${CY} C172,172 122,212 ${CX},${TIP_Y}Z`;

// Crown spikes
const SPIKES = [-150, -120, -90, -60, -30].map((deg) => {
  const θ = (deg * Math.PI) / 180, δ = (8 * Math.PI) / 180;
  return {
    b1: { x: +(CX + R * Math.cos(θ - δ)).toFixed(1), y: +(CY + R * Math.sin(θ - δ)).toFixed(1) },
    tip: { x: +(CX + (R + 13) * Math.cos(θ)).toFixed(1), y: +(CY + (R + 13) * Math.sin(θ)).toFixed(1) },
    b2: { x: +(CX + R * Math.cos(θ + δ)).toFixed(1), y: +(CY + R * Math.sin(θ + δ)).toFixed(1) },
  };
});

// Stars scattered around the text zone
const STARS = [
  { x: 70,  y: 108, r: 1.2, dur: 2.1, delay: 0.0 },
  { x: 82,  y: 115, r: 0.9, dur: 1.7, delay: 0.4 },
  { x: 94,  y: 118, r: 1.4, dur: 2.4, delay: 0.8 },
  { x: 107, y: 113, r: 1.0, dur: 1.9, delay: 0.2 },
  { x: 118, y: 108, r: 1.2, dur: 2.2, delay: 0.6 },
  { x: 75,  y: 122, r: 0.8, dur: 1.6, delay: 1.0 },
  { x: 88,  y: 125, r: 1.1, dur: 2.0, delay: 0.3 },
  { x: 112, y: 121, r: 0.9, dur: 1.8, delay: 0.7 },
  { x: 64,  y: 116, r: 0.7, dur: 2.3, delay: 0.9 },
  { x: 126, y: 116, r: 0.8, dur: 1.5, delay: 0.5 },
];

// ─── Crown spike ──────────────────────────────────────────────────────────────
function CrownSpike({ spike, phase, i }: { spike: typeof SPIKES[0]; phase: GeoPhase; i: number }) {
  const isFound = phase === 'found', isSearching = phase === 'searching';
  const c = isFound ? 'rgba(251,191,36,0.88)' : 'rgba(20,184,166,0.58)';
  const f = isFound ? 'rgba(251,191,36,0.28)' : 'rgba(20,184,166,0.10)';
  return (
    <motion.g
      animate={isSearching
        ? { scale: [1, 1.22, 1], opacity: [0.6, 1, 0.6] }
        : isFound
          ? { scale: [1, 1.28, 1.12], opacity: [0.9, 1, 0.9] }
          : { scale: [1, 1.06, 1], opacity: [0.55, 0.80, 0.55] }}
      transition={{ duration: isSearching ? 0.85 : 2.2, delay: i * 0.12, repeat: Infinity }}
      style={{ transformOrigin: `${spike.tip.x}px ${spike.tip.y}px` }}
    >
      <polygon points={`${spike.b1.x},${spike.b1.y} ${spike.tip.x},${spike.tip.y} ${spike.b2.x},${spike.b2.y}`}
        fill={f} stroke={c} strokeWidth="1.2" strokeLinejoin="round" />
    </motion.g>
  );
}

// ─── Scissors icon ────────────────────────────────────────────────────────────
function ScissorIcon({ phase }: { phase: GeoPhase }) {
  const isFound = phase === 'found', c = isFound ? '#fbbf24' : '#2dd4bf';
  return (
    <motion.g
      animate={{ rotate: phase === 'searching' ? 360 : isFound ? 45 : 0 }}
      transition={phase === 'searching'
        ? { duration: 1.8, repeat: Infinity, ease: 'linear' }
        : { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformOrigin: `${CX}px ${CY}px` }}
    >
      <path d={`M${CX},${CY} L${CX+10},${CY-24} L${CX+5},${CY-28} L${CX},${CY-12}Z`} fill={c} opacity={0.88} />
      <path d={`M${CX},${CY} L${CX-10},${CY+24} L${CX-5},${CY+28} L${CX},${CY+12}Z`} fill={c} opacity={0.82} />
      <path d={`M${CX},${CY} L${CX-24},${CY-10} L${CX-28},${CY-5} L${CX-12},${CY}Z`} fill={c} opacity={0.76} />
      <path d={`M${CX},${CY} L${CX+24},${CY+10} L${CX+28},${CY+5} L${CX+12},${CY}Z`} fill={c} opacity={0.82} />
      <circle cx={CX} cy={CY} r={3.2} fill={isFound ? '#fbbf24' : '#14b8a6'} />
      <circle cx={CX} cy={CY} r={1.6} fill="white" />
      <g fill={c} opacity={0.4} fontSize="7" fontFamily="Tajawal,system-ui" fontWeight="700" textAnchor="middle">
        <text x={CX} y={CY - 52}>ش</text>
        <text x={CX} y={CY + 62}>ج</text>
        <text x={CX - 57} y={CY + 3}>غ</text>
        <text x={CX + 57} y={CY + 3}>ق</text>
      </g>
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

  const isIdle = phase === 'idle';
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';
  const mapColor = isFound ? '#fbbf24' : '#2dd4bf';
  const mapOpacity = isFound ? 0.65 : 0.22;
  const strokeColor = isFound ? 'rgba(251,191,36,0.85)' : 'rgba(20,184,166,0.70)';
  const glowColor = isDenied ? 'rgba(239,68,68,0.40)' : isFound ? 'rgba(251,191,36,0.50)' : 'rgba(20,184,166,0.28)';

  return (
    <div className="flex flex-col items-center gap-5 select-none" dir="rtl">

      {/* ── Status label ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2.5">
          <div className="h-px w-10 bg-gradient-to-l from-teal-400/50 to-transparent" />
          <span className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-teal-400/70">
            {isFound ? 'مكانك على رادار حلاق ماب ✓' : isSearching ? 'الرادار يكتسب إشارتك…' : isDenied ? 'إشارة مرفوضة · انقر للإعادة' : 'مكانك على الرادار'}
          </span>
          <div className="h-px w-10 bg-gradient-to-r from-teal-400/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── The Pin ──────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full transition-all duration-700"
          style={{ boxShadow: `0 8px 60px 8px ${glowColor}, 0 0 120px 20px ${glowColor.replace('0.', '0.0')}` }} />

        <motion.button onClick={handleClick} disabled={isSearching}
          whileTap={!isSearching ? { scale: 0.94 } : undefined}
          whileHover={!isSearching && !isFound ? { scale: 1.03 } : undefined}
          className="relative block focus:outline-none rounded-full cursor-pointer"
          aria-label="تحديد موقعي الجغرافي">

          <svg viewBox="0 0 200 255" width="210" height="268" className="overflow-visible">
            <defs>
              <radialGradient id="pinBg3" cx="50%" cy="35%">
                <stop offset="0%" stopColor="#0f2033" />
                <stop offset="100%" stopColor="#020912" />
              </radialGradient>
              <radialGradient id="ksaFill" cx="50%" cy="50%">
                <stop offset="0%" stopColor={mapColor} stopOpacity={isFound ? 0.45 : 0.18} />
                <stop offset="100%" stopColor={mapColor} stopOpacity={isFound ? 0.12 : 0.04} />
              </radialGradient>
              <radialGradient id="tipGlow3" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0.9" />
                <stop offset="100%" stopColor={isFound ? '#fbbf24' : '#14b8a6'} stopOpacity="0" />
              </radialGradient>
              <filter id="glo3">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="ksaGlo">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glassBlur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
              <clipPath id="pinClip3"><path d={PIN_PATH} /></clipPath>
            </defs>

            {/* ── Pin silhouette ─────────────────────────── */}
            <path d={PIN_PATH} fill="url(#pinBg3)" stroke={isFound ? 'rgba(251,191,36,0.35)' : 'rgba(20,184,166,0.28)'} strokeWidth="1.2" />

            {/* ── KSA Map glow backdrop ───────────────────── */}
            <g clipPath="url(#pinClip3)">
              <path d={KSA_PATH} fill={mapColor} opacity={isFound ? 0.12 : 0.06} filter="url(#ksaGlo)" />
            </g>

            {/* ── KSA Map outline ─────────────────────────── */}
            <motion.path
              d={KSA_PATH}
              fill="url(#ksaFill)"
              stroke={strokeColor}
              strokeWidth={isFound ? '1.8' : '1.4'}
              strokeLinejoin="round"
              animate={isSearching
                ? { opacity: [0.7, 1, 0.7], strokeWidth: ['1.4', '2.2', '1.4'] }
                : isFound
                  ? { opacity: [0.9, 1, 0.9] }
                  : { opacity: [0.65, 0.85, 0.65] }}
              transition={{ duration: isSearching ? 0.9 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
              filter={isFound ? 'url(#ksaGlo)' : undefined}
            />

            {/* ── City dots ───────────────────────────────── */}
            {KSA_CITIES.map((city) => (
              <g key={city.name}>
                {/* Glow ring */}
                <circle cx={city.x} cy={city.y} r={city.r + 4}
                  fill={city.isCapital ? (isFound ? 'rgba(251,191,36,0.20)' : 'rgba(20,184,166,0.15)') : 'none'} />
                {/* City dot */}
                <circle cx={city.x} cy={city.y} r={city.r}
                  fill={city.isCapital ? (isFound ? '#fbbf24' : '#2dd4bf') : (isFound ? 'rgba(251,191,36,0.70)' : 'rgba(20,184,166,0.55)')} />
                {city.isCapital && (
                  <>
                    <circle cx={city.x} cy={city.y} r={city.r * 0.45} fill="white" />
                    <circle cx={city.x} cy={city.y} r={city.r + 3}
                      fill="none" stroke={isFound ? 'rgba(251,191,36,0.70)' : 'rgba(20,184,166,0.60)'}
                      strokeWidth="0.8">
                      <animate attributeName="r" values={`${city.r + 2};${city.r + 8};${city.r + 2}`}
                        dur={isSearching ? '1.2s' : '2.5s'} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8"
                        dur={isSearching ? '1.2s' : '2.5s'} repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            ))}

            {/* ── Crown spikes ────────────────────────────── */}
            {SPIKES.map((spike, i) => <CrownSpike key={i} spike={spike} phase={phase} i={i} />)}

            {/* ── Scanning sweep (searching state) ───────── */}
            {isSearching && (
              <motion.line
                x1="30" x2="170"
                y1={CY} y2={CY}
                stroke="rgba(20,184,166,0.35)"
                strokeWidth="1"
                animate={{ y1: [CY - R, CY + R, CY - R], y2: [CY - R, CY + R, CY - R] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                clipPath="url(#pinClip3)"
              />
            )}

            {/* ── IDLE STATE: Stars + Glassmorphism text ─── */}
            <AnimatePresence>
              {isIdle && (
                <motion.g key="idle-content"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}>

                  {/* Stars twinkling around text zone */}
                  {STARS.map((s, i) => (
                    <motion.circle key={i} cx={s.x} cy={s.y} r={s.r}
                      fill="white"
                      animate={{ opacity: [0.1, 0.85, 0.1], scale: [0.6, 1.3, 0.6], y: [0, -3, 0] }}
                      transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                    />
                  ))}

                  {/* ── "اضغط هنا" glassmorphism floating pill ── */}
                  <motion.g
                    animate={{ y: [0, -7, 0], rotate: [-1.5, 1.5, -1.5] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${CX}px 106px` }}
                  >
                    {/* Glass blur background (simulated) */}
                    <rect x="72" y="98" width="56" height="18" rx="9"
                      fill="rgba(20,184,166,0.08)"
                      filter="url(#glassBlur)" />
                    {/* Glass pill */}
                    <rect x="72" y="98" width="56" height="18" rx="9"
                      fill="rgba(255,255,255,0.10)"
                      stroke="rgba(255,255,255,0.38)"
                      strokeWidth="0.9" />
                    {/* Shine highlight top */}
                    <rect x="76" y="99.5" width="30" height="4" rx="2"
                      fill="rgba(255,255,255,0.18)" />
                    {/* "اضغط هنا" text */}
                    <text x={CX} y="111.5" textAnchor="middle"
                      fontSize="8.5" fontFamily="Tajawal,system-ui" fontWeight="800"
                      fill="rgba(255,255,255,0.92)" letterSpacing="0.5">
                      اضغط هنا
                    </text>
                  </motion.g>

                  {/* ── "لتحديد موقعك" trailing text ─────────── */}
                  <motion.g
                    animate={{ y: [0, -5, 0], opacity: [0.70, 0.95, 0.70] }}
                    transition={{ duration: 3.2, delay: 0.45, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <text x={CX} y="126" textAnchor="middle"
                      fontSize="7" fontFamily="Tajawal,system-ui" fontWeight="600"
                      fill="rgba(20,184,166,0.85)" letterSpacing="0.5">
                      لتحديد موقعك
                    </text>
                  </motion.g>

                  {/* Arrow hint ↓ below text */}
                  <motion.text x={CX} y="136" textAnchor="middle"
                    fontSize="8" fill="rgba(20,184,166,0.40)"
                    animate={{ y: [136, 139, 136], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                    ↓
                  </motion.text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── Searching: scissors ─────────────────────── */}
            <AnimatePresence>
              {!isIdle && (
                <motion.g key="scissors"
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.35 }}
                  filter="url(#glo3)">
                  <ScissorIcon phase={phase} />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ── Pulse rings ─────────────────────────────── */}
            {!isFound ? (
              <>
                <circle cx={CX} cy={CY} r="5" fill={isSearching ? 'rgba(20,184,166,0.14)' : 'rgba(20,184,166,0.08)'}>
                  <animate attributeName="r" values="8;68;8" dur={isSearching ? '1.3s' : '4s'} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur={isSearching ? '1.3s' : '4s'} repeatCount="indefinite" />
                </circle>
                {isSearching && (
                  <circle cx={CX} cy={CY} r="5" fill="rgba(20,184,166,0.10)">
                    <animate attributeName="r" values="8;68;8" dur="1.3s" begin="0.65s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="1.3s" begin="0.65s" repeatCount="indefinite" />
                  </circle>
                )}
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

            {/* ── Found: Riyadh lock point ─────────────────── */}
            {isFound && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: '106px 89px' }}>
                <circle cx="106" cy="89" r="6" fill="#fbbf24" filter="url(#glo3)">
                  <animate attributeName="r" values="4;9;4" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="106" cy="89" r="2.5" fill="white" />
              </motion.g>
            )}

            {/* ── Denied ring ─────────────────────────────── */}
            {isDenied && (
              <circle cx={CX} cy={CY} r="30" fill="none"
                stroke="rgba(239,68,68,0.55)" strokeWidth="1.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* ── HUD brackets ────────────────────────────── */}
            {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => (
              <g key={i} stroke={isFound ? 'rgba(251,191,36,0.90)' : 'rgba(20,184,166,0.50)'}
                strokeWidth="1.8" fill="none">
                <path d={`M${CX+sx*16},${CY+sy*16+sy*7} L${CX+sx*16},${CY+sy*16} L${CX+sx*16+sx*7},${CY+sy*16}`} />
              </g>
            ))}

            {/* ── Pin needle tip glow ──────────────────────── */}
            <circle cx={CX} cy={TIP_Y} r={isFound ? 8 : 5} fill="url(#tipGlow3)" filter="url(#glo3)">
              <animate attributeName="r" values={isFound ? '6;11;6' : '4;7;4'} dur={isFound ? '1.2s' : '2.5s'} repeatCount="indefinite" />
            </circle>
            <circle cx={CX} cy={TIP_Y} r="2.5" fill={isFound ? '#fbbf24' : '#14b8a6'} />

            {/* ── LOCK badge ───────────────────────────────── */}
            {isFound && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: `${CX}px ${TIP_Y + 14}px` }}>
                <rect x={CX - 28} y={TIP_Y + 5} width="56" height="14" rx="4"
                  fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.60)" strokeWidth="0.9" />
                <text x={CX} y={TIP_Y + 15.5} textAnchor="middle" fontSize="7.5"
                  fontFamily="JetBrains Mono,monospace" fontWeight="800"
                  fill="rgba(251,191,36,0.95)" letterSpacing="1.5">
                  ✓ LOCK
                </text>
              </motion.g>
            )}

            {/* ── Signal bars ─────────────────────────────── */}
            {[3,5,8,5,3].map((h, i) => {
              const lit = isSearching ? i <= 2 : isFound ? true : i <= 1;
              return (
                <rect key={i} x={82 + i * 9} y={TIP_Y + (isFound ? 27 : 9) - h}
                  width="6" height={h} rx="1.5"
                  fill={lit ? (isFound ? 'rgba(251,191,36,0.70)' : 'rgba(20,184,166,0.60)') : 'rgba(255,255,255,0.07)'} />
              );
            })}
          </svg>
        </motion.button>
      </div>

      {/* ── Coordinates / status text ───────────────────── */}
      <AnimatePresence mode="wait">
        {isFound && coords ? (
          <motion.div key="coords" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2">
            {/* الإحداثيات */}
            <div className="flex flex-col items-center gap-1">
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
            </div>

            {/* زر التحقق من الموقع — يفتح تطبيق الخرائط */}
            <motion.a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 320 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-[0.72rem] font-bold text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.15)] transition-all hover:border-amber-400/60 hover:bg-amber-500/18 hover:shadow-[0_0_24px_rgba(251,191,36,0.25)]"
            >
              {/* أيقونة دبوس صغيرة */}
              <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" className="shrink-0 text-amber-400">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"/>
              </svg>
              <span>تحقق من موقعك على الخريطة</span>
              {/* أيقونة رابط خارجي */}
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-amber-400/60">
                <path d="M2 10L10 2M10 2H5.5M10 2V6.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>

            <p className="text-[0.56rem] text-slate-600 text-center">
              يفتح تطبيق الخرائط على موقعك الذي رصدناه
            </p>
          </motion.div>
        ) : isSearching ? (
          <motion.p key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-mono text-[0.62rem] text-teal-400/60">
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>▋</motion.span>
            {' '}الرادار يحدّد موقعك على خريطة المملكة…
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
            className="flex flex-col items-center gap-1 text-center">
            <p className="text-[0.63rem] text-slate-500 max-w-xs">
              اضغط على الدبوس لاكتشاف أقرب الصالونات لموقعك في المملكة
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="h-px w-36 bg-gradient-to-l from-transparent via-teal-400/25 to-transparent"
        animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}
