/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اختيار لقطات السماء وعزل صور القاعات. لا يُستورد من App.
 */
import type { AmbientPhaseId } from '@/config/platformAmbientPhases';
import {
  STORE_SHOP_SKY_IMAGE_OPACITY,
  STORE_SHOP_SKY_INTERVAL_MS,
  STORE_SHOP_SKY_RIYADH,
  STORE_SHOP_SKY_TEMP_WASH,
  STORE_SHOP_SKY_VEIL,
  STORE_SHOP_SKY_WASH,
  storeShopSkyFrames,
  type StoreShopSkyProduct,
  type StoreShopSkySurface,
} from '@/config/storeShopSky';

export function storeShopSkyIntervalMs(surface: StoreShopSkySurface): number {
  return STORE_SHOP_SKY_INTERVAL_MS[surface];
}

export function storeShopSkyWash(phase: AmbientPhaseId): string {
  return STORE_SHOP_SKY_WASH[phase];
}

export function storeShopSkyImageOpacity(surface: StoreShopSkySurface): number {
  return STORE_SHOP_SKY_IMAGE_OPACITY[surface];
}

export function storeShopSkyVeilOpacity(
  surface: StoreShopSkySurface,
  phase: AmbientPhaseId,
): number {
  return STORE_SHOP_SKY_VEIL[surface][phase];
}

export function storeShopSkySources(
  product: StoreShopSkyProduct,
  phase: AmbientPhaseId,
): readonly string[] {
  return storeShopSkyFrames(product, phase);
}

export function shopSkyFrameIsHallPanorama(src: string): boolean {
  return src.includes('/images/store/live/pano-') || src.includes('lab-wedding-panorama');
}

export function shopSkyHasPin(lat?: number, lng?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) > 0.2 &&
    Math.abs(lng) > 0.2 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function resolveShopSkyWeatherPoint(lat?: number, lng?: number): {
  lat: number;
  lng: number;
  fromPin: boolean;
} {
  if (shopSkyHasPin(lat, lng)) return { lat: lat as number, lng: lng as number, fromPin: true };
  return { lat: STORE_SHOP_SKY_RIYADH.lat, lng: STORE_SHOP_SKY_RIYADH.lng, fromPin: false };
}

export function storeShopSkyTempBand(temp: number): keyof typeof STORE_SHOP_SKY_TEMP_WASH {
  if (temp <= 22) return 'cool';
  if (temp <= 28) return 'mild';
  if (temp <= 32) return 'warm';
  if (temp <= 36) return 'hot';
  return 'harsh';
}

export function storeShopSkyTempWash(temp: number): string {
  return STORE_SHOP_SKY_TEMP_WASH[storeShopSkyTempBand(temp)];
}

export function storeShopSkyTempChipLabel(temp: number): string {
  return `${Math.round(temp)}°`;
}
