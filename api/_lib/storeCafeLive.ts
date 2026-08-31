/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق كافينا1 — وسم store_cafe_live، 1199 أو 2099 ر.س، وصندوق المحادثة مدرج.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';
import { DEFAULT_STORE_SHOP_HOURS, parseStoreShopHours, type StoreShopHoursState } from './storeShopHours.js';
import { isMobileVendorPriceHalalas, mobileVendorChargeHalalas, mobileVendorPackFromHalalas, parseVendorMode, type StoreVendorMode } from './storeMobileVendor.js';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, publicShopPlaceFields, type ShopPickupPlace } from './storeShopPlace.js';

export const STORE_CAFE_LIVE_TABLE = 'store_cafe_live_orders' as const;
export const STORE_CAFE_LIVE_PRODUCT = 'store_cafe_live' as const;
export const STORE_CAFE_LIVE_PRICE_6_SAR = 1199 as const;
export const STORE_CAFE_LIVE_PRICE_12_SAR = 2099 as const;
export const STORE_CAFE_LIVE_PRICE_6_HALALAS = 119900 as const;
export const STORE_CAFE_LIVE_PRICE_12_HALALAS = 209900 as const;
export const STORE_CAFE_LIVE_DAYS_6 = 180 as const;
export const STORE_CAFE_LIVE_DAYS_12 = 365 as const;
export const STORE_CAFE_LIVE_POLICY = '2026-08-26' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isCafeLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_CAFE_LIVE_CHECKOUT_ENABLED, true);
}

export function newCafeToken(): string {
  return randomBytes(24).toString('base64url');
}

export function parseCafePackId(raw: unknown): 'm6' | 'm12' {
  return String(raw || '').trim() === 'm12' ? 'm12' : 'm6';
}

export function cafePackFromId(id: 'm6' | 'm12') {
  return id === 'm12'
    ? { id, days: STORE_CAFE_LIVE_DAYS_12, priceSar: STORE_CAFE_LIVE_PRICE_12_SAR, priceHalalas: STORE_CAFE_LIVE_PRICE_12_HALALAS }
    : { id, days: STORE_CAFE_LIVE_DAYS_6, priceSar: STORE_CAFE_LIVE_PRICE_6_SAR, priceHalalas: STORE_CAFE_LIVE_PRICE_6_HALALAS };
}

export function cafeChargeHalalas(packId: 'm6' | 'm12', vendorMode: StoreVendorMode = 'fixed'): number {
  return vendorMode === 'mobile' ? mobileVendorChargeHalalas(packId) : cafePackFromId(packId).priceHalalas;
}

export function cafePackFromHalalas(amount: number) {
  if (isMobileVendorPriceHalalas(amount)) return cafePackFromId(mobileVendorPackFromHalalas(amount));
  if (amount === STORE_CAFE_LIVE_PRICE_12_HALALAS) return cafePackFromId('m12');
  return cafePackFromId('m6');
}

export function isCafePriceHalalas(amount: number): boolean {
  return (
    isMobileVendorPriceHalalas(amount)
    || amount === STORE_CAFE_LIVE_PRICE_6_HALALAS
    || amount === STORE_CAFE_LIVE_PRICE_12_HALALAS
  );
}

export function cafeLiveTermEndIso(days: number, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function cafeLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function cafeLiveInvoiceDescription(packId: 'm6' | 'm12', vendorMode: StoreVendorMode = 'fixed'): string {
  if (vendorMode === 'mobile') {
    return packId === 'm12' ? 'halaqmap — كافينا1 متحرك 12 شهراً' : 'halaqmap — كافينا1 متحرك 6 أشهر';
  }
  return packId === 'm12' ? 'halaqmap — كافينا1 12 شهراً' : 'halaqmap — كافينا1 6 أشهر';
}

export function cafeLiveInvoiceMetadata(
  token: string,
  packId: 'm6' | 'm12',
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  vendorMode: StoreVendorMode = 'fixed',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_CAFE_LIVE_PRODUCT,
      product_type: STORE_CAFE_LIVE_PRODUCT,
      store_cafe_token: token,
      store_cafe_pack: packId,
      store_cafe_kind: kind,
      store_cafe_vendor: vendorMode,
    },
    affiliateCode,
  );
}

export function cafeLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function cafeLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_cafe_token ?? meta?.storeCafeToken ?? '').trim();
}

export function cafeLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  const product = cafeLiveMetaProduct(input.meta);
  if (product !== STORE_CAFE_LIVE_PRODUCT) return false;
  if (!input.token || cafeLiveMetaToken(input.meta) !== input.token) return false;
  return isCafePriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export type CafeLiveBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  pending?: boolean;
  at: string;
};

