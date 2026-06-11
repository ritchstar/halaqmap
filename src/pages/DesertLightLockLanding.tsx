/**
 * قفل الإضاءة الصحراوي — معمل تصميم مستقل
 * المسار: /lab/desert-light-lock
 *
 * ليل صحراوي + نجوم + شهب — وطبقة إضاءة تملأ الشاشة عند التشغيل.
 * لوحة تحكم يسار الشاشة تظهر عند اقتراب المؤشر من الحافة.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Lightbulb,
  LightbulbOff,
  Sun,
  ChevronLeft,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HOME_HREF = '/#/';

type LightPreset = {
  id: string;
  label: string;
  top: string;
  mid: string;
  glow: string;
};

const LIGHT_PRESETS: LightPreset[] = [
  { id: 'white', label: 'أبيض', top: 'rgba(255,252,245,0.98)', mid: 'rgba(255,248,235,0.72)', glow: '#fffef7' },
  { id: 'blue', label: 'أزرق', top: 'rgba(191,219,254,0.95)', mid: 'rgba(96,165,250,0.55)', glow: '#93c5fd' },
  { id: 'amber', label: 'عنبر', top: 'rgba(254,243,199,0.96)', mid: 'rgba(251,191,36,0.5)', glow: '#fcd34d' },
  { id: 'violet', label: 'بنفسجي', top: 'rgba(233,213,255,0.94)', mid: 'rgba(167,139,250,0.48)', glow: '#c4b5fd' },
  { id: 'rose', label: 'وردي', top: 'rgba(255,228,230,0.94)', mid: 'rgba(251,113,133,0.45)', glow: '#fda4af' },
  { id: 'emerald', label: 'زمردي', top: 'rgba(209,250,229,0.93)', mid: 'rgba(52,211,153,0.42)', glow: '#6ee7b7' },
];

type Star = { id: number; x: number; y: number; r: number; delay: number; bright: boolean };

type Meteor = { id: number; x: number; y: number; len: number; dur: number };

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildStars(count: number): Star[] {
  const rnd = seeded(77);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rnd() * 100,
    y: rnd() * 58,
    r: rnd() * 1.5 + 0.35,
    delay: rnd() * 6,
    bright: rnd() > 0.9,
  }));
}

function randomMeteor(id: number): Meteor {
  const rnd = seeded(id * 997 + Date.now() % 1000);
  return {
    id,
    x: 8 + rnd() * 75,
    y: 2 + rnd() * 28,
    len: 12 + rnd() * 18,
    dur: 0.55 + rnd() * 0.45,
  };
}

function NightSky({
  visible,
  stars,
  meteors,
  reduceMotion,
}: {
  visible: number;
  stars: Star[];
  meteors: Meteor[];
  reduceMotion: boolean | null;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: visible }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(30,27,75,0.55) 0%, rgba(4,6,18,0.98) 55%, #020108 100%)',
        }}
      />
      <svg className="absolute inset-0 h-[72%] w-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.bright ? '#fde68a' : '#e2e8f0'}
            opacity={s.bright ? 0.95 : 0.5}
          >
            {!reduceMotion ? (
              <animate
                attributeName="opacity"
                values={s.bright ? '0.45;1;0.45' : '0.2;0.65;0.2'}
                dur={`${3 + s.delay * 0.35}s`}
                begin={`${s.delay}s`}
                repeatCount="indefinite"
              />
            ) : null}
          </circle>
        ))}
        {meteors.map((m) => (
          <line
            key={m.id}
            x1={m.x}
            y1={m.y}
            x2={m.x + m.len * 0.85}
            y2={m.y + m.len * 0.35}
            stroke="url(#meteor-grad)"
            strokeWidth="0.35"
            strokeLinecap="round"
            opacity="0"
          >
            {!reduceMotion ? (
              <>
                <animate attributeName="opacity" values="0;0.9;0" dur={`${m.dur}s`} begin="0s" fill="freeze" />
                <animate attributeName="x1" values={`${m.x};${m.x + 22}`} dur={`${m.dur}s`} fill="freeze" />
                <animate attributeName="y1" values={`${m.y};${m.y + 10}`} dur={`${m.dur}s`} fill="freeze" />
                <animate attributeName="x2" values={`${m.x + m.len * 0.85};${m.x + 22 + m.len}`} dur={`${m.dur}s`} fill="freeze" />
                <animate attributeName="y2" values={`${m.y + m.len * 0.35};${m.y + 10 + m.len * 0.35}`} dur={`${m.dur}s`} fill="freeze" />
              </>
            ) : null}
          </line>
        ))}
        <defs>
          <linearGradient id="meteor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="40%" stopColor="#fef3c7" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{
          background:
            'linear-gradient(to top, #0c0704 0%, rgba(28,15,8,0.92) 22%, rgba(8,10,22,0.4) 55%, transparent 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-[-5%] h-24 w-[110%] rounded-[50%] bg-[#1a0f0a] opacity-90"
        style={{ boxShadow: '0 -20px 80px rgba(0,0,0,0.8)' }}
      />
    </div>
  );
}

function LightWash({
  active,
  brightness,
  preset,
  whiteBlast,
}: {
  active: boolean;
  brightness: number;
  preset: LightPreset;
  whiteBlast: boolean;
}) {
  if (whiteBlast) {
    return (
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: 0.97,
          background:
            'radial-gradient(ellipse 130% 95% at 50% 8%, rgba(255,255,255,1) 0%, rgba(255,252,240,0.92) 35%, rgba(255,250,235,0.55) 62%, rgba(255,255,255,0.15) 100%)',
        }}
        aria-hidden
      />
    );
  }

  const level = active ? brightness / 100 : 0;
  if (level <= 0.01) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 transition-all duration-500 ease-out"
      style={{
        opacity: level,
        background: `radial-gradient(ellipse 125% 90% at 50% 6%, ${preset.top} 0%, ${preset.mid} 38%, rgba(255,255,255,0.08) 68%, transparent 100%)`,
        boxShadow: `inset 0 0 120px 40px ${preset.glow}33`,
      }}
      aria-hidden
    />
  );
}

export default function DesertLightLockLanding() {
  const reduceMotion = useReducedMotion();
  const stars = useMemo(() => buildStars(reduceMotion ? 55 : 120), [reduceMotion]);

  const [lightsOn, setLightsOn] = useState(false);
  const [whiteBlast, setWhiteBlast] = useState(false);
  const [brightness, setBrightness] = useState(72);
  const [presetId, setPresetId] = useState('blue');
  const [panelOpen, setPanelOpen] = useState(false);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const meteorSeq = useRef(0);
  const hideTimer = useRef<number | null>(null);

  const preset = LIGHT_PRESETS.find((p) => p.id === presetId) ?? LIGHT_PRESETS[1];
  const nightVisible = whiteBlast
    ? 0
    : lightsOn
      ? Math.max(0, 1 - (brightness / 100) * 1.15)
      : 1;

  const scheduleMeteor = useCallback(() => {
    if (reduceMotion) return;
    setMeteors((prev) => {
      const next = [...prev, randomMeteor(meteorSeq.current++)];
      return next.slice(-4);
    });
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || lightsOn) return;
    scheduleMeteor();
    const id = window.setInterval(() => {
      if (Math.random() > 0.35) scheduleMeteor();
    }, 2800 + Math.random() * 3200);
    return () => window.clearInterval(id);
  }, [lightsOn, reduceMotion, scheduleMeteor]);

  useEffect(() => {
    if (!whiteBlast) return;
    const t = window.setTimeout(() => setWhiteBlast(false), 900);
    return () => window.clearTimeout(t);
  }, [whiteBlast]);

  const openPanel = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setPanelOpen(true);
  }, []);

  const closePanelSoon = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPanelOpen(false), 700);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientX <= 52) {
        openPanel();
        return;
      }
      if (!panelOpen) return;
      if (e.clientX > 300) closePanelSoon();
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [closePanelSoon, openPanel, panelOpen]);

  const toggleMaster = () => {
    setLightsOn((v) => !v);
    if (lightsOn) setWhiteBlast(false);
  };

  return (
    <div dir="rtl" className="fixed inset-0 overflow-hidden bg-[#020108] select-none">
      <NightSky visible={nightVisible} stars={stars} meteors={meteors} reduceMotion={reduceMotion} />
      <LightWash active={lightsOn} brightness={brightness} preset={preset} whiteBlast={whiteBlast} />

      {/* منطقة حساسة يسار الشاشة */}
      <div
        className="fixed inset-y-0 left-0 z-20 w-14"
        onMouseEnter={openPanel}
        aria-hidden
      />

      <AnimatePresence>
        {panelOpen ? (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed left-0 top-0 z-30 flex h-full w-[min(280px,88vw)] flex-col border-r border-white/10 bg-black/55 shadow-[0_0_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            onMouseLeave={closePanelSoon}
            onMouseEnter={openPanel}
          >
            <div className="border-b border-white/10 px-4 py-4">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400">معمل · قفل الإضاءة</p>
              <h1 className="mt-1 text-lg font-black text-white">صحراء الليل</h1>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              {/* رئيسي ON/OFF */}
              <div>
                <p className="mb-2 text-xs font-bold text-slate-400">قفل الإضاءة</p>
                <button
                  type="button"
                  onClick={toggleMaster}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-black transition-all',
                    lightsOn
                      ? 'border-amber-300/45 bg-amber-400/15 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.2)]'
                      : 'border-white/12 bg-white/5 text-slate-300 hover:border-white/25',
                  )}
                >
                  <span>{lightsOn ? 'ON — الإضاءة مفتوحة' : 'OFF — ليل ونجوم'}</span>
                  {lightsOn ? <Lightbulb className="h-5 w-5" /> : <LightbulbOff className="h-5 w-5" />}
                </button>
              </div>

              {/* أبيض ساطع */}
              <div>
                <p className="mb-2 text-xs font-bold text-slate-400">ضوء الغرفة الأبيض</p>
                <button
                  type="button"
                  onClick={() => setWhiteBlast(true)}
                  className="relative w-full overflow-hidden rounded-2xl border border-white/50 bg-white px-4 py-4 text-sm font-black text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.55)] transition-all hover:shadow-[0_0_56px_rgba(255,255,255,0.75)]"
                >
                  <Sun className="mb-1 inline h-5 w-5" />
                  <span className="block">وميض أبيض ساطع</span>
                  <span className="mt-1 block text-[10px] font-medium text-slate-600">يعمل حتى مع إطفاء القفل</span>
                </button>
              </div>

              {/* ديمر */}
              <div className={cn(!lightsOn && 'opacity-45 pointer-events-none')}>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5" />
                    مخفت الإضاءة
                  </span>
                  <span dir="ltr">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={100}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-amber-300"
                  aria-label="مخفت الإضاءة"
                />
              </div>

              {/* ألوان */}
              <div className={cn(!lightsOn && 'opacity-45 pointer-events-none')}>
                <p className="mb-2 text-xs font-bold text-slate-400">لون الإضاءة</p>
                <div className="grid grid-cols-2 gap-2">
                  {LIGHT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPresetId(p.id)}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-xs font-bold transition-all',
                        presetId === p.id
                          ? 'border-white/40 text-white shadow-[0_0_16px_rgba(255,255,255,0.12)]'
                          : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200',
                      )}
                      style={{
                        background:
                          presetId === p.id
                            ? `linear-gradient(135deg, ${p.mid}, transparent)`
                            : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-3">
              <a
                href={HOME_HREF}
                className="flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-300"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                العودة للمنصة
              </a>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* تلميح الحافة */}
      {!panelOpen && !lightsOn ? (
        <div
          className="pointer-events-none fixed left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/30 px-2 py-3 text-[10px] font-semibold text-slate-500 backdrop-blur-sm [writing-mode:vertical-rl]"
          aria-hidden
        >
          تحكم
        </div>
      ) : null}

      {/* حالة مركزية خفيفة عند الليل فقط */}
      {!lightsOn ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="max-w-xs text-center text-sm font-medium text-slate-500/80">
            اقترب يسار الشاشة لفتح لوحة الإضاءة
          </p>
        </div>
      ) : null}
    </div>
  );
}
