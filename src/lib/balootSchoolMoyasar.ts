/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مفاتيح ونموذج ميسر لدفع مدرسة البلوت — يتبع VITE_PAYMENT_ENV العام لبقية
 * دفعات ميسر الحقيقية في المنصة (بلا راية مستقلة تُبقيه تجريبياً افتراضياً).
 */
import { BALOOT_SCHOOL_PRODUCT } from '@/config/balootSchoolPay';

export function balootSchoolLivePaymentsEnabled(): boolean {
  const liveEnv = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase() === 'live';
  const raw = String(import.meta.env.VITE_BALOOT_SCHOOL_LIVE_PAYMENTS ?? '').trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return liveEnv;
  return liveEnv;
}

export function resolveBalootSchoolPublishableKey(): string {
  const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
  const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
  const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
  if (balootSchoolLivePaymentsEnabled()) {
    if (liveKey.startsWith('pk_live_')) return liveKey;
    if (legacy.startsWith('pk_live_')) return legacy;
    return '';
  }
  if (testKey.startsWith('pk_test_')) return testKey;
  if (legacy.startsWith('pk_test_')) return legacy;
  return '';
}

export function buildBalootSchoolCallbackUrl(registrationId: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : 'https://www.halaqmap.com';
  const q = new URLSearchParams();
  q.set('purpose', BALOOT_SCHOOL_PRODUCT);
  q.set('baloot_school_rid', registrationId);
  return `${origin}/?${q.toString()}`;
}

function balootSchoolReturnParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const top = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '');
  const hashQuery = hash.includes('?') ? hash.split('?').slice(1).join('?') : '';
  const nested = new URLSearchParams(hashQuery);
  const merged = new URLSearchParams(top);
  nested.forEach((value, key) => {
    if (!merged.get(key)) merged.set(key, value);
  });
  return merged;
}

export function readBalootSchoolReturnPaymentId(): string {
  return balootSchoolReturnParams().get('id')?.trim() || '';
}

export function isBalootSchoolPaymentReturn(): boolean {
  const params = balootSchoolReturnParams();
  if ((params.get('purpose') || '').trim() === BALOOT_SCHOOL_PRODUCT) return true;
  return Boolean((params.get('id') || '').trim());
}
