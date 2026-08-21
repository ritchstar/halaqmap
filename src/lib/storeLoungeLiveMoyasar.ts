/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مفاتيح ميسر للاونجا1 — نفس بوابة المتجر، وسم مستقل.
 */
import { STORE_LOUNGE_LIVE_PRODUCT } from '@/config/storeLoungeLive';

export function loungeLiveLivePaymentsEnabled(): boolean {
  const liveEnv = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase() === 'live';
  const raw = String(import.meta.env.VITE_STORE_LOUNGE_LIVE_LIVE_PAYMENTS ?? import.meta.env.VITE_STORE_PAID_INVITE_LIVE_PAYMENTS ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return liveEnv;
  return liveEnv;
}

export function resolveLoungeLivePublishableKey(): string {
  const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
  const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
  const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
  if (loungeLiveLivePaymentsEnabled()) {
    if (liveKey.startsWith('pk_live_')) return liveKey;
    if (legacy.startsWith('pk_live_')) return legacy;
    return '';
  }
  if (testKey.startsWith('pk_test_')) return testKey;
  if (legacy.startsWith('pk_test_')) return legacy;
  return '';
}

export function buildLoungeLiveCallbackUrl(token: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : 'https://www.halaqmap.com';
  const q = new URLSearchParams();
  q.set('purpose', STORE_LOUNGE_LIVE_PRODUCT);
  q.set('store_lounge_token', token);
  return `${origin}/?${q.toString()}`;
}

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

function returnParams(): URLSearchParams {
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

export function readLoungeLiveReturnPaymentId(): string {
  return returnParams().get('id')?.trim() || '';
}

export function isLoungeLivePaymentReturn(): boolean {
  const params = returnParams();
  if ((params.get('purpose') || '').trim() === STORE_LOUNGE_LIVE_PRODUCT) return true;
  return Boolean((params.get('id') || '').trim());
}
