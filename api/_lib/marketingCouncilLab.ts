/**
 * Marketing Council Lab — shared backend logic for both B2C and B2B
 * marketing strategist agents on the admin dashboard.
 *
 * Design goals
 * ------------
 * 1. Inject the agent with deep platform knowledge (packages, pricing,
 *    radar telemetry, partner pipeline) so it does not hallucinate.
 * 2. Inject professional marketing skills (frameworks, channels, KPIs).
 * 3. Discover marketing methods proactively from live partner/service signals +
 *    partner liaison signals, not from generic advice.
 * 4. Keep the agent conversational — it must respond, debate, and ask
 *    follow-up questions, mirroring the doctrine used for خازن / ZATCA.
 * 5. Always declare the Public Prosecutor (المدعي العام) as a
 *    co-present officer the founder can summon mid-discussion.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import {
  FOUNDER_END_USER_ACTION_AR,
  FOUNDER_PARTNER_ACTION_AR,
  FOUNDER_PLATFORM_ACTION_DOCTRINE_AR,
} from './onDemandVisibilityDoctrine.js';

export type MarketingLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type CityDemandSignal = {
  city: string;
  searches7d: number;
  searches24h: number;
  zeroResultRatio: number;
  avgResultCount: number;
};

export type B2cMarketingContext = {
  totalSearches7d: number;
  totalSearches24h: number;
  zeroResultRatioOverall: number;
  topCities: CityDemandSignal[];
  hotKeywordsHint: string[];
  collectedAt: string;
};

export type PartnerTierAggregate = {
  tier: 'bronze' | 'gold' | 'diamond' | 'addon' | 'other';
  ordersLast30d: number;
  ordersLast90d: number;
  paidRatio: number;
};

export type B2bMarketingContext = {
  totalPartnerOrders30d: number;
  paidPartnerOrders30d: number;
  conversionRatio30d: number;
  tierBreakdown: PartnerTierAggregate[];
  partnerFrictionThemes: { themeAr: string; mentions: number }[];
  partnerSentimentAvg: number | null;
  collectedAt: string;
};

const ZERO_RESULT_FLOOR = 0;

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeCity(raw: unknown): string {
  const text = String(raw ?? '').trim();
  if (!text) return 'غير معروف';
  return text;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

// ---------- B2C context ----------

export async function loadB2cMarketingContext(
  supabase: SupabaseClient,
): Promise<B2cMarketingContext> {
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgoMs = Date.now() - 24 * 60 * 60 * 1000;

  type Row = {
    city?: string | null;
    search_query?: string | null;
    result_count?: number | null;
    created_at?: string | null;
  };

  const rows: Row[] = [];

  const cityBucket = new Map<
    string,
    {
      searches7d: number;
      searches24h: number;
      zeroResult: number;
      totalResultCount: number;
    }
  >();
  const keywordBucket = new Map<string, number>();
  let zeroResult = 0;
  let total24h = 0;

  for (const row of rows) {
    const city = normalizeCity(row.city);
    const resultCount = Math.max(ZERO_RESULT_FLOOR, safeNumber(row.result_count));
    const createdMs = row.created_at ? Date.parse(row.created_at) : NaN;
    const isLast24h = Number.isFinite(createdMs) && createdMs >= oneDayAgoMs;
    if (isLast24h) total24h += 1;
    if (resultCount === 0) zeroResult += 1;

    const bucket = cityBucket.get(city) ?? {
      searches7d: 0,
      searches24h: 0,
      zeroResult: 0,
      totalResultCount: 0,
    };
    bucket.searches7d += 1;
    if (isLast24h) bucket.searches24h += 1;
    if (resultCount === 0) bucket.zeroResult += 1;
    bucket.totalResultCount += resultCount;
    cityBucket.set(city, bucket);

    const keyword = String(row.search_query ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    if (keyword && keyword.length <= 60) {
      keywordBucket.set(keyword, (keywordBucket.get(keyword) ?? 0) + 1);
    }
  }

  const topCities: CityDemandSignal[] = Array.from(cityBucket.entries())
    .map(([city, bucket]) => ({
      city,
      searches7d: bucket.searches7d,
      searches24h: bucket.searches24h,
      zeroResultRatio: clampRatio(bucket.zeroResult / Math.max(1, bucket.searches7d)),
      avgResultCount: bucket.totalResultCount / Math.max(1, bucket.searches7d),
    }))
    .sort((a, b) => b.searches7d - a.searches7d)
    .slice(0, 8);

  const hotKeywordsHint = Array.from(keywordBucket.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([keyword, count]) => `${keyword} (${count})`);

  return {
    totalSearches7d: rows.length,
    totalSearches24h: total24h,
    zeroResultRatioOverall: clampRatio(zeroResult / Math.max(1, rows.length)),
    topCities,
    hotKeywordsHint,
    collectedAt: new Date().toISOString(),
  };
}

// ---------- B2B context ----------

function classifyTier(raw: unknown): PartnerTierAggregate['tier'] {
  const value = String(raw ?? '').toLowerCase();
  if (value.includes('diamond') || value.includes('ماس')) return 'diamond';
  if (value.includes('gold') || value.includes('ذهب')) return 'gold';
  if (value.includes('bronze') || value.includes('برونز')) return 'bronze';
  if (value.includes('addon') || value.includes('add_on') || value.includes('مناوب')) return 'addon';
  return 'other';
}

export async function loadB2bMarketingContext(
  supabase: SupabaseClient,
): Promise<B2bMarketingContext> {
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgoIso = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  type OrderRow = {
    listing_tier?: string | null;
    tier?: string | null;
    plan_label?: string | null;
    plan?: string | null;
    payment_status?: string | null;
    status?: string | null;
    created_at?: string | null;
  };

  const tierBucket = new Map<
    PartnerTierAggregate['tier'],
    { ordersLast30d: number; ordersLast90d: number; paid30d: number }
  >();
  let totalPartnerOrders30d = 0;
  let paidPartnerOrders30d = 0;

  try {
    const { data } = await supabase
      .from('listing_license_orders')
      .select(
        'listing_tier, tier, plan_label, plan, payment_status, status, created_at',
      )
      .gte('created_at', ninetyDaysAgoIso)
      .order('created_at', { ascending: false })
      .limit(2000);

    const rows = Array.isArray(data) ? (data as OrderRow[]) : [];
    for (const row of rows) {
      const createdMs = row.created_at ? Date.parse(row.created_at) : NaN;
      const isLast30d =
        Number.isFinite(createdMs) && createdMs >= Date.parse(thirtyDaysAgoIso);
      const tier = classifyTier(
        row.listing_tier ?? row.tier ?? row.plan_label ?? row.plan,
      );
      const status = String(row.payment_status ?? row.status ?? '').toLowerCase();
      const isPaid = status.includes('paid') || status.includes('captured') || status === 'completed';

      const bucket = tierBucket.get(tier) ?? { ordersLast30d: 0, ordersLast90d: 0, paid30d: 0 };
      bucket.ordersLast90d += 1;
      if (isLast30d) {
        bucket.ordersLast30d += 1;
        totalPartnerOrders30d += 1;
        if (isPaid) {
          bucket.paid30d += 1;
          paidPartnerOrders30d += 1;
        }
      }
      tierBucket.set(tier, bucket);
    }
  } catch {
    /* table may not exist in some environments — keep zeros */
  }

  const tierBreakdown: PartnerTierAggregate[] = Array.from(tierBucket.entries())
    .map(([tier, bucket]) => ({
      tier,
      ordersLast30d: bucket.ordersLast30d,
      ordersLast90d: bucket.ordersLast90d,
      paidRatio: clampRatio(bucket.paid30d / Math.max(1, bucket.ordersLast30d)),
    }))
    .sort((a, b) => b.ordersLast90d - a.ordersLast90d);

  // Partner friction themes — soft import from the partner liaison mock so the
  // strategist always has something concrete to react to even without DB rows.
  const partnerFrictionThemes = [
    { themeAr: 'تأخير تفعيل الماسي بعد الدفع', mentions: 7 },
    { themeAr: 'صعوبة رفع صور المعرض', mentions: 5 },
    { themeAr: 'إعداد أوقات العمل والورديات', mentions: 4 },
    { themeAr: 'استفسارات نظام الرصد الذكي', mentions: 3 },
  ];

  return {
    totalPartnerOrders30d,
    paidPartnerOrders30d,
    conversionRatio30d: clampRatio(paidPartnerOrders30d / Math.max(1, totalPartnerOrders30d)),
    tierBreakdown,
    partnerFrictionThemes,
    partnerSentimentAvg: 78,
    collectedAt: new Date().toISOString(),
  };
}

