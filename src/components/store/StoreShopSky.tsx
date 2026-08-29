/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طبقة سماء خلف متجر الحي. بلا نقر، بلا فيديو، بلا تتبع موقع الجار.
 * لا يُستورد من App.
 */
import { useEffect, useState } from 'react';
import { usePlatformAmbientOptional } from '@/context/PlatformAmbientContext';
import { resolveAmbientPhaseFromRiyadhTime } from '@/lib/riyadhAmbientPhase';
import {
  resolveShopSkyWeatherPoint,
  shopSkyFrameIsHallPanorama,
  storeShopSkyImageOpacity,
  storeShopSkyIntervalMs,
  storeShopSkySources,
  storeShopSkyTempChipLabel,
  storeShopSkyTempWash,
  storeShopSkyVeilOpacity,
  storeShopSkyWash,
} from '@/lib/storeShopSky';
import { fetchTemperatureCelsius } from '@/lib/userRegionWeather';
import { cn } from '@/lib/utils';
import {
  STORE_SHOP_SKY_TEMP_CHIP_ARIA_AR,
  STORE_SHOP_SKY_TEMP_REFRESH_MS,
  type StoreShopSkyProduct,
  type StoreShopSkySurface,
} from '@/config/storeShopSky';

export function StoreShopSky({
  product,
  surface = 'shop',
  lat,
  lng,
}: {
  product: StoreShopSkyProduct;
  surface?: StoreShopSkySurface;
  lat?: number;
  lng?: number;
}) {
  const ambient = usePlatformAmbientOptional();
  const [clockPhase, setClockPhase] = useState(() => resolveAmbientPhaseFromRiyadhTime());
  const phase = ambient?.effectivePhase ?? clockPhase;
  const frames = storeShopSkySources(product, phase).filter((src) => !shopSkyFrameIsHallPanorama(src));
  const [index, setIndex] = useState(0);
  const current = frames[index] ?? frames[0];
  const next = frames.length > 1 ? frames[(index + 1) % frames.length] : null;
  const shown = next && next !== current ? [current, next] : current ? [current] : [];
  const imageOpacity = storeShopSkyImageOpacity(surface);
  const veil = storeShopSkyVeilOpacity(surface, phase);
  const wash = storeShopSkyWash(phase);
  const intervalMs = storeShopSkyIntervalMs(surface);
  const weatherPoint = resolveShopSkyWeatherPoint(lat, lng);
  const [tempC, setTempC] = useState<number | null>(null);

  useEffect(() => {
    if (ambient) return undefined;
    const tick = () => setClockPhase(resolveAmbientPhaseFromRiyadhTime());
    const timer = window.setInterval(tick, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ambient]);

  useEffect(() => {
    setIndex(0);
  }, [product, phase, surface]);

  useEffect(() => {
    if (frames.length < 2) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % frames.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [frames.length, intervalMs]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetchTemperatureCelsius(weatherPoint.lat, weatherPoint.lng).then((next) => {
        if (!cancelled) setTempC(next);
      });
    };
    load();
    const timer = window.setInterval(load, STORE_SHOP_SKY_TEMP_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [weatherPoint.lat, weatherPoint.lng]);

  return (
    <>
    <div
      className="store-shop-sky pointer-events-none fixed inset-0 z-0 overflow-hidden"
      data-store-shop-sky={product}
      data-store-shop-sky-surface={surface}
      data-ambient-phase={phase}
      data-shop-sky-from-pin={weatherPoint.fromPin ? '1' : '0'}
      aria-hidden
    >
      {shown.map((src) => (
        <img
          key={`${phase}-${src}`}
          src={src}
          alt=""
          className={cn(
            'store-shop-sky__shot absolute inset-0 h-full w-full object-cover',
            src === current ? 'opacity-[var(--shop-sky-shot)]' : 'opacity-0',
          )}
          style={{ ['--shop-sky-shot' as string]: String(imageOpacity) }}
          loading={src === current ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
      <div className="absolute inset-0" style={{ background: wash }} />
      {tempC != null ? <div className="absolute inset-0" style={{ background: storeShopSkyTempWash(tempC) }} /> : null}
      <div
        className="store-shop-sky__veil absolute inset-0"
        style={{ background: `rgba(5, 3, 8, ${veil})` }}
      />
    </div>
    {tempC != null ? (
      <p
        className="store-shop-sky-chip pointer-events-none fixed left-3 top-3 z-20"
        data-store-shop-sky-chip="1"
        aria-label={STORE_SHOP_SKY_TEMP_CHIP_ARIA_AR}
      >
        <span dir="ltr">{storeShopSkyTempChipLabel(tempC)}</span>
      </p>
    ) : null}
    </>
  );
}
