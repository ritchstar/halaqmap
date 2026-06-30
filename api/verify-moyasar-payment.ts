/**
 * التحقق من حالة دفع ميسر (Moyasar) على الخادم — لا يُعرَض مفتاح السرّ في الواجهة.
 * GET https://api.moyasar.com/v1/payments/:id — Basic Auth: اسم المستخدم = المفتاح السري، كلمة المرور فارغة.
 * @see https://docs.mysr.dev/api/payments/02-fetch-payment
 *
 * Production keys location (Vercel Environment Variables):
 * - PAYMENT_ENV=live
 * - MOYSAR_SECRET_LIVE_API_KEY=sk_live_...
 * Optional sandbox:
 * - PAYMENT_ENV=test
 * - MOYSAR_SECRET_TEST_API_KEY=sk_test_...
 */

import https from 'node:https';
import { URL } from 'node:url';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const DEFAULT_MOYSAR_API_BASE = 'https://api.moyasar.com/v1';

function resolveMoyasarApiBase(): string {
  const raw = (process.env.MOYSAR_API_BASE || DEFAULT_MOYSAR_API_BASE).trim().replace(/\/$/, '');
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === 'api.moyasar.com') return raw;
  } catch {
    // ignore invalid MOYSAR_API_BASE
  }
  return DEFAULT_MOYSAR_API_BASE;
}

