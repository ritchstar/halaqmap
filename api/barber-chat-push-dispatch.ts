import { createClient } from '@supabase/supabase-js';
import {
  buildBarberChatPushPayload,
  sendBarberChatPushToSubscription,
  verifyBarberChatPushWebhookSecret,
  isBarberChatPushConfigured,
} from './_lib/barberChatPushLib.js';
import { emitOpsEventFireAndForget } from './_lib/opsEventRouter.js';

export const config = {
  maxDuration: 30,
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-barber-chat-push-secret',
  };
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function isHomeServiceBody(body: string): boolean {
  const t = body.trim();
  return t.startsWith('🏠') || t.includes('طلب تواصل — خدمة زيارة منزلية');
}

type PrivateMessageRecord = {
  id?: string;
  conversation_id?: string;
  sender_id?: string;
  body?: string;
};

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders();
  if (!verifyBarberChatPushWebhookSecret(request)) {
    emitOpsEventFireAndForget({
      type: 'push.unauthorized',
      severity: 'urgent',
      title: 'محاولة webhook Push غير مصرّح بها',
      summary: 'طلب إلى `/api/barber-chat-push-dispatch` برأس سرّ خاطئ أو ناقص.',
      clientId: 'BARBER_PUSH',
      detail: { source: 'barber-chat-push-dispatch' },
      dedupeKey: 'push.unauthorized:dispatch',
      dedupeHours: 1,
    });
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  }
  if (!isBarberChatPushConfigured()) {
    return Response.json({ ok: true, skipped: 'push_not_configured' }, { headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }

  const record =
    ((body as { record?: PrivateMessageRecord }).record ??
      (body as PrivateMessageRecord)) as PrivateMessageRecord;

  const messageId = String(record.id ?? '').trim();
  const conversationId = String(record.conversation_id ?? '').trim();
  const senderId = String(record.sender_id ?? '').trim();
  const text = String(record.body ?? '');

  if (!messageId || !conversationId || !senderId) {
    return Response.json({ error: 'Missing message fields' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: conv, error: convErr } = await supabase
    .from('private_conversations')
    .select('id, customer_id, barber_user_id, barber_id, status, expires_at, closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convErr || !conv) {
    return Response.json({ error: 'Conversation not found' }, { status: 404, headers });
  }

  const customerId = String(conv.customer_id ?? '');
  if (!customerId || senderId !== customerId) {
    return Response.json({ ok: true, skipped: 'not_inbound_customer_message' }, { headers });
  }

  const open =
    conv.status === 'active' &&
    !conv.closed_at &&
    new Date(String(conv.expires_at)).getTime() > Date.now();
  if (!open) {
    return Response.json({ ok: true, skipped: 'conversation_not_open' }, { headers });
  }

  const barberId = String(conv.barber_id ?? '').trim();
  if (!barberId) {
    return Response.json({ ok: true, skipped: 'missing_barber_id' }, { headers });
  }

  const kind = isHomeServiceBody(text) ? 'home_visit' : 'message';
  const payload = buildBarberChatPushPayload({ body: text, conversationId, kind });

  const { data: subs, error: subsErr } = await supabase
    .from('barber_push_subscriptions')
    .select('endpoint, p256dh, auth_key')
    .eq('barber_id', barberId)
    .eq('enabled', true);

  if (subsErr) {
    return Response.json({ error: subsErr.message || 'Failed to load subscriptions' }, { status: 500, headers });
  }

  const rows = subs ?? [];
  if (rows.length === 0) {
    return Response.json({ ok: true, sent: 0, skipped: 'no_subscriptions' }, { headers });
  }

  let sent = 0;
  const goneEndpoints: string[] = [];

  for (const row of rows) {
    const result = await sendBarberChatPushToSubscription(
      {
        endpoint: String(row.endpoint),
        p256dh: String(row.p256dh),
        auth_key: String(row.auth_key),
      },
      payload,
    );
    if (result.ok) {
      sent += 1;
      continue;
    }
    if (result.gone) goneEndpoints.push(String(row.endpoint));
  }

  if (goneEndpoints.length > 0) {
    await supabase.from('barber_push_subscriptions').delete().in('endpoint', goneEndpoints);
  }

  return Response.json({ ok: true, sent, pruned: goneEndpoints.length }, { headers });
}