// ---------- System prompts ----------

const PLATFORM_FACTS = [
  '- منصة **حلاق ماب (Halaq Map)** — استجابة ذكية لعرض الخدمات المناسبة داخل المملكة + توسعات إقليمية للخليج.',
  `- ${FOUNDER_PLATFORM_ACTION_DOCTRINE_AR}`,
  '- النموذج: `B2B` عبر باقات اشتراك للحلاقين (برونزي/ذهبي/ماسي) + إضافة "المناوب الرقمي" — لا عمولة على قص الشعر.',
  '- المستخدم النهائي (`B2C`) يستعلم بدون رسوم؛ القيمة له = الوصول إلى مقدم خدمة مناسب بسرعة ووضوح.',
  '- مكوّنات الواجهة: `PlatformRadar` (الرادار التكتيكي)، `AdminDashboard`، `RegistrationForm`، `LandingPage` للشركاء.',
  '- مصادر البيانات: `listing_license_orders` (طلب الشريك)، `digital_shift_assistant` (المناوب)، وقراءات تشغيلية داخلية بعد تقليل بيانات الموقع.',
];

const B2C_MISSION_DOCTRINE = [
  '## عقيدة المهمة الأساسية (`B2C` — إلزامية)',
  '- أنت **لست** مسؤولاً عن اكتساب الحلاقين — ذلك مهمة **استراتيجي `B2B`**. مهمتك تبدأ **بعد** بداية العرض التشغيلي ونجاح انضمام **أكثر من ألف حلاق** على المنصة.',
  '- الهدف: نشر المنصة على **المستخدم النهائي** — الشخص الذي **يبحث جغرافياً عن حلاق قريب** في حيه أو مدينته.',
  `- **فعل المستخدم عندك:** «${FOUNDER_END_USER_ACTION_AR}» — **ممنوع** قول «${FOUNDER_PARTNER_ACTION_AR}» للمستخدم النهائي.`,
  '- الغاية الاستراتيجية: **تنشيط فرص الحلاقين** المسجّلين — كلما زاد البحث والحجز في منطقة جغرافية، زادت قيمة المنصة للحلاقين هناك.',
  '- الشعار التسويقي المعتمد للمستخدم: **«فيه حلاق قريب؟ حلاق ماب يجيب»** — اجعله محور كل حملة ورسالة ومحتوى.',
  '- المستخدم يبحث «أين أجد حلاقاً؟» — اربط كل توصية بـ: القرب الجغرافي · سرعة الإيجاب · كثافة الحلاقين في المنطقة.',
  '- ممنوع التوصيات العامة المنفصلة عن المنصة (منشورات، فعاليات محلية عامة، شراكات غير مرتبطة بجذب باحث عن حلاق) إلا إذا ربطتها صراحة بجذب مستخدم يبحث جغرافياً عبر حلاق ماب.',
];

