import type { SupabaseClient } from '@supabase/supabase-js';
import {
  creditWalletForAiReplyRefund,
  debitWalletForAiReply,
  dismissRecommendationsByDedupeKeys,
  evaluateIntercept,
  generateDigitalShiftReply,
  loadDigitalShiftContext,
  upsertRecommendation,
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
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
import { resolveReplyDelaySeconds } from './digitalShiftReplyDelay.js';

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

function shiftReplyDebitReason(conversationId: string, customerMessageAt: string): string {
  // بدون trigger — نفس الرسالة = نفس سبب الخصم (يمنع خصماً مزدوجاً عند تغيّر حالة المحل)
  return `shift_reply:${conversationId}:${customerMessageAt}`;
}

/** جدول claims غير مُطبَّق بعد أو بلا صلاحيات — PostgREST يُرجع PGRST205/42501. */
function isMissingInterceptClaimsTableError(code: string, message: string): boolean {
  const c = code.trim();
  if (c === '42P01' || c === 'PGRST205' || c === '42501') return true;
  const m = message.toLowerCase();
  return (
    m.includes('digital_shift_intercept_claims') &&
    (m.includes('schema cache') ||
      m.includes('could not find the table') ||
      m.includes('does not exist') ||
      m.includes('permission denied'))
  );
}

/** أطول من maxDuration (60ث) بهامش — claim بلا رد يُحرَّر بعد انقطاع الدالة. */
const INTERCEPT_CLAIM_STALE_MS = 90_000;

async function releaseInterceptClaim(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
): Promise<void> {
  await supabase
    .from('digital_shift_intercept_claims')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('customer_message_at', customerMessageAt);
}

async function shiftReplyExistsAfterCustomerMessage(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('private_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('is_digital_shift_reply', true)
    .gte('created_at', customerMessageAt);
  if (error) return false;
  return (count ?? 0) > 0;
}

/** يحرّر claim عالقاً (انقطاع Vercel/خطأ) بلا رد فعلي للعميل. */
async function clearStaleOrphanInterceptClaim(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
  staleMs = INTERCEPT_CLAIM_STALE_MS,
): Promise<boolean> {
  try {
    const { data: claim, error } = await supabase
      .from('digital_shift_intercept_claims')
      .select('created_at')
      .eq('conversation_id', conversationId)
      .eq('customer_message_at', customerMessageAt)
      .maybeSingle();
    if (error) {
      if (isMissingInterceptClaimsTableError(String(error.code ?? ''), String(error.message ?? ''))) {
        return false;
      }
      return false;
    }
    if (!claim?.created_at) return false;
    if (await shiftReplyExistsAfterCustomerMessage(supabase, conversationId, customerMessageAt)) {
      return false;
    }
    const ageMs = Date.now() - new Date(claim.created_at).getTime();
    if (!Number.isFinite(ageMs) || ageMs < staleMs) return false;
    await releaseInterceptClaim(supabase, conversationId, customerMessageAt);
    return true;
  } catch {
    return false;
  }
}

async function acquireInterceptClaim(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  await clearStaleOrphanInterceptClaim(supabase, conversationId, customerMessageAt);

  const tryInsert = async (): Promise<{ ok: true } | { ok: false; reason: string }> => {
    const { error: claimErr } = await supabase.from('digital_shift_intercept_claims').insert({
      conversation_id: conversationId,
      customer_message_at: customerMessageAt,
    });
    if (!claimErr) return { ok: true };

    const code = String(claimErr.code ?? '');
    if (code === '23505') {
      if (await shiftReplyExistsAfterCustomerMessage(supabase, conversationId, customerMessageAt)) {
        return { ok: false, reason: 'shift_already_replied_race' };
      }
      const cleared = await clearStaleOrphanInterceptClaim(supabase, conversationId, customerMessageAt);
      if (cleared) {
        const { error: retryErr } = await supabase.from('digital_shift_intercept_claims').insert({
          conversation_id: conversationId,
          customer_message_at: customerMessageAt,
        });
        if (!retryErr) return { ok: true };
        if (String(retryErr.code ?? '') === '23505') {
          return { ok: false, reason: 'shift_claim_race' };
        }
        if (!isMissingInterceptClaimsTableError(String(retryErr.code ?? ''), String(retryErr.message ?? ''))) {
          return { ok: false, reason: retryErr.message || 'claim_insert_failed' };
        }
        return { ok: true };
      }
      return { ok: false, reason: 'shift_claim_race' };
    }
    if (isMissingInterceptClaimsTableError(code, String(claimErr.message ?? ''))) {
      return { ok: true };
    }
    return { ok: false, reason: claimErr.message || 'claim_insert_failed' };
  };

  return tryInsert();
}

async function readWalletBalanceHalalas(supabase: SupabaseClient, barberId: string): Promise<number> {
  const { data } = await supabase
    .from('barber_ai_wallet')
    .select('balance_halalas')
    .eq('barber_id', barberId)
    .maybeSingle();
  return Math.max(0, Number(data?.balance_halalas ?? 0));
}

async function revalidateInterceptInFlight(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
  barberUserId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { data: conv } = await supabase
    .from('private_conversations')
    .select('status, closed_at, expires_at, shift_manual_takeover')
    .eq('id', conversationId)
    .maybeSingle();

  if (!conv || conv.status !== 'active' || conv.closed_at) {
    return { ok: false, reason: 'conversation_closed' };
  }
  if (new Date(conv.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: 'conversation_closed' };
  }
  if (Boolean(conv.shift_manual_takeover)) {
    return { ok: false, reason: 'barber_manual_takeover' };
  }

  const [{ count: barberHuman }, { count: shiftReplies }] = await Promise.all([
    supabase
      .from('private_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', barberUserId)
      .eq('is_digital_shift_reply', false)
      .gt('created_at', customerMessageAt),
    supabase
      .from('private_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('is_digital_shift_reply', true)
      .gt('created_at', customerMessageAt),
  ]);

  if ((barberHuman ?? 0) > 0) return { ok: false, reason: 'barber_already_replied' };
  if ((shiftReplies ?? 0) > 0) return { ok: false, reason: 'shift_already_replied_race' };

  return { ok: true };
}

/** يُطلق اعتراضاً كاملاً في invocation منفصل — لا يُعطّل إرسال رسالة العميل. */
function resolveShiftWorkerBaseUrl(): string {
  const candidates = [
    (process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim(),
    (process.env.VITE_SITE_ORIGIN || '').trim(),
    (process.env.SITE_ORIGIN || '').trim(),
    (process.env.VERCEL_URL || '').trim(),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const host = raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (host) return `https://${host}`;
  }
  return '';
}

export function dispatchDigitalShiftInterceptWorker(conversationId: string): boolean {
  const id = conversationId.trim();
  if (!id) return false;

  const base = resolveShiftWorkerBaseUrl();
  const secret = (process.env.CRON_SECRET || '').trim();

  if (!base || !secret) {
    console.warn('[shift] intercept worker dispatch skipped — missing base URL or CRON_SECRET', {
      hasBase: Boolean(base),
      hasSecret: Boolean(secret),
    });
    return false;
  }

  void fetch(`${base}/api/customer-digital-shift-intercept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ conversationId: id, worker: true }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error('[shift] intercept worker HTTP error', res.status, body.slice(0, 200));
      }
    })
    .catch((err) => {
      console.error('[shift] intercept worker dispatch failed', err);
    });
  return true;
}

async function markShiftWalletEmpty(
  supabase: SupabaseClient,
  barberId: string,
): Promise<void> {
  await dismissRecommendationsByDedupeKeys(supabase, barberId, ['shift_last_action']);
  await upsertRecommendation(supabase, {
    barberId,
    category: 'shift_chat',
    priority: 90,
    dedupeKey: 'shift_wallet_empty',
    title: 'توقف المناوبة — الرصيد منتهٍ',
    body: 'يا عمنا، توقفت الردود الآلية لأن رصيد محفظة المناوب منتهٍ. شحن الرصيد يعيد تفعيل المناوبة فوراً.',
  });
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
  let barberUserId = String(conv.barber_user_id ?? '').trim() || null;
  if (!barberUserId && barberId) {
    const { data: barberUserRow } = await supabase
      .from('barbers')
      .select('user_id')
      .eq('id', barberId)
      .maybeSingle();
    barberUserId = String(barberUserRow?.user_id ?? '').trim() || null;
    if (barberUserId) {
      await supabase.from('private_conversations').update({ barber_user_id: barberUserId }).eq('id', conversationId);
    }
  }
  if (!barberUserId) {
    return { ok: true, replied: false, reason: 'no_barber_user_id' };
  }

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

  const walletBalanceHalalas = await readWalletBalanceHalalas(supabase, barberId);
  if (walletBalanceHalalas < DIGITAL_SHIFT_REPLY_COST_HALALAS) {
    await markShiftWalletEmpty(supabase, barberId);
    return { ok: true, replied: false, reason: 'insufficient_balance' };
  }

  const claim = await acquireInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
  if (!claim.ok) {
    if (claim.reason === 'shift_already_replied_race' || claim.reason === 'shift_claim_race') {
      return { ok: true, replied: false, reason: claim.reason };
    }
    return { ok: false, error: claim.reason, status: 500 };
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

  const preAiCheck = await revalidateInterceptInFlight(
    supabase,
    conversationId,
    lastCustomerMessageAt,
    barberUserId,
  );
  if (!preAiCheck.ok) {
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    return { ok: true, replied: false, reason: preAiCheck.reason };
  }

  let replyText: string;
  try {
    replyText = await generateDigitalShiftReply(ctx, 'customer', lastCustomerBody, history, {
      ...(privateOfficeInstructions.length > 0 ? { instructions: privateOfficeInstructions } : {}),
      ...(customerSalonContext ? { operationalInsights: customerSalonContext } : {}),
    });
  } catch (e) {
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    const msg = e instanceof Error ? e.message : 'AI failed';
    return { ok: false, error: msg, status: 502 };
  }

  if (!replyText.trim()) {
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    return { ok: true, replied: false, reason: 'empty_ai_reply' };
  }

  const customerLang = detectClientLanguage(lastCustomerBody);
  const greetingHint = extractSalonGreetingHint(privateOfficeInstructions);
  replyText = finalizeCustomerShiftReply(replyText, customerLang, ctx, lastCustomerBody, greetingHint);

  const preDebitCheck = await revalidateInterceptInFlight(
    supabase,
    conversationId,
    lastCustomerMessageAt,
    barberUserId,
  );
  if (!preDebitCheck.ok) {
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    return { ok: true, replied: false, reason: preDebitCheck.reason };
  }

  const debitReason = shiftReplyDebitReason(conversationId, lastCustomerMessageAt);
  const debit = await debitWalletForAiReply(supabase, barberId, debitReason);
  if (!debit.ok) {
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    await markShiftWalletEmpty(supabase, barberId);
    return { ok: true, replied: false, reason: debit.error };
  }

  if (debit.alreadyDebited) {
    if (await shiftReplyExistsAfterCustomerMessage(supabase, conversationId, lastCustomerMessageAt)) {
      await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
      return { ok: true, replied: false, reason: 'shift_already_replied_race' };
    }
  }

  const preInsertCheck = await revalidateInterceptInFlight(
    supabase,
    conversationId,
    lastCustomerMessageAt,
    barberUserId,
  );
  if (!preInsertCheck.ok) {
    if (!debit.alreadyDebited) {
      await creditWalletForAiReplyRefund(supabase, barberId, debitReason);
    }
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    return { ok: true, replied: false, reason: preInsertCheck.reason };
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
    await creditWalletForAiReplyRefund(supabase, barberId, debitReason);
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
    return { ok: false, error: insErr.message, status: 500 };
  }
  if (!inserted) {
    await creditWalletForAiReplyRefund(supabase, barberId, debitReason);
    await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);
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

  await dismissRecommendationsByDedupeKeys(supabase, barberId, [
    'shift_wallet_empty',
    'market_stagnation_local',
  ]);

  await releaseInterceptClaim(supabase, conversationId, lastCustomerMessageAt);

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
      .select('enabled, reply_delay_minutes, reply_delay_seconds')
      .eq('barber_id', barberId)
      .maybeSingle(),
    loadDigitalShiftContext(supabase, barberId),
  ]);

  if (!cfg?.enabled || !ctx) return null;

  const delaySec = resolveReplyDelaySeconds(cfg);
  const waitMs = ctx.shopOpen ? delaySec * 1000 + 250 : 350;
  await sleep(waitMs);

  let result = await runDigitalShiftIntercept(supabase, conversationId);
  if (result.ok && result.replied) return result;

  const retryReasons = new Set(['within_delay_window', 'shift_claim_race', 'shift_already_replied_race']);
  if (result.ok && !result.replied && retryReasons.has(result.reason)) {
    await sleep(ctx.shopOpen ? 2200 : 800);
    result = await runDigitalShiftIntercept(supabase, conversationId);
  }
  if (result.ok && !result.replied && result.reason === 'shift_claim_race') {
    await sleep(ctx.shopOpen ? 5000 : 2000);
    result = await runDigitalShiftIntercept(supabase, conversationId);
  }

  return result;
}

/** بعد إرسال العميل: worker + انتظار مباشر للمهلات ≤90ث (احتياط إذا فشل worker). */
export async function scheduleDigitalShiftInterceptAfterSend(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<{ mode: 'inline' | 'worker' | 'skipped'; workerDispatched: boolean }> {
  const id = conversationId.trim();
  if (!id) return { mode: 'skipped', workerDispatched: false };

  const workerDispatched = dispatchDigitalShiftInterceptWorker(id);

  const { data: conv } = await supabase
    .from('private_conversations')
    .select('barber_id, barber_user_id')
    .eq('id', id)
    .maybeSingle();

  let barberId = String(conv?.barber_id ?? '').trim();
  if (!barberId && conv?.barber_user_id) {
    const { data: barberRow } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', conv.barber_user_id)
      .maybeSingle();
    barberId = String(barberRow?.id ?? '').trim();
  }
  if (!barberId) return { mode: 'skipped', workerDispatched };

  const [{ data: cfg }, ctx] = await Promise.all([
    supabase
      .from('barber_digital_shift_config')
      .select('enabled, reply_delay_minutes, reply_delay_seconds')
      .eq('barber_id', barberId)
      .maybeSingle(),
    loadDigitalShiftContext(supabase, barberId),
  ]);

  if (!cfg?.enabled || !ctx) return { mode: 'skipped', workerDispatched };

  const delaySec = resolveReplyDelaySeconds(cfg);
  if (delaySec > 90) {
    return { mode: 'worker', workerDispatched };
  }

  try {
    await awaitDigitalShiftInterceptAfterCustomerSend(supabase, id);
    return { mode: 'inline', workerDispatched };
  } catch (err) {
    console.error('[shift] inline intercept after send failed', err);
    if (!workerDispatched) dispatchDigitalShiftInterceptWorker(id);
    return { mode: 'worker', workerDispatched: workerDispatched || true };
  }
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
