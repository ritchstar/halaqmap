/**
 * POST /api/sab-webhook
 * Webhook دفع بنك الأول (SAB / OPPWA) — يتحقق من الحالة ثم يفعّل الاشتراك.
 *
 * أسرار: SAB_WEBHOOK_*_SECRET، SUPABASE_SERVICE_ROLE_KEY، LISTING_LICENSE_INTERNAL_SECRET
 */
import { timingSafeEqual } from 'node:crypto';
import {
  createSabWebhookSupabase,
  processSabPaymentWebhook,
} from './_lib/sabPaymentWebhookService.js';
import {
  fetchSabPaymentByCheckoutId,
  fetchSabPaymentByResourcePath,
} from './_lib/payment-gateway/sabOppwaClient.js';
import { resolveSabWebhookSecret, sabOppwaConfigured } from './_lib/payment-gateway/sabOppwaConfig.js';

export const config = { maxDuration: 60 };

type WebhookBody = {
  secret_token?: unknown;
  checkout_id?: unknown;
  id?: unknown;
  resource_path?: unknown;
  resourcePath?: unknown;
  event_id?: unknown;
  event_type?: unknown;
};

function verifyBodySecret(token: string): boolean {
  const secret = resolveSabWebhookSecret();
  if (secret.length < 16 || !token) return false;
  try {
    const a = Buffer.from(secret, 'utf8');
    const b = Buffer.from(token, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request): Promise<Response> {
  if (!sabOppwaConfigured()) {
    return Response.json(
      { error: 'server_misconfigured', hint: 'SAB OPPWA keys are not configured.' },
      { status: 503 },
    );
  }

  const supabase = createSabWebhookSupabase();
  if (!supabase) {
    return Response.json({ error: 'server_misconfigured', hint: 'Supabase service role missing.' }, { status: 503 });
  }

  let body: WebhookBody;
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const token = String(body.secret_token ?? '').trim();
  if (!verifyBodySecret(token)) {
    return Response.json({ error: 'invalid_secret_token' }, { status: 401 });
  }

  const checkoutId = String(body.checkout_id ?? body.id ?? '').trim();
  const resourcePath = String(body.resource_path ?? body.resourcePath ?? '').trim();
  if (!checkoutId && !resourcePath) {
    return Response.json({ error: 'missing_checkout_id' }, { status: 400 });
  }

  const fetched = resourcePath
    ? await fetchSabPaymentByResourcePath(resourcePath, checkoutId || undefined)
    : await fetchSabPaymentByCheckoutId(checkoutId);

  if (!fetched.ok) {
    return Response.json(
      { error: fetched.error, detail: fetched.detail ?? null },
      { status: fetched.status === 404 ? 404 : 502 },
    );
  }

  const result = await processSabPaymentWebhook(supabase, {
    payment: fetched.payment,
    eventId: String(body.event_id ?? '').trim() || `sab-${fetched.payment.checkoutId}-${Date.now()}`,
    eventType: String(body.event_type ?? 'payment.sab.notification').trim(),
  });

  if (!result.ok) {
    return Response.json(result, { status: result.error === 'price_mismatch_before_activation' ? 409 : 502 });
  }

  return Response.json(result, { status: 200 });
}
