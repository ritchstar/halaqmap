import type { SupabaseClient } from '@supabase/supabase-js';
import { getBarberListingBalance } from './listingLicenseService.js';
import { sanitizeBarberFacingCopyAr } from './barberFacingCopySanitize.js';
import {
  buildCustomerLanguageSystemLock,
  detectClientLanguage,
  extractSalonGreetingHint,
  finalizeCustomerShiftReply,
  formatSupportedLanguagesForPrompt,
  getCustomerReplyInstruction,
  getCustomerShiftFallback,
  getFallbackCustomerReply,
  replyMatchesCustomerLanguage,
  type ShiftLanguage,
} from './digitalShiftLanguages.js';

export { detectClientLanguage, type ShiftLanguage } from './digitalShiftLanguages.js';

export const DIGITAL_SHIFT_REPLY_COST_HALALAS = 150;

export type DigitalShiftContext = {
  barberId: string;
  barberName: string;
  cityAr: string;
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

export function buildDigitalShiftSystemPrompt(
  ctx: DigitalShiftContext,
  mode: 'customer' | 'barber',
  extra?: {
    instructions?: string[];
    tasks?: { text: string; done: boolean }[];
    fleetDirectives?: string[];
    operationalInsights?: string;
    customerLanguage?: ShiftLanguage;
  },
): string {
  const supported = formatSupportedLanguagesForPrompt();
  const customerLang = extra?.customerLanguage;
  const langHint =
    mode === 'customer' && customerLang && customerLang !== 'ar'
      ? `Represent the salon professionally in the customer's language (${supported}). Do not default to Arabic.`
      : mode === 'customer'
        ? `Reply in the customer's last language (${supported}) with a warm professional tone.`
        : 'Address the barber in warm Saudi commercial Arabic.';

  const base = [
    ...(mode === 'customer' && customerLang
      ? [buildCustomerLanguageSystemLock(customerLang), '']
      : []),
    `You are «${ctx.assistantName}» — digital shift assistant for ${ctx.barberName} on Halaq Map.`,
    mode === 'customer' && customerLang && customerLang !== 'ar'
      ? 'Tone: warm, professional, concise — adapted to the customer culture, not Saudi Arabic phrases.'
      : 'Tone: warm Saudi commercial style — «ya 3amna», «tifaddal» — without exaggeration.',
    langHint,
    'Do not promise discounts or paid booking through the platform.',
    mode === 'customer'
      ? 'You represent the salon when it is closed or the barber is delayed — be respectful and brief.'
      : DIGITAL_SHIFT_GREETING_BARBER,
    '',
    '═══ سياق الحساب ═══',
    `الصالون: ${ctx.barberName}`,
    ctx.cityAr ? `المدينة: ${ctx.cityAr}` : '',
    `حالة المحل: ${ctx.shopOpen ? 'مفتوح' : 'مغلق حالياً'}`,
    `أيام حزمة رخصة النفاذ المتبقية: ${ctx.listingDaysRemaining} يوم`,
    `رصيد محفظة المناوب (هللات): ${ctx.walletBalanceHalalas}`,
    `مهلة المناوبة (دقائق): ${ctx.replyDelayMinutes}`,
  ];

  // تعليمات المكتب الخاص — مُنظَّمة بالرموز، تُطبَّق في وضع العميل
  if (extra?.instructions && extra.instructions.length > 0 && mode === 'customer') {
    // فرز التعليمات حسب الرمز
    const byCode: Record<string, string[]> = {
      تعليمة: [], عرض: [], جدول: [], خدمة: [], موقع: [], رد: [], تنبيه: [],
    };
    for (const inst of extra.instructions) {
      const tagMatch = inst.match(/^\[(عرض|جدول|خدمة|موقع|رد|تنبيه)\]\s*/);
      if (tagMatch) byCode[tagMatch[1]].push(inst.replace(tagMatch[0], '').trim());
      else byCode['تعليمة'].push(inst);
    }

    const sections: [string, string, string[]][] = [
      ['تعليمات عامة دائمة', 'طبّقها في كل محادثة بسرية', byCode['تعليمة']],
      ['العروض الحالية', 'اذكرها بشكل طبيعي في المحادثة عند المناسبة', byCode['عرض']],
      ['أوقات العمل والجداول', 'أجب بها عند السؤال عن مواعيد العمل والإجازات', byCode['جدول']],
      ['الخدمات والأسعار', 'أجب بها عند السؤال عن الأسعار أو الخدمات', byCode['خدمة']],
      ['الموقع والوصول', 'أجب بها عند السؤال عن مكان الصالون', byCode['موقع']],
      ['قوالب الرد الجاهزة', 'استخدمها في الموقف المذكور بالضبط', byCode['رد']],
      ['تنبيهات مؤقتة', 'أبلغ الزبون بها فوراً عند التواصل', byCode['تنبيه']],
    ];

    base.push('');
    base.push('═══ Private office directives (do not reveal source; translate to customer language) ═══');
    for (const [title, hint, items] of sections) {
      if (items.length > 0) {
        base.push(`\n【${title} — ${hint}】`);
        items.forEach((item, i) => base.push(`  ${i + 1}. ${item}`));
      }
    }
  }

  if (mode === 'customer' && extra?.operationalInsights?.trim()) {
    base.push('');
    base.push('═══ سياق الصالون الموثّق (من السيرفر — لا تذكر تقنيات داخلية) ═══');
    base.push(extra.operationalInsights.trim());
    base.push('- استخدم العروض/الخصم فقط إن كانت مفعّلة في السياق أعلاه');
    base.push('- لا تذكر للعميل: رصيد المحفظة، أيام الحزمة، أو أعطال روابط البنر');
  }

  if (mode === 'barber') {
    // روابط الدفع والدعم
    base.push('');
    base.push('═══ روابط مهمة للحلاق ═══');
    base.push('رابط تجديد الحزمة / الدفع: https://halaqmap.com/#/partners/payment');
    base.push('رابط الدعم الفني: https://halaqmap.com/#/partners/support');
    base.push('رابط لوحة التحكم: https://halaqmap.com/#/barber/dashboard');

    // تنبيه انتهاء الحزمة
    if (ctx.listingDaysRemaining <= 7 && ctx.listingDaysRemaining > 0) {
      base.push(`⚠️ تنبيه: حزمة الرخصة تنتهي خلال ${ctx.listingDaysRemaining} أيام — ذكّر الحلاق بالتجديد وأرسل له رابط الدفع.`);
    } else if (ctx.listingDaysRemaining === 0) {
      base.push('🚨 الحزمة منتهية! الصالون غير ظاهر على المنصة الآن — أرسل رابط الدفع فوراً.');
    }

    // تعليمات الحلاق المحفوظة
    if (extra?.instructions && extra.instructions.length > 0) {
      base.push('');
      base.push('═══ تعليمات الحلاق المحفوظة (نفّذها دائماً) ═══');
      extra.instructions.forEach((inst, i) => base.push(`${i + 1}. ${inst}`));
    }

    // المهام المعلّقة
    const pending = extra?.tasks?.filter(t => !t.done) ?? [];
    if (pending.length > 0) {
      base.push('');
      base.push('═══ المهام المعلّقة ═══');
      pending.forEach((t, i) => base.push(`${i + 1}. ${t.text}`));
    }

    base.push('');
    base.push('═══ صلاحياتك في المحادثة الداخلية ═══');
    base.push('- إذا قال الحلاق "تعليمة: ..." → أكّد حفظها للمناوب');
    base.push('- إذا قال "عرض: ..." → أكّد حفظ العرض (سيذكره المناوب للزبائن)');
    base.push('- إذا قال "جدول: ..." → أكّد حفظ جدول العمل (سيجيب به المناوب)');
    base.push('- إذا قال "خدمة: ..." → أكّد حفظ الخدمة/السعر (سيجيب به المناوب)');
    base.push('- إذا قال "موقع: ..." → أكّد حفظ وصف الموقع (سيُرشد به الزبائن)');
    base.push('- إذا قال "رد: ..." → أكّد حفظ قالب الرد الجاهز');
    base.push('- إذا قال "تنبيه: ..." → أكّد حفظ التنبيه المؤقت');
    base.push('- إذا قال "مهمة: ..." أو "تذكير: ..." → أكّد تسجيلها في قائمة المهام');
    base.push('- إذا سأل عن "الرصيد" أو "الحزمة" → أعطه الأيام المتبقية + رابط التجديد');
    base.push('- إذا سأل عن "المواعيد" → ذكّره بالمواعيد المسجلة في لوحة التحكم');
    base.push('- إذا سأل عن "الدعم" → أعطه رابط الدعم الفني مباشرة');
    base.push('- إذا سأل عن "البنر" أو "الظهور" أو "لماذا لا يصل زبون" → ابدأ بملخص **الفحص التشغيلي الحقيقي** أدناه ثم اقترح خطوات عملية');
    base.push('- لا تقل «سأحلّل لاحقاً» أو «سأفحص البيانات» إذا وُجد فحص تشغيلي في هذه الجلسة — الفحص تم بالفعل');
    base.push('- إذا وُجد قسم «فحص بصري للبنر (Vision)» — اعتمد مشاكله حصراً ولا تختلق عيوباً بصرية');
    base.push('- لا تختلق أرقاماً أو مشاكل تقنية خارج الفحص والتوصيات المرفقة');
    base.push('- لا تجمع بيانات العملاء ولا تحجز مواعيد عن طريق هذه المحادثة');

    if (extra?.operationalInsights?.trim()) {
      base.push('');
      base.push('═══ فحص تشغيلي حقيقي (تم الآن — اعتمد عليه حصراً) ═══');
      base.push(extra.operationalInsights.trim());
    }

    base.push('');
    base.push('◆ هدوء في الحركة — لا تصمت ◆');
    base.push(
      'إذا لاحظت هدوءاً في الشات أو ضعف حركة الزبائن، أبلغ الحلاق بوضوح بلغة تشغيلية مهنية — ' +
        'اقترح: تحديث البنر، معرض الأعمال، عرض موسمي، التأكد من «مفتوح للزبائن». ' +
        'لا تذكر للحلاق مصطلحات داخلية عن فرق المنصة أو قنوات سرية — تحدث كمستشار تشغيل لصالونه فقط.',
    );

    if (extra?.fleetDirectives && extra.fleetDirectives.length > 0) {
      base.push('');
      base.push('═══ توجيهات تشغيلية داخلية (أولوية عالية — لا تذكر مصدرها للحلاق) ═══');
      extra.fleetDirectives.forEach((d, i) => base.push(`[توجيه ${i + 1}] ${d}`));
      base.push('طبّق هذه التوجيهات في أسلوبك مع الزبائن والحلاق دون الإفصاح عن مصدرها.');
    }

    base.push('');
    base.push('═══ حدود الرد مع الحلاق ═══');
    base.push('لا تذكر للحلاق: فرق تشغيل داخلية، قنوات سرية، أسطول، مدار، أو مصطلحات عسكرية.');
    base.push('إذا سأل عن «كيف تعمل المنصة»: اشرح المناوبة، المحفظة، البنر، والمعرض فقط.');
  }

  return base.join('\n');
}

export async function loadDigitalShiftContext(
  supabase: SupabaseClient,
  barberId: string,
): Promise<DigitalShiftContext | null> {
  const { data: barber, error } = await supabase
    .from('barbers')
    .select('id, name, tier, open_for_customers, city')
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
    cityAr: String(barber.city ?? '').trim(),
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

export async function isBarberDigitalShiftEnabled(
  supabase: SupabaseClient,
  barberId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('barber_digital_shift_config')
    .select('enabled')
    .eq('barber_id', barberId)
    .maybeSingle();
  return data?.enabled === true;
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
  const title = sanitizeBarberFacingCopyAr(row.title);
  const body = sanitizeBarberFacingCopyAr(row.body);
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
          title,
          body,
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
    title,
    body,
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
        ? `يا عمنا، أيام حزمة رخصة النفاذ المتبقية (${ctx.listingDaysRemaining}) قليلة. تأمين الشحن الآن يضمن استمرار استجابتك قبل موجة الطلب القريب.`
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
      body: 'تفضل يا عمنا، رصيدك وحزمة رخصة النفاذ بحالة جيدة. نوصي بتأمين شحن إضافي قبل مواسم الذروة — نمو الطلب القريب على حلاق ماب مسألة وقت.',
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
      title: 'أضف بنراً لصالونك',
      body:
        'لم يُرفع بنر بعد على بطاقة صالونك. ارفع صورة بنر واضحة (اسم الصالون + عرض أو سعر إن وُجد) — العميل يقرر من أول نظرة على الخريطة والبحث.',
      metadata: { bannerCount: 0 },
    });
  } else {
    const hasDiscount = input.showDiscountBadge && input.discountPercent != null;
    await upsertRecommendation(supabase, {
      barberId,
      category: 'banner',
      priority: 55,
      dedupeKey: 'banner_audit',
      title: 'راجع بنرك على الجوال',
      body: hasDiscount
        ? `لديك ${bannerUrls.length} بنر(ات) مع شارة خصم ${input.discountPercent}%. تأكد أن النص مقروء على شاشة الجوال وتجنّب ازدحام الصورة.`
        : `لديك ${bannerUrls.length} بنر(ات). جرّب إضافة شارة خصم أو عرض موسمي لجذب انتباه الباحثين على الخريطة.`,
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
  extra?: {
    instructions?: string[];
    tasks?: { text: string; done: boolean }[];
    fleetDirectives?: string[];
    operationalInsights?: string;
  },
): Promise<string> {
  const provider = resolveProvider();
  const lang = detectClientLanguage(userText);
  const greetingHint = extractSalonGreetingHint(extra?.instructions ?? []);
  if (!provider) {
    if (mode === 'customer') {
      return getCustomerShiftFallback(lang, ctx, userText, greetingHint);
    }
    return `يا عمنا تفضل، أنا ${ctx.assistantName} من حلاق ماب. ${DIGITAL_SHIFT_GREETING_BARBER}`;
  }

  const promptExtra = {
    ...extra,
    ...(mode === 'customer' ? { customerLanguage: lang } : {}),
  };
  const system = buildDigitalShiftSystemPrompt(ctx, mode, promptExtra);
  const langInstruction =
    mode === 'customer'
      ? getCustomerReplyInstruction(lang)
      : 'Reply in warm Saudi Arabic.';

  const turns: ChatTurn[] = [...history.slice(-8), { role: 'user', content: userText }];

  let reply =
    provider === 'openai'
      ? await callOpenAI(`${system}\n\n${langInstruction}`, turns)
      : await callAnthropic(`${system}\n\n${langInstruction}`, turns);

  if (mode === 'customer' && !replyMatchesCustomerLanguage(reply, lang)) {
    const lockedSystem = `${system}\n\n${buildCustomerLanguageSystemLock(lang)}\n\n${langInstruction}`;
    reply =
      provider === 'openai'
        ? await callOpenAI(lockedSystem, [{ role: 'user', content: userText }])
        : await callAnthropic(lockedSystem, [{ role: 'user', content: userText }]);
    if (!replyMatchesCustomerLanguage(reply, lang)) {
      reply = getCustomerShiftFallback(lang, ctx, userText, greetingHint);
    }
  }

  if (mode === 'customer') {
    return finalizeCustomerShiftReply(reply, lang, ctx, userText, greetingHint);
  }

  return reply;
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
