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

export function occasionCardLivePaymentsEnabled(): boolean {
  return (
    String(import.meta.env.VITE_STORE_PAID_INVITE_LIVE_PAYMENTS || '').trim().toLowerCase() === 'true' &&
    String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase() === 'live'
  );
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

export function readOccasionCardReturnPaymentId(): string {
  if (typeof window === 'undefined') return '';
  const top = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '');
  const hashQuery = hash.includes('?') ? hash.split('?').slice(1).join('?') : '';
  const nested = new URLSearchParams(hashQuery);
  return (top.get('id') || nested.get('id') || '').trim();
}
