/**
 * KSACityClocksBar — شريط مدن المملكة المُضيء
 * تصميم: توهج حيّ · درجات الحرارة · ساعة دقيقة · زجاجي فاخر
 * كأن المنصة تُنير كل مدينة بنبضة تيل ذهبية
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer } from 'lucide-react';
import { KSA_CITIES_GEO } from '@/config/ksaCitiesGeo';
import {
  fetchTemperatureCelsius,
  formatRiyadhMonthAr,
  readStoredUserCoords,
  resolveUserRegion,
  storeUserCoords,
  tempColor,
  type UserCoords,
} from '@/lib/userRegionWeather';

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
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const scanRef = useRef(0);
  const [scanX, setScanX] = useState(-30);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(() => readStoredUserCoords());
  const [coordsFromDevice, setCoordsFromDevice] = useState(Boolean(readStoredUserCoords()));
  const [cityTemps, setCityTemps] = useState<(number | null)[]>(() =>
    KSA_CITIES_GEO.map(() => null),
  );
  const [userTemp, setUserTemp] = useState<number | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const riyadhMonth = formatRiyadhMonthAr();

  const userRegion = resolveUserRegion(userCoords, coordsFromDevice);
  const userCityIndex = KSA_CITIES_GEO.findIndex((c) => c.id === userRegion.city.id);

  const refreshWeather = useCallback(async () => {
    setWeatherLoading(true);
    const cityResults = await Promise.all(
      KSA_CITIES_GEO.map((city) => fetchTemperatureCelsius(city.lat, city.lng)),
    );
    setCityTemps(
      cityResults.map((t, i) => t ?? KSA_CITIES_GEO[i].baseTemp),
    );

    const regionTemp = await fetchTemperatureCelsius(
      userRegion.coords.lat,
      userRegion.coords.lng,
    );
    setUserTemp(regionTemp ?? userRegion.city.baseTemp);
    setWeatherLoading(false);
  }, [userRegion.coords.lat, userRegion.coords.lng, userRegion.city.baseTemp]);

  // ساعة حية
  useEffect(() => {
    const id = setInterval(() => setTime(getKSATime()), 1000);
    return () => clearInterval(id);
  }, []);

  // تحديث الطقس كل 15 دقيقة
  useEffect(() => {
    void refreshWeather();
    const id = setInterval(() => void refreshWeather(), 15 * 60_000);
    return () => clearInterval(id);
  }, [refreshWeather]);

  // تسليط الضوء على مدينة مختلفة كل 3 ثوان
  useEffect(() => {
    const id = setInterval(() => {
      setActiveCityIdx((i) => (i + 1) % KSA_CITIES_GEO.length);
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

  // موقع المستخدم — من الجلسة أو GPS (بدون إزعاج إن وُجد إذن سابق)
  useEffect(() => {
    const onCoords = (event: Event) => {
      const detail = (event as CustomEvent<UserCoords>).detail;
      if (detail?.lat != null && detail?.lng != null) {
        setUserCoords(detail);
        setCoordsFromDevice(true);
      }
    };
    window.addEventListener('halaqmap:user-coords', onCoords);

    if (readStoredUserCoords()) return () => window.removeEventListener('halaqmap:user-coords', onCoords);

    if (!navigator.geolocation) {
      return () => window.removeEventListener('halaqmap:user-coords', onCoords);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        storeUserCoords(coords);
        setUserCoords(coords);
        setCoordsFromDevice(true);
      },
      () => {
        /* الافتراضي: الرياض */
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 60 * 60_000 },
    );

    return () => window.removeEventListener('halaqmap:user-coords', onCoords);
  }, []);

  const displayTemps = cityTemps.map((t, i) => t ?? KSA_CITIES_GEO[i].baseTemp);
  const maxTemp = Math.max(...displayTemps);
  const minTemp = Math.min(...displayTemps);
  const regionTempValue = userTemp ?? userRegion.city.baseTemp;
  const regionColor = tempColor(regionTempValue);

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
          background:
            'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.05) 30%, rgba(20,184,166,0.14) 50%, rgba(20,184,166,0.05) 70%, transparent 100%)',
        }}
      />

      {/* ── توهج علوي فاخر ──────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(20,184,166,0.5) 30%, rgba(245,158,11,0.3) 60%, rgba(20,184,166,0.5) 80%, transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(20,184,166,0.25) 40%, rgba(20,184,166,0.25) 60%, transparent)',
        }}
      />

      {/* ── المحتوى الرئيسي ─────────────────────────────── */}
      <div className="relative flex h-full items-center justify-between gap-2 px-3 sm:px-4">

        {/* يمين: الساعة + LIVE ─────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono text-[1.05rem] font-black tabular-nums tracking-tight text-teal-100/95 sm:text-[1.1rem]">
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

          <div className="hidden h-4 w-px bg-teal-400/15 sm:block" />

          <div className="hidden items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/12 px-2.5 py-1 sm:flex">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.7, 1.2, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-teal-400"
            />
            <span className="text-[0.6rem] font-black tracking-[0.18em] text-teal-300">LIVE</span>
          </div>
        </div>

        {/* وسط: المدن ──────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto px-1 scrollbar-none sm:px-4">
          {KSA_CITIES_GEO.map((city, i) => {
            const temp = displayTemps[i];
            const isHottest = temp === maxTemp;
            const isCoolest = temp === minTemp;
            const isActive = activeCityIdx === i;
            const isUserCity = i === userCityIndex;
            const color = tempColor(temp);

            return (
              <div key={city.id} className="flex shrink-0 items-center">
                {i > 0 && <div className="mx-1.5 h-4 w-px bg-white/8 sm:mx-2" />}

                <motion.div
                  animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="relative flex flex-col items-center justify-center rounded-lg px-1.5 py-1 transition-all duration-300 sm:px-2"
                  style={{
                    background: isActive || isUserCity ? `${color}10` : 'transparent',
                    border:
                      isUserCity
                        ? `1px solid ${color}55`
                        : isActive
                          ? `1px solid ${color}35`
                          : '1px solid transparent',
                  }}
                >
                  {(isActive || isUserCity) && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg blur-sm"
                      style={{ background: `${color}18` }}
                    />
                  )}

                  <div className="relative flex items-center gap-1">
                    <span className="text-[0.7rem] leading-none">{city.emoji}</span>
                    <span
                      className={`hidden text-[0.6rem] font-semibold leading-tight sm:block ${isActive || isUserCity ? 'text-white/90' : 'text-slate-400/70'}`}
                    >
                      {city.nameAr}
                    </span>
                  </div>

                  <div className="relative flex items-center gap-0.5">
                    {(isHottest || isCoolest) && (
                      <span className="text-[0.5rem]" style={{ color }}>
                        {isHottest ? '▲' : '▼'}
                      </span>
                    )}
                    <span
                      className="font-mono text-[0.8rem] font-black tabular-nums leading-tight sm:text-[0.85rem]"
                      style={{ color }}
                    >
                      {temp}°
                    </span>
                  </div>

                  {isUserCity && (
                    <span
                      className="absolute -top-2 left-1/2 hidden -translate-x-1/2 rounded-full px-1 py-0 text-[0.42rem] font-bold sm:inline"
                      style={{ background: `${color}22`, color }}
                    >
                      أنت
                    </span>
                  )}

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

        {/* يسار: حرارة منطقة المستخدم ───────────────── */}
        <div
          className="flex shrink-0 items-center gap-2 rounded-lg border px-2 py-1 sm:gap-2.5 sm:px-2.5"
          style={{
            borderColor: `${regionColor}40`,
            background: `${regionColor}12`,
          }}
          title={
            coordsFromDevice
              ? `درجة الحرارة عند ${userRegion.city.nameAr} — أقرب مدينة لموقعك`
              : `درجة الحرارة في ${userRegion.city.nameAr} — افتراضي حتى تحديد موقعك`
          }
        >
          <Thermometer className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: regionColor }} />
          <div className="flex min-w-0 flex-col items-end leading-tight">
            <div className="flex items-baseline gap-1">
              <span
                className="font-mono text-[1rem] font-black tabular-nums sm:text-[1.15rem]"
                style={{ color: regionColor }}
              >
                {weatherLoading ? '…' : `${regionTempValue}°`}
              </span>
              <span className="text-[0.55rem] font-bold text-slate-400">C</span>
            </div>
            <div className="flex max-w-[7.5rem] items-center gap-1 truncate">
              {coordsFromDevice && (
                <MapPin className="h-2.5 w-2.5 shrink-0" style={{ color: regionColor }} aria-hidden />
              )}
              <span className="truncate text-[0.55rem] font-semibold text-slate-300 sm:text-[0.58rem]">
                {userRegion.city.nameAr}
              </span>
              <span className="hidden text-[0.5rem] text-slate-500 sm:inline">
                · {coordsFromDevice ? 'منطقتك' : 'UTC+3'}
              </span>
            </div>
            <span className="hidden text-[0.48rem] text-slate-600 sm:inline">
              {riyadhMonth}
            </span>
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
          background: `radial-gradient(ellipse 40% 100% at 50% 50%, ${tempColor(displayTemps[activeCityIdx])}18, transparent)`,
        }}
      />
    </div>
  );
}