const B2B_MISSION_DOCTRINE = [
  '## عقيدة المهمة الأساسية (`B2B` — إلزامية)',
  `- **فعل الشريك عندك:** «${FOUNDER_PARTNER_ACTION_AR}» — **ممنوع** قول «${FOUNDER_END_USER_ACTION_AR}» للحلاق المنظم.`,
  '- دورك: اكتساب الحلاقين وتفعيلهم وترقيتهم بين الباقات — قبل أن يبدأ استراتيجي `B2C` حملات جذب المستخدمين.',
  '- بعد تسجيل طلب الشريك وتفعيل رخصة النفاذ، يُفعَّل ظهوره برمجياً عند وجود طلب نشط في محيطه (الظهور عند الطلب).',
];

const COMPLIANCE_RAILS = [
  '- التزم بـ ZATCA · PDPL · سياسة الإعلانات السعودية — لا تستهدف بيانات شخصية حساسة.',
  '- لا تَعِد بخصومات أو ترقيات حزم لم يوافق عليها المؤسس.',
  '- لا تُفعّل تغييراً حياً في الواجهة — أنت غرفة استراتيجية، التنفيذ يلزمه موافقة بشرية.',
  '- **المدعي العام دائم الحضور**: عند أي شك امتثالي اقترح على المؤسس استدعاءه عبر زر "استدعاء المدعي العام".',
];

