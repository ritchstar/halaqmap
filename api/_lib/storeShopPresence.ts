/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نبض حضور مجهول لصفحات الحي الأربع. بلا اسم ولا هاتف ولا دفتر زيارات.
 */
import { cafeLiveIsExpired, STORE_CAFE_LIVE_TABLE } from './storeCafeLive.js';
import { grocersLiveIsExpired, STORE_GROCERS_LIVE_TABLE } from './storeGrocersLive.js';
import { kitchenLiveIsExpired, STORE_KITCHEN_LIVE_TABLE } from './storeKitchenLive.js';
import { produceLiveIsExpired, STORE_PRODUCE_LIVE_TABLE } from './storeProduceLive.js';
import { restaurantLiveIsExpired, STORE_RESTAURANT_LIVE_TABLE } from './storeRestaurantLive.js';

export const STORE_SHOP_PRESENCE_TABLE = 'store_shop_presence' as const;
export const STORE_SHOP_PRESENCE_TTL_MS = 45_000 as const;

export const STORE_SHOP_PRESENCE_TAGS = [
  'store_grocers_live',
  'store_restaurant_live',
  'store_cafe_live',
  'store_kitchen_live',
  'store_produce_live',
] as const;

export type StoreShopPresenceTag = (typeof STORE_SHOP_PRESENCE_TAGS)[number];

export const STORE_SHOP_PRESENCE_LAB_TOKENS = new Set([
  'grocers-lab',
  'restaurant-lab',
  'cafe-lab',
  'kitchen-lab',
  'produce-lab',
]);

const SHOP: Record<
  StoreShopPresenceTag,
  {
    table: string;
    isExpired: (expiresAt: string | null | undefined, nowMs?: number) => boolean;
  }
> = {
  store_grocers_live: { table: STORE_GROCERS_LIVE_TABLE, isExpired: grocersLiveIsExpired },
  store_restaurant_live: { table: STORE_RESTAURANT_LIVE_TABLE, isExpired: restaurantLiveIsExpired },
  store_cafe_live: { table: STORE_CAFE_LIVE_TABLE, isExpired: cafeLiveIsExpired },
  store_kitchen_live: { table: STORE_KITCHEN_LIVE_TABLE, isExpired: kitchenLiveIsExpired },
  store_produce_live: { table: STORE_PRODUCE_LIVE_TABLE, isExpired: produceLiveIsExpired },
};

export function parseStoreShopPresenceTag(raw: unknown): StoreShopPresenceTag | null {
  const value = String(raw || '').trim();
  return STORE_SHOP_PRESENCE_TAGS.includes(value as StoreShopPresenceTag)
    ? (value as StoreShopPresenceTag)
    : null;
}

export function isStoreShopPresenceLabToken(token: string): boolean {
  return STORE_SHOP_PRESENCE_LAB_TOKENS.has(token.trim());
}

export function isStoreShopPresenceVisitorKey(raw: unknown): boolean {
  return /^[a-z0-9]{16,40}$/.test(String(raw || '').trim());
}

export function isStoreShopPresenceLiveToken(raw: unknown): boolean {
  const token = String(raw || '').trim();
  if (token.length < 16 || token.length > 80) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return false;
  return !isStoreShopPresenceLabToken(token);
}

export function storeShopPresenceOrdersTable(tag: StoreShopPresenceTag): string {
  return SHOP[tag].table;
}

export function storeShopPresenceIsExpired(
  tag: StoreShopPresenceTag,
  expiresAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  return SHOP[tag].isExpired(expiresAt, nowMs);
}

export function storeShopRowIsLive(
  tag: StoreShopPresenceTag,
  row: { status?: string | null; expires_at?: string | null },
  nowMs = Date.now(),
): boolean {
  if (String(row.status || '').trim() !== 'live') return false;
  return !storeShopPresenceIsExpired(tag, row.expires_at, nowMs);
}

export function storeShopPresenceStaleIso(nowMs = Date.now()): string {
  return new Date(nowMs - STORE_SHOP_PRESENCE_TTL_MS).toISOString();
}
