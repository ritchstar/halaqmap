/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سماء متجر الحي: تمويناتا1 وخضارنا1 فقط. كل منتج بصوره.
 * لا قاعات زواج ولا بانوراما اللاونج. لا يُستورد من App.
 */
import type { AmbientPhaseId } from '@/config/platformAmbientPhases';
import {
  STORE_GROCERS_MARKETING_FRAMES,
  STORE_PRODUCE_MARKETING_FRAMES,
} from '@/config/storeMarketingReels';

export type StoreShopSkyProduct = 'grocers' | 'produce';
export type StoreShopSkySurface = 'shop' | 'desk';

export const STORE_SHOP_SKY_INTERVAL_MS = {
  shop: 12_000,
  desk: 16_000,
} as const;

/** مؤشرات داخل شريط المنتج — أربع لقطات لكل مرحلة. */
export const STORE_SHOP_SKY_PHASE_INDEXES: Record<AmbientPhaseId, readonly number[]> = {
  fajr: [0, 1, 2, 3],
  dhuhr: [3, 4, 5, 6],
  ghuroob: [6, 7, 2, 1],
  layl: [8, 0, 7, 5],
};

export const STORE_SHOP_SKY_WASH: Record<AmbientPhaseId, string> = {
  fajr: 'rgba(251, 146, 60, 0.20)',
  dhuhr: 'rgba(20, 184, 166, 0.12)',
  ghuroob: 'rgba(245, 158, 11, 0.22)',
  layl: 'rgba(15, 23, 42, 0.38)',
};

export const STORE_SHOP_SKY_IMAGE_OPACITY: Record<StoreShopSkySurface, number> = {
  shop: 0.34,
  desk: 0.16,
};

export const STORE_SHOP_SKY_VEIL: Record<StoreShopSkySurface, Record<AmbientPhaseId, number>> = {
  shop: {
    fajr: 0.78,
    dhuhr: 0.74,
    ghuroob: 0.80,
    layl: 0.84,
  },
  desk: {
    fajr: 0.90,
    dhuhr: 0.88,
    ghuroob: 0.91,
    layl: 0.93,
  },
};

const BANKS: Record<StoreShopSkyProduct, readonly string[]> = {
  grocers: STORE_GROCERS_MARKETING_FRAMES,
  produce: STORE_PRODUCE_MARKETING_FRAMES,
};

export function storeShopSkyBank(product: StoreShopSkyProduct): readonly string[] {
  return BANKS[product];
}

export function storeShopSkyFrames(
  product: StoreShopSkyProduct,
  phase: AmbientPhaseId,
): readonly string[] {
  const bank = BANKS[product];
  const picks = STORE_SHOP_SKY_PHASE_INDEXES[phase];
  return picks.map((index) => bank[index % bank.length]);
}
