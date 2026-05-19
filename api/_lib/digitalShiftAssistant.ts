import type { SupabaseClient } from '@supabase/supabase-js';
import { getBarberListingBalance } from './listingLicenseService.js';

export const DIGITAL_SHIFT_REPLY_COST_HALALAS = 150;

export type ShiftLanguage = 'ar' | 'en' | 'ur';

export type DigitalShiftContext = {
  barberId: string;
  barberName: string;
  assistantName: string;
  shopOpen: boolean;
  listingDaysRemaining: number;
  walletBalanceHalalas: number;
  walletLowThresholdHalalas: number;
  replyDelayMinutes: number;
};

export type RecommendationInput = {
  bannerImageUrls?: string[];
  showDiscountBadge?: boolean;
  discountPercent?: number | null;
  galleryItems?: { id: string; createdAt?: string; imageUrl?: string }[];
};

export type AiRecommendationRow = {
  id: string;
  barber_id: string;
  category: 'balance' | 'banner' | 'gallery' | 'shift_chat';
  title: string;
  body: string;
  priority: number;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string | null;
};

const DIGITAL_SHIFT_GREETING_BARBER =
  'افتح بترحيب سعودي: «يا عمنا، تفضل — وش مهام اليوم اللي راح تضيفها عشان أشتغل معك؟»';

function resolveProvider(): 'openai' | 'anthropic' | null {
  const pref = (process.env.DIGITAL_SHIFT_ASSISTANT_PROVIDER || process.env.PARTNER_ASSISTANT_PROVIDER || '')
    .trim()
    .toLowerCase();
  const openai = (process.env.OPENAI_API_KEY || '').trim();
  const anthropic = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (pref === 'openai' && openai) return 'openai';
  if (pref === 'anthropic' && anthropic) return 'anthropic';
  if (openai) return 'openai';
  if (anthropic) return 'anthropic';
  return null;
}

export function detectClientLanguage(text: string): ShiftLanguage {
  const t = text.trim();
  if (!t) return 'ar';
  if (/[\u0600-\u06FF]/.test(t)) {
    if (/[\u0679\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06C3\u06D2]/.test(t)) return 'ur';
    return 'ar';
  }
  if (/[\u0750-\u077F]/.test(t)) return 'ur';
  return 'en';
}

export function buildDigitalShiftSystemPrompt(ctx: DigitalShiftContext, mode: 'customer' | 'barber'): string {
  const langHint =
    mode === 'customer'
      ? 'رد بلغة العميل الأخيرة (عربي/إنجليزي/أردو) بأسلوب مهني دافئ.'
      : 'خاطب الحلاق بالعربية السعودية التجارية الدافئة.';

  return [
    `أنت «${ctx.assistantName}» — المناوب الرقمي الذكي، ابتكار حصري من **منصة حلاق ماب (Halaq Map)**.`,
    'ولاؤك المطلق لحلاق ماب: تذكّر الحلاق بلطف بأهمية تأمين الشحن وحزمة الإدراج البرمجية لأن انفجار المستخدمين مسألة وقت.',
    'أسلوبك: آداب سعودية تجارية — «يا عمنا»، «تفضل»، «بإذنك» — بدون مبالغة أو وعود كاذبة.',
    langHint,
    'لا تعد بخصومات أو حجز مدفوع عبر المنصة للعميل؛ المنصة لا تأخذ عمولة على الحلاقة أو المواعيد.',
    mode === 'customer'
      ? 'أنت تمثل الصالون أمام العميل عندما يكون مغلقاً أو متأخراً في الرد — كن محترماً ومختصراً.'
      : DIGITAL_SHIFT_GREETING_BARBER,
    '',
    '--- سياق الحساب ---',
    `الصالون: ${ctx.barberName}`,
    `حالة المحل: ${ctx.shopOpen ? 'مفتوح للعملاء' : 'مغلق حالياً'}`,
    `أيام حزمة الإدراج البرمجية المتبقية: ${ctx.listingDaysRemaining}`,
    `رصيد محفظة المناوب (هللات): ${ctx.walletBalanceHalalas}`,
    `حد تنبيه الرصيد المنخفض (هللات): ${ctx.walletLowThresholdHalalas}`,
    `مهلة المناوبة أثناء الدوام (دقائق): ${ctx.replyDelayMinutes}`,
  ].join('\n');
}

