/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مفاتيح ونموذج ميسر لدفع مدرسة الشطرنج الاحترافية — يتبع VITE_PAYMENT_ENV
 * العام لبقية دفعات ميسر الحقيقية في المنصة (بلا رايه مستقلة تُبقيه تجريبياً افتراضياً).
 */
import { CHESS_SCHOOL_PRODUCT } from '@/config/chessSchoolPay';

export function chessSchoolLivePaymentsEnabled(): boolean {
  const liveEnv = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase() === 'live';
  const raw = String(import.meta.env.VITE_CHESS_SCHOOL_LIVE_PAYMENTS ?? '').trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return liveEnv;
  return liveEnv;
}

export function resolveChessSchoolPublishableKey(): string {
  const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
  const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
  const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
  if (chessSchoolLivePaymentsEnabled()) {
    if (liveKey.startsWith('pk_live_')) return liveKey;
    if (legacy.startsWith('pk_live_')) return legacy;
    return '';
  }
  if (testKey.startsWith('pk_test_')) return testKey;
  if (legacy.startsWith('pk_test_')) return legacy;
  return '';
}

export function buildChessSchoolCallbackUrl(registrationId: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : 'https://www.halaqmap.com';
  const q = new URLSearchParams();
  q.set('purpose', CHESS_SCHOOL_PRODUCT);
  q.set('chess_school_rid', registrationId);
  return `${origin}/?${q.toString()}`;
}

function chessSchoolReturnParams(): URLSearchParams {
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

export function readChessSchoolReturnPaymentId(): string {
  return chessSchoolReturnParams().get('id')?.trim() || '';
}

export function isChessSchoolPaymentReturn(): boolean {
  const params = chessSchoolReturnParams();
  if ((params.get('purpose') || '').trim() === CHESS_SCHOOL_PRODUCT) return true;
  return Boolean((params.get('id') || '').trim());
}
