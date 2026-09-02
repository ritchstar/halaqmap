/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق خضارنا1 — وسم store_produce_live، 1350 أو 2500 ر.س. صندوق الملاحظة مدرج.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';
import { parseShopLogoSrc } from './storeShopLogo.js';
import { parseVendorMode, type StoreVendorMode } from './storeMobileVendor.js';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, publicShopPlaceFields, type ShopPickupPlace } from './storeShopPlace.js';

export const STORE_PRODUCE_LIVE_TABLE = 'store_produce_live_orders' as const;
export const STORE_PRODUCE_LIVE_PRODUCT = 'store_produce_live' as const;
export const STORE_PRODUCE_LIVE_PRICE_6_SAR = 1350 as const;
export const STORE_PRODUCE_LIVE_PRICE_12_SAR = 2500 as const;
export const STORE_PRODUCE_LIVE_PRICE_6_HALALAS = 135000 as const;
export const STORE_PRODUCE_LIVE_PRICE_12_HALALAS = 250000 as const;
export const STORE_PRODUCE_LIVE_DAYS_6 = 180 as const;
export const STORE_PRODUCE_LIVE_DAYS_12 = 360 as const;
export const STORE_PRODUCE_LIVE_POLICY = '2026-08-29' as const;
export const STORE_PRODUCE_TRIAL_DAYS = 60 as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isProduceLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_PRODUCE_LIVE_CHECKOUT_ENABLED, true);
}

export function newProduceToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseProducePackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function producePackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_PRODUCE_LIVE_DAYS_12, priceSar: STORE_PRODUCE_LIVE_PRICE_12_SAR, priceHalalas: STORE_PRODUCE_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_PRODUCE_LIVE_DAYS_6, priceSar: STORE_PRODUCE_LIVE_PRICE_6_SAR, priceHalalas: STORE_PRODUCE_LIVE_PRICE_6_HALALAS };
}

export function produceChargeHalalas(packId: 'm6' | 'm12'): number {
  return producePackFromId(packId).priceHalalas;
}

export function producePackFromHalalas(amount: number) {
  if (amount === STORE_PRODUCE_LIVE_PRICE_12_HALALAS) return producePackFromId('m12');
  return producePackFromId('m6');
}

export function isProducePriceHalalas(amount: number): boolean {
  return amount === STORE_PRODUCE_LIVE_PRICE_6_HALALAS || amount === STORE_PRODUCE_LIVE_PRICE_12_HALALAS;
}

export function produceLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function produceLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function produceLiveInvoiceDescription(packId: 'm6' | 'm12'): string {
  return packId === 'm12' ? 'halaqmap — خضارنا1 360 يوماً' : 'halaqmap — خضارنا1 180 يوماً';
}

export function produceLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  vendorMode: StoreVendorMode = 'fixed',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_PRODUCE_LIVE_PRODUCT,
      product_type: STORE_PRODUCE_LIVE_PRODUCT,
      store_produce_token: token,
      store_produce_pack: packId,
      store_produce_kind: kind,
      store_produce_vendor: vendorMode,
    },
    affiliateCode,
  );
}

export function produceLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function produceLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_produce_token ?? meta?.storeProduceToken ?? '').trim();
}

export function produceLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = produceLiveMetaProduct(input.meta);
  if (product !== STORE_PRODUCE_LIVE_PRODUCT) return false;
  if (!input.token || produceLiveMetaToken(input.meta) !== input.token) return false;
  return isProducePriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type ProduceLiveOrderPayload = {
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
  chatIncluded: boolean;
  chats: unknown[];
} & StoreShopHoursState & ShopPickupPlace;

export function parseProduceLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; vendorMode: StoreVendorMode; payload: ProduceLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة ولوحة الصندوق.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم المحل مطلوب.' };
  const packId = parseProducePackId(body.packId);
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
      blurbAr: clip(body.blurbAr, 200) || 'خضارنا1: اطلب صندوق اليوم من جوالك.',
      customFields: Array.from({ length: 5 }, () => ''),
      flashAr: '',
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

export function parseProduceChat(raw: unknown, forcedFrom?: 'buyer' | 'desk'): Record<string, unknown> | null {
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

export function parseProduceChats(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => parseProduceChat(item)).filter(Boolean).slice(0, 200);
}

export function publicProducePayload(payload: ProduceLiveOrderPayload, role = 'shop') {
  return {
    packId: parseProducePackId(payload.packId),
    shopName: payload.shopName,
    logoSrc: parseShopLogoSrc(payload.logoSrc),
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 5) : [],
    flashAr: payload.flashAr,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    orderArchive: role === 'desk' && Array.isArray(payload.orderArchive) ? payload.orderArchive.slice(0, 1000) : [],
    chatIncluded: payload.chatIncluded !== false,
    chats: parseProduceChats(payload.chats),
    ...parseStoreShopHours(payload),
    ...publicShopPlaceFields(role, parseShopPickupPlace(payload)),
  };
}
