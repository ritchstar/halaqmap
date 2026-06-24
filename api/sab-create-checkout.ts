/**
 * POST /api/sab-create-checkout
 * إنشاء جلسة دفع OPPWA لبوابة بنك الأول (SAB) — المفاتيح على الخادم فقط.
 */
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { SABProvider } from './_lib/payment-gateway/SABProvider.js';
import {
  buildSabShopperCustomParameters,
  createSabCheckout,
  halalasToOppwaAmount,
} from './_lib/payment-gateway/sabOppwaClient.js';
import {
  resolveSabOppwaApiBase,
  resolveSabWidgetBase,
  sabOppwaConfigured,
} from './_lib/payment-gateway/sabOppwaConfig.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

const REQUEST_ID_RE = /^HM-[A-Z0-9-]{6,}$/i;

type Body = {
  tier?: unknown;
  amountHalalas?: unknown;
  licenseQuantity?: unknown;
  digitalShiftAddonSelected?: unknown;
  barberName?: unknown;
  requestId?: unknown;
  linkedBarberId?: unknown;
  shopperResultUrl?: unknown;
};

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'sab-create-checkout');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  if (!sabOppwaConfigured()) {
    return Response.json(
      {
        ok: false,
        error: 'sab_disabled',
        hint: 'Set SAB_OPPWA_API_BASE, SAB_ENTITY_ID_* and SAB_ACCESS_TOKEN_* (or SAB_SECRET_*) on the server.',
      },
      { status: 503, headers },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  const tier = String(body.tier || '').trim();
  const barberName = String(body.barberName || '').trim();
  const requestId = String(body.requestId || '').trim();
  const linkedBarberId = String(body.linkedBarberId || '').trim();
  const amountHalalas = Number(body.amountHalalas);
  const licenseQuantity = Math.min(12, Math.max(1, Math.trunc(Number(body.licenseQuantity) || 1)));
  const digitalShiftAddonSelected =
    body.digitalShiftAddonSelected === true ||
    body.digitalShiftAddonSelected === 'true' ||
    body.digitalShiftAddonSelected === 1;

  if (!tier || !barberName || !Number.isFinite(amountHalalas) || amountHalalas < 100) {
    return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400, headers });
  }

  if (requestId && !REQUEST_ID_RE.test(requestId)) {
    return Response.json({ ok: false, error: 'invalid_request_id' }, { status: 400, headers });
  }

  const shopperResultUrl = String(body.shopperResultUrl || '').trim();
  if (!shopperResultUrl.startsWith('https://') && !shopperResultUrl.startsWith('http://')) {
    return Response.json(
      { ok: false, error: 'invalid_shopper_result_url', hint: 'Provide absolute shopperResultUrl (HTTPS in production).' },
      { status: 400, headers },
    );
  }

  const session = SABProvider.createSessionPayload({
    tier,
    amountHalalas: Math.round(amountHalalas),
    licenseQuantity,
    digitalShiftAddonSelected,
    barberName,
    requestId,
    linkedBarberId,
  });

  const metadata = {
    ...session.metadata,
    license_quantity: licenseQuantity,
    digital_shift_addon: digitalShiftAddonSelected,
  };

  const merchantTransactionId = requestId || `HM-PAY-${Date.now()}`;
  const checkout = await createSabCheckout({
    amountHalalas: Math.round(amountHalalas),
    merchantTransactionId,
    shopperResultUrl,
    customParameters: buildSabShopperCustomParameters(metadata),
  });

  if (!checkout.ok) {
    return Response.json(
      { ok: false, error: checkout.error, detail: checkout.detail ?? null },
      { status: 502, headers },
    );
  }

  const widgetBase = resolveSabWidgetBase() || resolveSabOppwaApiBase().replace(/\/v1$/i, '');
  const widgetScriptUrl = `${widgetBase}/v1/paymentWidgets.js?checkoutId=${encodeURIComponent(checkout.checkoutId)}`;

  return Response.json(
    {
      ok: true,
      gateway: 'SAB',
      checkoutId: checkout.checkoutId,
      widgetScriptUrl,
      shopperResultUrl,
      amountDisplay: halalasToOppwaAmount(Math.round(amountHalalas)),
      currency: 'SAR',
      integrity: checkout.integrity ?? null,
      metadata,
    },
    { headers },
  );
}
