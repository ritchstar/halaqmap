/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق تموينات الحي — وسم store_grocers_live، 599 أو 899 ر.س فقط.
 */
import { randomBytes } from 'node:crypto';

export const STORE_GROCERS_LIVE_TABLE = 'store_grocers_live_orders' as const;
export const STORE_GROCERS_LIVE_PRODUCT = 'store_grocers_live' as const;
export const STORE_GROCERS_LIVE_PRICE_6_SAR = 599 as const;
export const STORE_GROCERS_LIVE_PRICE_12_SAR = 899 as const;
export const STORE_GROCERS_LIVE_PRICE_6_HALALAS = 59900 as const;
export const STORE_GROCERS_LIVE_PRICE_12_HALALAS = 89900 as const;
export const STORE_GROCERS_LIVE_DAYS_6 = 180 as const;
export const STORE_GROCERS_LIVE_DAYS_12 = 365 as const;
export const STORE_GROCERS_LIVE_POLICY = '2026-08-22' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isGrocersLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_GROCERS_LIVE_CHECKOUT_ENABLED, true);
}

export function newGrocersToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseGrocersPackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function grocersPackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_GROCERS_LIVE_DAYS_12, priceSar: STORE_GROCERS_LIVE_PRICE_12_SAR, priceHalalas: STORE_GROCERS_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_GROCERS_LIVE_DAYS_6, priceSar: STORE_GROCERS_LIVE_PRICE_6_SAR, priceHalalas: STORE_GROCERS_LIVE_PRICE_6_HALALAS };
}

export function grocersPackFromHalalas(amount: number) {
  if (amount === STORE_GROCERS_LIVE_PRICE_12_HALALAS) return grocersPackFromId('m12');
  return grocersPackFromId('m6');
}

export function isGrocersPriceHalalas(amount: number): boolean {
  return amount === STORE_GROCERS_LIVE_PRICE_6_HALALAS || amount === STORE_GROCERS_LIVE_PRICE_12_HALALAS;
}

export function grocersLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function grocersLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function grocersLiveInvoiceDescription(packId: 'm6' | 'm12'): string {
  return packId === 'm12' ? 'halaqmap — تموينات الحي 12 شهراً' : 'halaqmap — تموينات الحي 6 أشهر';
}

export function grocersLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
): Record<string, string> {
  return {
    product: STORE_GROCERS_LIVE_PRODUCT,
    product_type: STORE_GROCERS_LIVE_PRODUCT,
    store_grocers_token: token,
    store_grocers_pack: packId,
    store_grocers_kind: kind,
  };
}

export function grocersLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function grocersLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_grocers_token ?? meta?.storeGrocersToken ?? '').trim();
}

export function grocersLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  if (grocersLiveMetaProduct(input.meta) !== STORE_GROCERS_LIVE_PRODUCT) return false;
  if (grocersLiveMetaProduct(input.meta) === 'store_occasion_card') return false;
  if (grocersLiveMetaProduct(input.meta) === 'store_wedding_live') return false;
  if (grocersLiveMetaProduct(input.meta) === 'store_event_live') return false;
  if (grocersLiveMetaProduct(input.meta) === 'store_lounge_live') return false;
  if (!input.token || grocersLiveMetaToken(input.meta) !== input.token) return false;
  return isGrocersPriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type GrocersLiveOrderPayload = {
  packId: 'm6' | 'm12';
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  shelf: unknown[];
  orders: unknown[];
};

export function parseGrocersLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; payload: GrocersLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط المتجر والكاشير.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم التموينات مطلوب.' };
  const packId = parseGrocersPackId(body.packId);
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80) || shopName,
    packId,
    payload: {
      packId,
      shopName,
      hostName,
      blurbAr: clip(body.blurbAr, 200) || 'تموينات الحي: اطلب من جوالك.',
      customFields: Array.from({ length: 5 }, () => ''),
      flashAr: '',
      shelf: [],
      orders: [],
    },
  };
}

export function publicGrocersPayload(payload: GrocersLiveOrderPayload) {
  return {
    packId: parseGrocersPackId(payload.packId),
    shopName: payload.shopName,
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 5) : [],
    flashAr: payload.flashAr,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
  };
}
