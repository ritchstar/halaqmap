/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق تمرتنا1 — وسم store_dates_live، 1350 أو 2500 ر.س. صندوق الملاحظة مدرج.
 * منتج غير مسجّل لدى الهيئة السعودية للملكية الفكرية.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';
import { parseShopLogoSrc } from './storeShopLogo.js';
import { parseVendorMode, type StoreVendorMode } from './storeMobileVendor.js';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, publicShopPlaceFields, type ShopPickupPlace } from './storeShopPlace.js';

export const STORE_DATES_LIVE_TABLE = 'store_dates_live_orders' as const;
export const STORE_DATES_LIVE_PRODUCT = 'store_dates_live' as const;
export const STORE_DATES_LIVE_PRICE_6_SAR = 1350 as const;
export const STORE_DATES_LIVE_PRICE_12_SAR = 2500 as const;
export const STORE_DATES_LIVE_PRICE_6_HALALAS = 135000 as const;
export const STORE_DATES_LIVE_PRICE_12_HALALAS = 250000 as const;
export const STORE_DATES_LIVE_DAYS_6 = 180 as const;
export const STORE_DATES_LIVE_DAYS_12 = 360 as const;
export const STORE_DATES_LIVE_POLICY = '2026-09-10' as const;
export const STORE_DATES_TRIAL_DAYS = 60 as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isDatesLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_DATES_LIVE_CHECKOUT_ENABLED, true);
}

export function newDatesToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseDatesPackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function datesPackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_DATES_LIVE_DAYS_12, priceSar: STORE_DATES_LIVE_PRICE_12_SAR, priceHalalas: STORE_DATES_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_DATES_LIVE_DAYS_6, priceSar: STORE_DATES_LIVE_PRICE_6_SAR, priceHalalas: STORE_DATES_LIVE_PRICE_6_HALALAS };
}

export function datesChargeHalalas(packId: 'm6' | 'm12'): number {
  return datesPackFromId(packId).priceHalalas;
}

export function datesPackFromHalalas(amount: number) {
  if (amount === STORE_DATES_LIVE_PRICE_12_HALALAS) return datesPackFromId('m12');
  return datesPackFromId('m6');
}

export function isDatesPriceHalalas(amount: number): boolean {
  return amount === STORE_DATES_LIVE_PRICE_6_HALALAS || amount === STORE_DATES_LIVE_PRICE_12_HALALAS;
}

export function datesLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function datesLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function datesLiveInvoiceDescription(packId: 'm6' | 'm12'): string {
  return packId === 'm12' ? 'halaqmap — تمرتنا1 360 يوماً' : 'halaqmap — تمرتنا1 180 يوماً';
}

export function datesLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  vendorMode: StoreVendorMode = 'fixed',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_DATES_LIVE_PRODUCT,
      product_type: STORE_DATES_LIVE_PRODUCT,
      store_dates_token: token,
      store_dates_pack: packId,
      store_dates_kind: kind,
      store_dates_vendor: vendorMode,
    },
    affiliateCode,
  );
}

export function datesLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function datesLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_dates_token ?? meta?.storeDatesToken ?? '').trim();
}

export function datesLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = datesLiveMetaProduct(input.meta);
  if (product !== STORE_DATES_LIVE_PRODUCT) return false;
  if (!input.token || datesLiveMetaToken(input.meta) !== input.token) return false;
  return isDatesPriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type DatesLiveOrderPayload = {
  packId: 'm6' | 'm12';
  shopName: string;
  logoSrc?: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  acceptingOrders: boolean;
  shelf: unknown[];
  orders: unknown[];
  orderArchive?: unknown[];
  chatIncluded: boolean;
  chats: unknown[];
} & StoreShopHoursState & ShopPickupPlace & {
  shopHeaderBg?: string;
  shopPageBg?: string;
};

export function parseDatesLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; vendorMode: StoreVendorMode; payload: DatesLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة ولوحة الصندوق.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم المحل مطلوب.' };
  const packId = parseDatesPackId(body.packId);
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
      blurbAr: clip(body.blurbAr, 200) || 'تمرتنا1: اطلب أصناف اليوم من جوالك.',
      customFields: Array.from({ length: 5 }, () => ''),
      flashAr: '',
      acceptingOrders: true,
      shelf: [],
      orders: [],
      orderArchive: [],
      chatIncluded: true,
      chats: [],
      ...DEFAULT_SHOP_PICKUP,
      vendorMode,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
  };
}

export function parseDatesChat(raw: unknown, forcedFrom?: 'buyer' | 'desk'): Record<string, unknown> | null {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const text = clip(row.text, 240);
  if (text.length < 2) return null;
  const from = forcedFrom || (row.from === 'desk' ? 'desk' : 'buyer');
  return {
    id: clip(row.id, 40) || `c${Date.now().toString(36)}`,
    from,
    name: clip(row.name, 40) || (from === 'desk' ? 'الصندوق' : 'جار الحي'),
    text,
    at: String(row.at || new Date().toISOString()).slice(0, 40),
    hidden: row.hidden === true,
  };
}

export function parseDatesChats(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => parseDatesChat(item)).filter(Boolean).slice(0, 200);
}

export function publicDatesPayload(payload: DatesLiveOrderPayload, role = 'shop') {
  return {
    packId: parseDatesPackId(payload.packId),
    shopName: payload.shopName,
    logoSrc: parseShopLogoSrc(payload.logoSrc),
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 5) : [],
    flashAr: payload.flashAr,
    acceptingOrders: payload.acceptingOrders !== false,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    orderArchive: role === 'desk' && Array.isArray(payload.orderArchive) ? payload.orderArchive.slice(0, 1000) : [],
    chatIncluded: payload.chatIncluded !== false,
    chats: parseDatesChats(payload.chats),
    ...parseStoreShopHours(payload),
    ...publicShopPlaceFields(role, parseShopPickupPlace(payload)),
  };
}
