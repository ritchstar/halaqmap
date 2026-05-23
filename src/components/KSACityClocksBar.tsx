/**
 * KSACityClocksBar — شريط توقيت مدن المملكة العربية السعودية
 * يُعرَض كشريط رفيع أعلى النافبار بتصميم تقني شفّاف احترافي.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const KSA_CITIES = [
  { nameAr: 'الرياض', emoji: '🏙️' },
  { nameAr: 'جدة', emoji: '🌊' },
  { nameAr: 'مكة المكرمة', emoji: '🕌' },
  { nameAr: 'المدينة المنورة', emoji: '☪️' },
  { nameAr: 'الدمام', emoji: '⛽' },
  { nameAr: 'أبها', emoji: '🏔️' },
  { nameAr: 'تبوك', emoji: '🌵' },
] as const;

/** المملكة كلها UTC+3 */
function getKSATime(): { h: string; m: string; s: string } {
  const now = new Date();
  const ksaOffset = 3 * 60; // UTC+3
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const ksa = new Date(utc + ksaOffset * 60_000);
  return {
    h: ksa.getHours().toString().padStart(2, '0'),
    m: ksa.getMinutes().toString().padStart(2, '0'),
    s: ksa.getSeconds().toString().padStart(2, '0'),
  };
}

export function KSACityClocksBar() {
  const [time, setTime] = useState(getKSATime);

  useEffect(() => {
    const id = setInterval(() => setTime(getKSATime()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = `${time.h}:${time.m}`;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-teal-400/10 bg-gradient-to-l from-[#020912] via-[#030e1a] to-[#020912]"
      style={{ height: '32px' }}
    >
      {/* خلفية نبضية خفية */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgba(20,184,166,0.06),transparent)]" />

      <div className="relative flex h-full items-center justify-between px-4">
        {/* يسار — شارة النظام */}
        <div className="flex shrink-0 items-center gap-1.5">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-teal-400"
          />
          <span className="hidden text-[0.58rem] font-semibold tracking-widest text-teal-400/70 sm:block">
            HALAQ MAP · LIVE
          </span>
        </div>

        {/* وسط — المدن */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 overflow-x-auto px-4 scrollbar-none">
          {KSA_CITIES.map((city, i) => (
            <div
              key={city.nameAr}
              className="flex shrink-0 items-center gap-1 text-[0.6rem]"
            >
              <span className="text-[0.65rem] leading-none">{city.emoji}</span>
              <span className="hidden font-medium text-slate-400 sm:block">{city.nameAr}</span>
              <span className="font-mono font-semibold tabular-nums text-teal-300/90">
                {timeStr}
              </span>
              {i < KSA_CITIES.length - 1 && (
                <span className="hidden text-slate-700 sm:inline">·</span>
              )}
            </div>
          ))}
        </div>

        {/* يمين — التاريخ */}
        <div className="shrink-0 text-[0.58rem] tabular-nums text-slate-600">
          <span className="font-mono">{time.s}</span>
          <span className="ms-1 text-slate-700">UTC+3</span>
        </div>
      </div>
    </div>
  );
}