export async function loadDigitalShiftContext(
  supabase: SupabaseClient,
  barberId: string,
): Promise<DigitalShiftContext | null> {
  const { data: barber, error } = await supabase
    .from('barbers')
    .select('id, name, tier, open_for_customers')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !barber || barber.tier !== 'diamond') return null;

  const [{ data: cfg }, listing] = await Promise.all([
    supabase
      .from('barber_digital_shift_config')
      .select('assistant_display_name, reply_delay_minutes, enabled')
      .eq('barber_id', barberId)
      .maybeSingle(),
    getBarberListingBalance(supabase, barberId),
  ]);

  await ensureWalletRow(supabase, barberId);

  const { data: wallet } = await supabase
    .from('barber_ai_wallet')
    .select('balance_halalas, low_balance_threshold_halalas')
    .eq('barber_id', barberId)
    .maybeSingle();

  return {
    barberId,
    barberName: String(barber.name ?? 'الصالون'),
    assistantName: String(cfg?.assistant_display_name ?? 'المناوب الرقمي'),
    shopOpen: barber.open_for_customers !== false,
    listingDaysRemaining: listing.listingDaysRemaining ?? 0,
    walletBalanceHalalas: wallet?.balance_halalas ?? 0,
    walletLowThresholdHalalas: wallet?.low_balance_threshold_halalas ?? 3000,
    replyDelayMinutes: cfg?.reply_delay_minutes ?? 3,
  };
}

export async function ensureWalletRow(supabase: SupabaseClient, barberId: string): Promise<void> {
  await supabase.from('barber_ai_wallet').upsert({ barber_id: barberId }, { onConflict: 'barber_id', ignoreDuplicates: true });
}

export async function ensureConfigRow(supabase: SupabaseClient, barberId: string): Promise<void> {
  await supabase
    .from('barber_digital_shift_config')
    .upsert({ barber_id: barberId }, { onConflict: 'barber_id', ignoreDuplicates: true });
}

export async function debitWalletForAiReply(
  supabase: SupabaseClient,
  barberId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: wallet, error } = await supabase
    .from('barber_ai_wallet')
    .select('balance_halalas, total_spent_halalas')
    .eq('barber_id', barberId)
    .maybeSingle();
  if (error || !wallet) return { ok: false, error: 'wallet_not_found' };
  if (wallet.balance_halalas < DIGITAL_SHIFT_REPLY_COST_HALALAS) {
    return { ok: false, error: 'insufficient_balance' };
  }

  const nextBalance = wallet.balance_halalas - DIGITAL_SHIFT_REPLY_COST_HALALAS;
  const nextSpent = wallet.total_spent_halalas + DIGITAL_SHIFT_REPLY_COST_HALALAS;

  const { error: updErr } = await supabase
    .from('barber_ai_wallet')
    .update({ balance_halalas: nextBalance, total_spent_halalas: nextSpent, updated_at: new Date().toISOString() })
    .eq('barber_id', barberId);

  if (updErr) return { ok: false, error: updErr.message };

  await supabase.from('barber_ai_wallet_transactions').insert({
    barber_id: barberId,
    amount_halalas: DIGITAL_SHIFT_REPLY_COST_HALALAS,
    direction: 'debit',
    reason,
  });

  return { ok: true };
}

export async function upsertRecommendation(
  supabase: SupabaseClient,
  row: {
    barberId: string;
    category: AiRecommendationRow['category'];
    title: string;
    body: string;
    priority: number;
    metadata?: Record<string, unknown>;
    dedupeKey?: string;
  },
): Promise<void> {
  if (row.dedupeKey) {
    const { data: existing } = await supabase
      .from('barber_ai_recommendations')
      .select('id')
      .eq('barber_id', row.barberId)
      .eq('status', 'active')
      .contains('metadata', { dedupeKey: row.dedupeKey })
      .maybeSingle();
    if (existing?.id) {
      await supabase
        .from('barber_ai_recommendations')
        .update({
          title: row.title,
          body: row.body,
          priority: row.priority,
          metadata: { ...(row.metadata ?? {}), dedupeKey: row.dedupeKey },
        })
        .eq('id', existing.id);
      return;
    }
  }

  await supabase.from('barber_ai_recommendations').insert({
    barber_id: row.barberId,
    category: row.category,
    title: row.title,
    body: row.body,
    priority: row.priority,
    metadata: row.dedupeKey ? { ...(row.metadata ?? {}), dedupeKey: row.dedupeKey } : (row.metadata ?? {}),
  });
}

