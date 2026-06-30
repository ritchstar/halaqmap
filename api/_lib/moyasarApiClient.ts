const DEFAULT_MOYSAR_API_BASE = 'https://api.moyasar.com/v1';

export function resolveMoyasarApiBase(): string {
  const raw = (process.env.MOYSAR_API_BASE || DEFAULT_MOYSAR_API_BASE).trim().replace(/\/$/, '');
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === 'api.moyasar.com') return raw;
  } catch {
    // ignore invalid MOYSAR_API_BASE
  }
  return DEFAULT_MOYSAR_API_BASE;
}

export function resolveMoyasarSecretKey(): string {
  const mode = (process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  const testKey = (process.env.MOYSAR_SECRET_TEST_API_KEY || '').trim();
  const liveKey = (process.env.MOYSAR_SECRET_LIVE_API_KEY || '').trim();
  const legacy = (process.env.MOYSAR_SECRET_API_KEY || '').trim();
  const candidates = mode === 'live' ? [liveKey, legacy, testKey] : [testKey, legacy, liveKey];
  const picked = candidates.find((k) => k.startsWith('sk_')) || '';
  return picked.replace(/\s+/g, '');
}

export function secretKeyLooksValid(secret: string): boolean {
  const mode = (process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  if (!secret.startsWith('sk_')) return false;
  if (secret.includes('...') || secret.includes('***')) return false;
  if (secret.length < 20) return false;
  if (mode === 'live') return secret.startsWith('sk_live_');
  return secret.startsWith('sk_test_') || secret.startsWith('sk_live_');
}

export function moyasarBasicAuthHeader(secret: string): string {
  const token = `${secret}:`;
  let binary = '';
  for (const byte of new TextEncoder().encode(token)) binary += String.fromCharCode(byte);
  const encoded =
    typeof btoa === 'function'
      ? btoa(binary)
      : typeof Buffer !== 'undefined'
        ? Buffer.from(token, 'utf8').toString('base64')
        : '';
  return `Basic ${encoded}`;
}

export type MoyasarUpstreamResult = { status: number; text: string };

export function moyasarPaymentIsPaid(status: string): boolean {
  const s = String(status || '').trim().toLowerCase();
  return s === 'paid' || s === 'success' || s === 'succeeded' || s === 'captured';
}

export function moyasarPaymentStatusRetryable(status: string): boolean {
  const s = String(status || '').trim().toLowerCase();
  return s === '' || s === 'initiated' || s === 'pending' || s === 'authorized' || s === 'processing';
}

export async function fetchMoyasarPayment(
  paymentId: string,
  secret: string,
  apiBase = resolveMoyasarApiBase(),
): Promise<MoyasarUpstreamResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const upstream = await fetch(`${apiBase}/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: moyasarBasicAuthHeader(secret),
        Accept: 'application/json',
        'User-Agent': 'halaqmap-verify/1.0',
      },
      signal: controller.signal,
    });
    const text = await upstream.text();
    return { status: upstream.status, text };
  } finally {
    clearTimeout(timer);
  }
}
