/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق الدعوة الحرة التفاعلية — وسم ميسر مستقل، مبلغ 899 ر.س فقط.
 */
import { randomBytes } from 'node:crypto';

export const STORE_EVENT_LIVE_TABLE = 'store_event_live_orders' as const;
export const STORE_EVENT_LIVE_PRODUCT = 'store_event_live' as const;
export const STORE_EVENT_LIVE_PRICE_SAR = 899 as const;
export const STORE_EVENT_LIVE_PRICE_HALALAS = 89900 as const;
export const STORE_EVENT_LIVE_POLICY = '2026-08-21' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isEventLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_EVENT_LIVE_CHECKOUT_ENABLED, true);
}

export function newEventToken(): string {
  return randomBytes(24).toString('base64url');
}

export function eventLiveInvoiceDescription(): string {
  return 'halaqmap — دعوة حرة تفاعلية';
}

export function eventLiveInvoiceMetadata(token: string): Record<string, string> {
  return {
    product: STORE_EVENT_LIVE_PRODUCT,
    product_type: STORE_EVENT_LIVE_PRODUCT,
    store_event_token: token,
  };
}

export function eventLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function eventLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_event_token ?? meta?.storeEventToken ?? '').trim();
}

export function eventLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  if (eventLiveMetaProduct(input.meta) !== STORE_EVENT_LIVE_PRODUCT) return false;
  if (eventLiveMetaProduct(input.meta) === 'store_occasion_card') return false;
  if (eventLiveMetaProduct(input.meta) === 'store_wedding_live') return false;
  if (!input.token || eventLiveMetaToken(input.meta) !== input.token) return false;
  return input.amount === STORE_EVENT_LIVE_PRICE_HALALAS;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function parseEventVoice(raw: unknown): 'men' | 'women' {
  return String(raw || '').trim() === 'women' ? 'women' : 'men';
}

export function parseEventHostRole(_raw: unknown, _voice: 'men' | 'women' = 'men'): 'self' {
  return 'self';
}

export type EventLiveOrderPayload = {
  voice: 'men' | 'women';
  hostRole: 'self';
  hostName: string;
  occasionTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueMapsUrl: string;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  photoSrc: string;
  panoramaSrc: string;
  blessings: Array<{
    id: string;
    name: string;
    cannedId: string;
    cannedText: string;
    extra: string;
    hidden: boolean;
    at: string;
  }>;
};

export function parseEventLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; payload: EventLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال الروابط السرية.' };
  const hostName = clip(body.hostName, 80);
  const occasionTitle = clip(body.occasionTitle, 80);
  if (hostName.length < 2 || occasionTitle.length < 2) {
    return { ok: false, error: 'اسم الداعي أو الداعية واسم المناسبة مطلوبة.' };
  }
  const voice = parseEventVoice(body.voice);
  const defaultPhoto =
    voice === 'women' ? '/images/store/lab/lab-luxury-rosegold.png' : '/images/store/lab/lab-luxury-gold.png';
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80),
    payload: {
      voice,
      hostRole: 'self',
      hostName,
      occasionTitle,
      eventDate: clip(body.eventDate, 80),
      eventTime: clip(body.eventTime, 80),
      venueName: clip(body.venueName, 120),
      venueMapsUrl: clip(body.venueMapsUrl, 500),
      welcomeAr: clip(body.welcomeAr, 400),
      youtubeUrl: clip(body.youtubeUrl, 300),
      youtubeHidden: Boolean(body.youtubeHidden),
      announcement: clip(body.announcement, 160),
      photoSrc: clip(body.photoSrc, 400) || defaultPhoto,
      panoramaSrc: clip(body.panoramaSrc, 400) || '/images/store/lab/lab-wedding-panorama.png',
      blessings: [],
    },
  };
}

export function publicEventPayload(payload: EventLiveOrderPayload) {
  return {
    voice: payload.voice === 'women' ? 'women' : 'men',
    hostRole: 'self' as const,
    hostName: payload.hostName,
    occasionTitle: payload.occasionTitle,
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    venueName: payload.venueName,
    venueMapsUrl: payload.venueMapsUrl,
    welcomeAr: payload.welcomeAr,
    youtubeUrl: payload.youtubeUrl,
    youtubeHidden: payload.youtubeHidden,
    announcement: payload.announcement,
    photoSrc: payload.photoSrc,
    panoramaSrc: payload.panoramaSrc,
    blessings: (payload.blessings || []).filter((item) => !item.hidden),
  };
}
