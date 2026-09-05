/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق مطعمنا1 — وسم store_restaurant_live، 699 أو 999 ر.س، وصندوق المحادثة مدرج.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';
import { parseShopLogoSrc } from './storeShopLogo.js';
import { isMobileVendorPriceHalalas, mobileVendorChargeHalalas, mobileVendorPackFromHalalas, parseVendorMode, type StoreVendorMode } from './storeMobileVendor.js';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, publicShopPlaceFields, type ShopPickupPlace } from './storeShopPlace.js';

export const STORE_RESTAURANT_LIVE_TABLE = 'store_restaurant_live_orders' as const;
export const STORE_RESTAURANT_LIVE_PRODUCT = 'store_restaurant_live' as const;
export const STORE_RESTAURANT_LIVE_PRICE_6_SAR = 699 as const;
export const STORE_RESTAURANT_LIVE_PRICE_12_SAR = 999 as const;
export const STORE_RESTAURANT_LIVE_PRICE_6_HALALAS = 69900 as const;
export const STORE_RESTAURANT_LIVE_PRICE_12_HALALAS = 99900 as const;
export const STORE_RESTAURANT_LIVE_DAYS_6 = 180 as const;
export const STORE_RESTAURANT_LIVE_DAYS_12 = 365 as const;
export const STORE_RESTAURANT_LIVE_POLICY = '2026-08-23' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isRestaurantLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED, true);
}

export function newRestaurantToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseRestaurantPackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function restaurantPackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_RESTAURANT_LIVE_DAYS_12, priceSar: STORE_RESTAURANT_LIVE_PRICE_12_SAR, priceHalalas: STORE_RESTAURANT_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_RESTAURANT_LIVE_DAYS_6, priceSar: STORE_RESTAURANT_LIVE_PRICE_6_SAR, priceHalalas: STORE_RESTAURANT_LIVE_PRICE_6_HALALAS };
}

export function restaurantChargeHalalas(packId: 'm6' | 'm12', vendorMode: StoreVendorMode = 'fixed'): number {
  return vendorMode === 'mobile' ? mobileVendorChargeHalalas(packId) : restaurantPackFromId(packId).priceHalalas;
}

export function restaurantPackFromHalalas(amount: number) {
  if (isMobileVendorPriceHalalas(amount)) return restaurantPackFromId(mobileVendorPackFromHalalas(amount));
  if (amount === STORE_RESTAURANT_LIVE_PRICE_12_HALALAS) return restaurantPackFromId('m12');
  return restaurantPackFromId('m6');
}

export function isRestaurantPriceHalalas(amount: number): boolean {
  return (
    isMobileVendorPriceHalalas(amount)
    || amount === STORE_RESTAURANT_LIVE_PRICE_6_HALALAS
    || amount === STORE_RESTAURANT_LIVE_PRICE_12_HALALAS
  );
}

export function restaurantLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function restaurantLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function restaurantLiveInvoiceDescription(packId: 'm6' | 'm12', vendorMode: StoreVendorMode = 'fixed'): string {
  if (vendorMode === 'mobile') {
    return packId === 'm12' ? 'halaqmap — مطعمنا1 متحرك 12 شهراً' : 'halaqmap — مطعمنا1 متحرك 6 أشهر';
  }
  return packId === 'm12' ? 'halaqmap — مطعمنا1 12 شهراً' : 'halaqmap — مطعمنا1 6 أشهر';
}

export function restaurantLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  vendorMode: StoreVendorMode = 'fixed',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_RESTAURANT_LIVE_PRODUCT,
      product_type: STORE_RESTAURANT_LIVE_PRODUCT,
      store_restaurant_token: token,
      store_restaurant_pack: packId,
      store_restaurant_kind: kind,
      store_restaurant_vendor: vendorMode,
    },
    affiliateCode,
  );
}

export function restaurantLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function restaurantLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_restaurant_token ?? meta?.storeRestaurantToken ?? '').trim();
}

export function restaurantLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = restaurantLiveMetaProduct(input.meta);
  if (product !== STORE_RESTAURANT_LIVE_PRODUCT) return false;
  if (!input.token || restaurantLiveMetaToken(input.meta) !== input.token) return false;
  return isRestaurantPriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type RestaurantLiveOrderPayload = {
  packId: 'm6' | 'm12';
  shopName: string;
  logoSrc?: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  shelf: unknown[];
  orders: unknown[];
  orderArchive?: unknown[];
  chatIncluded: true;
  chats: unknown[];
  nextTicket: number;
} & StoreShopHoursState & ShopPickupPlace;

export function parseRestaurantLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; vendorMode: StoreVendorMode; payload: RestaurantLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة ولوحة المطبخ.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم المطعم مطلوب.' };
  const packId = parseRestaurantPackId(body.packId);
  const vendorMode = parseVendorMode(body.vendorMode);
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80) || shopName,
    packId,
    vendorMode,
    payload: {
      packId,
      shopName,
      logoSrc: '',
      hostName,
      blurbAr: clip(body.blurbAr, 200) || 'مطعمنا1: اطلب من جوالك.',
      customFields: Array.from({ length: 6 }, () => ''),
      flashAr: '',
      shelf: [],
      orders: [],
      orderArchive: [],
      chatIncluded: true,
      chats: [],
      nextTicket: 1,
      ...DEFAULT_SHOP_PICKUP,
      vendorMode,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
  };
}

export function parseRestaurantChat(raw: unknown, forcedFrom?: 'buyer' | 'desk'): Record<string, unknown> | null {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const text = clip(row.text, 240);
  if (text.length < 2) return null;
  const from = forcedFrom || (row.from === 'desk' ? 'desk' : 'buyer');
  return {
    id: clip(row.id, 40) || `c${Date.now().toString(36)}`,
    from,
    name: clip(row.name, 40) || (from === 'desk' ? 'المطبخ' : 'ضيف الحي'),
    text,
    at: String(row.at || new Date().toISOString()).slice(0, 40),
    hidden: row.hidden === true,
  };
}

export function parseRestaurantChats(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => parseRestaurantChat(item)).filter(Boolean).slice(0, 200);
}

export function publicRestaurantPayload(payload: RestaurantLiveOrderPayload, role = 'shop') {
  return {
    packId: parseRestaurantPackId(payload.packId),
    shopName: payload.shopName,
    logoSrc: parseShopLogoSrc(payload.logoSrc),
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 6) : [],
    flashAr: payload.flashAr,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    orderArchive: role === 'desk' && Array.isArray(payload.orderArchive) ? payload.orderArchive.slice(0, 1000) : [],
    chatIncluded: true,
    chats: parseRestaurantChats(payload.chats),
    nextTicket: Number(payload.nextTicket) > 0 ? Number(payload.nextTicket) : 1,
    ...parseStoreShopHours(payload),
    ...publicShopPlaceFields(role, parseShopPickupPlace(payload)),
  };
}
