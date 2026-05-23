/**
 * KSACityClocksBar — شريط توقيت مدن المملكة الاحترافي
 * تصميم: داكن زجاجي · نبضة حية · مدن مضيئة
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const KSA_CITIES = [
  { nameAr: 'الرياض',          emoji: '🏙️' },
  { nameAr: 'جدة',             emoji: '🌊' },
  { nameAr: 'مكة المكرمة',     emoji: '🕌' },
  { nameAr: 'المدينة المنورة', emoji: '☪️' },
  { nameAr: 'الدمام',          emoji: '⛽' },
  { nameAr: 'أبها',            emoji: '🏔️' },
  { nameAr: 'تبوك',            emoji: '🌵' },
] as const;

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
  const [scanX, setScanX] = useState(-100);

  useEffect(() => {
    const id = setInterval(() => setTime(getKSATime()), 1000);
    return () => clearInterval(id);
  }, []);

  // Moving scan line
  useEffect(() => {
    let x = -100;
    const id = setInterval(() => {
      x = x > 110 ? -100 : x + 0.8;
      setScanX(x);
    }, 20);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden border-b border-teal-400/12"
      style={{
        height: '38px',
        background: 'linear-gradient(90deg,#020912 0%,#041118 40%,#020d18 60%,#020912 100%)',
      }}
    >
      {/* Moving teal scan line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[180px] transition-none"
        style={{
          left: `${scanX}%`,
          background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.06), rgba(20,184,166,0.12), rgba(20,184,166,0.06), transparent)',
        }}
      />

      {/* Bottom glow line */}
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

        {/* ── وسط: المدن ──────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto px-3 scrollbar-none">
          {KSA_CITIES.map((city, i) => (
            <div key={city.nameAr} className="flex shrink-0 items-center">
              {/* Separator */}
              {i > 0 && (
                <div className="mx-1.5 h-3 w-px bg-teal-400/15" />
              )}
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5 transition-all hover:bg-teal-500/10">
                <span className="text-[0.65rem] leading-none">{city.emoji}</span>
                <span className="hidden text-[0.58rem] font-medium text-slate-400 sm:block">{city.nameAr}</span>
                <span className="font-mono text-[0.62rem] font-bold tabular-nums text-teal-200/90">
                  {time.h}:{time.m}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── يسار: الوقت الكامل ──────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-[0.75rem] font-black tabular-nums text-teal-100/90">
              {time.h}:{time.m}
            </span>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="font-mono text-[0.58rem] font-bold tabular-nums text-teal-400/60"
            >
              :{time.s}
            </motion.span>
          </div>
          <span className="hidden text-[0.5rem] text-slate-700 md:block">ت·م·ع+٣</span>
        </div>
      </div>
    </div>
  );
}
