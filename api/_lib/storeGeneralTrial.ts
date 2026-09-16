/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تأكيد بريد نظام التجربة العام. لا يُخلط بهدية المناسبات.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  confirmVisitorStoreProductTrial,
  isGeneralTrialProductKey,
  normalizeTrialEmail,
  requestVisitorStoreProductTrial,
  type StoreGeneralTrialKey,
} from './storeProductTrial.js';

const CONFIRM_HOURS = 48 as const;

function confirmSecret(): string | null {
  const s = (
    process.env.STORE_GIFT_EMAIL_CONFIRM_SECRET ||
    process.env.BRONZE_TRIAL_EMAIL_CONFIRM_SECRET ||
    process.env.REGISTRATION_INTENT_SECRET ||
    process.env.LISTING_LICENSE_VOUCHER_PEPPER ||
    ''
  ).trim();
  return s.length >= 16 ? s : null;
}

export function mintGeneralTrialConfirmToken(input: {
  trialId: string;
  email: string;
}): { ok: true; token: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر تجهيز رسالة التأكيد.' };
  const exp = Math.floor(Date.now() / 1000) + CONFIRM_HOURS * 3600;
  const payloadB64 = Buffer.from(
    JSON.stringify({ tid: input.trialId, em: input.email, exp }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return { ok: true, token: `${payloadB64}.${sig}` };
}

export function verifyGeneralTrialConfirmToken(
  token: string,
): { ok: true; trialId: string; email: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر التحقق.' };
  const parts = String(token ?? '').trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, error: 'رابط غير صالح.' };
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  let got: Buffer;
  try {
    got = Buffer.from(parts[1], 'base64url');
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  try {
    const parsed = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as {
      tid?: string;
      em?: string;
      exp?: number;
    };
    if (!parsed.tid || !parsed.em || !parsed.exp) return { ok: false, error: 'رابط غير صالح.' };
    if ((parsed as { purpose?: string }).purpose) return { ok: false, error: 'رابط غير صالح.' };
    if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'انتهت صلاحية رابط التأكيد.' };
    return { ok: true, trialId: parsed.tid, email: parsed.em };
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
}

export function generalTrialConfirmUrl(token: string): string {
  return `https://store.halaqmap.com/#/store/try/confirm?t=${encodeURIComponent(token)}`;
}

const NOT_ME_HOURS = 48 as const;

export function mintGeneralTrialNotMeToken(input: {
  trialId: string;
  email: string;
}): { ok: true; token: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر تجهيز رسالة التذكير.' };
  const exp = Math.floor(Date.now() / 1000) + NOT_ME_HOURS * 3600;
  const payloadB64 = Buffer.from(
    JSON.stringify({ tid: input.trialId, em: input.email, exp, purpose: 'not_me' }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return { ok: true, token: `${payloadB64}.${sig}` };
}

export function verifyGeneralTrialNotMeToken(
  token: string,
): { ok: true; trialId: string; email: string } | { ok: false; error: string } {
  const secret = confirmSecret();
  if (!secret) return { ok: false, error: 'تعذر التحقق.' };
  const parts = String(token ?? '').trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, error: 'رابط غير صالح.' };
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  let got: Buffer;
  try {
    got = Buffer.from(parts[1], 'base64url');
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, error: 'رابط غير صالح.' };
  }
  try {
    const parsed = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as {
      tid?: string;
      em?: string;
      exp?: number;
      purpose?: string;
    };
    if (!parsed.tid || !parsed.em || !parsed.exp || parsed.purpose !== 'not_me') {
      return { ok: false, error: 'رابط غير صالح.' };
    }
    if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'انتهت صلاحية الرابط.' };
    return { ok: true, trialId: parsed.tid, email: parsed.em };
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
}

export function generalTrialNotMeUrl(token: string): string {
  return `https://store.halaqmap.com/#/store/try/not-me?d=${encodeURIComponent(token)}`;
}

export async function declineNotRequestedGeneralTrial(
  db: Db,
  token: string,
): Promise<{ ok: true; alreadyResolved?: boolean } | { ok: false; error: string }> {
  const verified = verifyGeneralTrialNotMeToken(token);
  if (!verified.ok) return verified;
  const { data } = await db
    .from('store_product_trials')
    .select('id, status, beneficiary_email')
    .eq('id', verified.trialId)
    .maybeSingle();
  if (!data) return { ok: false, error: 'رابط غير صالح.' };
  const rowEmail = normalizeTrialEmail((data as { beneficiary_email?: string }).beneficiary_email);
  if (rowEmail !== normalizeTrialEmail(verified.email)) return { ok: false, error: 'رابط غير صالح.' };
  if (String((data as { status?: string }).status) !== 'pending_confirm') {
    return { ok: true, alreadyResolved: true };
  }
  const now = new Date().toISOString();
  const { error } = await db
    .from('store_product_trials')
    .update({
      status: 'declined',
      review_note: 'تم إنهاؤه تلقائياً — صاحب البريد أفاد أنه لم يطلبه (رابط "لم أطلب هذا").',
      reviewed_by: 'نظام — تبليغ صاحب البريد',
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', verified.trialId);
  if (error) return { ok: false, error: 'تعذر إنهاء الطلب.' };
  return { ok: true };
}

type Db = SupabaseClient;

export async function enterGeneralTrial(
  db: Db,
  input: {
    productKey: unknown;
    email: unknown;
    shopName: unknown;
    city: unknown;
    neighborhood: unknown;
    whatsapp?: unknown;
    acceptedTerms?: unknown;
    committed?: unknown;
  },
): Promise<{ ok: true; trialId: string; confirmToken: string } | { ok: false; error: string }> {
  if (input.acceptedTerms !== true) return { ok: false, error: 'الموافقة على شروط التجربة العامة مطلوبة.' };
  if (input.committed !== true) return { ok: false, error: 'التزم بتشغيل الصفحة لبيع فعلي.' };
  if (!isGeneralTrialProductKey(input.productKey)) {
    return { ok: false, error: 'اختر منتجاً من التجربة العامة.' };
  }
  const entered = await requestVisitorStoreProductTrial(db, {
    productKey: input.productKey as StoreGeneralTrialKey,
    email: String(input.email || ''),
    shopName: String(input.shopName || ''),
    city: String(input.city || ''),
    neighborhood: String(input.neighborhood || ''),
    whatsapp: String(input.whatsapp || ''),
  });
  if (!entered.ok) return entered;
  const minted = mintGeneralTrialConfirmToken({
    trialId: entered.trialId,
    email: normalizeTrialEmail(input.email),
  });
  if (!minted.ok) return minted;
  return { ok: true, trialId: entered.trialId, confirmToken: minted.token };
}

export async function confirmGeneralTrial(
  db: Db,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const verified = verifyGeneralTrialConfirmToken(token);
  if (!verified.ok) return verified;
  return confirmVisitorStoreProductTrial(db, verified.trialId, verified.email);
}
