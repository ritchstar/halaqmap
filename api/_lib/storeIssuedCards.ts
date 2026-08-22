/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق حقول إصدار البطاقات — بلا أسرار.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { normalizeArabMobileDigits, maskArabMobileDisplay } from './arabMobileDial.js';
import { hijriFromIsoDate } from './gregorianHijri.js';

export const STORE_ISSUED_CARDS_TABLE = 'store_issued_cards' as const;
export const STORE_ISSUED_CARD_OTP_TABLE = 'store_issued_card_otp' as const;

export const PAID_PRICE_HALALAS = {
  quick: 1200,
  featured: 2900,
  luxury: 5900,
} as const;

export type PaidInviteTier = keyof typeof PAID_PRICE_HALALAS;

/** وسم ميسر المستقل عن رخصة النفاذ وشحن المحفظة. */
export const STORE_OCCASION_CARD_PRODUCT = 'store_occasion_card';

function envFlag(raw: string | undefined, fallback: boolean): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'false' || value === '0' || value === 'off') return false;
  if (value === 'true' || value === '1' || value === 'on') return true;
  return fallback;
}

/** التحصيل مفتوح افتراضياً. يُغلق بـ OCCASION_CARD_CHECKOUT_ENABLED=false. */
export function isOccasionCardCheckoutEnabled(): boolean {
  return envFlag(process.env.OCCASION_CARD_CHECKOUT_ENABLED, true);
}

/** يتبع PAYMENT_ENV. يُعاد للتجريبي بـ STORE_PAID_INVITE_LIVE_PAYMENTS=false. */
export function isOccasionCardLivePaymentsEnabled(): boolean {
  const liveEnv = (process.env.PAYMENT_ENV || 'test').trim().toLowerCase() === 'live';
  return liveEnv && envFlag(process.env.STORE_PAID_INVITE_LIVE_PAYMENTS, true);
}

export function paidInviteTierFromHalalas(amount: number): PaidInviteTier | null {
  if (amount === PAID_PRICE_HALALAS.quick) return 'quick';
  if (amount === PAID_PRICE_HALALAS.featured) return 'featured';
  if (amount === PAID_PRICE_HALALAS.luxury) return 'luxury';
  return null;
}

export const PAID_INVITE_TIER_LABEL_AR: Record<PaidInviteTier, string> = {
  quick: 'سريعة',
  featured: 'مميزة',
  luxury: 'فاخرة',
};

export function occasionCardInvoiceDescription(tier: PaidInviteTier): string {
  return `halaqmap — كاردي8 — ${PAID_INVITE_TIER_LABEL_AR[tier]}`;
}

/** رابط دفع فاتورة ميسر المستضافة فقط. */
export function isAllowedMoyasarInvoiceUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (u.protocol !== 'https:') return false;
    if (host === 'api.moyasar.com') return false;
    return host === 'checkout.moyasar.com' || host.endsWith('.moyasar.com');
  } catch {
    return false;
  }
}

export function occasionCardInvoiceMetadata(input: {
  token: string;
  tier: PaidInviteTier;
  templateId: string;
}): Record<string, string> {
  return {
    product: STORE_OCCASION_CARD_PRODUCT,
    product_type: STORE_OCCASION_CARD_PRODUCT,
    tier: input.tier,
    store_card_token: input.token,
    template_id: input.templateId,
  };
}

export function occasionCardMetaProduct(meta: Record<string, unknown> | undefined): string {
  return String(meta?.product ?? meta?.product_type ?? meta?.productType ?? '')
    .trim()
    .toLowerCase();
}

export function occasionCardMetaToken(meta: Record<string, unknown> | undefined): string {
  return String(meta?.store_card_token ?? meta?.storeCardToken ?? '').trim();
}

/** يرفض خلط دفعة الرخصة أو مبلغ خارج الطبقات الثلاث. */
export function occasionCardPaymentMatches(input: {
  meta: Record<string, unknown> | undefined;
  token: string;
  amount: number;
}): boolean {
  if (occasionCardMetaProduct(input.meta) !== STORE_OCCASION_CARD_PRODUCT) return false;
  if (!input.token || occasionCardMetaToken(input.meta) !== input.token) return false;
  return paidInviteTierFromHalalas(input.amount) != null;
}

/** فاتورة ميسر المستضافة غالباً لا تنسخ الوسم إلى عملية البطاقة التابعة. */
export function occasionCardInvoiceAuthorizesPayment(input: {
  token: string;
  invoiceId: string;
  invoiceMeta: Record<string, unknown> | undefined;
  invoiceAmount: number;
  invoicePayments?: Array<{ id?: unknown }>;
  paymentId: string;
  paymentInvoiceId?: string;
}): boolean {
  if (!occasionCardPaymentMatches({
    meta: input.invoiceMeta,
    token: input.token,
    amount: input.invoiceAmount,
  })) {
    return false;
  }
  const invoiceId = String(input.invoiceId || '').trim();
  const paymentId = String(input.paymentId || '').trim();
  const paymentInvoiceId = String(input.paymentInvoiceId || '').trim();
  if (!invoiceId || !paymentId) return false;
  if (paymentInvoiceId && paymentInvoiceId !== invoiceId) return false;
  const listed = (input.invoicePayments || []).some((item) => String(item.id || '').trim() === paymentId);
  return listed || paymentInvoiceId === invoiceId;
}

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
  return maskArabMobileDisplay(phone966);
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

