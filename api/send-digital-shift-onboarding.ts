/**
 * POST /api/send-digital-shift-onboarding
 * استدعاء داخلي بعد تفعيل المناوب الرقمي (مثلاً من webhook عند تعطيل بريد الترحيب العام).
 */
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { dispatchDigitalShiftOnboardingEmail } from './_lib/digitalShiftOnboardingMail.js';

export const config = { maxDuration: 30 };

function verifyInternalSecret(request: Request): boolean {
  const expected = (process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET || '').trim();
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
  return new Response(null, { status: 204 });
}

export async function POST(request: Request): Promise<Response> {
  if (!verifyInternalSecret(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503 });
  }

  let body: { barberId?: string; barberEmail?: string; barberName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const barberId = String(body.barberId ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(barberId)) {
    return Response.json({ error: 'invalid_barber_id' }, { status: 400 });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await dispatchDigitalShiftOnboardingEmail(supabase, {
    barberId,
    buyerEmail: body.barberEmail ?? null,
    barberName: body.barberName ?? null,
    metadata: { digital_shift_addon: true },
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json({ ok: true, sent: result.sent, messageId: result.messageId ?? null });
}
