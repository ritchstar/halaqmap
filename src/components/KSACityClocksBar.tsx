/**
 * KSACityClocksBar — شريط مدن المملكة المُضيء
 * تصميم: توهج حيّ · درجات الحرارة · ساعة دقيقة · زجاجي فاخر
 * كأن المنصة تُنير كل مدينة بنبضة تيل ذهبية
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';

// ── مدن المملكة مع البيانات ─────────────────────────────────────────────────
const KSA_CITIES = [
  { nameAr: 'الرياض',          emoji: '🏙️', baseTemp: 34, accent: 'text-orange-300' },
  { nameAr: 'جدة',             emoji: '🌊', baseTemp: 31, accent: 'text-cyan-300'   },
  { nameAr: 'مكة المكرمة',     emoji: '🕌', baseTemp: 33, accent: 'text-amber-200' },
  { nameAr: 'المدينة المنورة', emoji: '☪️', baseTemp: 32, accent: 'text-emerald-300' },
  { nameAr: 'الدمام',          emoji: '⛽', baseTemp: 35, accent: 'text-rose-300'  },
  { nameAr: 'أبها',            emoji: '🏔️', baseTemp: 21, accent: 'text-sky-300'   },
  { nameAr: 'تبوك',            emoji: '🌵', baseTemp: 28, accent: 'text-lime-300'  },
] as const;

// ── حساب الحرارة المتذبذبة ──────────────────────────────────────────────────
function applyFluctuation(base: number, seed: number, tick: number): number {
  const phase = (tick + seed * 37) % 180;
  const offset = Math.sin((phase / 180) * Math.PI * 2) * 0.8;
  return Math.round((base + offset) * 10) / 10;
}

// ── لون درجة الحرارة ────────────────────────────────────────────────────────
function tempColor(temp: number): string {
  if (temp <= 22) return '#7dd3fc';  // sky blue — بارد
  if (temp <= 28) return '#6ee7b7';  // emerald — معتدل
  if (temp <= 32) return '#fde68a';  // amber — دافئ
  if (temp <= 36) return '#fb923c';  // orange — حار
  return '#f87171';                  // red — شديد الحرارة
}

// ── الساعة السعودية ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export function KSACityClocksBar() {
  const [time, setTime] = useState(getKSATime);
  const [tick, setTick] = useState(0);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const scanRef = useRef(0);
  const [scanX, setScanX] = useState(-30);

  // ساعة حية
  useEffect(() => {
    const id = setInterval(() => setTime(getKSATime()), 1000);
    return () => clearInterval(id);
  }, []);

  // تحديث الحرارة كل 90 ثانية
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90_000);
    return () => clearInterval(id);
  }, []);

  // تسليط الضوء على مدينة مختلفة كل 3 ثوان
  useEffect(() => {
    const id = setInterval(() => {
      setActiveCityIdx((i) => (i + 1) % KSA_CITIES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // خط المسح المتحرك
  useEffect(() => {
    const id = setInterval(() => {
      scanRef.current = scanRef.current > 108 ? -30 : scanRef.current + 0.6;
      setScanX(scanRef.current);
    }, 16);
    return () => clearInterval(id);
  }, []);

  const temperatures = KSA_CITIES.map((c, i) =>
    applyFluctuation(c.baseTemp, i, tick)
  );
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);

  return (
    <div
      dir="rtl"
      className="relative w-full overflow-hidden"
      style={{
        height: '52px',
        background: 'linear-gradient(180deg, #060e1a 0%, #030912 50%, #060e1a 100%)',
        borderBottom: '1px solid rgba(20,184,166,0.18)',
      }}
    >
      {/* ── خط مسح أفقي متحرك ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[22%] transition-none"
        style={{
          left: `${scanX}%`,
          background: 'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.05) 30%, rgba(20,184,166,0.14) 50%, rgba(20,184,166,0.05) 70%, transparent 100%)',
        }}
      />

      {/* ── توهج علوي فاخر ──────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5) 30%, rgba(245,158,11,0.3) 60%, rgba(20,184,166,0.5) 80%, transparent)' }}
      />
      {/* توهج سفلي */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.25) 40%, rgba(20,184,166,0.25) 60%, transparent)' }}
      />

      {/* ── المحتوى الرئيسي ─────────────────────────────── */}
      <div className="relative flex h-full items-center justify-between px-4">

        {/* يمين: الساعة + شارة LIVE ───────────────────── */}
        <div className="flex shrink-0 items-center gap-3">
          {/* الساعة الكبيرة */}
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-[1.1rem] font-black tabular-nums text-teal-100/95 tracking-tight">
              {time.h}:{time.m}
            </span>
            <motion.span
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="font-mono text-[0.65rem] font-bold tabular-nums text-teal-400/55"
            >
              :{time.s}
            </motion.span>
          </div>

          {/* فاصل */}
          <div className="h-4 w-px bg-teal-400/15" />

          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/12 px-2.5 py-1">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.7, 1.2, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-teal-400"
            />
            <span className="text-[0.6rem] font-black tracking-[0.18em] text-teal-300">LIVE</span>
          </div>
        </div>

        {/* وسط: المدن ────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto px-4 scrollbar-none">
          {KSA_CITIES.map((city, i) => {
            const temp = temperatures[i];
            const isHottest = temp === maxTemp;
            const isCoolest = temp === minTemp;
            const isActive = activeCityIdx === i;
            const color = tempColor(temp);

            return (
              <div key={city.nameAr} className="flex shrink-0 items-center">
                {/* فاصل بين المدن */}
                {i > 0 && (
                  <div className="mx-2 h-4 w-px bg-white/8" />
                )}

                {/* بطاقة المدينة */}
                <motion.div
                  animate={isActive ? {
                    scale: [1, 1.06, 1],
                  } : { scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="relative flex flex-col items-center justify-center rounded-lg px-2 py-1 transition-all duration-300"
                  style={{
                    background: isActive ? `${color}10` : 'transparent',
                    border: isActive ? `1px solid ${color}35` : '1px solid transparent',
                  }}
                >
                  {/* توهج خلفي عند التفعيل */}
                  {isActive && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg blur-sm"
                      style={{ background: `${color}18` }}
                    />
                  )}

                  {/* الصف العلوي: رمز + اسم */}
                  <div className="relative flex items-center gap-1">
                    <span className="text-[0.7rem] leading-none">{city.emoji}</span>
                    <span className={`hidden text-[0.6rem] font-semibold leading-tight sm:block ${isActive ? 'text-white/90' : 'text-slate-400/70'}`}>
                      {city.nameAr}
                    </span>
                  </div>

                  {/* الصف السفلي: الحرارة */}
                  <div className="relative flex items-center gap-0.5">
                    {(isHottest || isCoolest) && (
                      <span className="text-[0.5rem]" style={{ color }}>
                        {isHottest ? '▲' : '▼'}
                      </span>
                    )}
                    <span
                      className="font-mono text-[0.85rem] font-black tabular-nums leading-tight"
                      style={{ color }}
                    >
                      {temp}°
                    </span>
                  </div>

                  {/* نقطة توهج أسفل المدينة النشطة */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                      style={{ background: color }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.3, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* يسار: أيقونة الحرارة + UTC ──────────────────── */}
        <div className="flex shrink-0 items-center gap-2">
          <Thermometer className="h-4 w-4 text-orange-400/60" />
          <div className="hidden flex-col items-end leading-tight sm:flex">
            <span className="text-[0.55rem] font-bold text-slate-500">درجة الحرارة</span>
            <span className="text-[0.5rem] text-slate-700">UTC+3 · مايو</span>
          </div>
        </div>
      </div>

      {/* ── نبضة ضوئية عند تغيير المدينة ─────────────────── */}
      <motion.div
        key={activeCityIdx}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: `radial-gradient(ellipse 40% 100% at 50% 50%, ${tempColor(temperatures[activeCityIdx])}18, transparent)`,
        }}
      />
    </div>
  );
}
