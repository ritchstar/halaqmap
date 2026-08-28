/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق طبختنا1 — وسم store_kitchen_live، 300 أو 600 ر.س، بلا صندوق محادثة.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';

export const STORE_KITCHEN_LIVE_TABLE = 'store_kitchen_live_orders' as const;
export const STORE_KITCHEN_LIVE_PRODUCT = 'store_kitchen_live' as const;
export const STORE_KITCHEN_LIVE_PRICE_6_SAR = 300 as const;
export const STORE_KITCHEN_LIVE_PRICE_12_SAR = 600 as const;
export const STORE_KITCHEN_LIVE_PRICE_6_HALALAS = 30000 as const;
export const STORE_KITCHEN_LIVE_PRICE_12_HALALAS = 60000 as const;
export const STORE_KITCHEN_LIVE_DAYS_6 = 180 as const;
export const STORE_KITCHEN_LIVE_DAYS_12 = 360 as const;
export const STORE_KITCHEN_LIVE_POLICY = '2026-08-27' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isKitchenLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_KITCHEN_LIVE_CHECKOUT_ENABLED, true);
}

export function newKitchenToken(): string {
  return randomBytes(24).toString('base64url');
}

export function newKitchenQrStamp(): string {
  return `k${randomBytes(6).toString('hex')}`;
}

export function parseKitchenPackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function kitchenPackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_KITCHEN_LIVE_DAYS_12, priceSar: STORE_KITCHEN_LIVE_PRICE_12_SAR, priceHalalas: STORE_KITCHEN_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_KITCHEN_LIVE_DAYS_6, priceSar: STORE_KITCHEN_LIVE_PRICE_6_SAR, priceHalalas: STORE_KITCHEN_LIVE_PRICE_6_HALALAS };
}

export function kitchenChargeHalalas(packId: 'm6' | 'm12'): number {
  return kitchenPackFromId(packId).priceHalalas;
}

export function kitchenPackFromHalalas(amount: number) {
  if (amount === STORE_KITCHEN_LIVE_PRICE_12_HALALAS) return kitchenPackFromId('m12');
  return kitchenPackFromId('m6');
}

export function isKitchenPriceHalalas(amount: number): boolean {
  return amount === STORE_KITCHEN_LIVE_PRICE_6_HALALAS || amount === STORE_KITCHEN_LIVE_PRICE_12_HALALAS;
}

export function kitchenLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function kitchenLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function kitchenLiveInvoiceDescription(packId: 'm6' | 'm12'): string {
  return packId === 'm12' ? 'halaqmap — طبختنا1 360 يوماً' : 'halaqmap — طبختنا1 180 يوماً';
}

export function kitchenLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_KITCHEN_LIVE_PRODUCT,
      product_type: STORE_KITCHEN_LIVE_PRODUCT,
      store_kitchen_token: token,
      store_kitchen_pack: packId,
      store_kitchen_kind: kind,
    },
    affiliateCode,
  );
}

export function kitchenLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function kitchenLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_kitchen_token ?? meta?.storeKitchenToken ?? '').trim();
}

export function kitchenLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = kitchenLiveMetaProduct(input.meta);
  if (product !== STORE_KITCHEN_LIVE_PRODUCT) return false;
  if (!input.token || kitchenLiveMetaToken(input.meta) !== input.token) return false;
  return isKitchenPriceHalalas(input.amount);
}

export const DEFAULT_KITCHEN_PICKUP = {
  pickupLat: 0,
  pickupLng: 0,
  pickupMapsUrl: '',
  pickupPlaceVisible: false,
} as const;

function clipKitchenMapsUrl(raw: unknown): string {
  const value = String(raw ?? '').trim().slice(0, 240);
  if (!value) return '';
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'maps.google.com' || host === 'maps.app.goo.gl') return value;
    if (host === 'google.com' && parsed.pathname.startsWith('/maps')) return value;
  } catch {
    return '';
  }
  return '';
}

