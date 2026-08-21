/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق لاونجا1 — وسم ميسر مستقل، مبلغ 600 ر.س فقط، مدة ثلاثة أشهر.
 */
import { randomBytes } from 'node:crypto';

export const STORE_LOUNGE_LIVE_TABLE = 'store_lounge_live_orders' as const;
export const STORE_LOUNGE_LIVE_PRODUCT = 'store_lounge_live' as const;
export const STORE_LOUNGE_LIVE_PRICE_SAR = 600 as const;
export const STORE_LOUNGE_LIVE_PRICE_HALALAS = 60000 as const;
export const STORE_LOUNGE_LIVE_DAYS = 90 as const;
export const STORE_LOUNGE_LIVE_POLICY = '2026-08-22' as const;

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

export function loungeLiveTermEndIso(fromMs = Date.now()): string {
  return new Date(fromMs + STORE_LOUNGE_LIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function loungeLiveIsExpired(expiresAt: string | null | undefined, nowMs = Date.now()): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t <= nowMs;
}

export function loungeLiveInvoiceDescription(): string {
  return 'halaqmap — لاونجا1 تشغيل شاشات اللاونج';
}

export function loungeLiveInvoiceMetadata(token: string, kind: 'purchase' | 'renewal' = 'purchase'): Record<string, string> {
  return {
    product: STORE_LOUNGE_LIVE_PRODUCT,
    product_type: STORE_LOUNGE_LIVE_PRODUCT,
    store_lounge_token: token,
    store_lounge_kind: kind,
  };
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
  if (!input.token || loungeLiveMetaToken(input.meta) !== input.token) return false;
  return input.amount === STORE_LOUNGE_LIVE_PRICE_HALALAS;
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
  at: string;
};

export type LoungeLiveOrderPayload = {
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
  blessings: LoungeLiveBlessing[];
};

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
      loungeName,
      hostName,
      activeEventId: parseLoungeEventId(body.activeEventId),
      customEventTitle: clip(body.customEventTitle, 80),
      welcomeAr: clip(body.welcomeAr, 400),
      youtubeUrl: clip(body.youtubeUrl, 300),
      youtubeHidden: body.youtubeHidden == null ? true : Boolean(body.youtubeHidden),
      announcement: clip(body.announcement, 160),
      photoSrc: clip(body.photoSrc, 400) || '/images/store/lab/lab-wedding-panorama.png',
      panoramaSrc: clip(body.panoramaSrc, 400) || '/images/store/lab/lab-wedding-panorama.png',
      blessings: [],
    },
  };
}

export function publicLoungePayload(payload: LoungeLiveOrderPayload) {
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
    blessings: (payload.blessings || []).filter((item) => !item.hidden),
  };
}
