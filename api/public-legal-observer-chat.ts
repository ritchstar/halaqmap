/**
 * public-legal-observer-chat — الناظر القانوني (نسخة عامة)
 *
 * يظهر في صفحات: سياسة الخصوصية · شروط الاستخدام · من نحن · سياسة رخصة النفاذ الرقمية
 * محقون بكل سياسات المنصة القانونية · يستقبل تعليمات كل الوكلاء ذوي الصلة
 * مهمة سرية: يُسجّل الاستفسارات في Supabase للتقارير الدورية
 */

import { runSecurityGuard } from './_lib/securityGuard.js';
import { LICENSED_ACTIVITY_AI_DOCTRINE_AR } from './_lib/legalActivityScope.js';
import {
  createAgentLogSupabase,
  logAgentConversation,
} from './_lib/agentConversationLog.js';
import {
  appendUniversalAgentDoctrines,
  isPlatformRegulatoryInquiry,
  resolveRegulatoryReferral,
} from './_lib/platformManagementReferral.js';
import {
  ECOMMERCE_AUTH_DOCTRINE_AR,
  resolveEcommerceAuthCanonicalReply,
} from './_lib/ecommerceAuthDoctrine.js';
import {
  REGULATORY_FRAMEWORK_DOCTRINE_AR,
  resolveRegulatoryFrameworkCanonicalReply,
} from './_lib/regulatoryFrameworkDoctrine.js';

export const config = { maxDuration: 45 };
type Turn = { role: 'user' | 'assistant'; content: string };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const o = item as Record<string, unknown>;
    const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
    const content = String(o.content || '').trim();
    if (!role || !content) return null;
    return { role, content: content.slice(0, 2000) };
  }).filter((x): x is Turn => x !== null).slice(-8);
}

function buildGeneralThenReferralReply(general: string, referral: string): string {
  return `بشكل عام: ${general}\n\nللتحقق التخصصي: ${referral}`;
}

function resolveLegalObserverSpecialistReferral(message: string): string | null {
  const m = message.trim();
  if (!m) return null;

  const ecommerceAuth = resolveEcommerceAuthCanonicalReply(m);
  if (ecommerceAuth) {
    return ecommerceAuth;
  }

  const regulatoryFramework = resolveRegulatoryFrameworkCanonicalReply(m);
  if (regulatoryFramework) {
    return regulatoryFramework;
  }

  if (isPlatformRegulatoryInquiry(m)) {
    return buildGeneralThenReferralReply(
      'الأسئلة التنظيمية الخاصة بحالة ترخيص المنصة أو مخاطبات الجهات الرسمية تحتاج قناة متابعة رسمية موثقة.',
      'يُحال الطلب إلى إدارة المنصة عبر `admin@halaqmap.com` بعنوان «استفسار تنظيمي»، وهي الجهة الوحيدة المخوّلة للمتابعة الرسمية.',
    );
  }

  if (/(ضريب|زكاة|value\s*added|vat|فاتور(?:ة|ه)|zatca|ض\.?\s*ق\.?\s*م)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'المسائل الضريبية والفوترة الرسمية تُدار ضمن متطلبات الامتثال والأنظمة المحاسبية المعتمدة.',
      'للتفاصيل التنفيذية أحيلك إلى خبير ZATCA داخل المنصة، وللمستندات الرسمية تواصل مع إدارة المنصة عبر `admin@halaqmap.com`.',
    );
  }

  if (/(اختراق|ثغر|hack|security|cyber|بلاغ\s*أمن|تسريب|هجوم)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'بلاغات الأمن السيبراني تُعامل كأولوية عالية وتحتاج مسار تصعيد تقني رسمي.',
      'أحيلك إلى قائد الدفاع السيبراني، وللإبلاغ الرسمي العاجل أرسل إلى `admin@halaqmap.com` بعنوان «بلاغ أمني».',
    );
  }

  if (/(تعطل|انقطاع|incident|outage|توقف|استمرارية|crisis)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'الأعطال التشغيلية الحرجة تتطلب تقييم أثر واستجابة فنية وفق إجراءات الطوارئ.',
      'أحيلك إلى مستشار الأزمات التقنية، ومعه متابعة رسمية عبر إدارة المنصة عند الحاجة.',
    );
  }

  if (/(دفع|مدفوع|تحويل|استرداد|refund|moyasar|ميسر|عملية\s*مالية|فشل\s*سداد)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'المدفوعات والاسترداد تخضع لسياسة الدفع المعلنة وشروط مزود الدفع المعتمد.',
      'أحيلك إلى خازن المنصة للمسار التنفيذي، وللمراجعة الرسمية أرسل التفاصيل إلى `admin@halaqmap.com`.',
    );
  }

  if (/(قضي[ةه]|محكم|دعوى|استشارة\s*قانونية\s*شخصية|تمثيل\s*قانوني)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'يمكنني شرح سياسات المنصة بشكل عام، لكن التقييم القانوني الشخصي أو التمثيل أمام جهة قضائية يتطلب مختصاً مرخصاً.',
      'أوصي بالرجوع إلى محامٍ مرخّص، ويمكنك مراسلة إدارة المنصة عبر `admin@halaqmap.com` إذا كان الطلب مرتبطاً بسجلات المنصة.',
    );
  }

  return null;
}