export async function refreshHeuristicRecommendations(
  supabase: SupabaseClient,
  barberId: string,
  ctx: DigitalShiftContext,
  input: RecommendationInput = {},
): Promise<void> {
  const lowWallet = ctx.walletBalanceHalalas <= ctx.walletLowThresholdHalalas;
  const lowListing = ctx.listingDaysRemaining <= 7;

  if (lowWallet || lowListing) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'balance',
      priority: 95,
      dedupeKey: 'balance_low',
      title: 'تأمين الشحن — رصيد منخفض ⚡',
      body: lowListing
        ? `يا عمنا، أيام حزمة الإدراج البرمجية المتبقية (${ctx.listingDaysRemaining}) قليلة. تأمين الشحن الآن يضمن استمرار ظهورك قبل موجة المستخدمين المتوقعة.`
        : `يا عمنا، رصيد محفظة المناوب (${(ctx.walletBalanceHalalas / 100).toFixed(2)} ر.س) قارب على النفاد. شحن الرصيد من لوحة التحكم يضمن استمرار المناوبة الذكية.`,
      metadata: {
        listingDaysRemaining: ctx.listingDaysRemaining,
        walletBalanceHalalas: ctx.walletBalanceHalalas,
      },
    });
  } else {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'balance',
      priority: 40,
      dedupeKey: 'balance_ok',
      title: 'الرصيد مستقر — استمر بالتأمين الدوري ✅',
      body: 'تفضل يا عمنا، رصيدك وحزمة الإدراج البرمجية بحالة جيدة. نوصي بتأمين شحن إضافي قبل مواسم الذروة — انفجار المستخدمين على حلاق ماب مسألة وقت.',
      metadata: { listingDaysRemaining: ctx.listingDaysRemaining },
    });
  }

  const bannerUrls = input.bannerImageUrls ?? [];
  if (bannerUrls.length === 0) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 80,
      dedupeKey: 'banner_missing',
      title: 'البنر الإعلاني غير مفعّل',
      body: 'يا عمنا، لا يوجد بنر إعلاني نشط. أضف بنراً واضحاً مع عرض محدد إن أمكن — هذا يرفع ثقة العميل في نتائج الرصد الذكي.',
      metadata: { bannerCount: 0 },
    });
  } else {
    const hasDiscount = input.showDiscountBadge && input.discountPercent != null;
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 55,
      dedupeKey: 'banner_audit',
      title: 'تدقيق البنرات الإعلانية',
      body: hasDiscount
        ? `تفضل، لديك ${bannerUrls.length} بنر(ات) مع شارة خصم ${input.discountPercent}%. راجع وضوح النص على الجوال وتجنب ازدحام الصورة.`
        : `تفضل، لديك ${bannerUrls.length} بنر(ات). فكّر بإضافة شارة خصم أو عرض موسمي لرفع النقرات من خريطة الرصد.`,
      metadata: { bannerCount: bannerUrls.length, hasDiscount },
    });
  }

  const gallery = input.galleryItems ?? [];
  const staleDays = 45;
  const now = Date.now();
  const stale = gallery.filter((g) => {
    if (!g.createdAt) return false;
    const age = (now - new Date(g.createdAt).getTime()) / 86400000;
    return age > staleDays;
  });

  if (gallery.length === 0) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'gallery',
      priority: 75,
      dedupeKey: 'gallery_empty',
      title: 'معرض الصور فارغ',
      body: 'يا عمنا، معرض أعمالك فارغ. أضف صوراً حديثة لأعمالك — العملاء يقررون من أول نظرة على المعرض.',
      metadata: { galleryCount: 0 },
    });
  } else if (stale.length > 0) {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'gallery',
      priority: 70,
      dedupeKey: 'gallery_stale',
      title: `تنبيه: ${stale.length} صورة قديمة في المعرض`,
      body: `تفضل، بعض صور المعرض تجاوزت ${staleDays} يوماً. تحديث الصور يعكس حيوية الصالون ويرفع ثقة الزائر.`,
      metadata: { staleCount: stale.length, galleryCount: gallery.length },
    });
  } else {
    await upsertRecommendation(supabase, {
      barberId,
      category: 'gallery',
      priority: 35,
      dedupeKey: 'gallery_fresh',
      title: 'معرض الصور محدّث 👍',
      body: `تفضل يا عمنا، معرضك يحتوي ${gallery.length} صورة بحالة جيدة. حافظ على تجديد صورة كل 30–45 يوم.`,
      metadata: { galleryCount: gallery.length },
    });
  }

  await supabase
    .from('barber_digital_shift_config')
    .update({
      last_insights_refresh_at: new Date().toISOString(),
      banner_snapshot: {
        bannerImageUrls: bannerUrls,
        showDiscountBadge: input.showDiscountBadge ?? false,
        discountPercent: input.discountPercent ?? null,
      },
      gallery_snapshot: gallery,
    })
    .eq('barber_id', barberId);
}