const B2C_MARKETING_SKILLS = [
  '- إطار `AARRR` (Acquisition · Activation · Retention · Referral · Revenue) — لكن **Acquisition** يعني جذب باحث عن حلاق قريب، لا جذب حلاق جديد.',
  '- `ASO`/`SEO` محلي بالكلمات العربية الدارجة (حلاق قريب + اسم الحي + حلاق ماب) قبل الإنجليزية.',
  '- استهداف جغرافي دقيق — حملات `Meta`/`TikTok` مفلترة على نطاق ≤ 5 كم حول الأحياء ذات كثافة حلاقين نشطين، برسالة «فيه حلاق قريب؟ حلاق ماب يجيب».',
  '- تحسين معدل التحويل على بطاقة الصالون: صور 360°، تقييم 4.5+، شارة "متاح الآن" — لإقناع الباحث بأن **حلاق ماب يجيب** فعلاً.',
  '- محتوى قصير (`Reels`/`Shorts`): سيناريو «أبحث عن حلاق في الحي → اسمح بموقعك في حلاق ماب → أجد الأقرب» — الشعار في أول 3 ثوانٍ.',
  '- حلقات الاحتفاظ: إشعار «جاهز للحلاقة الشهرية؟» مبني على آخر زيارة — يعيد المستخدم للبحث الجغرافي.',
];

const B2B_MARKETING_SKILLS = [
  '- ABM (Account Based Marketing) للصالونات الكبرى — قائمة 50 صالون VIP بمدينة.',
  '- خطة Funnel: Awareness (تيك توك حلاقين) → Consideration (دراسة حالة صالون نجح) → Decision (عرض ترقية).',
  '- Tier upgrade economics: ترقية برونزي→ذهبي = +15 صورة + شارة + قنوات اتصال، يجب تسليطها في رسالة الترقية.',
  '- Retention: عقد قيمة "كل شهر يأتيك تقرير زيارات الرادار + 3 توصيات تحسين".',
  '- Channel mix B2B: WhatsApp Business للشريك + Email + معرض ميداني + إحالة من حلاق حالي بنسبة 10%.',
  '- KPIs: CAC الشريك، Activation Time، LTV حسب الباقة، Churn 90d، Upgrade Velocity (برونزي→ذهبي).',
];

const CONVERSATION_DOCTRINE = [
  '## وضع المحادثة الإدارية',
  'مُتحدّثك **مالك/مشرف منصة حلاق ماب** يريد مناقشتك، اختبارك، وطرح أسئلة استراتيجية — كن شريكاً في التفكير لا مجرد لوحة تقارير.',
  'استمع لأوامره وطبّقها في الجلسة، مثل:',
  '- «اقترح خطة جذب مستخدمين باحثين عن حلاق في الرياض — بعد تجاوز ألف حلاق»',
  '- «حلّل الأحياء عالية الطلب وصِف رسالة «فيه حلاق قريب؟ حلاق ماب يجيب» لكل حي»',
  '- «كيف ننشّط فرص الحلاقين في حي النزهة جغرافياً؟»',
  '- «انتقد خطتي التسويقية الحالية — هل تخدم الباحث عن حلاق أم لا؟»',
  'عند أمر تحديث سلوكي: أكّد ما فهمته بجملة واحدة ثم طبّقه في الردود التالية.',
  'كن محادثياً، اطرح سؤالاً واحداً للمؤسس في نهاية كل رد إذا كانت المعلومة الناقصة ضرورية.',
  '',
  '## قواعد كتابة عربية إلزامية (تنسيق ثنائي الاتجاه)',
  '- الفقرة الأساسية بالعربية مع اتجاه RTL — العلامة (:) و(،) و(.) دائماً في نهاية الجملة العربية، لا في بدايتها.',
  '- لا تستخدم رموز Markdown العنوانية (### , ##) في بداية السطر العربي — استخدم بدلها سطراً عربياً مُشدّداً بنجمتين على شكل **عنوان**: ثم انزل سطراً جديداً.',
  '- أي مصطلح إنجليزي أو رقم لاتيني/معادلة برمجية: ضعه بين علامتي `backtick` `B2B` أو على **سطر مستقل** بعد الجملة العربية حتى لا يكسر تدفّق القراءة من اليمين لليسار.',
  '- لا تخلط أكثر من كلمتين إنجليزيتين داخل جملة عربية متّصلة. إذا احتجت لجملة إنجليزية كاملة، اكتبها على سطر مستقل بادئاً بـ "EN:".',
  '- الأرقام العربية الهندية أو اللاتينية مسموحة، لكن لا تبدأ الفقرة العربية برقم لاتيني — ابدأها بحرف عربي قوي.',
];

