/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حرارة مدن الشريط — بلا موقع جهاز الزائر.
 */
import { useEffect, useState } from 'react';
import { KSA_CITIES_GEO } from '@/config/ksaCitiesGeo';
import { fetchTemperatureCelsius } from '@/lib/userRegionWeather';

export function useKsaCityTemps() {
  const [temps, setTemps] = useState<(number | null)[]>(() => KSA_CITIES_GEO.map(() => null));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await Promise.all(KSA_CITIES_GEO.map((city) => fetchTemperatureCelsius(city.lat, city.lng)));
      if (!cancelled) {
        setTemps(next.map((temp, index) => temp ?? KSA_CITIES_GEO[index].baseTemp));
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return temps.map((temp, index) => temp ?? KSA_CITIES_GEO[index].baseTemp);
}
