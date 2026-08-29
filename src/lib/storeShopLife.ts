/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  STORE_SHOP_LIGHT_STORAGE_KEY,
  STORE_SHOP_LIGHT_ZONES,
  type StoreShopLightZone,
} from '@/config/storeShopLife';

export function isStoreShopLightZone(raw: string): raw is StoreShopLightZone {
  return (STORE_SHOP_LIGHT_ZONES as readonly string[]).includes(raw);
}

export function readStoreShopLightZone(): StoreShopLightZone {
  if (typeof window === 'undefined') return 'mid';
  try {
    const raw = window.sessionStorage.getItem(STORE_SHOP_LIGHT_STORAGE_KEY) || '';
    if (isStoreShopLightZone(raw)) return raw;
  } catch {
    /* بلا تخزين */
  }
  return 'mid';
}

export function writeStoreShopLightZone(zone: StoreShopLightZone): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORE_SHOP_LIGHT_STORAGE_KEY, zone);
  } catch {
    /* بلا تخزين */
  }
}
