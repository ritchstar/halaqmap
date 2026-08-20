/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق حقول إصدار البطاقات — بلا أسرار.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { normalizeSaudiMobileForWa } from './saudiWhatsAppPhone.js';

export const STORE_ISSUED_CARDS_TABLE = 'store_issued_cards' as const;
export const STORE_ISSUED_CARD_OTP_TABLE = 'store_issued_card_otp' as const;

export const PAID_PRICE_HALALAS = {
  quick: 1200,
  featured: 2900,
  luxury: 5900,
} as const;

const PAID_TEMPLATES: Record<string, keyof typeof PAID_PRICE_HALALAS> = {
  'season-short': 'quick',
  'season-eid-note': 'quick',
  'season-thanks': 'quick',
  'personal-birthday': 'featured',
  'personal-newborn': 'featured',
  'personal-eid': 'featured',
  'achieve-grad': 'featured',
  'achieve-role': 'featured',
  'achieve-general': 'featured',
  'luxury-wedding': 'luxury',
  'luxury-milka': 'luxury',
  'luxury-family': 'luxury',
};

const MAPS_HOSTS = new Set(['maps.google.com', 'www.google.com', 'maps.app.goo.gl', 'goo.gl']);

export function newPublicToken(): string {
  return randomBytes(24).toString('base64url');
}

export function newAdminToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSecret(value: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${value}`).digest('hex');
}

export function hashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function maskPhoneLast4(phone966: string): string {
  const local = `0${phone966.slice(3)}`;
  return `${local.slice(0, 2)}••• ••${local.slice(-3)}`;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function isHttpUrl(raw: string, max = 500): boolean {
  if (!raw) return true;
  if (raw.length > max) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function isPublicMapsUrl(raw: string): boolean {
  if (!raw) return true;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    return MAPS_HOSTS.has(host) || host.endsWith('.google.com');
  } catch {
    return false;
  }
}

export type PaidInvitePayload = {
  hostName: string;
  occasionLine: string;
  whenText: string;
  placeText: string;
  message: string;
};

export type BereavementPayload = {
  gender: 'male' | 'female';
  fullName: string;
  nickname: string;
  deathDate: string;
  city: string;
  prayerAt: string;
  mosqueName: string;
  mosqueMapUrl: string;
  cemeteryName: string;
  cemeteryMapUrl: string;
  burial: 'pending' | 'done' | 'unknown';
  condolenceMode: 'phone_only' | 'cemetery_only' | 'none';
  prayerText: string;
  familyNote: string;
};

export function parsePaidInviteBody(body: Record<string, unknown>):
  | { ok: true; templateId: string; priceHalalas: number; payload: PaidInvitePayload }
  | { ok: false; error: string } {
  const templateId = clip(body.templateId, 40);
  const tier = PAID_TEMPLATES[templateId];
  if (!tier) return { ok: false, error: 'القالب غير معروف' };

  const hostName = clip(body.hostName, 80);
  if (hostName.length < 2) return { ok: false, error: 'اسم صاحب المناسبة مطلوب' };

  const payload: PaidInvitePayload = {
    hostName,
    occasionLine: clip(body.occasionLine, 80),
    whenText: clip(body.whenText, 80),
    placeText: clip(body.placeText, 120),
    message: clip(body.message, 280),
  };
  return { ok: true, templateId, priceHalalas: PAID_PRICE_HALALAS[tier], payload };
}

export function parseBereavementBody(body: Record<string, unknown>):
  | { ok: true; phone966: string; attestorName: string; attestorRole: string; payload: BereavementPayload }
  | { ok: false; error: string } {
  const phone966 = normalizeSaudiMobileForWa(clip(body.phone, 24));
  if (!phone966) return { ok: false, error: 'رقم الجوال غير صالح' };

  const gender = clip(body.gender, 8) === 'female' ? 'female' : clip(body.gender, 8) === 'male' ? 'male' : '';
  if (!gender) return { ok: false, error: 'حدّد صيغة الاسم' };

  const fullName = clip(body.fullName, 80);
  if (fullName.length < 3) return { ok: false, error: 'الاسم الكامل مطلوب' };

  const mosqueMapUrl = clip(body.mosqueMapUrl, 500);
  const cemeteryMapUrl = clip(body.cemeteryMapUrl, 500);
  if (!isHttpUrl(mosqueMapUrl) || !isPublicMapsUrl(mosqueMapUrl)) {
    return { ok: false, error: 'رابط موقع المسجد غير صالح' };
  }
  if (!isHttpUrl(cemeteryMapUrl) || !isPublicMapsUrl(cemeteryMapUrl)) {
    return { ok: false, error: 'رابط موقع المقبرة غير صالح' };
  }

  const burialRaw = clip(body.burial, 16);
  const burial = burialRaw === 'done' || burialRaw === 'unknown' ? burialRaw : 'pending';
  const modeRaw = clip(body.condolenceMode, 24);
  const condolenceMode =
    modeRaw === 'cemetery_only' || modeRaw === 'none' ? modeRaw : 'phone_only';

  const mosqueName = clip(body.mosqueName, 80);
  const cemeteryName = clip(body.cemeteryName, 80);
  const prayerAt = clip(body.prayerAt, 80);
  if (!mosqueName || !cemeteryName || !prayerAt) {
    return { ok: false, error: 'الصلاة واسم المسجد والمقبرة مطلوبة في الإعلان العاجل' };
  }

  const attestorName = clip(body.attestorName, 80);
  const attestorRole = clip(body.attestorRole, 80);
  if (attestorName.length < 2) return { ok: false, error: 'اسم من اعتمد البلاغ مطلوب ولا يظهر للزوار' };

  const payload: BereavementPayload = {
    gender,
    fullName,
    nickname: clip(body.nickname, 40),
    deathDate: clip(body.deathDate, 32),
    city: clip(body.city, 40),
    prayerAt,
    mosqueName,
    mosqueMapUrl,
    cemeteryName,
    cemeteryMapUrl,
    burial,
    condolenceMode,
    prayerText: clip(body.prayerText, 180),
    familyNote: clip(body.familyNote, 280),
  };

  return { ok: true, phone966, attestorName, attestorRole, payload };
}

export function publicBereavementView(payload: BereavementPayload, updatedAt: string | null) {
  return {
    gender: payload.gender,
    fullName: payload.fullName,
    nickname: payload.nickname,
    deathDate: payload.deathDate,
    city: payload.city,
    prayerAt: payload.prayerAt,
    mosqueName: payload.mosqueName,
    mosqueMapUrl: payload.mosqueMapUrl,
    cemeteryName: payload.cemeteryName,
    cemeteryMapUrl: payload.cemeteryMapUrl,
    burial: payload.burial,
    condolenceMode: payload.condolenceMode,
    prayerText: payload.prayerText,
    familyNote: payload.familyNote,
    lastUpdatedAt: updatedAt,
  };
}

export function publicPaidView(payload: PaidInvitePayload, templateId: string, priceHalalas: number) {
  return {
    templateId,
    priceHalalas,
    hostName: payload.hostName,
    occasionLine: payload.occasionLine,
    whenText: payload.whenText,
    placeText: payload.placeText,
    message: payload.message,
  };
}
