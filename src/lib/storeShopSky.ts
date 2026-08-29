/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اختيار لقطات السماء وعزل صور القاعات. لا يُستورد من App.
 */
import type { AmbientPhaseId } from '@/config/platformAmbientPhases';
import {
  STORE_SHOP_SKY_IMAGE_OPACITY,
  STORE_SHOP_SKY_INTERVAL_MS,
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