type ChatTurn = { role: 'user' | 'assistant'; content: string };

async function callOpenAI(system: string, turns: ChatTurn[]): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.DIGITAL_SHIFT_OPENAI_MODEL || process.env.PARTNER_ASSISTANT_OPENAI_MODEL || 'gpt-4o-mini').trim();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 700,
      messages: [{ role: 'system', content: system }, ...turns.map((t) => ({ role: t.role, content: t.content }))],
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  return String(json.choices?.[0]?.message?.content ?? '').trim();
}

async function callAnthropic(system: string, turns: ChatTurn[]): Promise<string> {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  const model = (process.env.DIGITAL_SHIFT_ANTHROPIC_MODEL || 'claude-3-5-haiku-latest').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      system,
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type: string; text?: string }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `Anthropic HTTP ${res.status}`);
  const block = json.content?.find((c) => c.type === 'text');
  return String(block?.text ?? '').trim();
}

export async function generateDigitalShiftReply(
  ctx: DigitalShiftContext,
  mode: 'customer' | 'barber',
  userText: string,
  history: ChatTurn[] = [],
): Promise<string> {
  const provider = resolveProvider();
  if (!provider) {
    if (mode === 'customer') {
      const lang = detectClientLanguage(userText);
      if (lang === 'en') {
        return `Hello! I'm ${ctx.assistantName}, the digital shift assistant for ${ctx.barberName} on Halaq Map. The barber will reply soon — how can I help you in the meantime?`;
      }
      if (lang === 'ur') {
        return `السلام علیکم! میں ${ctx.assistantName}، ${ctx.barberName} کا ڈیجیٹل اسسٹنٹ (Halaq Map)۔ باربر جلد جواب دیں گے — میں ابھی آپ کی کیسے مدد کر سکتا ہوں؟`;
      }
      return `يا هلا! أنا ${ctx.assistantName} — المناوب الرقمي لـ${ctx.barberName} على حلاق ماب. الحلاق يرد عليك قريباً يا عمنا، تفضل — كيف أقدر أساعدك الآن؟`;
    }
    return `يا عمنا تفضل، أنا ${ctx.assistantName} من حلاق ماب. ${DIGITAL_SHIFT_GREETING_BARBER}`;
  }

  const system = buildDigitalShiftSystemPrompt(ctx, mode);
  const lang = detectClientLanguage(userText);
  const langInstruction =
    mode === 'customer' && lang === 'en'
      ? 'Reply in English.'
      : mode === 'customer' && lang === 'ur'
        ? 'Reply in Urdu script.'
        : mode === 'customer'
          ? 'Reply in Arabic.'
          : 'Reply in warm Saudi Arabic.';

  const turns: ChatTurn[] = [...history.slice(-8), { role: 'user', content: `${langInstruction}\n\n${userText}` }];

  if (provider === 'openai') return callOpenAI(system, turns);
  return callAnthropic(system, turns);
}

export type InterceptDecision = {
  shouldReply: boolean;
  reason: string;
  trigger: 'shop_closed' | 'barber_delay' | 'none';
};

export function evaluateIntercept(params: {
  ctx: DigitalShiftContext;
  shopOpen: boolean;
  lastCustomerMessageAt: string | null;
  lastBarberHumanReplyAt: string | null;
  lastShiftReplyAt: string | null;
  enabled: boolean;
}): InterceptDecision {
  if (!params.enabled) return { shouldReply: false, reason: 'disabled', trigger: 'none' };
  if (!params.lastCustomerMessageAt) return { shouldReply: false, reason: 'no_customer_message', trigger: 'none' };

  const customerAt = new Date(params.lastCustomerMessageAt).getTime();
  const barberAt = params.lastBarberHumanReplyAt ? new Date(params.lastBarberHumanReplyAt).getTime() : 0;
  const shiftAt = params.lastShiftReplyAt ? new Date(params.lastShiftReplyAt).getTime() : 0;

  if (barberAt > customerAt) return { shouldReply: false, reason: 'barber_already_replied', trigger: 'none' };
  if (shiftAt > customerAt) return { shouldReply: false, reason: 'shift_already_replied', trigger: 'none' };

  if (!params.shopOpen) {
    return { shouldReply: true, reason: 'shop_closed', trigger: 'shop_closed' };
  }

  const delayMs = params.ctx.replyDelayMinutes * 60_000;
  if (Date.now() - customerAt >= delayMs) {
    return { shouldReply: true, reason: 'barber_delay', trigger: 'barber_delay' };
  }

  return { shouldReply: false, reason: 'within_delay_window', trigger: 'none' };
}
