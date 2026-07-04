/**
 * شحن محفظة المناوب الرقمي بعد دفع ميسر ناجح.
 *
 *  GET  /api/wallet-topup-fulfill?paymentId=<uuid>
 *       عام (CORS + حارس أصول) — تستدعيه الواجهة (poll) بعد العودة من ميسر.
 *
 *  POST /api/wallet-topup-fulfill  { paymentId }
 *       داخلي من moyasar-webhook (Edge) — يتطلب x-wallet-topup-internal-secret.
 *
 * الطرفان يتحققان من الدفع لدى ميسر ثم يشحنان الرصيد الصافي بشكل idempotent.
 */
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { syncWalletTopupFulfillment } from './_lib/walletTopupFulfillmentSync.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-wallet-topup-internal-secret',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function resolveInternalSecret(): string {
  return (
    (process.env.WALLET_TOPUP_INTERNAL_SECRET || '').trim() ||
    (process.env.LISTING_LICENSE_INTERNAL_SECRET || '').trim()
  );
}

function verifyInternalSecret(request: Request): boolean {
  const secret = resolveInternalSecret();
  if (secret.length < 16) return false;
  const sent = request.headers.get('x-wallet-topup-internal-secret')?.trim() || '';
  if (!sent) return false;
  try {
    const a = Buffer.from(secret, 'utf8');
    const b = Buffer.from(sent, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function serviceClient(): ReturnType<typeof createClient> | null {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) return null;
  return createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** استدعاء داخلي من الـ webhook — يتجاوز حارس الأصول عبر السرّ المشترك. */
export async function POST(request: Request): Promise<Response> {
  if (!verifyInternalSecret(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { paymentId?: unknown };
  try {
    body = (await request.json()) as { paymentId?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const paymentId = String(body.paymentId ?? '').trim();
  if (!UUID_RE.test(paymentId)) {
    return Response.json({ ok: false, error: 'invalid_payment_id' }, { status: 400 });
  }

  const supabase = serviceClient();
  if (!supabase) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503 });
  }

  const result = await syncWalletTopupFulfillment(supabase, paymentId);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status });
  }
  return Response.json(result, { status: 200 });
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'wallet-topup-fulfill');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = new URL(request.url);
  const paymentId = (url.searchParams.get('paymentId') || url.searchParams.get('id') || '').trim();
  if (!UUID_RE.test(paymentId)) {
    return Response.json(
      { ok: false, error: 'invalid_payment_id', hint: 'Provide ?paymentId=<moyasar-uuid>' },
      { status: 400, headers },
    );
  }

  const supabase = serviceClient();
  if (!supabase) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const result = await syncWalletTopupFulfillment(supabase, paymentId);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json(result, { status: 200, headers });
}