function canonicalizeMode(raw: string): 'phone' | 'cemetery' | 'at_home' | null {
  if (raw === 'phone' || raw === 'phone_only') return 'phone';
  if (raw === 'cemetery' || raw === 'cemetery_only') return 'cemetery';
  if (raw === 'at_home') return 'at_home';
  return null;
}

function parseCondolenceModes(body: Record<string, unknown>): Array<'phone' | 'cemetery' | 'at_home'> {
  const raw = body.condolenceModes;
  const list: string[] = Array.isArray(raw)
    ? raw.map((item) => String(item || ''))
    : [clip(body.condolenceMode, 24)];
  const unique: Array<'phone' | 'cemetery' | 'at_home'> = [];
  for (const item of list) {
    const mode = canonicalizeMode(item.trim());
    if (mode && !unique.includes(mode)) unique.push(mode);
    if (unique.length >= 3) break;
  }
  return unique.length ? unique : ['phone'];
}

const KIN_RELATIONS = new Set([
  'father',
  'mother',
  'son',
  'daughter',
  'brother',
  'sister',
  'husband',
  'wife',
  'uncle_paternal',
  'uncle_maternal',
  'other',
]);

function parseKinRows(body: Record<string, unknown>): Array<{ name: string; relation: string; phoneDigits: string }> {
  const raw = Array.isArray(body.kin) ? body.kin : [];
  const rows: Array<{ name: string; relation: string; phoneDigits: string }> = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = clip(row.name, 80);
    const relation = clip(row.relation, 24);
    if (name.length < 2 || !KIN_RELATIONS.has(relation)) continue;
    const phoneDigits = normalizeArabMobileDigits(clip(row.phone, 20), clip(row.phoneDial, 6) || '966');
    if (!phoneDigits) continue;
    rows.push({ name, relation, phoneDigits });
  }
  return rows;
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
  condolenceMode: 'phone' | 'cemetery' | 'at_home' | 'phone_only' | 'cemetery_only' | 'none';
  condolenceModes: Array<'phone' | 'cemetery' | 'at_home'>;
  deathDateHijri: string;
  kin: Array<{ name: string; relation: string; phoneDigits: string }>;
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
  const phone966 = normalizeArabMobileDigits(clip(body.phone, 20), clip(body.phoneDial, 6) || '966');
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
  const condolenceModes = parseCondolenceModes(body);
  const deathDate = clip(body.deathDate, 32);
  const deathDateHijri = hijriFromIsoDate(deathDate) || clip(body.deathDateHijri, 80);
  const kin = parseKinRows(body);

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
    deathDate,
    deathDateHijri,
    city: clip(body.city, 40),
    prayerAt,
    mosqueName,
    mosqueMapUrl,
    cemeteryName,
    cemeteryMapUrl,
    burial,
    condolenceMode: condolenceModes[0],
    condolenceModes,
    kin,
    prayerText: clip(body.prayerText, 180),
    familyNote: clip(body.familyNote, 280),
  };

  return { ok: true, phone966, attestorName, attestorRole, payload };
}

export function publicBereavementView(payload: BereavementPayload, updatedAt: string | null) {
  const source = payload.condolenceModes?.length
    ? payload.condolenceModes
    : payload.condolenceMode
      ? [payload.condolenceMode]
      : [];
  const modes: Array<'phone' | 'cemetery' | 'at_home'> = [];
  for (const item of source) {
    const mode = canonicalizeMode(String(item || ''));
    if (mode && !modes.includes(mode)) modes.push(mode);
  }
  if (!modes.length) modes.push('phone');
  return {
    gender: payload.gender,
    fullName: payload.fullName,
    nickname: payload.nickname,
    deathDate: payload.deathDate,
    deathDateHijri: payload.deathDateHijri,
    city: payload.city,
    prayerAt: payload.prayerAt,
    mosqueName: payload.mosqueName,
    mosqueMapUrl: payload.mosqueMapUrl,
    cemeteryName: payload.cemeteryName,
    cemeteryMapUrl: payload.cemeteryMapUrl,
    burial: payload.burial,
    condolenceMode: modes[0],
    condolenceModes: modes,
    kin: (payload.kin || []).map((row) => ({
      name: row.name,
      relation: row.relation,
      phoneMasked: maskArabMobileDisplay(row.phoneDigits),
      phoneHref: `tel:+${row.phoneDigits}`,
    })),
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
