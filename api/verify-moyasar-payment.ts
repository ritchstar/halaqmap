/**
 * التحقق من حالة دفع ميسر (Moyasar) على الخادم — لا يُعرَض مفتاح السرّ في الواجهة.
 * GET https://api.moyasar.com/v1/payments/:id — Basic Auth: اسم المستخدم = المفتاح السري، كلمة المرور فارغة.
 * @see https://docs.mysr.dev/api/payments/02-fetch-payment
 */

import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';

export const config = { maxDuration: 20 };

const MOYSAR_API_BASE = (process.env.MOYSAR_API_BASE || 'https://api.moyasar.com/v1').trim().replace(/\/$/, '');
/** UUID كما تعيده ميسر في باراميتر ?id= */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
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
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'verify-moyasar-payment');
  if (!guard.ok) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = (process.env.MOYSAR_SECRET_API_KEY || '').trim();
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

  const url = new URL(request.url);
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

  const basic = Buffer.from(`${secret}:`, 'utf8').toString('base64');
  let upstream: Response;
  try {
    upstream = await fetch(`${MOYSAR_API_BASE}/payments/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: 'application/json',
      },
    });
  } catch {
    return Response.json({ ok: false, error: 'upstream_network' }, { status: 502, headers });
  }

  const text = await upstream.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_upstream', status: upstream.status },
      { status: 502, headers },
    );
  }

  if (!upstream.ok) {
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