const MOYSAR_API_BASE = resolveMoyasarApiBase();
/** UUID كما تعيده ميسر في باراميتر ?id= */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function resolveMoyasarSecretKey(): string {
  const mode = (process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  const testKey = (process.env.MOYSAR_SECRET_TEST_API_KEY || '').trim();
  const liveKey = (process.env.MOYSAR_SECRET_LIVE_API_KEY || '').trim();
  const legacy = (process.env.MOYSAR_SECRET_API_KEY || '').trim();
  const candidates = mode === 'live' ? [liveKey, legacy, testKey] : [testKey, legacy, liveKey];
  const picked = candidates.find((k) => k.startsWith('sk_')) || '';
  return picked.replace(/\s+/g, '');
}

function secretKeyLooksValid(secret: string): boolean {
  const mode = (process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  if (!secret.startsWith('sk_')) return false;
  if (mode === 'live') return secret.startsWith('sk_live_');
  return secret.startsWith('sk_test_') || secret.startsWith('sk_live_');
}

function moyasarBasicAuthHeader(secret: string): string {
  const token = `${secret}:`;
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(token, 'utf8').toString('base64')}`;
  }
  let binary = '';
  for (const byte of new TextEncoder().encode(token)) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

type MoyasarUpstreamResult = { status: number; text: string };

function fetchMoyasarPayment(id: string, secret: string): Promise<MoyasarUpstreamResult> {
  const paymentUrl = new URL(`${MOYSAR_API_BASE}/payments/${encodeURIComponent(id)}`);
  const auth = moyasarBasicAuthHeader(secret);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: paymentUrl.hostname,
        port: paymentUrl.port || 443,
        path: `${paymentUrl.pathname}${paymentUrl.search}`,
        method: 'GET',
        headers: {
          Authorization: auth,
          Accept: 'application/json',
          'User-Agent': 'halaqmap-verify/1.0',
        },
        timeout: 12_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 502,
            text: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error('upstream_timeout'));
    });
    req.on('error', reject);
    req.end();
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

type MoyasarPaymentJson = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  fee?: number;
  description?: string;
  amount_format?: string;
};

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  try {
    return await handleVerifyMoyasarPayment(request, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unexpected_error';
    return Response.json(
      {
        ok: false,
        error: 'server_error',
        message,
        hint: 'تعذر إكمال التحقق من الدفع على الخادم. راجع سجلات Vercel أو أعد المحاولة.',
      },
      { status: 500, headers },
    );
  }
}

async function handleVerifyMoyasarPayment(
  request: Request,
  headers: Record<string, string>,
): Promise<Response> {
  const guard = runRegistrationRouteGuards(request, 'verify-moyasar-payment');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = new URL(request.url);
  if (url.searchParams.get('health') === '1') {
    const secret = resolveMoyasarSecretKey();
    return Response.json(
      {
        ok: true,
        moyasarConfigured: Boolean(secret),
        secretLooksValid: secret ? secretKeyLooksValid(secret) : false,
        apiBase: MOYSAR_API_BASE,
        paymentEnv: (process.env.PAYMENT_ENV || 'test').trim().toLowerCase(),
      },
      { headers },
    );
  }

  const secret = resolveMoyasarSecretKey();
  if (!secret) {
    return Response.json(
      {
        ok: false,
        error: 'moyasar_disabled',
        hint: 'Set MOYSAR_SECRET_API_KEY on the server (Vercel) to enable payment verification.',
      },
      { status: 503, headers },
    );
  }

  if (!secretKeyLooksValid(secret)) {
    return Response.json(
      {
        ok: false,
        error: 'moyasar_secret_invalid',
        hint:
          'يجب أن يبدأ MOYSAR_SECRET_TEST_API_KEY بـ sk_test_ كاملاً من لوحة ميسر (وليس pk_test_ ولا sk_test_... حرفياً).',
      },
      { status: 503, headers },
    );
  }

  const id = (url.searchParams.get('id') || '').trim();
  if (!id || !UUID_RE.test(id)) {
    return Response.json({ ok: false, error: 'invalid_id', hint: 'Provide a valid Moyasar payment UUID as ?id=' }, { status: 400, headers });
  }

  const expectedAmountRaw = url.searchParams.get('expectedAmount');
  const expectedCurrency = (url.searchParams.get('expectedCurrency') || '').trim().toUpperCase() || undefined;
  let expectedAmount: number | undefined;
  if (expectedAmountRaw != null && expectedAmountRaw !== '') {
    const n = Number.parseInt(expectedAmountRaw, 10);
    if (!Number.isFinite(n) || n < 100) {
      return Response.json({ ok: false, error: 'invalid_expected_amount' }, { status: 400, headers });
    }
    expectedAmount = n;
  }

  let upstream: MoyasarUpstreamResult;
  try {
    upstream = await fetchMoyasarPayment(id, secret);
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'upstream_timeout';
    console.error('[verify-moyasar] upstream fetch failed', {
      timedOut,
      message: error instanceof Error ? error.message : String(error),
      apiBase: MOYSAR_API_BASE,
    });
    return Response.json(
      {
        ok: false,
        error: timedOut ? 'upstream_timeout' : 'upstream_network',
        hint: timedOut
          ? 'انتهت مهلة الاتصال ببوابة ميسر. أعد المحاولة خلال ثوانٍ.'
          : 'تعذر الاتصال ببوابة ميسر من الخادم. تحقق من MOYSAR_SECRET_TEST_API_KEY وMOYSAR_API_BASE على Vercel.',
      },
      { status: 502, headers },
    );
  }

  const text = upstream.text;

  if (text.trimStart().startsWith('<')) {
    console.error('[verify-moyasar] upstream returned HTML', {
      status: upstream.status,
      apiBase: MOYSAR_API_BASE,
      snippet: text.replace(/\s+/g, ' ').trim().slice(0, 120),
    });
    return Response.json(
      {
        ok: false,
        error: 'invalid_upstream',
        status: upstream.status,
        hint:
          'رد غير متوقع من مسار ميسر (HTML). احذف MOYSAR_API_BASE من Vercel أو اضبطه على https://api.moyasar.com/v1 فقط.',
      },
      { status: 502, headers },
    );
  }

  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    return Response.json(
      {
        ok: false,
        error: 'invalid_upstream',
        status: upstream.status,
        hint: 'تعذر تحليل رد بوابة ميسر.',
      },
      { status: 502, headers },
    );
  }

  if (upstream.status < 200 || upstream.status >= 300) {
    const err = body as { message?: string; type?: string };
    return Response.json(
      {
        ok: false,
        error: 'moyasar_error',
        status: upstream.status,
        message: err?.message || err?.type || 'fetch_failed',
      },
      { status: upstream.status === 404 ? 404 : 502, headers },
    );
  }

  const p = body as MoyasarPaymentJson;
  const status = String(p.status || '');
  const amount = typeof p.amount === 'number' ? p.amount : NaN;
  const currency = String(p.currency || '');

  if (expectedAmount != null && Number.isFinite(amount) && amount !== expectedAmount) {
    return Response.json(
      {
        ok: false,
        error: 'amount_mismatch',
        expectedAmount,
        actualAmount: amount,
        paymentId: p.id,
        status,
      },
      { status: 409, headers },
    );
  }

  if (expectedCurrency && currency && expectedCurrency !== currency) {
    return Response.json(
      { ok: false, error: 'currency_mismatch', expectedCurrency, actualCurrency: currency, paymentId: p.id },
      { status: 409, headers },
    );
  }

  return Response.json(
    {
      ok: true,
      paid: status === 'paid',
      status,
      id: p.id,
      amount: Number.isFinite(amount) ? amount : null,
      currency: currency || null,
      fee: typeof p.fee === 'number' ? p.fee : null,
      description: p.description ?? null,
      amount_format: p.amount_format ?? null,
    },
    { headers },
  );
}
