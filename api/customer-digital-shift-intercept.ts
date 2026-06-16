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
import {
  formatCustomerSalonContextForPrompt,
  resolveRecommendationInput,
} from './_lib/digitalShiftSalonInsights.js';
import { recordFleetDemandSignal } from './_lib/fleetDemandSignals.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

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
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 20 });
  if (!secGuard.allowed) return secGuard.response;

  const routeGuard = runRegistrationRouteGuards(request, 'customer-digital-shift-intercept');
  if (routeGuard.ok === false) {
    return Response.json(routeGuard.json, { status: routeGuard.status, headers });
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

  // ◆ قراءة تعليمات المكتب الخاص لهذا الحلاق
  let privateOfficeInstructions: string[] = [];
  try {
    const { data: instRows } = await supabase
      .from('barber_ai_recommendations')
      .select('body')
      .eq('barber_id', barberId)
      .eq('category', 'private_office_instruction')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(15);
    if (instRows && instRows.length > 0) {
      privateOfficeInstructions = instRows.map((r: { body: string }) => String(r.body ?? ''));
    }
  } catch { /* صامت — لا نوقف الرد */ }

  let customerSalonContext = '';
  try {
    const input = await resolveRecommendationInput(supabase, barberId, {});
    customerSalonContext = formatCustomerSalonContextForPrompt(ctx, input);
  } catch {
    customerSalonContext = '';
  }

  let replyText: string;
  try {
    replyText = await generateDigitalShiftReply(
      ctx, 'customer', lastCustomerBody, history,
      {
        ...(privateOfficeInstructions.length > 0 ? { instructions: privateOfficeInstructions } : {}),
        ...(customerSalonContext ? { operationalInsights: customerSalonContext } : {}),
      },
    );
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

  // ◆ تقرير المناوب → المكتب الخاص
  const reportTitle = decision.trigger === 'shop_closed'
    ? '🌙 المناوب رد أثناء الإغلاق'
    : '⏱️ المناوب تدخل بعد تأخر الرد';
  const reportBody = [
    `رسالة الزبون: «${lastCustomerBody.slice(0, 200)}»`,
    `رد المناوب: «${replyText.trim().slice(0, 200)}»`,
    `الحالة: ${decision.trigger === 'shop_closed' ? 'المحل مغلق' : 'تأخر الرد أثناء الدوام'}`,
    privateOfficeInstructions.length > 0
      ? `التعليمات المطبّقة: ${privateOfficeInstructions.length} تعليمة`
      : '',
  ].filter(Boolean).join('\n');

  try {
    await supabase.from('barber_ai_recommendations').insert({
      barber_id: barberId,
      category: 'shift_report',
      title: reportTitle,
      body: reportBody,
      priority: 70,
      status: 'active',
      metadata: {
        trigger: decision.trigger,
        conversationId,
        customerMessage: lastCustomerBody.slice(0, 300),
        shiftReply: replyText.trim().slice(0, 300),
        instructionsApplied: privateOfficeInstructions.length,
        reportedAt: new Date().toISOString(),
      },
    });
  } catch { /* صامت — التقرير لا يوقف الرد */ }

  if (ctx.cityAr) {
    void recordFleetDemandSignal(supabase, {
      cityAr: ctx.cityAr,
      signalType: decision.trigger === 'shop_closed' ? 'intercept_shop_closed' : 'intercept_barber_delay',
    });
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
