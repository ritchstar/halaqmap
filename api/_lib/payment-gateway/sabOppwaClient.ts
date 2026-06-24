/**
 * عميل OPPWA / HyperPay لبوابة SAB.
 * @see https://hyperpay.docs.oppwa.com/integrations/widget
 */

import {
  resolveSabAccessToken,
  resolveSabEntityId,
  resolveSabOppwaApiBase,
} from './sabOppwaConfig.js';

/** أكواد نجاح OPPWA المعتادة */
const OPPWA_SUCCESS_RE = /^(000\.000\.|000\.100\.1|000\.[36])/;
const OPPWA_PENDING_RE = /^000\.200\./;

export type SabOppwaPaymentStatus = 'paid' | 'pending' | 'failed' | 'cancelled';

export type SabOppwaPaymentView = {
  checkoutId: string;
  status: SabOppwaPaymentStatus;
  resultCode: string;
  resultDescription: string;
  amountHalalas: number | null;
  currency: string;
  merchantTransactionId: string | null;
  customParameters: Record<string, string>;
  raw: Record<string, unknown>;
};

export type SabCreateCheckoutInput = {
  amountHalalas: number;
  currency?: 'SAR';
  merchantTransactionId: string;
  shopperResultUrl: string;
  customParameters?: Record<string, string>;
  paymentType?: 'DB' | 'PA';
};

export type SabCreateCheckoutResult =
  | { ok: true; checkoutId: string; integrity?: string | null }
  | { ok: false; error: string; detail?: string };

function authHeaders(): Record<string, string> {
  const token = resolveSabAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

function entityId(): string {
  return resolveSabEntityId();
}

function apiBase(): string {
  return resolveSabOppwaApiBase();
}

export function halalasToOppwaAmount(amountHalalas: number): string {
  const halalas = Math.max(100, Math.trunc(amountHalalas));
  return (halalas / 100).toFixed(2);
}

export function oppwaAmountToHalalas(amount: unknown): number | null {
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return Math.round(amount * 100);
  }
  const s = String(amount ?? '').trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function normalizeCustomParameters(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v == null) continue;
    out[String(k)] = String(v);
  }
  return out;
}

export function mapOppwaResultToStatus(resultCode: string): SabOppwaPaymentStatus {
  const code = String(resultCode || '').trim();
  if (!code) return 'pending';
  if (OPPWA_SUCCESS_RE.test(code)) return 'paid';
  if (OPPWA_PENDING_RE.test(code)) return 'pending';
  if (/cancel/i.test(code) || code.startsWith('100.396.')) return 'cancelled';
  return 'failed';
}

function parsePaymentJson(checkoutId: string, body: Record<string, unknown>): SabOppwaPaymentView {
  const result = (body.result && typeof body.result === 'object' ? body.result : {}) as Record<string, unknown>;
  const resultCode = String(result.code ?? '').trim();
  const resultDescription = String(result.description ?? '').trim();
  const customParameters = normalizeCustomParameters(body.customParameters);
  const amountHalalas = oppwaAmountToHalalas(body.amount);
  const currency = String(body.currency ?? 'SAR').trim().toUpperCase() || 'SAR';

  return {
    checkoutId,
    status: mapOppwaResultToStatus(resultCode),
    resultCode,
    resultDescription,
    amountHalalas,
    currency,
    merchantTransactionId: String(body.merchantTransactionId ?? '').trim() || null,
    customParameters,
    raw: body,
  };
}

