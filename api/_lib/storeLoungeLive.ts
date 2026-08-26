/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق لاونجا1 — وسم ميسر مستقل، باقات 3 و6 و12 شهراً.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';

export const STORE_LOUNGE_LIVE_TABLE = 'store_lounge_live_orders' as const;
export const STORE_LOUNGE_LIVE_PRODUCT = 'store_lounge_live' as const;
export const STORE_LOUNGE_LIVE_PRICE_SAR = 600 as const;
export const STORE_LOUNGE_LIVE_PRICE_HALALAS = 60000 as const;
export const STORE_LOUNGE_LIVE_DAYS = 90 as const;
export const STORE_LOUNGE_LIVE_POLICY = '2026-08-26' as const;

export type LoungeLivePackId = 'm3' | 'm6' | 'm12';

const LOUNGE_PACKS = {
  m3: { id: 'm3' as const, days: 90, priceHalalas: 60000 },
  m6: { id: 'm6' as const, days: 180, priceHalalas: 120000 },
  m12: { id: 'm12' as const, days: 365, priceHalalas: 240000 },
} as const;

export function parseLoungePackId(raw: unknown): LoungeLivePackId {
  const id = String(raw || '').trim();
  if (id === 'm6' || id === 'm12') return id;
  return 'm3';
}

export function loungePackFromId(id: LoungeLivePackId) {
  return LOUNGE_PACKS[id];
}

export function loungePackFromHalalas(amount: number) {
  if (amount === 120000) return LOUNGE_PACKS.m6;
  if (amount === 240000) return LOUNGE_PACKS.m12;
  return LOUNGE_PACKS.m3;
}

export function isLoungePriceHalalas(amount: number): boolean {
  return amount === 60000 || amount === 120000 || amount === 240000;
}

export function loungeChargeHalalas(packId: LoungeLivePackId): number {
  return LOUNGE_PACKS[packId].priceHalalas;
}

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isLoungeLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_LOUNGE_LIVE_CHECKOUT_ENABLED, true);
}

export function newLoungeToken(): string {
  return randomBytes(24).toString('base64url');
}

export function loungeLiveTermEndIso(days: number = STORE_LOUNGE_LIVE_DAYS, fromMs = Date.now()): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function loungeLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function loungeLiveInvoiceDescription(packId: LoungeLivePackId = 'm3'): string {
  const months = packId === 'm12' ? 'اثني عشر شهراً' : packId === 'm6' ? 'ستة أشهر' : 'ثلاثة أشهر';
  return `halaqmap — لاونجا1 تشغيل شاشات اللاونج · ${months}`;
}

export function loungeLiveInvoiceMetadata(
  token: string,
  kind: 'purchase' | 'renewal' = 'purchase',
  affiliateCode?: unknown,
  packId: LoungeLivePackId = 'm3',
): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_LOUNGE_LIVE_PRODUCT,
      product_type: STORE_LOUNGE_LIVE_PRODUCT,
      store_lounge_token: token,
      store_lounge_kind: kind,
      store_lounge_pack: packId,
    },
    affiliateCode,
  );
}

export function loungeLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function loungeLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_lounge_token ?? meta?.storeLoungeToken ?? '').trim();
}

export function loungeLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  if (loungeLiveMetaProduct(input.meta) !== STORE_LOUNGE_LIVE_PRODUCT) return false;
  if (loungeLiveMetaProduct(input.meta) === 'store_occasion_card') return false;
  if (loungeLiveMetaProduct(input.meta) === 'store_wedding_live') return false;
  if (loungeLiveMetaProduct(input.meta) === 'store_event_live') return false;
  if (loungeLiveMetaProduct(input.meta) === 'store_grocers_live') return false;
  if (loungeLiveMetaProduct(input.meta) === 'store_restaurant_live') return false;
  if (!input.token || loungeLiveMetaToken(input.meta) !== input.token) return false;
  return isLoungePriceHalalas(input.amount);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

