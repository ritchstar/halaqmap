/**
 * KSACityClocksBar — شريط درجات حرارة مدن المملكة + الوقت
 * تصميم: داكن زجاجي · نبضة حية · درجات حرارة محاكاة واقعية
 *
 * درجات الحرارة: تحاكي قيم مايو (موسم ليلي) مع تذبذب ±1°C كل 90 ثانية
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';

/* ── درجات أساسية لشهر مايو (ليلاً — تقريبية) ──────────────────── */
const KSA_CITIES = [
  { nameAr: 'الرياض',          emoji: '🏙️', baseTemp: 34 },
  { nameAr: 'جدة',             emoji: '🌊', baseTemp: 31 },
  { nameAr: 'مكة المكرمة',     emoji: '🕌', baseTemp: 33 },
  { nameAr: 'المدينة المنورة', emoji: '☪️', baseTemp: 32 },
  { nameAr: 'الدمام',          emoji: '⛽', baseTemp: 35 },
  { nameAr: 'أبها',            emoji: '🏔️', baseTemp: 21 },
  { nameAr: 'تبوك',            emoji: '🌵', baseTemp: 28 },
] as const;

/* درجة حرارة متذبذبة ±1 */
function applyFluctuation(base: number, seed: number, tick: number): number {
  const phase = (tick + seed * 37) % 180;
  const offset = Math.sin((phase / 180) * Math.PI * 2) * 0.8;
  return Math.round((base + offset) * 10) / 10;
}

/* لون درجة الحرارة */
function tempColor(temp: number): string {
  if (temp <= 22) return 'text-sky-300';
  if (temp <= 28) return 'text-teal-300';
  if (temp <= 32) return 'text-amber-300';
  if (temp <= 36) return 'text-orange-400';
  return 'text-rose-400';
}

function getKSATime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const ksa = new Date(utc + 3 * 60 * 60_000);
  return {
    h: ksa.getHours().toString().padStart(2, '0'),
    m: ksa.getMinutes().toString().padStart(2, '0'),
    s: ksa.getSeconds().toString().padStart(2, '0'),
  };
}

export function KSACityClocksBar() {
  const [time, setTime] = useState(getKSATime);
  const [tick, setTick] = useState(0);
  const [scanX, setScanX] = useState(-100);
  const scanRef = useRef(-100);

  /* ساعة حية */
  useEffect(() => {
    const id = setInterval(() => setTime(getKSATime()), 1000);
    return () => clearInterval(id);
  }, []);

  /* تحديث تذبذب الحرارة كل 90 ثانية */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90_000);
    return () => clearInterval(id);
  }, []);

  /* خط مسح متحرك */
  useEffect(() => {
    const id = setInterval(() => {
      scanRef.current = scanRef.current > 110 ? -100 : scanRef.current + 0.8;
      setScanX(scanRef.current);
    }, 20);
    return () => clearInterval(id);
  }, []);

  /* قيم الحرارة المحسوبة */
  const temperatures = KSA_CITIES.map((c, i) =>
    applyFluctuation(c.baseTemp, i, tick)
  );

  /* أعلى + أدنى درجة */
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);

  return (
    <div
      className="relative w-full overflow-hidden border-b border-teal-400/12"
      style={{
        height: '38px',
        background: 'linear-gradient(90deg,#020912 0%,#041118 40%,#020d18 60%,#020912 100%)',
      }}
    >
      {/* خط مسح متحرك */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[180px] transition-none"
        style={{
          left: `${scanX}%`,
          background:
            'linear-gradient(90deg,transparent,rgba(20,184,166,0.06),rgba(20,184,166,0.12),rgba(20,184,166,0.06),transparent)',
        }}
      />

      {/* خط توهج سفلي */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />

      <div className="relative flex h-full items-center justify-between px-4">

        {/* ── يمين: شارة حية ──────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-teal-400/25 bg-teal-500/10 px-2.5 py-0.5">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full bg-teal-400"
            />
            <span className="text-[0.55rem] font-black tracking-[0.18em] text-teal-300">LIVE</span>
          </div>
          <span className="hidden text-[0.5rem] font-semibold tracking-widest text-teal-400/40 sm:block">
            KSA · UTC+3
          </span>
        </div>

        {/* ── وسط: المدن بدرجات الحرارة ───────────────────── */}
        <div className="flex flex-1 items-center justify-center gap-0.5 overflow-x-auto px-3 scrollbar-none">
          {KSA_CITIES.map((city, i) => {
            const temp = temperatures[i];
            const isHottest = temp === maxTemp;
            const isCoolest = temp === minTemp;
            const color = tempColor(temp);
            return (
              <div key={city.nameAr} className="flex shrink-0 items-center">
                {i > 0 && <div className="mx-1 h-3 w-px bg-white/8" />}
                <div
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-all hover:bg-white/5 ${
                    isHottest ? 'bg-rose-500/5' : isCoolest ? 'bg-sky-500/5' : ''
                  }`}
                >
                  <span className="text-[0.6rem] leading-none">{city.emoji}</span>
                  <span className="hidden text-[0.55rem] font-medium text-slate-500 sm:block">
                    {city.nameAr}
                  </span>
                  <span className={`font-mono text-[0.65rem] font-bold tabular-nums ${color}`}>
                    {temp}°
                  </span>
                  {isHottest && (
                    <span className="hidden text-[0.5rem] text-rose-500 sm:inline">▲</span>
                  )}
                  {isCoolest && (
                    <span className="hidden text-[0.5rem] text-sky-400 sm:inline">▼</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── يسار: الوقت الكامل + أيقونة حرارة ──────────── */}
        <div className="flex shrink-0 items-center gap-2">
          <Thermometer className="h-3 w-3 text-orange-400/60" />
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-[0.72rem] font-black tabular-nums text-teal-100/90">
              {time.h}:{time.m}
            </span>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="font-mono text-[0.56rem] font-bold tabular-nums text-teal-400/60"
            >
              :{time.s}
            </motion.span>
          </div>
          <span className="hidden text-[0.5rem] text-slate-700 md:block">°C</span>
        </div>
      </div>
    </div>
  );
}