export function parseKitchenPickupPlace(
  raw: Record<string, unknown> | KitchenLiveOrderPayload | null | undefined,
  fallback = DEFAULT_KITCHEN_PICKUP,
) {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const lat = Number(row.pickupLat);
  const lng = Number(row.pickupLng);
  return {
    pickupLat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : fallback.pickupLat,
    pickupLng: Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : fallback.pickupLng,
    pickupMapsUrl: clipKitchenMapsUrl(row.pickupMapsUrl) || fallback.pickupMapsUrl,
    pickupPlaceVisible: row.pickupPlaceVisible === true,
  };
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type KitchenLiveOrderPayload = {
  packId: 'm6' | 'm12';
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  opsPhone: string;
  acceptingOrders: boolean;
  scheduleEnabled: boolean;
  deliveryFee: number;
  showSoldOut: boolean;
  qrStamp: string;
  qrActive: boolean;
  shelf: unknown[];
  orders: unknown[];
  nextTicket: number;
  pickupLat: number;
  pickupLng: number;
  pickupMapsUrl: string;
  pickupPlaceVisible: boolean;
  gift?: boolean;
  giftLabelAr?: string;
  issuedByLabel?: string;
  giftClockFromFirstVisit?: boolean;
  giftStartedAt?: string;
  giftConvertedAt?: string;
} & StoreShopHoursState;

export function isKitchenGiftPayload(payload: Record<string, unknown> | KitchenLiveOrderPayload | null | undefined): boolean {
  if (!payload) return false;
  const raw = payload as Record<string, unknown>;
  return raw.gift === true || String(raw.issuedByLabel || '').trim() === 'هدية طبختنا1';
}

export function parseKitchenLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; payload: KitchenLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة ولوحة النشاط.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم النشاط مطلوب.' };
  const packId = parseKitchenPackId(body.packId);
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80) || shopName,
    packId,
    payload: {
      packId,
      shopName,
      hostName,
      blurbAr: clip(body.blurbAr, 200) || 'طبختنا1: أصناف البيت من الجوال إلى النشاط.',
      customFields: Array.from({ length: 5 }, () => ''),
      flashAr: '',
      opsPhone: '',
      acceptingOrders: true,
      scheduleEnabled: false,
      deliveryFee: 0,
      showSoldOut: false,
      qrStamp: newKitchenQrStamp(),
      qrActive: true,
      shelf: [],
      orders: [],
      nextTicket: 1,
      ...DEFAULT_KITCHEN_PICKUP,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
  };
}

function orderIdempotencyKey(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  return clip((raw as Record<string, unknown>).idempotencyKey, 80);
}

export function kitchenOrderAlreadyStored(orders: unknown[], incoming: unknown): boolean {
  const key = orderIdempotencyKey(incoming);
  if (!key) return false;
  return orders.some((item) => orderIdempotencyKey(item) === key);
}

export function publicKitchenPayload(payload: KitchenLiveOrderPayload, role = 'shop') {
  const pickup = parseKitchenPickupPlace(payload);
  const showPickup = role === 'desk' || role === 'host' || pickup.pickupPlaceVisible;
  return {
    packId: parseKitchenPackId(payload.packId),
    shopName: payload.shopName,
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 5) : [],
    flashAr: payload.flashAr,
    opsPhone: String(payload.opsPhone || ''),
    acceptingOrders: payload.acceptingOrders !== false,
    scheduleEnabled: payload.scheduleEnabled === true,
    deliveryFee: Number(payload.deliveryFee) >= 0 ? Number(payload.deliveryFee) : 0,
    showSoldOut: payload.showSoldOut === true,
    qrStamp: String(payload.qrStamp || ''),
    qrActive: payload.qrActive !== false,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    nextTicket: Number(payload.nextTicket) > 0 ? Number(payload.nextTicket) : 1,
    gift: payload.gift === true,
    giftLabelAr: String(payload.giftLabelAr || ''),
    issuedByLabel: String(payload.issuedByLabel || ''),
    giftClockFromFirstVisit: payload.giftClockFromFirstVisit === true,
    giftStartedAt: String(payload.giftStartedAt || ''),
    pickupLat: showPickup ? pickup.pickupLat : 0,
    pickupLng: showPickup ? pickup.pickupLng : 0,
    pickupMapsUrl: showPickup ? pickup.pickupMapsUrl : '',
    pickupPlaceVisible: pickup.pickupPlaceVisible,
    ...parseStoreShopHours(payload),
  };
}
