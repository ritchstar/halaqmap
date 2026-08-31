/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نبض حضور مجهول لصفحات الحي. لا يُستورد من App.
 * عبارة اللوحة فقط، بلا محاذير بجانبها.
 */
export const STORE_SHOP_PRESENCE_LABEL_AR = 'عدد المتواجدون الان';

export const STORE_SHOP_PRESENCE_TTL_MS = 75_000 as const;
export const STORE_SHOP_PRESENCE_PING_MS = 30_000 as const;

export const STORE_SHOP_PRESENCE_TAGS = [
  'store_grocers_live',
  'store_restaurant_live',
  'store_cafe_live',
  'store_kitchen_live',
  'store_produce_live',
] as const;

export type StoreShopPresenceTag = (typeof STORE_SHOP_PRESENCE_TAGS)[number];

export const STORE_SHOP_PRESENCE_LAB_TOKENS = [
  'grocers-lab',
  'restaurant-lab',
  'cafe-lab',
  'kitchen-lab',
  'produce-lab',
] as const;

export function isStoreShopPresenceTag(raw: unknown): raw is StoreShopPresenceTag {
  return STORE_SHOP_PRESENCE_TAGS.includes(String(raw || '').trim() as StoreShopPresenceTag);
}

export function isStoreShopPresenceLabToken(token: string): boolean {
  return (STORE_SHOP_PRESENCE_LAB_TOKENS as readonly string[]).includes(token.trim());
}
