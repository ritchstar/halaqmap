/**
 * إعدادات بوابة بنك الأول (SAB) عبر OPPWA / HyperPay.
 * المفاتيح تُضبط على Vercel وSupabase Edge حسب PAYMENT_ENV.
 */

export type SabPaymentMode = 'test' | 'live';

const DEFAULT_OPPWA_TEST_BASE = 'https://eu-test.oppwa.com/v1';

export function resolveSabPaymentMode(): SabPaymentMode {
  const mode = String(process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

function pickEnv(testKey: string, liveKey: string, legacyKey?: string): string {
  const mode = resolveSabPaymentMode();
  const test = String(process.env[testKey] || '').trim();
  const live = String(process.env[liveKey] || '').trim();
  const legacy = legacyKey ? String(process.env[legacyKey] || '').trim() : '';
  if (mode === 'live') return live || legacy;
  return test || legacy;
}

/** عنوان API الأساسي (ينتهي بـ /v1) */
export function resolveSabOppwaApiBase(): string {
  const mode = resolveSabPaymentMode();
  const explicit =
    mode === 'live'
      ? String(process.env.SAB_OPPWA_API_BASE_LIVE || '').trim()
      : String(process.env.SAB_OPPWA_API_BASE_TEST || '').trim();
  const shared = String(process.env.SAB_OPPWA_API_BASE || '').trim();
  const base = explicit || shared || (mode === 'live' ? '' : DEFAULT_OPPWA_TEST_BASE);
  return base.replace(/\/$/, '');
}

/** قاعدة تحميل الودجت (بدون /v1) */
export function resolveSabWidgetBase(): string {
  const apiBase = resolveSabOppwaApiBase();
  if (!apiBase) return '';
  return apiBase.replace(/\/v1$/i, '');
}

export function resolveSabEntityId(): string {
  const mode = resolveSabPaymentMode();
  const test = String(
    process.env.SAB_ENTITY_ID_TEST || process.env.SAB_MERCHANT_ID_TEST || '',
  ).trim();
  const live = String(
    process.env.SAB_ENTITY_ID_LIVE || process.env.SAB_MERCHANT_ID_LIVE || '',
  ).trim();
  const legacy = String(process.env.SAB_ENTITY_ID || process.env.SAB_MERCHANT_ID || '').trim();
  if (mode === 'live') return live || legacy;
  return test || legacy;
}

export function resolveSabAccessToken(): string {
  const mode = resolveSabPaymentMode();
  const test = String(
    process.env.SAB_ACCESS_TOKEN_TEST || process.env.SAB_SECRET_TEST || '',
  ).trim();
  const live = String(
    process.env.SAB_ACCESS_TOKEN_LIVE || process.env.SAB_SECRET_LIVE || '',
  ).trim();
  const legacy = String(process.env.SAB_ACCESS_TOKEN || process.env.SAB_SECRET || '').trim();
  if (mode === 'live') return live || legacy;
  return test || legacy;
}

export function resolveSabWebhookSecret(): string {
  return pickEnv('SAB_WEBHOOK_TEST_SECRET', 'SAB_WEBHOOK_LIVE_SECRET', 'SAB_WEBHOOK_SECRET');
}

export function sabOppwaConfigured(): boolean {
  return Boolean(resolveSabOppwaApiBase() && resolveSabEntityId() && resolveSabAccessToken());
}
