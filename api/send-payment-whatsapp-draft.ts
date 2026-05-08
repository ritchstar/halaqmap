import { timingSafeEqual } from 'node:crypto';
import { sendPaymentSuccessWhatsAppDraft } from './_lib/whatsappPaymentDraft.js';

export const config = {
  maxDuration: 30,
};

type Payload = {
  phone?: string;
  barberName?: string;
  tierLabelAr?: string;
  paymentId?: string;
  amountSar?: string;
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-onboarding-internal-secret',
  };
}

function verifySecret(request: Request): boolean {
  const expected = (process.env.WHATSAPP_INTERNAL_WEBHOOK_SECRET || process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET || '')
    .trim();
  if (!expected) return false;
  const got = (request.headers.get('x-onboarding-internal-secret') || '').trim();
  if (got.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(got, 'utf8'));
  } catch {
    return false;
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders();
  if (!verifySecret(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403, headers });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const phone = String(body.phone || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  if (!phone || !paymentId) {
    return Response.json({ error: 'missing_required_fields' }, { status: 400, headers });
  }

  const result = await sendPaymentSuccessWhatsAppDraft({
    phoneE164: phone,
    barberName: String(body.barberName || 'شريك حلاق ماب').trim() || 'شريك حلاق ماب',
    tierLabelAr: String(body.tierLabelAr || 'الباقة المختارة').trim() || 'الباقة المختارة',
    paymentId,
    amountSar: String(body.amountSar || '').trim() || '0.00',
  });

  if (result.ok === false) {
    return Response.json({ ok: false, ...result }, { status: 502, headers });
  }
  return Response.json({ ok: true, ...result }, { headers });
}
