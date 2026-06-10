/**
 * KSACityClocksBar — شريط مدن المملكة المُضيء
 * تصميم: توهج حيّ · درجات الحرارة · ساعة دقيقة · زجاجي فاخر
 * كأن المنصة تُنير كل مدينة بنبضة تيل ذهبية
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer } from 'lucide-react';
import { KSA_CITIES_GEO } from '@/config/ksaCitiesGeo';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  fetchTemperatureCelsius,
  formatRiyadhMonthAr,
  readStoredUserCoords,
  resolveUserRegion,
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
  const isMobile = useIsMobile();
  const [time, setTime] = useState(getKSATime);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
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

  // تسليط الضوء على مدينة مختلفة — إيقاع بطيء كالتنفس
  useEffect(() => {
    const id = setInterval(() => {
      setActiveCityIdx((i) => (i + 1) % KSA_CITIES_GEO.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // موقع المستخدم — من الجلسة أو من مسار الاستعلام الصريح فقط
  useEffect(() => {
    const onCoords = (event: Event) => {
      const detail = (event as CustomEvent<UserCoords>).detail;
      if (detail?.lat != null && detail?.lng != null) {
        setUserCoords(detail);
        setCoordsFromDevice(true);
      }
    };
    window.addEventListener('halaqmap:user-coords', onCoords);

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
      className="ksa-clocks-bar relative w-full overflow-hidden"
      style={{
        height: '72px',
        background:
          'linear-gradient(180deg, #04111f 0%, #020c18 55%, #04111f 100%)',
        borderBottom: '1px solid rgba(20,184,166,0.14)',
      }}
    >
      {/* ── خط مسح أفقي ─── */}
      <div
        className="ksa-clocks-scanline pointer-events-none absolute inset-y-0 w-[22%]"
        style={{
          background:
            'linear-gradient(90deg,transparent 0%,rgba(20,184,166,0.04) 30%,rgba(20,184,166,0.11) 50%,rgba(20,184,166,0.04) 70%,transparent 100%)',
        }}
      />

      {/* ── خط توهج علوي ─── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
        style={{
          background:
            'linear-gradient(90deg,transparent 0%,rgba(20,184,166,0.45) 25%,rgba(245,158,11,0.35) 55%,rgba(20,184,166,0.45) 80%,transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg,transparent,rgba(20,184,166,0.18) 40%,rgba(20,184,166,0.18) 60%,transparent)',
        }}
      />

      {/* ── المحتوى ─── */}
      <div className="relative flex h-full items-center justify-between gap-3 px-4 sm:px-6">

        {/* يمين: الساعة */}
        <div className="flex shrink-0 flex-col items-start gap-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="ksa-clocks-time-main font-mono text-[1.2rem] font-black tabular-nums tracking-tight text-teal-50/95 sm:text-[1.3rem]">
              {time.h}:{time.m}
            </span>
            {isMobile ? (
              <span className="ksa-clocks-time-sec font-mono text-[0.7rem] font-bold tabular-nums text-teal-400/45">
                :{time.s}
              </span>
            ) : (
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ksa-clocks-time-sec font-mono text-[0.7rem] font-bold tabular-nums text-teal-400/45"
              >
                :{time.s}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isMobile ? (
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]" />
            ) : (
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]"
              />
            )}
            <span className="ksa-clocks-live-label text-[0.52rem] font-black tracking-[0.22em] text-teal-400/75">LIVE · KSA</span>
          </div>
        </div>

        {/* وسط: المدن */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto scrollbar-none px-2 sm:px-6">
          {KSA_CITIES_GEO.map((city, i) => {
            const temp = displayTemps[i];
            const isHottest = temp === maxTemp;
            const isCoolest = temp === minTemp;
            const isActive = activeCityIdx === i;
            const isUserCity = i === userCityIndex;
            const color = tempColor(temp);

            return (
              <div key={city.id} className="flex shrink-0 items-center">
                {i > 0 && <div className="mx-2 h-5 w-px bg-white/6 sm:mx-2.5" />}

                <motion.div
                  className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-[border-color,background] duration-[2s] ease-in-out sm:px-2.5"
                  style={{
                    background:
                      isActive || isUserCity
                        ? `linear-gradient(160deg,${color}18 0%,${color}0c 100%)`
                        : 'transparent',
                    border:
                      isUserCity
                        ? `1px solid ${color}50`
                        : isActive
                          ? `1px solid ${color}30`
                          : '1px solid transparent',
                    boxShadow:
                      isActive || isUserCity
                        ? `0 0 18px ${color}14,inset 0 1px 0 ${color}18`
                        : 'none',
                  }}
                >
                  {/* توهج سديمي داخلي */}
                  {(isActive || isUserCity) && !isMobile && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{
                        background: `radial-gradient(circle at 50% 60%,${color}28 0%,transparent 70%)`,
                        filter: 'blur(8px)',
                      }}
                      animate={{ opacity: isActive ? [0.3, 0.65, 0.3] : [0.18, 0.35, 0.18] }}
                      transition={{ duration: isActive ? 5 : 7, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {/* اسم + إيموجي */}
                  <div className="relative flex items-center gap-1">
                    <span className="text-[0.75rem] leading-none">{city.emoji}</span>
                    <span
                      className={`ksa-clocks-city-name hidden text-[0.62rem] font-semibold leading-none sm:block ${isActive || isUserCity ? 'text-white/95' : 'text-slate-400/60'}`}
                    >
                      {city.nameAr}
                    </span>
                  </div>

                  {/* الحرارة */}
                  <div className="relative flex items-center gap-0.5">
                    {(isHottest || isCoolest) && (
                      <span className="text-[0.48rem] leading-none" style={{ color }}>
                        {isHottest ? '▲' : '▼'}
                      </span>
                    )}
                    <span
                      className="font-mono text-[0.88rem] font-black tabular-nums leading-none sm:text-[0.95rem]"
                      style={{ color }}
                    >
                      {temp}°
                    </span>
                  </div>

                  {/* شارة «أنت» */}
                  {isUserCity && (
                    <span
                      className="absolute -top-2.5 left-1/2 hidden -translate-x-1/2 rounded-full px-1.5 py-px text-[0.44rem] font-bold sm:inline"
                      style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}
                    >
                      أنت
                    </span>
                  )}

                  {/* توهج سفلي للمدينة النشطة */}
                  {isActive && !isMobile && (
                    <motion.div
                      className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-8 -translate-x-1/2 rounded-full"
                      style={{
                        background: `radial-gradient(ellipse at center,${color} 0%,${color}44 40%,transparent 72%)`,
                        filter: 'blur(5px)',
                      }}
                      animate={{ opacity: [0.18, 0.5, 0.18], scaleX: [0.85, 1.15, 0.85] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* يسار: بطاقة الطقس الزجاجية */}
        <div
          className="relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-2 sm:px-4 sm:py-2.5"
          style={{
            borderColor: `${regionColor}38`,
            background: `linear-gradient(135deg,${regionColor}16 0%,${regionColor}09 60%,transparent 100%)`,
            boxShadow: `0 0 24px ${regionColor}14,inset 0 1px 0 ${regionColor}20`,
            backdropFilter: isMobile ? 'none' : 'blur(12px)',
          }}
          title={
            coordsFromDevice
              ? `درجة الحرارة قرب ${userRegion.city.nameAr} — مدينة مرجعية للاستعلام`
              : `درجة الحرارة في ${userRegion.city.nameAr} — مرجع افتراضي حتى بدء الاستعلام`
          }
        >
          {/* توهج خلفي للبطاقة */}
          {!isMobile ? (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ background: `radial-gradient(ellipse 80% 90% at 50% 50%,${regionColor}12,transparent)` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : null}

          {/* أيقونة الحرارة */}
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
            style={{
              borderColor: `${regionColor}35`,
              background: `${regionColor}18`,
              boxShadow: `0 0 14px ${regionColor}20`,
            }}
          >
            <Thermometer className="h-5 w-5" style={{ color: regionColor }} />
          </div>

          {/* البيانات */}
          <div className="relative flex flex-col items-end leading-none gap-1">
            <div className="flex items-baseline gap-1">
              <span
                className="font-mono text-[1.35rem] font-black tabular-nums sm:text-[1.5rem]"
                style={{ color: regionColor, textShadow: `0 0 18px ${regionColor}60` }}
              >
                {weatherLoading ? '…' : `${regionTempValue}°`}
              </span>
              <span className="ksa-clocks-weather-unit mb-0.5 text-[0.62rem] font-bold text-slate-400/80">C</span>
            </div>
            <div className="flex items-center gap-1">
              {coordsFromDevice && (
                <MapPin className="h-2.5 w-2.5 shrink-0 opacity-70" style={{ color: regionColor }} aria-hidden />
              )}
              <span className="ksa-clocks-weather-city text-[0.62rem] font-bold text-slate-200/85">
                {userRegion.city.nameAr}
              </span>
            </div>
            <span className="ksa-clocks-weather-meta text-[0.5rem] font-medium text-slate-500">
              {coordsFromDevice ? 'منطقتك · ' : ''}{riyadhMonth}
            </span>
          </div>
        </div>

      </div>

      {/* ── توهج سديمي عند تغيير المدينة ─── */}
      <motion.div
        key={activeCityIdx}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.12 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(ellipse 50% 130% at 50% 50%,${tempColor(displayTemps[activeCityIdx])}12,transparent 70%)`,
          filter: 'blur(12px)',
        }}
      />
    </div>
  );
}