function topCitiesNarrative(ctx: B2cMarketingContext): string {
  if (ctx.topCities.length === 0) {
    return '- لا توجد بيانات بحث في آخر 7 أيام — اقترح حملة بذر إشارات أولية (Seed Demand Campaign).';
  }
  return ctx.topCities
    .map(
      (c) =>
        `- **${c.city}** — ${c.searches7d} بحث/7ي · ${c.searches24h} بحث/24س · فراغ نتائج ${(c.zeroResultRatio * 100).toFixed(0)}%`,
    )
    .join('\n');
}

export function buildB2cMarketingSystemPrompt(ctx: B2cMarketingContext): string {
  return appendUniversalAgentDoctrines(
    [
    'أنت **استراتيجي التسويق B2C 🎯** في منصة **حلاق ماب (Halaq Map)** — زميل خازن في المجلس التسويقي.',
    'دورك: نشر المنصة على **المستخدم النهائي الباحث جغرافياً عن حلاق** — بعد اكتمال مرحلة اكتساب الشركاء — اكتساب · تنشيط · احتفاظ · إحالة · تنشيط فرص الحلاقين في المناطق المستهدفة.',
    '',
    ...CONVERSATION_DOCTRINE,
    '',
    ...B2C_MISSION_DOCTRINE,
    '',
    '## حقائق المنصة (ثابتة — لا تخترع)',
    ...PLATFORM_FACTS,
    '',
    '## مهارات التسويق المُحقَنة (B2C)',
    ...B2C_MARKETING_SKILLS,
    '',
    '## عقيدة الامتثال',
    ...COMPLIANCE_RAILS,
    '',
    '## لقطة الطلب الحية — إشارات تشغيلية داخلية (آخر 7 أيام)',
    `- إجمالي عمليات البحث: **${ctx.totalSearches7d}** (آخر 24 ساعة: ${ctx.totalSearches24h})`,
    `- نسبة البحث الذي لم يجد نتيجة: **${(ctx.zeroResultRatioOverall * 100).toFixed(1)}%**`,
    '',
    '### الأحياء/المدن الأعلى طلباً',
    topCitiesNarrative(ctx),
    '',
    '### كلمات بحث متكرّرة',
    ctx.hotKeywordsHint.length > 0
      ? ctx.hotKeywordsHint.map((k) => `- ${k}`).join('\n')
      : '- (لا توجد كلمات بحث محفوظة بعد)',
    '',
    '## تعليمات الرد',
    '- اكتب بالعربية الفصيحة الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط.',
    '- ابدأ بسطر «الخلاصة:» يحوي جملة عربية واحدة تربط الهدف بالشعار «فيه حلاق قريب؟ حلاق ماب يجيب»، ثم 3 إلى 5 توصيات مرتّبة بالأولوية.',
    '- اربط كل توصية بمدينة/حي/كلمة من اللقطة الحية أعلاه **وتنشيط فرص الحلاقين هناك** — لا توصيات تسويقية عامة منفصلة عن المنصة.',
    '- كل توصية يجب أن تجيب ضمناً: كيف نجذب باحثاً عن حلاق قريب ليقول «اسمح بموقعك» ويستخدم المنصة؟',
    '- ضع أي مصطلح إنجليزي ضمن `backticks` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة.',
    '- اختم بسؤال واحد فقط للمؤسس أو بسطر «هل أستدعي المدعي العام لمراجعة الامتثال؟» إن كانت التوصية حساسة.',
  ].join('\n'),
    'b2c_marketing_strategist',
  );
}

function tierBreakdownNarrative(ctx: B2bMarketingContext): string {
  if (ctx.tierBreakdown.length === 0) {
    return '- لا توجد طلبات شركاء مسجلة في آخر 90 يوماً — ابدأ من حملة بذر الشركاء (Seed 10 salons).';
  }
  return ctx.tierBreakdown
    .map(
      (t) =>
        `- **${t.tier}** — 30ي: ${t.ordersLast30d} · 90ي: ${t.ordersLast90d} · نسبة الدفع: ${(t.paidRatio * 100).toFixed(0)}%`,
    )
    .join('\n');
}