const EVENT_IDS = new Set(['welcome', 'birthday', 'cheers', 'tonight', 'custom']);

export function parseLoungeEventId(raw: unknown): 'welcome' | 'birthday' | 'cheers' | 'tonight' | 'custom' {
  const id = String(raw || '').trim();
  return EVENT_IDS.has(id) ? (id as 'welcome' | 'birthday' | 'cheers' | 'tonight' | 'custom') : 'welcome';
}

export type LoungeLiveBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  pending?: boolean;
  at: string;
};

export type LoungeLiveOrderPayload = {
  packId?: LoungeLivePackId;
  loungeName: string;
  hostName: string;
  activeEventId: 'welcome' | 'birthday' | 'cheers' | 'tonight' | 'custom';
  customEventTitle: string;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  photoSrc: string;
  panoramaSrc: string;
  guestPaused: boolean;
  reviewBeforeShow: boolean;
  blessings: LoungeLiveBlessing[];
};

const ABUSE_RE = /قحب|شرمو|نيك|كس ام|كسم /i;

export function loungeBlessingOnScreen(item: LoungeLiveBlessing): boolean {
  return item.hidden !== true && item.pending !== true;
}

export function loungeTextBlocked(raw: unknown): boolean {
  return ABUSE_RE.test(String(raw || ''));
}

export function loungeBlessingDuplicate(
  list: LoungeLiveBlessing[],
  input: { cannedText: string; extra: string },
  withinMs = 45_000,
  now = Date.now(),
): boolean {
  const text = `${input.cannedText}|${input.extra}`.replace(/\s+/g, ' ').trim();
  return list.some((item) => {
    const other = `${item.cannedText}|${item.extra}`.replace(/\s+/g, ' ').trim();
    const at = Date.parse(item.at);
    return other === text && Number.isFinite(at) && now - at < withinMs;
  });
}

export function parseLoungeLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; payload: LoungeLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال روابط الشاشة.' };
  const loungeName = clip(body.loungeName, 80);
  const hostName = clip(body.hostName, 80);
  if (loungeName.length < 2 || hostName.length < 2) {
    return { ok: false, error: 'اسم اللاونج واسم المسؤول مطلوبان.' };
  }
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80) || hostName,
    payload: {
      packId: parseLoungePackId(body.packId),
      loungeName,
      hostName,
      activeEventId: parseLoungeEventId(body.activeEventId),
      customEventTitle: clip(body.customEventTitle, 80),
      welcomeAr: clip(body.welcomeAr, 400),
      youtubeUrl: clip(body.youtubeUrl, 300),
      youtubeHidden: body.youtubeHidden == null ? true : Boolean(body.youtubeHidden),
      announcement: clip(body.announcement, 160),
      photoSrc: clip(body.photoSrc, 400) || '/images/store/lab/lab-lounge-interior.jpg',
      panoramaSrc: clip(body.panoramaSrc, 400) || '/images/store/lab/lab-lounge-interior.jpg',
      guestPaused: false,
      reviewBeforeShow: false,
      blessings: [],
    },
  };
}

export function publicLoungePayload(
  payload: LoungeLiveOrderPayload,
  role: 'display' | 'guest' | 'host' = 'display',
) {
  const blessings = Array.isArray(payload.blessings) ? payload.blessings : [];
  return {
    loungeName: payload.loungeName,
    hostName: payload.hostName,
    activeEventId: parseLoungeEventId(payload.activeEventId),
    customEventTitle: payload.customEventTitle,
    welcomeAr: payload.welcomeAr,
    youtubeUrl: payload.youtubeUrl,
    youtubeHidden: payload.youtubeHidden,
    announcement: payload.announcement,
    photoSrc: payload.photoSrc,
    panoramaSrc: payload.panoramaSrc,
    guestPaused: payload.guestPaused === true,
    reviewBeforeShow: payload.reviewBeforeShow === true,
    blessings: role === 'host' ? blessings.slice(-80) : blessings.filter(loungeBlessingOnScreen),
  };
}