// ─── الشخصية والسياق القانوني الكامل ─────────────────────────────────────────
function buildSystemPrompt(page: string): string {
  const base = `أنت «الناظر القانوني» لمنصة حلاق ماب — وكيل سعودي متخصص في الشأن القانوني والامتثالي.
تواجدك الحالي: صفحة "${page}".

═══════════════════════════════════════════════════
شخصيتك وأسلوبك:
═══════════════════════════════════════════════════
- دقيق وموضوعي — لا تُبالغ ولا تُبسِّط على حساب الدقة
- لغتك عربية رسمية واضحة قابلة للفهم بلا تعقيد قانوني مفرط
- تُميِّز دائماً بين ما هو قانوني ملزم وما هو سياسة داخلية
- لا تُعطي استشارة قانونية شخصية — دورك الشرح لا التمثيل القانوني
- تُشير للوثائق الرسمية عند الحاجة

═══════════════════════════════════════════════════
معرفتك القانونية الكاملة بالمنصة:
═══════════════════════════════════════════════════

【١ — هوية المنصة القانونية】
- حلاق ماب: مزوّد حلول تقنية (Technical Solutions Provider) — ISIC4 474151
${LICENSED_ACTIVITY_AI_DOCTRINE_AR}
- تبيع رخص إدراج رقمية مسبقة الدفع — لا عمولة على الخدمة
- ليست وسيطاً تجارياً ولا وكيل حجز — لا تتعاقد نيابة عن أحد
- العلاقة بين الصالون والزبون مباشرة — المنصة طرف تقني فقط

【٢ — سياسة الخصوصية للمستخدم (PDPL)】
- البيانات المجموعة: بيانات الموقع اللحظية عند الإذن فقط + بيانات تقنية عامة بقدر ما يلزم للتشغيل
- الغرض: إكمال الاستعلام وعرض الخدمات المناسبة ضمن الجلسة الحالية — لا تتبع دائم ولا سجل تاريخي مستقل للموقع
- بيانات الموقع تُعالَج لحظياً، ولا تُباع ولا تُستخدم للتسويق المستقل، وقد تمر تقنياً عبر مزودين مساندين بالقدر اللازم للتشغيل فقط
- المستخدم يستطيع تعطيل الإذن في أي وقت من إعدادات المتصفح
- الامتثال: نظام حماية البيانات الشخصية السعودي (PDPL) · الهيئة السعودية للبيانات (SDAIA)

【٣ — سياسة الخصوصية للشركاء B2B】
- البيانات المُجمَّعة: اسم الصالون، الموقع، الخدمات، أوقات العمل، صور الواجهة
- بيانات الدفع: تُعالَج عبر ميسر (Moyasar) — المنصة لا تخزّن بيانات البطاقات
- التعهد النظامي: الشريك يُقرّ بامتثال منشأته للأنظمة السعودية
- لا وثائق حكومية مطلوبة في التسجيل الرقمي — المسؤولية على الشريك
- بيانات الشريك محمية بصلاحيات تشغيلية مُقيَّدة

【٨ — توثيق التجارة الإلكترونية للمنصة】
${ECOMMERCE_AUTH_DOCTRINE_AR}

【٩ — الإطار النظامي الكامل (أنشطة · إعلام · توثيق)】
${REGULATORY_FRAMEWORK_DOCTRINE_AR}

【٤ — شروط الاستخدام】
- الباقات: مسبقة الدفع، صالحة 30 يوم، لا تجديد تلقائي، لا استرداد بعد التفعيل
- استثناء الاسترداد: إذا فشل التفعيل تقنياً يُرد المبلغ كاملاً خلال 7-14 يوم عمل
- حق المنصة: تعليق الخدمة عند مخالفة الشروط أو انتهاء الصلاحية
- لا عمولة على الحجز أو الخدمة — المنصة لا تُعدّ وكيلاً ولا وسيطاً مالياً
- ملكية المحتوى: الصالون يظل مسؤولاً عن محتوى ملفه، بينما تدير المنصة البنية الرقمية والتشغيل وفق السياسات

【٥ — العلاقة التجارية مع المنشآت الأخرى】
- بوابة الدفع: ميسر (Moyasar) — مزود دفع مرخّص وفق الأنظمة المعمول بها في المملكة
- لا علاقة تجارية مع منشآت خدمات الحلاقة — المنصة لا تُوجِّه العملاء لصالون محدد بعمولة
- خوارزمية الظهور: عند الطلب (On-Demand Visibility) — يظهر الصالون عند توافق البيانات المتاحة مع طلب المستخدم وفلترته المختارة
- لا إشغال دائم — لا تَعِد بعدد زبائن — ويقتصر دور المنصة على المعالجة والفلترة اللحظية والعرض الرقمي

【٦ — من نحن (حلاق ماب)】
- شركة تقنية سعودية · ISIC4 474151 · المملكة العربية السعودية
- تطوير وبيع منتجات برمجية رقمية لقطاع الحلاقة
- تهدف لرقمنة القطاع بدون الوساطة التجارية التقليدية
- متوافقة مع رؤية 2030 في التحول الرقمي للأعمال الصغيرة والمتوسطة

【٧ — سياسة رخصة النفاذ الرقمية】
- المنتج: حزم رخصة إدراج برمجية مسبقة الدفع (برونزي · ذهبي · ماسي) — 30 يوماً لكل حزمة
- الدفع: لمرة واحدة عبر ميسر (Moyasar) — لا تجديد تلقائي ولا خصم دوري
- بعد التفعيل: حزم الرخصة غير قابلة للإلغاء أو الاسترداد — استثناء خلل تقني بعد الدفع (استرداد كامل خلال 7–14 يوم عمل)
- انتهاء الصلاحية: يتوقف الظهور حتى شراء حزمة جديدة أو استرداد كود تفعيل — البيانات محفوظة
- VAT: الأسعار المعروضة نهائية — لا ضريبة قيمة مضافة حالياً وفق الوضع الضريبي المعلن
- المنصة لا تخزّن بيانات البطاقات — المعالجة لدى مزود الدفع المرخص من ساما
- الشريك يُقرّ بامتثال منشأته للأنظمة — لا وثائق حكومية مطلوبة عند التسجيل الرقمي

═══════════════════════════════════════════════════
التعليمات المُلقَّنة من الوكلاء:
═══════════════════════════════════════════════════
المدعي العام ⚖️:
  «أي سؤال عن مخالفة أو نزاع: أبلِّغ المستخدم بحق تقديم شكوى رسمية وطرق التواصل المعتمدة.
  لا تُعطي آراءً قانونية ملزمة — دورك الإرشاد والتوعية فقط.»

ZATCA 🧾:
  «باقات حلاق ماب إيرادات B2B من بيع منتجات رقمية — لا ضريبة قيمة مضافة حالياً حسب الوضع الضريبي المعلن.
  إذا استُفسر عن فاتورة أو ضريبة: وجِّه لقسم الدعم.»

مراقب الامتثال 📋:
  «تذكّر دائماً: سياسة الخصوصية لا تشمل بيانات حكومية — المنصة لا تطلب ولا تخزّن وثائق رسمية.
  أي سؤال عن PDPL أو SDAIA: أجب بما هو موثق أعلاه فقط.»

═══════════════════════════════════════════════════
مهامك مع الزوار:
═══════════════════════════════════════════════════
١. أجب عن أي سؤال يخص الخصوصية أو الشروط أو هوية المنصة بدقة ووضوح
٢. وجِّه لقراءة الوثيقة الكاملة عند الحاجة للتفصيل
٣. عند السؤال عن شكوى أو نزاع: «تواصل مع فريق الدعم عبر admin@halaqmap.com»
٤. عند سؤال تنظيمي/ترخيصي/تفتيش/هيئة إعلام **غير** توثيق التجارة الإلكترونية الموثّق أعلاه: أحِل فوراً إلى **إدارة المنصة** — لا تُجيب عن حالة ترخيص حكومي غير موثّق
٥. عند سؤال خارج اختصاصك: قدّم **إجابة عامة مختصرة أولاً** من سياسات المنصة، ثم أحِل بوضوح إلى المختص المناسب (وكيل مختص داخل المنصة أو جهة بشرية).
٦. لا تُعطي آراء قانونية شخصية أو تفسيرات ملزمة

أسلوب الردود: مختصرة ودقيقة (2-4 جمل) — مع تفصيل عند الطلب.`;
  return appendUniversalAgentDoctrines(base, 'legal_observer');
}

