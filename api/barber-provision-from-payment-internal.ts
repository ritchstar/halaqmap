/**
 * POST /api/barber-provision-from-payment-internal
 * إنشاء/ربط حساب الحلاق فور نجاح الدفع — استدعاء داخلي من moyasar-webhook فقط.
 */
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { provisionBarberForPaidOrder } from './_lib/barberProvisionService.js';

export const config = { maxDuration: 60 };

function verifyInternalSecret(request: Request): boolean {
  const secret = (
    process.env.BARBER_PROVISION_INTERNAL_SECRET ||
    process.env.LISTING_LICENSE_INTERNAL_SECRET ||
    ''
  ).trim();
  if (secret.length < 16) return false;
  const sent =
    request.headers.get('x-barber-provision-internal-secret')?.trim() ||
    request.headers.get('x-listing-license-internal-secret')?.trim() ||
    '';
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

type Body = {
  registrationRequestId?: unknown;
  buyerEmail?: unknown;
  buyerName?: unknown;
  buyerPhone?: unknown;
  tier?: unknown;
  moyasarPaymentId?: unknown;
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request): Promise<Response> {
  if (!verifyInternalSecret(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await provisionBarberForPaidOrder(supabase, {
    registrationRequestId: String(body.registrationRequestId ?? '').trim() || null,
    buyerEmail: String(body.buyerEmail ?? '').trim() || null,
    buyerName: String(body.buyerName ?? '').trim() || null,
    buyerPhone: String(body.buyerPhone ?? '').trim() || null,
    tier: String(body.tier ?? '').trim() || null,
    moyasarPaymentId: String(body.moyasarPaymentId ?? '').trim() || null,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    ok: true,
    barberId: result.barberId,
    created: result.created,
    credentialEmailSent: result.credentialEmailSent,
    source: result.source,
    shopOpenQuickHashLink: result.shopOpenQuickHashLink ?? null,
  });
}
