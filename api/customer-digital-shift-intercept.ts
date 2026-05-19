import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  debitWalletForAiReply,
  evaluateIntercept,
  generateDigitalShiftReply,
  loadDigitalShiftContext,
  upsertRecommendation,
} from './_lib/digitalShiftAssistant.js';

export const config = { maxDuration: 45 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-supabase-anon, x-client-supabase-url',
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
  return Response.json(
    { ok: true, route: 'customer-digital-shift-intercept', publicApiGuard: registrationGuardDiagnostics() },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'customer-digital-shift-intercept');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }

  const conversationId = String(body.conversationId ?? '').trim();
  if (!conversationId) {
    return Response.json({ error: 'Missing conversationId' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: conv, error: convErr } = await supabase
    .from('private_conversations')
    .select('id, barber_id, barber_user_id, customer_id, status, expires_at, closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convErr || !conv) {
    return Response.json({ error: 'Conversation not found' }, { status: 404, headers });
  }

  if (conv.status !== 'active' || conv.closed_at || new Date(conv.expires_at).getTime() <= Date.now()) {
    return Response.json({ ok: true, replied: false, reason: 'conversation_closed' }, { headers });
  }

  const barberId = String(conv.barber_id ?? '').trim();
  if (!barberId) {
    return Response.json({ ok: true, replied: false, reason: 'no_barber_id' }, { headers });
  }

  const { data: cfg } = await supabase
    .from('barber_digital_shift_config')
    .select('enabled, assistant_display_name')
    .eq('barber_id', barberId)
    .maybeSingle();

  if (!cfg?.enabled) {
    return Response.json({ ok: true, replied: false, reason: 'shift_disabled' }, { headers });
  }

  const ctx = await loadDigitalShiftContext(supabase, barberId);
  if (!ctx) {
    return Response.json({ ok: true, replied: false, reason: 'not_diamond' }, { headers });
  }

  const { data: msgs, error: msgErr } = await supabase
    .from('private_messages')
    .select('id, sender_id, body, created_at, is_digital_shift_reply')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (msgErr) return Response.json({ error: msgErr.message }, { status: 500, headers });

  const rows = msgs ?? [];
  const customerId = conv.customer_id;
  const barberUserId = conv.barber_user_id;

  let lastCustomerMessageAt: string | null = null;
  let lastCustomerBody = '';
  let lastBarberHumanReplyAt: string | null = null;
  let lastShiftReplyAt: string | null = null;

  for (const m of rows) {
    if (m.sender_id === customerId) {
      lastCustomerMessageAt = m.created_at;
      lastCustomerBody = m.body;
    } else if (m.sender_id === barberUserId) {
      if (m.is_digital_shift_reply) {
        lastShiftReplyAt = m.created_at;
      } else {
        lastBarberHumanReplyAt = m.created_at;
      }
    }
  }

  const decision = evaluateIntercept({
    ctx,
    shopOpen: ctx.shopOpen,
    lastCustomerMessageAt,
    lastBarberHumanReplyAt,
    lastShiftReplyAt,
    enabled: cfg.enabled,
  });

  if (!decision.shouldReply || !lastCustomerBody) {
    return Response.json({ ok: true, replied: false, reason: decision.reason, trigger: decision.trigger }, { headers });
  }

  const debit = await debitWalletForAiReply(supabase, barberId, `shift_reply:${decision.trigger}`);
  if (!debit.ok) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'shift_chat',
      priority: 90,
      dedupeKey: 'shift_wallet_empty',
      title: 'توقف المناوبة — الرصيد منتهٍ',
      body: 'يا عمنا، توقفت الردود الآلية لأن رصيد محفظة المناوب منتهٍ. شحن الرصيد يعيد تفعيل المناوبة فوراً.',
    });
    return Response.json({ ok: true, replied: false, reason: debit.error }, { headers });
  }

  const history = rows.slice(-10).map((m) => ({
    role: (m.sender_id === customerId ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body,
  }));

  let replyText: string;
  try {
    replyText = await generateDigitalShiftReply(ctx, 'customer', lastCustomerBody, history);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI failed';
    return Response.json({ error: msg }, { status: 502, headers });
  }

  if (!replyText.trim()) {
    return Response.json({ ok: true, replied: false, reason: 'empty_ai_reply' }, { headers });
  }

  const { data: inserted, error: insErr } = await supabase
    .from('private_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: barberUserId,
      body: replyText.trim().slice(0, 2000),
      is_digital_shift_reply: true,
    })
    .select('id, body, created_at, is_digital_shift_reply')
    .maybeSingle();

  if (insErr) {
    return Response.json({ error: insErr.message }, { status: 500, headers });
  }

  await upsertRecommendation(supabase, {
    barberId,
    category: 'shift_chat',
    priority: 50,
    dedupeKey: 'shift_last_action',
    title: decision.trigger === 'shop_closed' ? 'المناوب يعمل — المحل مغلق 🌙' : 'المناوب تولى رداً متأخراً ⏱️',
    body:
      decision.trigger === 'shop_closed'
        ? 'تفضل يا عمنا، المناوب رد على عميل أثناء إغلاق المحل. راجع المحادثة عند فتح الصالون.'
        : 'تفضل، المناوب تدخل بعد مهلة 3 دقائق لرد العميل. يمكنك متابعة المحادثة بنفسك في أي وقت.',
    metadata: { trigger: decision.trigger, conversationId },
  });

  return Response.json(
    {
      ok: true,
      replied: true,
      trigger: decision.trigger,
      message: inserted,
    },
    { headers },
  );
}