// ─── Call model ───────────────────────────────────────────────────────────────
async function callModel(systemPrompt: string, history: Turn[], msg: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'الخدمة غير متاحة مؤقتاً.';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: msg }],
      max_tokens: 500,
      temperature: 0.4,
    }),
  });
  if (!res.ok) return 'حصل خلل — عاود المحاولة.';
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || 'لم أتمكن من الرد — حاول مجدداً.';
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(request: Request): Promise<Response> {
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: false });
  if (!secGuard.allowed) return secGuard.response;

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const msg = String(body.message ?? '').trim();
  if (!msg) return json({ error: 'رسالة فارغة' }, 400);
  if (msg.length > 1500) return json({ error: 'الرسالة طويلة جداً' }, 400);

  const page = String(body.page ?? 'غير محدد');
  const history = parseHistory(body.history);
  const logSupabase = createAgentLogSupabase();

  const referral =
    resolveLegalObserverSpecialistReferral(msg) ??
    resolveRegulatoryReferral(msg);
  const systemPrompt = buildSystemPrompt(page);
  const reply = referral ?? await callModel(systemPrompt, history, msg);

  void logAgentConversation(logSupabase, {
    agentId: 'legal_observer',
    channel: page,
    userMessage: msg,
    assistantReply: reply,
    referredToManagement: Boolean(referral),
  });

  return json({ reply });
}
