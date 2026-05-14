/**
 * POST /api/webhooks/supabase-subscription
 * استقبال Database Webhooks من Supabase (جدول subscriptions) عند انتقال status إلى active.
 * الحماية: رأس `x-halaqmap-subscription-webhook-secret` يجب أن يطابق SUPABASE_SUBSCRIPTION_WEBHOOK_SECRET على Vercel (لا JWT إداري).
 *
 * في Supabase → Database Webhooks: أضف الرأس أعلاه بنفس القيمة السرّية، وجدول public.subscriptions، أحداث INSERT/UPDATE.
 */
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { normalizeSupabaseUrl } from '../_lib/supabaseUrl.js';
import { tryEmailPartnerUnifiedContractAfterApprove } from '../_lib/partnerContractNotify.js';

export const config = { maxDuration: 45 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY = 256_000;

function verifyWebhookSecret(request: Request): boolean {
  const secret = (process.env.SUPABASE_SUBSCRIPTION_WEBHOOK_SECRET || '').trim();
  if (secret.length < 16) return false;
  const sent =
    request.headers.get('x-halaqmap-subscription-webhook-secret')?.trim() ||
    request.headers.get('x-webhook-secret')?.trim() ||
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

type DbWebhookPayload = {
  type?: unknown;
  table?: unknown;
  record?: unknown;
  old_record?: unknown;
};

function isSubscriptionActiveTransition(payload: DbWebhookPayload): {
  ok: true;
  barberId: string;
  tier: string;
} | { ok: false } {
  const table = String(payload.table ?? '').toLowerCase();
  if (table !== 'subscriptions') return { ok: false };

  const rec =
    payload.record && typeof payload.record === 'object' && !Array.isArray(payload.record)
      ? (payload.record as Record<string, unknown>)
      : {};
  const status = String(rec.status ?? '').toLowerCase();
  if (status !== 'active') return { ok: false };

  const typ = String(payload.type ?? '').toUpperCase();
  const old =
    payload.old_record && typeof payload.old_record === 'object' && !Array.isArray(payload.old_record)
      ? (payload.old_record as Record<string, unknown>)
      : null;
  const oldStatus = old ? String(old.status ?? '').toLowerCase() : '';
  if (typ === 'UPDATE' && oldStatus === 'active') {
    return { ok: false };
  }

  const barberId = String(rec.barber_id ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false };

  const tier = String(rec.tier ?? 'bronze').toLowerCase();
  if (!['bronze', 'gold', 'diamond'].includes(tier)) return { ok: false };

  return { ok: true, barberId, tier };
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204 });
}

export async function GET(): Promise<Response> {
  return new Response(null, { status: 405 });
}

export async function POST(request: Request): Promise<Response> {
  const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

  if (!verifyWebhookSecret(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401, headers: jsonHeaders });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return Response.json({ error: 'payload_too_large' }, { status: 413, headers: jsonHeaders });
    }
    body = JSON.parse(text) as unknown;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers: jsonHeaders });
  }

  const payload = body as DbWebhookPayload;
  const parsed = isSubscriptionActiveTransition(payload);
  if (!parsed.ok) {
    return Response.json(
      { ok: true, skipped: true, reason: 'not_subscription_active_transition' },
      { status: 200, headers: jsonHeaders }
    );
  }

  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers: jsonHeaders });
  }

  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let registrationRequestId: string | null = null;
  const { data: bs } = await supabase
    .from('barber_subscriptions')
    .select('registration_request_id')
    .eq('barber_id', parsed.barberId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const rid = bs?.registration_request_id;
  if (rid != null && String(rid).trim()) {
    registrationRequestId = String(rid).trim();
  }

  const resendKey = (process.env.RESEND_API_KEY ?? '').trim();
  const resendFrom = (process.env.RESEND_FROM_EMAIL ?? '').trim();
  if (!resendKey || !resendFrom) {
    return Response.json({ error: 'resend_misconfigured' }, { status: 503, headers: jsonHeaders });
  }

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .select('email, name')
    .eq('id', parsed.barberId)
    .maybeSingle();
  if (barberErr) {
    return Response.json({ error: 'barber_lookup_failed', detail: barberErr.message }, { status: 500, headers: jsonHeaders });
  }
  const email = String(barber?.email ?? '').trim();
  if (!email) {
    return Response.json({ error: 'barber_email_missing' }, { status: 422, headers: jsonHeaders });
  }
  const barberName = String(barber?.name ?? '').trim() || email;

  const emailSent = await tryEmailPartnerUnifiedContractAfterApprove({
    supabase,
    resendApiKey: resendKey,
    resendFrom,
    barberEmail: email,
    barberName,
    tier: parsed.tier,
    registrationRequestId,
    barberId: parsed.barberId,
  });

  return Response.json(
    {
      ok: true,
      processed: true,
      emailSent,
      barberId: parsed.barberId,
    },
    { status: 200, headers: jsonHeaders }
  );
}
