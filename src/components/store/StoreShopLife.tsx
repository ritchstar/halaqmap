/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إضاءة أعلى/وسط/أسفل وشريط حرارة المدن. بلا شعار وبلا موقع جار الحي.
 */
import { useEffect, useState } from 'react';
import { KSA_CITIES_GEO } from '@/config/ksaCitiesGeo';
import {
  STORE_SHOP_LIFE_COPY,
  STORE_SHOP_LIGHT_LABEL,
  STORE_SHOP_LIGHT_ZONES,
  type StoreShopLightZone,
} from '@/config/storeShopLife';
import { useKsaCityTemps } from '@/hooks/useKsaCityTemps';
import { readStoreShopLightZone, writeStoreShopLightZone } from '@/lib/storeShopLife';
import { tempColor } from '@/lib/userRegionWeather';
import { cn } from '@/lib/utils';

function LightWash({ zone }: { zone: StoreShopLightZone }) {
  const at = zone === 'top' ? '50% 8%' : zone === 'bottom' ? '50% 92%' : '50% 48%';
  return (
    <div
      className="store-shop-light-wash pointer-events-none fixed inset-0 z-[1]"
      data-store-shop-light={zone}
      aria-hidden
      style={{
        background: `radial-gradient(ellipse 90% 42% at ${at}, rgba(232, 197, 71, 0.22), rgba(20, 184, 166, 0.08) 42%, transparent 72%)`,
      }}
    />
  );
}

export function StoreShopLife() {
  const [zone, setZone] = useState<StoreShopLightZone>(() => readStoreShopLightZone());
  const temps = useKsaCityTemps();
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % KSA_CITIES_GEO.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [held]);

  return (
    <>
      <LightWash zone={zone} />
      <div className="relative z-20 space-y-2 border-b border-white/10 bg-[#050308]/80 px-3 py-2 backdrop-blur-sm">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-none"
          role="list"
          aria-label={STORE_SHOP_LIFE_COPY.citiesAriaAr}
        >
          {KSA_CITIES_GEO.map((city, index) => {
            const temp = temps[index];
            const color = tempColor(temp);
            const lit = index === active % KSA_CITIES_GEO.length;
            return (
              <button
                key={city.id}
                type="button"
                role="listitem"
                onClick={() => {
                  setActive(index);
                  setHeld(true);
                }}
                className={cn(
                  'flex shrink-0 flex-col items-center rounded-xl px-2 py-1',
                  lit ? 'bg-white/8' : 'bg-transparent',
                )}
              >
                <span className="text-[0.62rem] text-white/70">{city.nameAr}</span>
                <span className="font-mono text-sm font-black tabular-nums" style={{ color }} dir="ltr">
                  {temp}°
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-2" role="group" aria-label={STORE_SHOP_LIFE_COPY.lightsAriaAr}>
          {STORE_SHOP_LIGHT_ZONES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setZone(item);
                writeStoreShopLightZone(item);
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                zone === item ? 'bg-[#e8c547] font-bold text-[#061018]' : 'border border-white/20 text-white/75',
              )}
            >
              {STORE_SHOP_LIGHT_LABEL[item]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
