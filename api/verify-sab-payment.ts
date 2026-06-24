/**
 * GET /api/verify-sab-payment
 * التحقق من حالة دفع OPPWA (بنك الأول SAB) على الخادم.
 */
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { SABProvider } from './_lib/payment-gateway/SABProvider.js';
import {
  fetchSabPaymentByCheckoutId,
  fetchSabPaymentByResourcePath,
  halalasToOppwaAmount,
  metadataFromSabCustomParameters,
} from './_lib/payment-gateway/sabOppwaClient.js';
import { sabOppwaConfigured } from './_lib/payment-gateway/sabOppwaConfig.js';

export const config = { maxDuration: 20 };

const CHECKOUT_ID_RE = /^[A-Za-z0-9._-]{8,128}$/;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'verify-sab-payment');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  if (!sabOppwaConfigured()) {
    return Response.json(
      {
        ok: false,
        error: 'sab_disabled',
        hint: 'Set SAB_OPPWA_API_BASE, SAB_ENTITY_ID_* and SAB_ACCESS_TOKEN_* on the server.',
      },
      { status: 503, headers },
    );
  }

  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').trim();
  const resourcePath = (url.searchParams.get('resourcePath') || '').trim();

  if (!id && !resourcePath) {
    return Response.json(
      { ok: false, error: 'missing_id', hint: 'Provide ?id=checkoutId or ?resourcePath=/v1/checkouts/.../payment' },
      { status: 400, headers },
    );
  }

  if (id && !CHECKOUT_ID_RE.test(id)) {
    return Response.json({ ok: false, error: 'invalid_id' }, { status: 400, headers });
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

  const fetched = resourcePath
    ? await fetchSabPaymentByResourcePath(resourcePath, id || undefined)
    : await fetchSabPaymentByCheckoutId(id);

  if (!fetched.ok) {
    return Response.json(
      {
        ok: false,
        error: fetched.error,
        detail: fetched.detail ?? null,
        status: fetched.status ?? null,
      },
      { status: fetched.status === 404 ? 404 : 502, headers },
    );
  }

  const payment = fetched.payment;
  const paid = payment.status === 'paid' && SABProvider.isSuccessStatus('paid');
  const amount = payment.amountHalalas;
  const currency = payment.currency || 'SAR';

  if (expectedAmount != null && amount != null && amount !== expectedAmount) {
    return Response.json(
      {
        ok: false,
        error: 'amount_mismatch',
        expectedAmount,
        actualAmount: amount,
        paymentId: payment.checkoutId,
        status: payment.status,
      },
      { status: 409, headers },
    );
  }

  if (expectedCurrency && currency && expectedCurrency !== currency) {
    return Response.json(
      {
        ok: false,
        error: 'currency_mismatch',
        expectedCurrency,
        actualCurrency: currency,
        paymentId: payment.checkoutId,
      },
      { status: 409, headers },
    );
  }

  const metadata = metadataFromSabCustomParameters(payment.customParameters);
  const amountFormat =
    amount != null ? `${halalasToOppwaAmount(amount)} ${currency}` : null;

  return Response.json(
    {
      ok: true,
      paid,
      status: payment.status,
      resultCode: payment.resultCode,
      resultDescription: payment.resultDescription,
      id: payment.checkoutId,
      amount: amount ?? null,
      currency,
      amount_format: amountFormat,
      metadata,
    },
    { headers },
  );
}
