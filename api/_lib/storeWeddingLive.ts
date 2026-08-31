/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق دعوة الزواج التفاعلية — وسم ميسر مستقل، مبلغ 899 ر.س فقط.
 */
import { randomBytes } from 'node:crypto';
import { withStoreAffiliateCode } from './storeAffiliateCode.js';

export const STORE_WEDDING_LIVE_TABLE = 'store_wedding_live_orders' as const;
export const STORE_WEDDING_LIVE_PRODUCT = 'store_wedding_live' as const;
export const STORE_WEDDING_LIVE_PRICE_SAR = 899 as const;
export const STORE_WEDDING_LIVE_PRICE_HALALAS = 89900 as const;
export const STORE_WEDDING_LIVE_POLICY = '2026-08-21' as const;

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

export function isWeddingLiveCheckoutEnabled(): boolean {
  return envFlag(process.env.STORE_WEDDING_LIVE_CHECKOUT_ENABLED, true);
}

export function newWeddingToken(): string {
  return randomBytes(24).toString('base64url');
}

export function weddingLiveInvoiceDescription(): string {
  return 'halaqmap — افراحي1';
}

export function weddingLiveInvoiceMetadata(token: string, affiliateCode?: unknown): Record<string, string> {
  return withStoreAffiliateCode(
    {
      product: STORE_WEDDING_LIVE_PRODUCT,
      product_type: STORE_WEDDING_LIVE_PRODUCT,
      store_wedding_token: token,
    },
    affiliateCode,
  );
}

export function weddingLiveMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function weddingLiveMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_wedding_token ?? meta?.storeWeddingToken ?? '').trim();
}

export function weddingLivePaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  if (weddingLiveMetaProduct(input.meta) !== STORE_WEDDING_LIVE_PRODUCT) return false;
  if (weddingLiveMetaProduct(input.meta) === 'store_occasion_card') return false;
  if (!input.token || weddingLiveMetaToken(input.meta) !== input.token) return false;
  return input.amount === STORE_WEDDING_LIVE_PRICE_HALALAS;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clipMultiline(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

export function parseWeddingWelcomeLinesAr(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).map((item) => String(item ?? '').slice(0, 400));
}

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function parseWeddingVoice(raw: unknown): 'men' | 'women' {
  return String(raw || '').trim() === 'women' ? 'women' : 'men';
}

export function parseWeddingHostRole(
  raw: unknown,
  voice: 'men' | 'women' = 'men',
): 'self' | 'groom_father' | 'bride_father' | 'groom_mother' | 'bride_mother' {
  const value = String(raw || '').trim();
  if (voice === 'women') {
    if (value === 'self' || value === 'groom_mother' || value === 'bride_mother') return value;
    if (value === 'groom_father') return 'groom_mother';
    if (value === 'bride_father') return 'bride_mother';
    return 'groom_mother';
  }
  if (value === 'groom_father' || value === 'bride_father') return value;
  return 'self';
}

function parseOffspringKind(raw: unknown): 'son' | 'daughter' {
  return String(raw || '').trim() === 'daughter' ? 'daughter' : 'son';
}

function parseVenueKind(raw: unknown): 'hall' | 'resthouse' | 'hotel' | 'other' {
  const value = String(raw || '').trim();
  if (value === 'resthouse' || value === 'hotel' || value === 'other') return value;
  return 'hall';
}

export type WeddingLiveOrderPayload = {
  voice: 'men' | 'women';
  hostRole: 'self' | 'groom_father' | 'bride_father' | 'groom_mother' | 'bride_mother';
  hostName: string;
  offspringKind: 'son' | 'daughter';
  groomName: string;
  brideName: string;
  eventDate: string;
  eventDateEn: string;
  eventTime: string;
  venueKind: 'hall' | 'resthouse' | 'hotel' | 'other';
  venueName: string;
  venueMapsUrl: string;
  invitationAr?: string;
  kickerAr?: string;
  welcomeAr: string;
  welcomeSetIndex?: number;
  welcomeLinesAr?: string[];
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

export function parseWeddingLiveOrderBody(body: Record<string, unknown>):
  | { ok: true; email: string; buyerName: string; payload: WeddingLiveOrderPayload }
  | { ok: false; error: string } {
  const email = clip(body.email, 180).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: 'البريد مطلوب لإرسال الروابط السرية.' };
  const hostName = clip(body.hostName, 80);
  const groomName = clip(body.groomName, 80);
  const brideName = clip(body.brideName, 80);
  if (hostName.length < 2 || groomName.length < 2 || brideName.length < 2) {
    return { ok: false, error: 'اسم الداعي أو الداعية واسم العريس واسم العروس مطلوبة.' };
  }
  const voice = parseWeddingVoice(body.voice);
  const defaultPhoto =
    voice === 'women' ? '/images/store/lab/lab-luxury-rosegold.jpg' : '/images/store/lab/lab-luxury-gold.jpg';
  return {
    ok: true,
    email,
    buyerName: clip(body.buyerName, 80),
    payload: {
      voice,
      hostRole: parseWeddingHostRole(body.hostRole, voice),
      hostName,
      offspringKind: parseOffspringKind(body.offspringKind),
      groomName,
      brideName,
      eventDate: clip(body.eventDate, 80),
      eventDateEn: clip(body.eventDateEn, 80),
      eventTime: clip(body.eventTime, 80),
      venueKind: parseVenueKind(body.venueKind),
      venueName: clip(body.venueName, 120),
      venueMapsUrl: clip(body.venueMapsUrl, 500),
      invitationAr: clipMultiline(body.invitationAr, 800),
      kickerAr: clip(body.kickerAr, 80),
      welcomeAr: clip(body.welcomeAr, 400),
      welcomeSetIndex: Math.max(0, Math.min(99, Number(body.welcomeSetIndex) || 0)),
      welcomeLinesAr: parseWeddingWelcomeLinesAr(body.welcomeLinesAr),
      youtubeUrl: clip(body.youtubeUrl, 300),
      youtubeHidden: Boolean(body.youtubeHidden),
      announcement: clip(body.announcement, 160),
      photoSrc: clip(body.photoSrc, 400) || defaultPhoto,
      panoramaSrc: clip(body.panoramaSrc, 400) || '/images/store/lab/lab-wedding-panorama.jpg',
      blessings: [],
    },
  };
}

export function publicWeddingPayload(payload: WeddingLiveOrderPayload) {
  return {
    voice: payload.voice === 'women' ? 'women' : 'men',
    hostRole: payload.hostRole || 'self',
    hostName: payload.hostName,
    offspringKind: parseOffspringKind(payload.offspringKind),
    groomName: payload.groomName,
    brideName: payload.brideName,
    eventDate: payload.eventDate,
    eventDateEn: payload.eventDateEn || '',
    eventTime: payload.eventTime,
    venueKind: parseVenueKind(payload.venueKind),
    venueName: payload.venueName,
    venueMapsUrl: payload.venueMapsUrl,
    invitationAr: clipMultiline(payload.invitationAr, 800),
    kickerAr: clip(payload.kickerAr, 80),
    welcomeAr: payload.welcomeAr,
    welcomeSetIndex: Number(payload.welcomeSetIndex) || 0,
    welcomeLinesAr: parseWeddingWelcomeLinesAr(payload.welcomeLinesAr),
    youtubeUrl: payload.youtubeUrl,
    youtubeHidden: payload.youtubeHidden,
    announcement: payload.announcement,
    photoSrc: payload.photoSrc,
    panoramaSrc: payload.panoramaSrc,
    blessings: (payload.blessings || []).filter((item) => !item.hidden),
  };
}
