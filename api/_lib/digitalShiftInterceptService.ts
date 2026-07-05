import type { SupabaseClient } from '@supabase/supabase-js';
import {
  debitWalletForAiReply,
  evaluateIntercept,
  generateDigitalShiftReply,
  loadDigitalShiftContext,
  upsertRecommendation,
} from './digitalShiftAssistant.js';
import {
  detectClientLanguage,
  extractSalonGreetingHint,
  finalizeCustomerShiftReply,
} from './digitalShiftLanguages.js';
import {
  formatCustomerSalonContextForPrompt,
  resolveRecommendationInput,
} from './digitalShiftSalonInsights.js';
import { recordFleetDemandSignal } from './fleetDemandSignals.js';
import { ensureDigitalShiftAddonFromPaidOrders } from './listingLicenseService.js';

export type DigitalShiftInterceptResult =
  | {
      ok: true;
      replied: true;
      trigger: 'shop_closed' | 'barber_delay';
      message: {
        id: string;
        body: string;
        created_at: string;
        is_digital_shift_reply: boolean;
      };
    }
  | {
      ok: true;
      replied: false;
      reason: string;
      trigger?: string;
    }
  | { ok: false; error: string; status: number };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearStaleInterceptClaim(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
): Promise<void> {
  const { count, error } = await supabase
    .from('private_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('is_digital_shift_reply', true)
    .gt('created_at', customerMessageAt);

  if (error || (count ?? 0) > 0) return;

  await supabase
    .from('digital_shift_intercept_claims')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('customer_message_at', customerMessageAt);
}

/** محاولة اعتراض المناوب لمحادثة واحدة — يُستدعى من API العميل أو جدولة الخادم. */
export async function runDigitalShiftIntercept(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<DigitalShiftInterceptResult> {
  const { data: conv, error: convErr } = await supabase
    .from('private_conversations')
    .select('id, barber_id, barber_user_id, customer_id, status, expires_at, closed_at, shift_manual_takeover')
    .eq('id', conversationId)
    .maybeSingle();

  if (convErr || !conv) {
    return { ok: false, error: 'Conversation not found', status: 404 };
  }

  if (conv.status !== 'active' || conv.closed_at || new Date(conv.expires_at).getTime() <= Date.now()) {
    return { ok: true, replied: false, reason: 'conversation_closed' };
  }

  const barberIdRaw = String(conv.barber_id ?? '').trim();
  let barberId = barberIdRaw;
  if (!barberId) {
    const { data: barberRow } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', conv.barber_user_id)
      .maybeSingle();
    barberId = String(barberRow?.id ?? '').trim();
    if (barberId) {
      await supabase.from('private_conversations').update({ barber_id: barberId }).eq('id', conversationId);
    }
  }
  if (!barberId) {
    return { ok: true, replied: false, reason: 'no_barber_id' };
  }

  await ensureDigitalShiftAddonFromPaidOrders(supabase, barberId);

  const { data: cfg } = await supabase
    .from('barber_digital_shift_config')
    .select('enabled, assistant_display_name')
    .eq('barber_id', barberId)
    .maybeSingle();

  if (!cfg?.enabled) {
    return { ok: true, replied: false, reason: 'shift_disabled' };
  }

  const ctx = await loadDigitalShiftContext(supabase, barberId);
  if (!ctx) {
    return { ok: true, replied: false, reason: 'not_diamond' };
  }

  const { data: msgs, error: msgErr } = await supabase
    .from('private_messages')
    .select('id, sender_id, body, created_at, is_digital_shift_reply')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (msgErr) return { ok: false, error: msgErr.message, status: 500 };

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
    shiftManualTakeover: Boolean(conv.shift_manual_takeover),
  });

  if (!decision.shouldReply || !lastCustomerBody || !lastCustomerMessageAt) {
    return { ok: true, replied: false, reason: decision.reason, trigger: decision.trigger };
  }

  const { count: existingShiftReplies, error: raceErr } = await supabase
    .from('private_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('is_digital_shift_reply', true)
    .gt('created_at', lastCustomerMessageAt);

  if (raceErr) {
    return { ok: false, error: raceErr.message, status: 500 };
  }
  if ((existingShiftReplies ?? 0) > 0) {
    return { ok: true, replied: false, reason: 'shift_already_replied_race' };
  }

  await clearStaleInterceptClaim(supabase, conversationId, lastCustomerMessageAt);

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
    return { ok: true, replied: false, reason: debit.error };
  }

  const history = rows.slice(-10).map((m) => ({
    role: (m.sender_id === customerId ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body,
  }));

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
  } catch {
    /* صامت */
  }

  let customerSalonContext = '';
  try {
    const input = await resolveRecommendationInput(supabase, barberId, {});
    customerSalonContext = formatCustomerSalonContextForPrompt(ctx, input);
  } catch {
    customerSalonContext = '';
  }

  let replyText: string;
  try {
    replyText = await generateDigitalShiftReply(ctx, 'customer', lastCustomerBody, history, {
      ...(privateOfficeInstructions.length > 0 ? { instructions: privateOfficeInstructions } : {}),
      ...(customerSalonContext ? { operationalInsights: customerSalonContext } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI failed';
    return { ok: false, error: msg, status: 502 };
  }

  if (!replyText.trim()) {
    return { ok: true, replied: false, reason: 'empty_ai_reply' };
  }

  const customerLang = detectClientLanguage(lastCustomerBody);
  const greetingHint = extractSalonGreetingHint(privateOfficeInstructions);
  replyText = finalizeCustomerShiftReply(replyText, customerLang, ctx, lastCustomerBody, greetingHint);

  const { error: claimErr } = await supabase.from('digital_shift_intercept_claims').insert({
    conversation_id: conversationId,
    customer_message_at: lastCustomerMessageAt,
  });
  if (claimErr) {
    const code = String(claimErr.code ?? '');
    if (code === '23505') {
      const { count: racedReplies } = await supabase
        .from('private_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_digital_shift_reply', true)
        .gt('created_at', lastCustomerMessageAt);
      if ((racedReplies ?? 0) > 0) {
        return { ok: true, replied: false, reason: 'shift_already_replied_race' };
      }
      return { ok: true, replied: false, reason: 'shift_claim_race' };
    }
    if (code !== '42P01') {
      return { ok: false, error: claimErr.message, status: 500 };
    }
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
    await supabase
      .from('digital_shift_intercept_claims')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('customer_message_at', lastCustomerMessageAt);
    return { ok: false, error: insErr.message, status: 500 };
  }
  if (!inserted) {
    return { ok: true, replied: false, reason: 'insert_empty' };
  }

  const reportTitle =
    decision.trigger === 'shop_closed' ? '🌙 المناوب رد أثناء الإغلاق' : '⏱️ المناوب تدخل بعد تأخر الرد';
  const reportBody = [
    `رسالة الزبون: «${lastCustomerBody.slice(0, 200)}»`,
    `رد المناوب: «${replyText.trim().slice(0, 200)}»`,
    `الحالة: ${decision.trigger === 'shop_closed' ? 'المحل مغلق' : 'تأخر الرد أثناء الدوام'}`,
    privateOfficeInstructions.length > 0
      ? `التعليمات المطبّقة: ${privateOfficeInstructions.length} تعليمة`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

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
  } catch {
    /* صامت */
  }

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
        : 'تفضل، المناوب تدخل بعد مهلة قصيرة لرد العميل. يمكنك متابعة المحادثة بنفسك في أي وقت — وعند الانتهاء أعد المناوب من شات العملاء.',
    metadata: { trigger: decision.trigger, conversationId },
  });

  return {
    ok: true,
    replied: true,
    trigger: decision.trigger === 'shop_closed' ? 'shop_closed' : 'barber_delay',
    message: inserted,
  };
}

/** انتظار مهلة الاعتراض ثم تنفيذ الرد — يُستدعى مباشرة بعد إرسال العميل (موثوق على Vercel). */
export async function awaitDigitalShiftInterceptAfterCustomerSend(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<DigitalShiftInterceptResult | null> {
  const { data: conv } = await supabase
    .from('private_conversations')
    .select('barber_id')
    .eq('id', conversationId)
    .maybeSingle();

  const barberIdRaw = String(conv?.barber_id ?? '').trim();
  let barberId = barberIdRaw;
  if (!barberId) {
    const { data: fullConv } = await supabase
      .from('private_conversations')
      .select('barber_user_id')
      .eq('id', conversationId)
      .maybeSingle();
    if (fullConv?.barber_user_id) {
      const { data: barberRow } = await supabase
        .from('barbers')
        .select('id')
        .eq('user_id', fullConv.barber_user_id)
        .maybeSingle();
      barberId = String(barberRow?.id ?? '').trim();
      if (barberId) {
        await supabase.from('private_conversations').update({ barber_id: barberId }).eq('id', conversationId);
      }
    }
  }
  if (!barberId) return null;

  await ensureDigitalShiftAddonFromPaidOrders(supabase, barberId);

  const [{ data: cfg }, ctx] = await Promise.all([
    supabase
      .from('barber_digital_shift_config')
      .select('enabled, reply_delay_seconds')
      .eq('barber_id', barberId)
      .maybeSingle(),
    loadDigitalShiftContext(supabase, barberId),
  ]);

  if (!cfg?.enabled || !ctx) return null;

  const delaySec = Math.min(120, Math.max(3, Number(cfg.reply_delay_seconds ?? 5) || 5));
  const waitMs = ctx.shopOpen ? delaySec * 1000 + 250 : 350;
  await sleep(waitMs);

  let result = await runDigitalShiftIntercept(supabase, conversationId);
  if (result.ok && result.replied) return result;

  const retryReasons = new Set(['within_delay_window', 'shift_claim_race', 'shift_already_replied_race']);
  if (result.ok && !result.replied && retryReasons.has(result.reason)) {
    await sleep(ctx.shopOpen ? 2200 : 800);
    result = await runDigitalShiftIntercept(supabase, conversationId);
  }

  return result;
}

/** جدولة محاولات اعتراض بعد إرسال العميل — احتياطي إذا أُغلق الطلب مبكراً. */
export function scheduleDigitalShiftInterceptBurst(
  supabase: SupabaseClient,
  conversationId: string,
  delaySeconds = 5,
): void {
  const safeDelay = Math.min(120, Math.max(3, delaySeconds));
  const delays = [safeDelay * 1000 + 400, safeDelay * 1000 + 2800];

  for (const waitMs of delays) {
    void (async () => {
      await sleep(waitMs);
      try {
        await runDigitalShiftIntercept(supabase, conversationId);
      } catch {
        /* صامت */
      }
    })();
  }
}
