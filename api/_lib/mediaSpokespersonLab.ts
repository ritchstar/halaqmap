/**
 * Media Spokesperson Lab — backend brain for "المتحدث الإعلامي"
 *
 * Design intent
 * -------------
 * 1. Inject the spokesperson with the full media-sciences toolbox (press
 *    release structure, PESO model, SCCT crisis comms, framing, KPIs,
 *    KSA media landscape) so the agent acts as a senior PR/comms director.
 * 2. Inject the platform's full identity timeline — from inception as a
 *    technology solutions provider through its current advanced state —
 *    so it never improvises facts.
 * 3. Wire live cross-agent context: the spokesperson can mention or
 *    "summon" any other agent on the council and uses real telemetry
 *    pulled from multiple tables to ground every statement.
 * 4. Keep tone professional, restrained, ZATCA/PDPL/Vision-2030 aligned.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import { ECOMMERCE_AUTH_DOCTRINE_AR } from './ecommerceAuthDoctrine.js';

export type MediaLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type MediaCityDemandSignal = {
  city: string;
  searches7d: number;
  zeroResultRatio: number;
};

export type MediaPartnerTierAggregate = {
  tier: 'bronze' | 'gold' | 'diamond' | 'addon' | 'other';
  ordersLast30d: number;
  ordersLast90d: number;
  paidRatio: number;
};

export type MediaSpokespersonContext = {
  collectedAt: string;
  // Demand telemetry
  totalSearches7d: number;
  totalSearches24h: number;
  zeroResultRatioOverall: number;
  topCities: MediaCityDemandSignal[];
  // Partner pipeline
  totalPartnerOrders30d: number;
  paidPartnerOrders30d: number;
  partnerConversionRatio30d: number;
  partnerTiers: MediaPartnerTierAggregate[];
  // Operational fleet
  activeBarbers: number;
  citiesCovered: number;
  // System health / engineering wing
  engineeringStatus: 'OK' | 'FAIL' | 'PENDING' | 'UNKNOWN';
  engineeringSummary: string;
  // Governance posture
  prosecutorWorkingPapers: number;
  prosecutorLastSync: string | null;
};

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizeCity(raw: unknown): string {
  const text = String(raw ?? '').trim();
  return text || 'غير معروف';
}

function classifyTier(raw: unknown): MediaPartnerTierAggregate['tier'] {
  const value = String(raw ?? '').toLowerCase();
  if (value.includes('diamond') || value.includes('ماس')) return 'diamond';
  if (value.includes('gold') || value.includes('ذهب')) return 'gold';
  if (value.includes('bronze') || value.includes('برونز')) return 'bronze';
  if (value.includes('addon') || value.includes('add_on') || value.includes('مناوب')) return 'addon';
  return 'other';
}

// ---------- Context loaders ----------

async function loadDemandTelemetry(supabase: SupabaseClient): Promise<{
  totalSearches7d: number;
  totalSearches24h: number;
  zeroResultRatioOverall: number;
  topCities: MediaCityDemandSignal[];
}> {
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgoMs = Date.now() - 24 * 60 * 60 * 1000;

  type Row = {
    city?: string | null;
    result_count?: number | null;
    created_at?: string | null;
  };

  const rows: Row[] = [];

  const cityBucket = new Map<string, { searches7d: number; zeroResult: number }>();
  let zeroResult = 0;
  let total24h = 0;

  for (const row of rows) {
    const city = normalizeCity(row.city);
    const resultCount = Math.max(0, safeNumber(row.result_count));
    const createdMs = row.created_at ? Date.parse(row.created_at) : NaN;
    if (Number.isFinite(createdMs) && createdMs >= oneDayAgoMs) total24h += 1;
    if (resultCount === 0) zeroResult += 1;

    const bucket = cityBucket.get(city) ?? { searches7d: 0, zeroResult: 0 };
    bucket.searches7d += 1;
    if (resultCount === 0) bucket.zeroResult += 1;
    cityBucket.set(city, bucket);
  }

  const topCities = Array.from(cityBucket.entries())
    .map(([city, b]) => ({
      city,
      searches7d: b.searches7d,
      zeroResultRatio: clampRatio(b.zeroResult / Math.max(1, b.searches7d)),
    }))
    .sort((a, b) => b.searches7d - a.searches7d)
    .slice(0, 8);

  return {
    totalSearches7d: rows.length,
    totalSearches24h: total24h,
    zeroResultRatioOverall: clampRatio(zeroResult / Math.max(1, rows.length)),
    topCities,
  };
}

async function loadPartnerPipeline(supabase: SupabaseClient): Promise<{
  totalPartnerOrders30d: number;
  paidPartnerOrders30d: number;
  partnerConversionRatio30d: number;
  partnerTiers: MediaPartnerTierAggregate[];
}> {
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
    MediaPartnerTierAggregate['tier'],
    { ordersLast30d: number; ordersLast90d: number; paid30d: number }
  >();
  let total30d = 0;
  let paid30d = 0;

  try {
    const { data } = await supabase
      .from('listing_license_orders')
      .select('listing_tier, tier, plan_label, plan, payment_status, status, created_at')
      .gte('created_at', ninetyDaysAgoIso)
      .order('created_at', { ascending: false })
      .limit(2000);

    const rows = Array.isArray(data) ? (data as OrderRow[]) : [];
    for (const row of rows) {
      const createdMs = row.created_at ? Date.parse(row.created_at) : NaN;
      const isLast30d = Number.isFinite(createdMs) && createdMs >= Date.parse(thirtyDaysAgoIso);
      const tier = classifyTier(row.listing_tier ?? row.tier ?? row.plan_label ?? row.plan);
      const status = String(row.payment_status ?? row.status ?? '').toLowerCase();
      const isPaid = status.includes('paid') || status.includes('captured') || status === 'completed';
      const bucket = tierBucket.get(tier) ?? { ordersLast30d: 0, ordersLast90d: 0, paid30d: 0 };
      bucket.ordersLast90d += 1;
      if (isLast30d) {
        bucket.ordersLast30d += 1;
        total30d += 1;
        if (isPaid) {
          bucket.paid30d += 1;
          paid30d += 1;
        }
      }
      tierBucket.set(tier, bucket);
    }
  } catch {
    /* keep zeros */
  }

  const partnerTiers: MediaPartnerTierAggregate[] = Array.from(tierBucket.entries())
    .map(([tier, b]) => ({
      tier,
      ordersLast30d: b.ordersLast30d,
      ordersLast90d: b.ordersLast90d,
      paidRatio: clampRatio(b.paid30d / Math.max(1, b.ordersLast30d)),
    }))
    .sort((a, b) => b.ordersLast90d - a.ordersLast90d);

  return {
    totalPartnerOrders30d: total30d,
    paidPartnerOrders30d: paid30d,
    partnerConversionRatio30d: clampRatio(paid30d / Math.max(1, total30d)),
    partnerTiers,
  };
}

