/**
 * LocationStatusBar — شريط تحديد موقع المستخدم الجغرافي
 *
 * يظهر في أعلى يسار الشاشة (fixed) بعد منح الإذن.
 * يعرض: المدينة · الإحداثيات · التوقيت المحلي الحي
 * تصميم: زجاجي مضيء، خط صغير، يتلاشى عند النقر عليه مؤقتاً.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, X, Navigation2 } from 'lucide-react';

// ─── قاعدة بيانات المدن السعودية (reverse geocode محلي) ─────────────────
const KSA_ZONES = [
  { nameAr: 'الرياض', lat: 24.688, lng: 46.722, r: 90 },
  { nameAr: 'جدة', lat: 21.485, lng: 39.192, r: 70 },
  { nameAr: 'مكة المكرمة', lat: 21.389, lng: 39.857, r: 45 },
  { nameAr: 'المدينة المنورة', lat: 24.527, lng: 39.569, r: 45 },
  { nameAr: 'الدمام', lat: 26.432, lng: 50.107, r: 55 },
  { nameAr: 'القطيف', lat: 26.560, lng: 50.013, r: 30 },
  { nameAr: 'الأحساء', lat: 25.375, lng: 49.588, r: 55 },
  { nameAr: 'تبوك', lat: 28.383, lng: 36.571, r: 55 },
  { nameAr: 'أبها', lat: 18.216, lng: 42.505, r: 45 },
  { nameAr: 'الطائف', lat: 21.437, lng: 40.513, r: 45 },
  { nameAr: 'بريدة', lat: 26.326, lng: 43.975, r: 45 },
  { nameAr: 'حائل', lat: 27.512, lng: 41.691, r: 45 },
  { nameAr: 'نجران', lat: 17.492, lng: 44.133, r: 45 },
  { nameAr: 'جازان', lat: 16.890, lng: 42.570, r: 45 },
  { nameAr: 'خميس مشيط', lat: 18.300, lng: 42.728, r: 30 },
  { nameAr: 'عرعر', lat: 30.975, lng: 41.038, r: 40 },
  { nameAr: 'سكاكا', lat: 29.967, lng: 40.200, r: 40 },
  { nameAr: 'الخبر', lat: 26.284, lng: 50.208, r: 25 },
];

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dG = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function reverseGeocodeKSA(lat: number, lng: number): string {
  let best = 'المملكة العربية السعودية';
  let minD = Infinity;
  for (const z of KSA_ZONES) {
    const d = distKm(lat, lng, z.lat, z.lng);
    if (d < z.r && d < minD) {
      minD = d;
      best = z.nameAr;
    }
  }
  return best;
}

function fmtCoord(val: number, posLabel: string, negLabel: string) {
  const abs = Math.abs(val).toFixed(4);
  const label = val >= 0 ? posLabel : negLabel;
  return `${abs}° ${label}`;
}

function getKSATimeStr(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const ksa = new Date(utc + 3 * 60 * 60_000);
  return [ksa.getHours(), ksa.getMinutes(), ksa.getSeconds()]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

// ─── Component ────────────────────────────────────────────────────────────
interface Props {
  lat?: number;
  lng?: number;
}

export function LocationStatusBar({ lat, lng }: Props) {
  const [timeStr, setTimeStr] = useState(getKSATimeStr);
  const [dismissed, setDismissed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTimeStr(getKSATimeStr()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!lat || !lng) return null;
  if (dismissed) return null;

  const city = reverseGeocodeKSA(lat, lng);
  const latStr = fmtCoord(lat, 'ش', 'ج');
  const lngStr = fmtCoord(lng, 'ق', 'غ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed left-3 top-[96px] z-40 md:top-[80px]"
        dir="rtl"
      >
        <div
          className="relative cursor-pointer overflow-hidden rounded-xl border border-teal-400/20 bg-[#030d1a]/80 shadow-lg shadow-teal-500/10 backdrop-blur-xl transition-all duration-300 hover:border-teal-400/40"
          onClick={() => setDetailOpen((o) => !o)}
          style={{ minWidth: '130px' }}
        >
          {/* خلفية نبضية */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.08),transparent)]" />

          {/* الصف الرئيسي */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Navigation2 className="h-2.5 w-2.5 text-teal-400" />
            </motion.div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[0.65rem] font-bold leading-tight text-teal-200">
                {city}
              </span>
              <span className="font-mono text-[0.55rem] leading-tight text-teal-400/70">
                {timeStr}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              className="ms-1 rounded p-0.5 text-slate-600 hover:text-slate-400"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* التفاصيل (تظهر عند النقر) */}
          <AnimatePresence>
            {detailOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-teal-400/10"
              >
                <div className="flex flex-col gap-0.5 px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[0.55rem] text-slate-400">
                    <MapPin className="h-2 w-2 text-teal-500" />
                    <span className="font-mono">{latStr}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[0.55rem] text-slate-400">
                    <MapPin className="h-2 w-2 text-teal-500" />
                    <span className="font-mono">{lngStr}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[0.55rem] text-slate-500">
                    <Clock className="h-2 w-2" />
                    <span>UTC+3 · توقيت المملكة</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
