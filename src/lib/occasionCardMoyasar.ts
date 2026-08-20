/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مفاتيح ونموذج ميسر لبطاقة المناسبة — مستقل عن رخصة النفاذ.
 */
import { STORE_OCCASION_CARD_PRODUCT, type StorePaidInviteTier } from '@/config/storeIssuedCardsCatalog';

export { STORE_OCCASION_CARD_PRODUCT };

export const OCCASION_CARD_TIER_LABEL_AR: Record<StorePaidInviteTier, string> = {
  quick: 'سريعة',
  featured: 'مميزة',
  luxury: 'فاخرة',
};

/** يتبع VITE_PAYMENT_ENV. يُعاد للتجريبي بـ VITE_STORE_PAID_INVITE_LIVE_PAYMENTS=false. */
export function occasionCardLivePaymentsEnabled(): boolean {
  const liveEnv = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase() === 'live';
  const raw = String(import.meta.env.VITE_STORE_PAID_INVITE_LIVE_PAYMENTS ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return liveEnv;
  return liveEnv;
}

export function resolveOccasionCardPublishableKey(): string {
  const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
  const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
  const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
  if (occasionCardLivePaymentsEnabled()) {
    if (liveKey.startsWith('pk_live_')) return liveKey;
    if (legacy.startsWith('pk_live_')) return legacy;
    return '';
  }
  if (testKey.startsWith('pk_test_')) return testKey;
  if (legacy.startsWith('pk_test_')) return legacy;
  return '';
}

export function buildOccasionCardCallbackUrl(token: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : 'https://www.halaqmap.com';
  const q = new URLSearchParams();
  q.set('purpose', STORE_OCCASION_CARD_PRODUCT);
  q.set('store_card_token', token);
  return `${origin}/?${q.toString()}`;
}

export function occasionCardMoyasarDescription(tier: StorePaidInviteTier): string {
  return `halaqmap — بطاقة مناسبة — ${OCCASION_CARD_TIER_LABEL_AR[tier]}`;
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

function occasionCardReturnParams(): URLSearchParams {
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

export function readOccasionCardReturnPaymentId(): string {
  return occasionCardReturnParams().get('id')?.trim() || '';
}

/** عودة ميسر (نموذج أو فاتورة) — لا مزامنة عند فتح صفحة الدفع أول مرة. */
export function isOccasionCardPaymentReturn(): boolean {
  const params = occasionCardReturnParams();
  const purpose = (params.get('purpose') || '').trim();
  if (purpose === STORE_OCCASION_CARD_PRODUCT) return true;
  return Boolean((params.get('id') || '').trim());
}