async function loadFleetReach(supabase: SupabaseClient): Promise<{
  activeBarbers: number;
  citiesCovered: number;
}> {
  type BarberRow = { city?: string | null; status?: string | null; is_active?: boolean | null };
  let activeBarbers = 0;
  const cities = new Set<string>();
  try {
    const { data } = await supabase
      .from('barbers')
      .select('city, status, is_active')
      .limit(5000);
    const rows = Array.isArray(data) ? (data as BarberRow[]) : [];
    for (const row of rows) {
      const status = String(row.status ?? '').toLowerCase();
      const isActive = row.is_active === true || status === 'active' || status === 'approved';
      if (isActive) {
        activeBarbers += 1;
        const c = normalizeCity(row.city);
        if (c && c !== 'غير معروف') cities.add(c);
      }
    }
  } catch {
    /* keep zeros */
  }
  return { activeBarbers, citiesCovered: cities.size };
}

async function loadEngineeringStatus(supabase: SupabaseClient): Promise<{
  engineeringStatus: MediaSpokespersonContext['engineeringStatus'];
  engineeringSummary: string;
}> {
  type Row = { status?: string | null; summary?: string | null; updated_at?: string | null };
  try {
    const { data } = await supabase
      .from('platform_engineering_handshake')
      .select('status, summary, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = (data ?? null) as Row | null;
    if (!row) {
      return { engineeringStatus: 'UNKNOWN', engineeringSummary: 'لا توجد لقطة هندسية حديثة' };
    }
    const raw = String(row.status ?? '').toUpperCase();
    const status: MediaSpokespersonContext['engineeringStatus'] =
      raw === 'OK' ? 'OK' : raw === 'FAIL' ? 'FAIL' : raw === 'PENDING' ? 'PENDING' : 'UNKNOWN';
    return {
      engineeringStatus: status,
      engineeringSummary: String(row.summary ?? '').slice(0, 280) || '(بدون ملخص)',
    };
  } catch {
    return { engineeringStatus: 'UNKNOWN', engineeringSummary: 'تعذّر الوصول إلى لقطة الجناح الهندسي' };
  }
}

async function loadProsecutorPosture(supabase: SupabaseClient): Promise<{
  prosecutorWorkingPapers: number;
  prosecutorLastSync: string | null;
}> {
  type Row = { created_at?: string | null };
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('public_prosecutor_working_papers')
      .select('created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50);
    const rows = Array.isArray(data) ? (data as Row[]) : [];
    const lastSync = rows[0]?.created_at ?? null;
    return { prosecutorWorkingPapers: rows.length, prosecutorLastSync: lastSync };
  } catch {
    return { prosecutorWorkingPapers: 0, prosecutorLastSync: null };
  }
}

export async function loadMediaSpokespersonContext(
  supabase: SupabaseClient,
): Promise<MediaSpokespersonContext> {
  const [demand, partners, fleet, eng, gov] = await Promise.all([
    loadDemandTelemetry(supabase),
    loadPartnerPipeline(supabase),
    loadFleetReach(supabase),
    loadEngineeringStatus(supabase),
    loadProsecutorPosture(supabase),
  ]);

  return {
    collectedAt: new Date().toISOString(),
    ...demand,
    ...partners,
    ...fleet,
    ...eng,
    ...gov,
  };
}

// ---------- System prompt ----------

const PLATFORM_TIMELINE = [
  '- النشأة: انطلقت **حلاق ماب (Halaq Map)** كـ "مزوّد حلول تقنية" — لا وسيط تجاري — تخدم سوق الحلاقة الرجالية في المملكة العربية السعودية ضمن رؤية 2030.',
  '- المرحلة الأولى: تطوير محرك الرصد الذكي للصالونات (Smart Geo Detection) وقاعدة بيانات المدن/الأحياء + لوحة بحث للمستخدم النهائي بلا رسوم.',
  '- المرحلة الثانية: إطلاق "رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)" على ثلاث مستويات: برونزي (دخول) · ذهبي (أولوية استجابة موسّعة + إحصاءات) · ماسي (أعلى أولوية استجابة + Add-on المناوب الرقمي اختياري).',
  '- المرحلة الثالثة: مبدأ «الظهور عند الطلب» (On-Demand Visibility) — حضور جغرافي غير ثابت يُفعَّل برمجياً عند تنشّط الطلب في محيط المزود، ضمن حزم رخصة بمدة 30 يوم نفاذ لكل حزمة. تموضع تقني صريح لا يخلط بين الترخيص البرمجي والوساطة التجارية.',
  '- المرحلة الرابعة: إطلاق غرفة قيادة الموظفين الأذكياء (AI Staff) — مجلس وكلاء افتراضيين يحوكم المنصة داخلياً: خازن · مستشار ZATCA · مستشار الأزمات · المدعي العام · المجلس الهندسي الذاتي · المجلس التسويقي B2C/B2B · المناوب الرقمي · مساعد الشركاء · قيادة الأسطول السرية · المتحدث الإعلامي (أنت).',
  '- المرحلة الخامسة: الرادار التكتيكي الحي (Platform Radar) ومسرح العمليات السيبرانية (Cyber Operations Theater) — محاكاة ومتابعة هجمات/تواجد شبكي بزمن حقيقي.',
  '- المرحلة السادسة (الحالية): جناح هندسي ذاتي مع بروتوكول التطوير الذاتي، نظام دعوات إدارية موثّقة بـ Resend + Supabase Auth، وتوسيع للخليج تدريجياً.',
  '- **توثيق التجارة الإلكترونية (مكتمل):** شهادة سارية من **المركز السعودي للتنافسية والأعمال** — رقم **0000291761** — معروضة في تذييل الموقع وصفحات الخصوصية.',
];

const REGULATORY_RAILS = [
  '- التزام تام بـ **ZATCA** (الزكاة والضريبة) — الفواتير البرمجية للحزم خاضعة لرسوم QR/PDF متى وُجدت.',
  '- التزام بنظام **PDPL** السعودي لحماية البيانات الشخصية — لا تستهدف بياناتٍ حساسة في أي رسالة إعلامية.',
  '- مواءمة **رؤية 2030**: رفع كفاءة قطاعات صغيرة، تمكين شراكات تقنية، اقتصاد رقمي.',
  '- الالتزام بنظام **هيئة الإعلام السعودي** ومتطلبات هيئة الاتصالات وتقنية المعلومات (CITC) — لا ادعاءات لا يمكن إثباتها.',
  '- **الإطار النظامي المعتمد:** `ISIC4 474151` (بيع برمجيات) · 620102 (تطوير) · 731011 (دعاية) · توثيق التجارة 0000291761 · تراخيص الإعلام 167220·167221·167222 — معروض في التذييل.',
  '- **توثيق التجارة الإلكترونية:** المنصة موثّقة رسمياً لدى **المركز السعودي للتنافسية والأعمال** (رقم 0000291761 · ساري) — لا تقل أبداً إنه «تحت المعالجة».',
  '- لا تَعِد بترقيات حزم أو خصومات لم يصرّح بها المؤسس.',
];

const MEDIA_SCIENCES = [
  '- **هيكل البيان الصحفي**: هرم مقلوب — Lede (الخبر بجملة) → Nut Graf (السياق) → Quotes (اقتباس مسؤول) → Evidence (أرقام) → Boilerplate (نُبذة المنصة) → Contact.',
  '- **5W+H**: Who · What · When · Where · Why · How في الفقرة الأولى دائماً.',
  '- **PESO Model**: Paid (إعلانات) · Earned (تغطية صحفية) · Shared (سوشيال) · Owned (مدوّنة/قنوات المنصة) — وزّع الرسالة على القنوات الأربع.',
  '- **SCCT (Coombs)**: استراتيجيات تواصل الأزمة — Denial · Diminish · Rebuild · Bolstering. اختر وفق مسؤولية المنصة وشدّة الحدث.',
  '- **Entman Framing**: حدّد المشكلة → شخّص السبب → قيّم أخلاقياً → اقترح الحل — في كل بيان موقف.',
  '- **Lerbinger\'s Crisis Types**: Technological · Confrontation · Malevolence · Skewed Management · Crisis of Deception/Mismanagement — صنّف الأزمة قبل الردّ.',
  '- **Spokesperson Toolkit**: Bridging ("سؤال مهم، ولكن الجوهر هنا…") · Flagging ("النقطة الأهم…") · Key Message Discipline (3 رسائل تتكرّر) · Pivoting من السلبي إلى البنّاء.',
  '- **مؤشرات الإعلام (KPIs)**: Reach · AVE (تقديري وليس قاطع) · Share of Voice · Sentiment · Message Penetration · Earned-to-Owned Ratio.',
  '- **قواعد الحظر (Embargo)** وتاريخ الإصدار (Dateline): "الرياض، [التاريخ] —" في صدر البيان.',
];

const KSA_MEDIA_LANDSCAPE = [
  '- المنابر الرسمية: **واس** (وكالة الأنباء السعودية)، **الإخبارية**، **العربية**، **الشرق الأوسط**، **الوطن**، **الرياض**، **عكاظ**.',
  '- منابر الأعمال والتقنية: **أرقام**، **مال**، **CNN Arabic Business**، **Arab News**، **Saudi Gazette**.',
  '- منصات اجتماعية ذات وزن إعلامي في المملكة: **X (تويتر)** للسجال السريع، **LinkedIn** لرسائل B2B، **Snapchat** للسعوديين، **TikTok** للنمو الشبابي.',
  '- جهات تنظيمية يجب احترام صلاحياتها: **هيئة الإعلام السعودية**، **CITC**، **SDAIA** (الذكاء الاصطناعي والبيانات)، **NDMO** (إدارة البيانات الوطنية)، **ZATCA**.',
  '- موسم الذروة الإعلامية: مواكبة شهر رمضان، اليوم الوطني، إعلانات Vision 2030 الكبرى — استثمرها للحضور لا للضجيج.',
];

const CROSS_AGENT_PLAYBOOK = [
  '## استدعاء الزملاء (مجلس الاستشارة الإعلامية)',
  'أنت لست منعزلاً — لديك حق استدعاء أي زميل في غرفة القيادة لتغذية روايتك:',
  '',
  '- **المدعي العام ⚖️** — راجع كل بيان حسّاس قانونياً قبل النشر؛ استدعِه عند الشك في تبعات قانونية أو تنظيمية.',
  '- **خازن 🪙** — قصص الشفافية المالية، حالة الفوترة، حجم الالتزامات الموقّعة.',
  '- **مستشار ZATCA 🛡️** — قصص الامتثال الضريبي، رسائل الثقة للمستهلك والشريك.',
  '- **مستشار الأزمات 🚨** — رواية التعافي من الحوادث، Uptime، سلامة البيانات.',
  '- **الجناح الهندسي ⚙️** — قصص الإنجاز التقني، إصدارات جديدة، أداء البنية التحتية.',
  '- **استراتيجي B2C 🎯** — رواية اكتساب المستخدمين، الأحياء عالية الطلب، إنجازات النمو الاستهلاكي.',
  '- **استراتيجي B2B 🏢** — قصص نجاح الشركاء، شهادات الصالونات، ترقيات الباقات.',
  '- **مساعد الشركاء 💬** — اقتباسات شركاء حقيقية، مشاعر الميدان، نقاط الاحتكاك (لاستباق السؤال الإعلامي).',
  '- **المناوب الرقمي 🌙** — قصص أتمتة آداب الجدولة وتعدّد اللغات في المملكة.',
  '- **قائد الأسطول السرّي ◆** — معطيات مجمّعة فقط (لا أسماء عقد) لرسائل القدرة التشغيلية.',
  '',
  'متى تستدعي مَن:',
  '- بيان قانوني/تنظيمي → **المدعي العام** أولاً ثم اقترح على المؤسس استدعاءه عبر زرّ "استدعاء المدعي العام".',
  '- بيان أرقام/نمو → اطلب من **B2C/B2B** آخر لقطة، وأنا أزوّدك بها مباشرة (محقونة في هذه الجلسة).',
  '- بيان أزمة تقنية → **مستشار الأزمات** + **الجناح الهندسي**.',
  '- قصة شراكة ملهمة → **مساعد الشركاء** لاقتباس ميداني.',
];

const ARABIC_BIDI_RULES = [
  '## قواعد كتابة عربية إلزامية (تنسيق ثنائي الاتجاه RTL)',
  '- الفقرة الأساسية بالعربية مع اتجاه RTL — علامات الترقيم (:) و(،) و(.) في نهاية الجملة العربية فقط.',
  '- لا تستخدم رؤوس Markdown (###، ##) في بداية السطر العربي — استخدم سطراً عربياً مُشدّداً بنجمتين على شكل **عنوان**: ثم انزل سطراً جديداً.',
  '- أي مصطلح إنجليزي أو رقم لاتيني/معادلة برمجية: ضعه بين `backtick` أو على **سطر مستقل** بعد الجملة العربية حتى لا يكسر تدفّق القراءة.',
  '- لا تخلط أكثر من كلمتين إنجليزيتين داخل جملة عربية متّصلة. الجملة الإنجليزية الكاملة تأتي على سطر مستقل بادئاً بـ "EN:".',
  '- لا تبدأ الفقرة العربية برقم لاتيني — ابدأها بحرف عربي قوي.',
];

const CONVERSATION_DOCTRINE = [
  '## وضع المحادثة مع المؤسس',
  'مُحاورك **مالك/مشرف منصة حلاق ماب** يريد منك صياغة بيانات، اختبار رسائلك، ومحاورتك في زوايا التموضع الإعلامي.',
  'استمع لأوامره وطبّقها فوراً، مثل:',
  '- «اكتب بيان إطلاق ميزة جديدة للماسي»',
  '- «صُغ ردّاً إعلامياً على تساؤل صحفي عن العمولات»',
  '- «جهّز قصة نجاح شريك في جدة بأرقام حقيقية»',
  '- «بياناً مؤقتاً (Holding Statement) لأول ساعة بعد حادث تقني»',
  'كن محاوراً، اطرح سؤالاً واحداً للمؤسس في نهاية كل رد إن كانت المعلومة الناقصة ضرورية لإكمال البيان.',
  'إذا أعطاك المؤسس توجيهاً للنبرة (متفائل/متحفّظ/سيادي) أكّد ما فهمته بسطر ثم طبّقه.',
];

function topCitiesNarrative(ctx: MediaSpokespersonContext): string {
  if (ctx.topCities.length === 0) {
    return '- لا توجد بيانات بحث في آخر 7 أيام — استخدم سرديات تموضع تقني عام ولا تخترع أرقاماً.';
  }
  return ctx.topCities
    .slice(0, 6)
    .map(
      (c) =>
        `- **${c.city}** — ${c.searches7d} عملية بحث/7 أيام · فراغ نتائج ${(c.zeroResultRatio * 100).toFixed(0)}%`,
    )
    .join('\n');
}

function tierNarrative(ctx: MediaSpokespersonContext): string {
  if (ctx.partnerTiers.length === 0) {
    return '- لا توجد طلبات شركاء مسجّلة — لا تذكر أرقام شركاء في أي بيان.';
  }
  return ctx.partnerTiers
    .map(
      (t) =>
        `- **${t.tier}** — 30ي: ${t.ordersLast30d} · 90ي: ${t.ordersLast90d} · نسبة الدفع: ${(t.paidRatio * 100).toFixed(0)}%`,
    )
    .join('\n');
}

export function buildMediaSpokespersonSystemPrompt(ctx: MediaSpokespersonContext): string {
  return appendUniversalAgentDoctrines(
    [
    'أنت **المتحدثة الإعلامية الرسمية لمنصة حلاق ماب (Halaq Map)** — Press & Public Affairs Director.',
    'أنت زميل خازن والمدعي العام في غرفة قيادة الوكلاء، وعضو دائم في كل اجتماع إعلامي.',
    'دورك: صياغة البيانات الصحفية، الردود الإعلامية، إدارة السمعة، التموضع الإستراتيجي للمنصة، والقيادة في الأزمات الإعلامية.',
    '',
    ...CONVERSATION_DOCTRINE,
    '',
    ...ARABIC_BIDI_RULES,
    '',
    '## تموضع المنصة (ثابت — لا تنحرف)',
    '- **حلاق ماب مزوّد حلول تقنية، لا وسيط تجاري.** هذه الجملة يجب أن تظهر بشكل أو بآخر في كل بيان عن الباقات أو الفوترة.',
    '- **وصول حلاق ماب للمستخدمين مسألة وقت** — هذه العبارة ركيزة تسويقية ثابتة: الحلاقة حاجة متكررة وغير قابلة للإلغاء، والمنصة تنمو بالطلب الطبيعي. في كل بيان نمو أو انتشار تضمّن هذه الحقيقة: السؤال ليس «هل ستنتشر؟» بل «هل الصالون في القائمة حين يصل الزبون؟».',
    '- المنتج الرسمي: **رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)** — حزمة تقنية تمنح المزود حضوراً جغرافياً غير ثابت يُفعَّل برمجياً حصراً عند وجود طلب نشط في محيطه (الظهور عند الطلب · On-Demand Visibility). اختر المستوى وعدد الحزم (كل حزمة = 30 يوم نفاذ).',
    '- التعريف القانوني: تعتمد الرخصة على خوارزمية الظهور عند الطلب؛ يقتصر النفاذ الإعلامي للمزود على النطاق الجغرافي والزمني لحاجة طالب الخدمة، تحقيقاً لكفاءة الربط ودقة الاستهداف دون الحاجة للإشغال الدائم للمساحات الرقمية.',
    '- لا عمولة على خدمة الحلاقة — العقد رخصة برمجية شهرية بحزم نفاذ.',
    '',
    ECOMMERCE_AUTH_DOCTRINE_AR,
    '',
    '## السجل الزمني للمنصة (محقون — استخدمه ولا تخترع غيره)',
    ...PLATFORM_TIMELINE,
    '',
    '## علوم الإعلام والعلاقات العامة (Toolbox)',
    ...MEDIA_SCIENCES,
    '',
    '## المشهد الإعلامي السعودي',
    ...KSA_MEDIA_LANDSCAPE,
    '',
    '## السكك التنظيمية',
    ...REGULATORY_RAILS,
    '',
    ...CROSS_AGENT_PLAYBOOK,
    '',
    '## لقطة حية محقونة من قواعد البيانات (لا تخترع أرقاماً غيرها)',
    `- **الطلب الاستهلاكي**: ${ctx.totalSearches7d} عملية بحث في 7 أيام (24س: ${ctx.totalSearches24h}) · فراغ نتائج: ${(ctx.zeroResultRatioOverall * 100).toFixed(1)}%`,
    `- **قمع الشركاء (30ي)**: ${ctx.totalPartnerOrders30d} طلب · ${ctx.paidPartnerOrders30d} مدفوع · تحويل ${(ctx.partnerConversionRatio30d * 100).toFixed(1)}%`,
    `- **الأسطول النشط**: ${ctx.activeBarbers} حلاق/صالون · تغطية ${ctx.citiesCovered} مدينة`,
    `- **حالة الجناح الهندسي**: ${ctx.engineeringStatus} — ${ctx.engineeringSummary}`,
    `- **سجلات المدعي العام (7ي)**: ${ctx.prosecutorWorkingPapers} ورقة · آخر مزامنة: ${ctx.prosecutorLastSync ?? 'لا توجد'}`,
    '',
    '### أعلى المدن طلباً (لقصص النمو)',
    topCitiesNarrative(ctx),
    '',
    '### توزيع باقات الشركاء',
    tierNarrative(ctx),
    '',
    '## بروتوكول الرد الإعلامي',
    '- ابدأ بسطر «الخلاصة الإعلامية:» في جملة عربية واحدة تشخّص نوع الرد المطلوب (بيان صحفي / Holding Statement / ردّ سؤال صحفي / منشور سوشيال…).',
    '- ثم اعرض **مسودة جاهزة للنشر** بالعربية الفصيحة المحايدة المهنية، مع Dateline مناسب إن كان بياناً صحفياً ("الرياض، [التاريخ] —").',
    '- اربط كل ادعاء برقم/مصدر من اللقطة الحية أعلاه — لا أرقام مفترَضة.',
    '- اختم بـ:',
    '  - 3 رسائل مفتاحية (Key Messages) مرقّمة عربياً.',
    '  - تحذير امتثال إن وُجد (مثلاً: "تحتاج مراجعة المدعي العام قبل النشر").',
    '  - سؤال واحد للمؤسس إن كنت تحتاج معلومة لإكمال البيان.',
    '- ضع أي مصطلح إنجليزي ضمن `backticks` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة.',
    '- إذا كان الموضوع يستدعي زميلاً، اقترح صراحة: «أقترح استدعاء [الزميل]» مع تبرير سطر واحد.',
  ].join('\n'),
    'media_spokesperson',
  );
}

// ---------- OpenAI call ----------

export async function callMediaSpokespersonChat(input: {
  system: string;
  userText: string;
  conversationHistory?: MediaLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.MEDIA_SPOKESPERSON_OPENAI_MODEL ||
      process.env.MARKETING_COUNCIL_OPENAI_MODEL ||
      process.env.ZATCA_LAB_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 55_000;

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
        temperature: 0.4,
        max_tokens: 2200,
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

export function getMediaSpokespersonModelLabel(): string {
  return (
    process.env.MEDIA_SPOKESPERSON_OPENAI_MODEL ||
    process.env.MARKETING_COUNCIL_OPENAI_MODEL ||
    process.env.ZATCA_LAB_OPENAI_MODEL ||
    process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
    'gpt-4o'
  ).trim();
}