export type CafeLiveOrderPayload = {
  packId: 'm6' | 'm12';
  shopName: string;
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
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  photoSrc: string;
  panoramaSrc: string;
  guestPaused: boolean;
  reviewBeforeShow: boolean;
  activeEventId: string;
  customEventTitle: string;
  blessings: CafeLiveBlessing[];
} & StoreShopHoursState & ShopPickupPlace;

export function parseCafeLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; packId: 'm6' | 'm12'; vendorMode: StoreVendorMode; payload: CafeLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الصفحة والشاشات ولوحة الكاشير.' };
  const shopName = clip(body.shopName, 80);
  const hostName = clip(body.hostName, 80) || 'الإدارة';
  if (shopName.length < 2) return { ok: false, error: 'اسم المقهى مطلوب.' };
  const packId = parseCafePackId(body.packId);
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
      hostName,
      blurbAr: clip(body.blurbAr, 200) || 'كافينا1: اطلب من جوالك.',
      customFields: Array.from({ length: 5 }, () => ''),
      flashAr: '',
      shelf: [],
      orders: [],
      orderArchive: [],
      chatIncluded: true,
      chats: [],
      nextTicket: 1,
      welcomeAr: 'حياكم الله في المقهى. اكتبوا أسماءكم لتظهر المشاركات على الشاشة.',
      youtubeUrl: '',
      youtubeHidden: true,
      announcement: '',
      photoSrc: '',
      panoramaSrc: '',
      guestPaused: false,
      reviewBeforeShow: false,
      activeEventId: 'welcome',
      customEventTitle: '',
      blessings: [],
      ...DEFAULT_SHOP_PICKUP,
      vendorMode,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
  };
}

export function parseCafeChat(raw: unknown, forcedFrom?: 'buyer' | 'desk'): Record<string, unknown> | null {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const text = clip(row.text, 240);
  if (text.length < 2) return null;
  const from = forcedFrom || (row.from === 'desk' ? 'desk' : 'buyer');
  return {
    id: clip(row.id, 40) || `c${Date.now().toString(36)}`,
    from,
    name: clip(row.name, 40) || (from === 'desk' ? 'الكاشير' : 'جار الحي'),
    text,
    at: String(row.at || new Date().toISOString()).slice(0, 40),
    hidden: row.hidden === true,
  };
}

export function parseCafeChats(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => parseCafeChat(item)).filter(Boolean).slice(0, 200);
}

const ABUSE_RE = /قحب|شرمو|نيك|كس ام|كسم /i;

export function cafeTextBlocked(raw: unknown): boolean {
  return ABUSE_RE.test(String(raw || ''));
}

export function cafeBlessingDuplicate(
  list: unknown[],
  input: { cannedText: string; extra: string },
  withinMs = 45_000,
  now = Date.now(),
): boolean {
  const text = `${input.cannedText}|${input.extra}`.replace(/\s+/g, ' ').trim();
  return list.some((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const other = `${row.cannedText || ''}|${row.extra || ''}`.replace(/\s+/g, ' ').trim();
    const at = Date.parse(String(row.at || ''));
    return other === text && Number.isFinite(at) && now - at < withinMs;
  });
}

export function publicCafePayload(payload: CafeLiveOrderPayload, role = 'shop') {
  return {
    packId: parseCafePackId(payload.packId),
    shopName: payload.shopName,
    hostName: payload.hostName,
    blurbAr: payload.blurbAr,
    customFields: Array.isArray(payload.customFields) ? payload.customFields.slice(0, 5) : [],
    flashAr: payload.flashAr,
    shelf: Array.isArray(payload.shelf) ? payload.shelf : [],
    orders: Array.isArray(payload.orders) ? payload.orders : [],
    orderArchive: role === 'desk' && Array.isArray(payload.orderArchive) ? payload.orderArchive.slice(0, 1000) : [],
    chatIncluded: true,
    chats: parseCafeChats(payload.chats),
    nextTicket: Number(payload.nextTicket) > 0 ? Number(payload.nextTicket) : 1,
    welcomeAr: payload.welcomeAr || '',
    youtubeUrl: payload.youtubeUrl || '',
    youtubeHidden: payload.youtubeHidden !== false,
    announcement: payload.announcement || '',
    photoSrc: payload.photoSrc || '',
    panoramaSrc: payload.panoramaSrc || '',
    guestPaused: payload.guestPaused === true,
    reviewBeforeShow: payload.reviewBeforeShow === true,
    activeEventId: payload.activeEventId || 'welcome',
    customEventTitle: payload.customEventTitle || '',
    blessings: Array.isArray(payload.blessings) ? payload.blessings.slice(-80) : [],
    ...parseStoreShopHours(payload),
    ...publicShopPlaceFields(role, parseShopPickupPlace(payload)),
  };
}