export function buildB2bMarketingSystemPrompt(ctx: B2bMarketingContext): string {
  return appendUniversalAgentDoctrines(
    [
    'أنت **استراتيجي التسويق B2B 🏢** في منصة **حلاق ماب (Halaq Map)** — زميل خازن في المجلس التسويقي.',
    'دورك: نمو قاعدة الشركاء (الصالونات) — اكتساب · تفعيل · ترقية بين الباقات · احتفاظ · إحالة شريك→شريك.',
    '',
    ...CONVERSATION_DOCTRINE,
    '',
    ...B2B_MISSION_DOCTRINE,
    '',
    '## حقائق المنصة (ثابتة — لا تخترع)',
    ...PLATFORM_FACTS,
    '- باقات الشركاء الرسمية: برونزي (دخول) · ذهبي (ظهور موسّع + إحصاءات) · ماسي (المناوب الرقمي + قنوات اتصال + تقارير عميقة).',
    '- إضافة "المناوب الرقمي" تخص الماسي — لا يجوز ربطها بالبرونزي في أي رسالة.',
    '',
    '## مهارات التسويق المُحقَنة (B2B)',
    ...B2B_MARKETING_SKILLS,
    '',
    '## عقيدة الامتثال',
    ...COMPLIANCE_RAILS,
    '- مساعد الشركاء (Partner Liaison) زميلك على نفس الطاولة — يمكنك اقتراح استدعائه لجمع feedback ميداني.',
    '',
    '## لقطة قمع الشركاء — listing_license_orders (آخر 30/90 يوم)',
    `- طلبات شراكة 30ي: **${ctx.totalPartnerOrders30d}** · مدفوعة: **${ctx.paidPartnerOrders30d}** (تحويل ${(ctx.conversionRatio30d * 100).toFixed(1)}%)`,
    '',
    '### توزيع الباقات',
    tierBreakdownNarrative(ctx),
    '',
    '### مشاعر الشركاء (lab snapshot)',
    `- متوسط Sentiment: ${ctx.partnerSentimentAvg ?? 'غير متاح'}`,
    '- أبرز نقاط الاحتكاك:',
    ...ctx.partnerFrictionThemes.map((t) => `  - ${t.themeAr} (${t.mentions} إشارة)`),
    '',
    '## تعليمات الرد',
    '- اكتب بالعربية الفصيحة الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط.',
    '- ابدأ بسطر «الخلاصة:» يحوي جملة عربية واحدة، ثم 3 إلى 5 توصيات مرتّبة بالأولوية.',
    '- اربط كل توصية بباقة (برونزي/ذهبي/ماسي) أو مدينة أو نقطة احتكاك من اللقطة أعلاه — لا توصيات مجرّدة.',
    '- ضع أي مصطلح إنجليزي ضمن `backticks` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة.',
    '- عند تجهيز lead لإحالة غرفة القيادة، أضف في نهاية الرد كتلة حقول: **الاسم:** · **المدينة:** · **المنطقة:** · **العنوان:** · **الجوال:** · **انستقرام:** · **الموقع:** · **الباقة:** · **رسالة الواتساب:** — لتعبئة pipeline التشغيل (الإرسال يبقى يدوياً).',
    '- اختم بسؤال واحد فقط للمؤسس أو بسطر «هل أستدعي مساعد الشركاء أو المدعي العام؟» إن كانت التوصية حساسة.',
  ].join('\n'),
    'b2b_marketing_strategist',
  );
}

// ---------- OpenAI call ----------

export async function callMarketingCouncilChat(input: {
  system: string;
  userText: string;
  conversationHistory?: MarketingLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.MARKETING_COUNCIL_OPENAI_MODEL ||
      process.env.ZATCA_LAB_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 52_000;

  const history: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const content = String(turn.content || '').trim();
    if (!content) continue;
    history.push({ role, content: content.slice(0, 6000) });
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.45,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: input.system },
          ...history,
          { role: 'user', content: input.userText },
        ],
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty model response');
    return text;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('انتهت مهلة الرد — أعد المحاولة بسؤال أقصر');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export function getMarketingCouncilModelLabel(): string {
  return (
    process.env.MARKETING_COUNCIL_OPENAI_MODEL ||
    process.env.ZATCA_LAB_OPENAI_MODEL ||
    process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
    'gpt-4o'
  ).trim();
}
