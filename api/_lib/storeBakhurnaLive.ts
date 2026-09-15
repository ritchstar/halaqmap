/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق بخورنا1 — وسم store_bakhurna_live، 899 أو 1799 ر.س. نافذة الاستفسار مدرجة.
 * منتج غير مسجّل لدى الهيئة السعودية للملكية الفكرية.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';
import { parseShopLogoSrc } from './storeShopLogo.js';
import { parseVendorMode, type StoreVendorMode } from './storeMobileVendor.js';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, publicShopPlaceFields, type ShopPickupPlace } from './storeShopPlace.js';

export const STORE_BAKHURNA_LIVE_TABLE = 'store_bakhurna_live_orders' as const;
export const STORE_BAKHURNA_LIVE_PRODUCT = 'store_bakhurna_live' as const;
export const STORE_BAKHURNA_LIVE_PRICE_6_SAR = 899 as const;
export const STORE_BAKHURNA_LIVE_PRICE_12_SAR = 1799 as const;
export const STORE_BAKHURNA_LIVE_PRICE_6_HALALAS = 89900 as const;
export const STORE_BAKHURNA_LIVE_PRICE_12_HALALAS = 179900 as const;
export const STORE_BAKHURNA_LIVE_DAYS_6 = 180 as const;
export const STORE_BAKHURNA_LIVE_DAYS_12 = 360 as const;
export const STORE_BAKHURNA_LIVE_POLICY = '2026-09-14' as const;
export const STORE_BAKHURNA_TRIAL_DAYS = 60 as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isBakhurnaLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED, true);
}

export function newBakhurnaToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseBakhurnaPackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function bakhurnaPackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? {
        id,
        days: STORE_BAKHURNA_LIVE_DAYS_12,
        priceSar: STORE_BAKHURNA_LIVE_PRICE_12_SAR,
        priceHalalas: STORE_BAKHURNA_LIVE_PRICE_12_HALALAS,
      }
    : {
        id,
        days: STORE_BAKHURNA_LIVE_DAYS_6,
        priceSar: STORE_BAKHURNA_LIVE_PRICE_6_SAR,
        priceHalalas: STORE_BAKHURNA_LIVE_PRICE_6_HALALAS,
      };
}

export function bakhurnaChargeHalalas(packId: 'm6' | 'm12'): number {
  return bakhurnaPackFromId(packId).priceHalalas;
}

export function bakhurnaPackFromHalalas(amount: number) {
  if (amount === STORE_BAKHURNA_LIVE_PRICE_12_HALALAS) return bakhurnaPackFromId('m12');
  return bakhurnaPackFromId('m6');
}

export function isBakhurnaPriceHalalas(amount: number): boolean {
  return amount === STORE_BAKHURNA_LIVE_PRICE_6_HALALAS || amount === STORE_BAKHURNA_LIVE_PRICE_12_HALALAS;
}

export function bakhurnaLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function bakhurnaLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function bakhurnaLiveInvoiceDescription(packId: 'm6' | 'm12'): string {
  return packId === 'm12' ? 'halaqmap — بخورنا1 360 يوماً' : 'halaqmap — بخورنا1 180 يوماً';
}

export function bakhurnaLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  vendorMode: StoreVendorMode = 'fixed',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_BAKHURNA_LIVE_PRODUCT,
      product_type: STORE_BAKHURNA_LIVE_PRODUCT,
      store_bakhurna_token: token,
      store_bakhurna_pack: packId,
      store_bakhurna_kind: kind,
      store_bakhurna_vendor: vendorMode,
    },
    affiliateCode,
  );
}

export function bakhurnaLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function bakhurnaLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_bakhurna_token ?? meta?.storeBakhurnaToken ?? '').trim();
}

export function bakhurnaLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = bakhurnaLiveMetaProduct(input.meta);
  if (product !== STORE_BAKHURNA_LIVE_PRODUCT) return false;
  if (!input.token || bakhurnaLiveMetaToken(input.meta) !== input.token) return false;
  return isBakhurnaPriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type BakhurnaLiveOrderPayload = {
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

export function parseBakhurnaLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; vendorMode: StoreVendorMode; payload: BakhurnaLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة ولوحة التشغيل.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم النشاط مطلوب.' };
  const packId = parseBakhurnaPackId(body.packId);
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
      blurbAr: clip(body.blurbAr, 200) || 'بخورنا1: اطلب أصناف اليوم من جوالك.',
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

export function parseBakhurnaChat(raw: unknown, forcedFrom?: 'buyer' | 'desk'): Record<string, unknown> | null {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const text = clip(row.text, 240);
  if (text.length < 2) return null;
  const from = forcedFrom || (row.from === 'desk' ? 'desk' : 'buyer');
  return {
    id: clip(row.id, 40) || `c${Date.now().toString(36)}`,
    from,
    name: clip(row.name, 40) || (from === 'desk' ? 'النشاط' : 'جار الحي'),
    text,
    at: String(row.at || new Date().toISOString()).slice(0, 40),
    hidden: row.hidden === true,
  };
}

export function parseBakhurnaChats(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => parseBakhurnaChat(item)).filter(Boolean).slice(0, 200);
}

export function publicBakhurnaPayload(payload: BakhurnaLiveOrderPayload, role = 'shop') {
  return {
    packId: parseBakhurnaPackId(payload.packId),
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
    chats: parseBakhurnaChats(payload.chats),
    ...parseStoreShopHours(payload),
    ...publicShopPlaceFields(role, parseShopPickupPlace(payload)),
  };
}
