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
    if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'انتهت صلاحية رابط التأكيد.' };
    return { ok: true, trialId: parsed.tid, email: parsed.em };
  } catch {
    return { ok: false, error: 'رابط غير صالح.' };
  }
}

export function generalTrialConfirmUrl(token: string): string {
  return `https://store.halaqmap.com/#/store/try/confirm?t=${encodeURIComponent(token)}`;
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