export async function createSabCheckout(input: SabCreateCheckoutInput): Promise<SabCreateCheckoutResult> {
  const base = apiBase();
  const entity = entityId();
  if (!base || !entity || !resolveSabAccessToken()) {
    return { ok: false, error: 'sab_not_configured' };
  }

  const params = new URLSearchParams();
  params.set('entityId', entity);
  params.set('amount', halalasToOppwaAmount(input.amountHalalas));
  params.set('currency', input.currency || 'SAR');
  params.set('paymentType', input.paymentType || 'DB');
  params.set('merchantTransactionId', input.merchantTransactionId);
  params.set('shopperResultUrl', input.shopperResultUrl);
  params.set('integrity', 'true');

  for (const [key, value] of Object.entries(input.customParameters || {})) {
    if (!key || value == null) continue;
    params.set(`customParameters[${key}]`, String(value));
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/checkouts`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  } catch {
    return { ok: false, error: 'upstream_network' };
  }

  const text = await upstream.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return { ok: false, error: 'invalid_upstream', detail: text.slice(0, 400) };
  }

  if (!upstream.ok) {
    const result = (body.result && typeof body.result === 'object' ? body.result : {}) as Record<string, unknown>;
    return {
      ok: false,
      error: 'oppwa_checkout_failed',
      detail: String(result.description || body.description || text).slice(0, 400),
    };
  }

  const checkoutId = String(body.id ?? '').trim();
  if (!checkoutId) {
    return { ok: false, error: 'missing_checkout_id', detail: text.slice(0, 400) };
  }

  const integrity =
    typeof body.integrity === 'string'
      ? body.integrity
      : typeof (body as { integrity?: unknown }).integrity === 'string'
        ? String((body as { integrity?: string }).integrity)
        : null;

  return { ok: true, checkoutId, integrity };
}

export async function fetchSabPaymentByCheckoutId(checkoutId: string): Promise<
  | { ok: true; payment: SabOppwaPaymentView }
  | { ok: false; error: string; detail?: string; status?: number }
> {
  const resourcePath = `/v1/checkouts/${encodeURIComponent(checkoutId)}/payment`;
  return fetchSabPaymentByResourcePath(resourcePath, checkoutId);
}

export async function fetchSabPaymentByResourcePath(
  resourcePath: string,
  checkoutIdFallback?: string,
): Promise<
  | { ok: true; payment: SabOppwaPaymentView }
  | { ok: false; error: string; detail?: string; status?: number }
> {
  const base = apiBase();
  const entity = entityId();
  if (!base || !entity || !resolveSabAccessToken()) {
    return { ok: false, error: 'sab_not_configured' };
  }

  const path = resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`;
  const url = `${base.replace(/\/v1$/i, '')}${path}?entityId=${encodeURIComponent(entity)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
    });
  } catch {
    return { ok: false, error: 'upstream_network' };
  }

  const text = await upstream.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return { ok: false, error: 'invalid_upstream', detail: text.slice(0, 400), status: upstream.status };
  }

  if (!upstream.ok) {
    const result = (body.result && typeof body.result === 'object' ? body.result : {}) as Record<string, unknown>;
    return {
      ok: false,
      error: 'oppwa_fetch_failed',
      detail: String(result.description || text).slice(0, 400),
      status: upstream.status,
    };
  }

  const checkoutId =
    checkoutIdFallback ||
    String(body.id ?? '').trim() ||
    path.match(/\/checkouts\/([^/]+)\/payment/i)?.[1] ||
    '';

  if (!checkoutId) {
    return { ok: false, error: 'missing_checkout_id', detail: text.slice(0, 400) };
  }

  return { ok: true, payment: parsePaymentJson(checkoutId, body) };
}

/** يستخرج metadata من customParameters ببادئة SHOPPER_ */
export function metadataFromSabCustomParameters(custom: Record<string, string>): Record<string, unknown> {
  const meta: Record<string, unknown> = { payment_gateway: 'SAB' };
  for (const [k, v] of Object.entries(custom)) {
    const key = k.startsWith('SHOPPER_') ? k.slice('SHOPPER_'.length) : k;
    if (!key) continue;
    if (key === 'expected_amount_halalas' || key === 'license_quantity') {
      const n = Number.parseInt(v, 10);
      if (Number.isFinite(n)) meta[key] = n;
      continue;
    }
    if (key === 'digital_shift_addon') {
      meta[key] = v === 'true' || v === '1';
      continue;
    }
    meta[key] = v;
  }
  return meta;
}

export function buildSabShopperCustomParameters(metadata: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (v == null) continue;
    const key = `SHOPPER_${k}`;
    if (typeof v === 'boolean') out[key] = v ? 'true' : 'false';
    else out[key] = String(v);
  }
  out.SHOPPER_payment_gateway = 'SAB';
  return out;
}
