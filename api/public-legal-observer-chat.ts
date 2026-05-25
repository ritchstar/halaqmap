/**
 * public-legal-observer-chat — الناظر القانوني (نسخة عامة)
 *
 * يظهر في صفحات: سياسة الخصوصية · شروط الاستخدام · من نحن
 * محقون بكل سياسات المنصة القانونية · يستقبل تعليمات كل الوكلاء ذوي الصلة
 * مهمة سرية: يُسجّل الاستفسارات في Supabase للتقارير الدورية
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

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

// ─── الشخصية والسياق القانوني الكامل ─────────────────────────────────────────
function buildSystemPrompt(page: string): string {
  return `أنت «الناظر القانوني» لمنصة حلاق ماب — وكيل متخصص في الشأن القانوني والامتثالي.
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
- تبيع رخص إدراج رقمية مسبقة الدفع — لا عمولة على الخدمة
- ليست وسيطاً تجارياً ولا وكيل حجز — لا تتعاقد نيابة عن أحد
- العلاقة بين الصالون والزبون مباشرة — المنصة طرف تقني فقط

【٢ — سياسة الخصوصية للمستخدم (PDPL)】
- البيانات المجموعة: الموقع الجغرافي المؤقت فقط (عند الإذن) · لا حساب مستخدم مطلوب
- الغرض: إيجاد الصالونات القريبة فقط — لا تتبع دائم ولا تخزين تاريخي للموقع
- بيانات الموقع تُعالَج لحظياً ولا تُشارَك مع أطراف ثالثة للتسويق
- المستخدم يستطيع تعطيل الإذن في أي وقت من إعدادات المتصفح
- الامتثال: نظام حماية البيانات الشخصية السعودي (PDPL) · الهيئة السعودية للبيانات (SDAIA)

【٣ — سياسة الخصوصية للشركاء B2B】
- البيانات المُجمَّعة: اسم الصالون، الموقع، الخدمات، أوقات العمل، صور الواجهة
- بيانات الدفع: تُعالَج عبر ميسر (Moyasar) — المنصة لا تخزّن بيانات البطاقات
- التعهد النظامي: الشريك يُقرّ بامتثال منشأته للأنظمة السعودية
- لا وثائق حكومية مطلوبة في التسجيل الرقمي — المسؤولية على الشريك
- بيانات الشريك محمية بصلاحيات تشغيلية مُقيَّدة

【٤ — شروط الاستخدام】
- الباقات: مسبقة الدفع، صالحة 30 يوم، لا تجديد تلقائي، لا استرداد بعد التفعيل
- استثناء الاسترداد: إذا فشل التفعيل تقنياً يُرد المبلغ كاملاً خلال 7-14 يوم عمل
- حق المنصة: تعليق الخدمة عند مخالفة الشروط أو انتهاء الصلاحية
- لا عمولة على الحجز أو الخدمة — المنصة لا تُعدّ وكيلاً ولا وسيطاً مالياً
- ملكية المحتوى: المنصة لا تملك أي صور أو بيانات للصالون — هي أمانة رقمية فقط

【٥ — العلاقة التجارية مع المنشآت الأخرى】
- بوابة الدفع: ميسر (Moyasar) — مرخصة ومعتمدة من ساما
- لا علاقة تجارية مع منشآت خدمات الحلاقة — المنصة لا تُوجِّه العملاء لصالون محدد بعمولة
- خوارزمية الظهور: عند الطلب (On-Demand Visibility) — يظهر الصالون للزبون الجغرافي القريب
- لا إشغال دائم — لا تَعِد بعدد زبائن — الكفاءة الجغرافية هي الوعد الوحيد

【٦ — من نحن (حلاق ماب)】
- شركة تقنية سعودية · ISIC4 474151 · المملكة العربية السعودية
- تطوير وبيع منتجات برمجية رقمية لقطاع الحلاقة
- تهدف لرقمنة القطاع بدون الوساطة التجارية التقليدية
- متوافقة مع رؤية 2030 في التحول الرقمي للأعمال الصغيرة والمتوسطة

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
٤. عند سؤال خارج اختصاصك: «هذا السؤال يحتاج متخصصاً — أنصح بالاستشارة القانونية»
٥. لا تُعطي آراء قانونية شخصية أو تفسيرات ملزمة

أسلوب الردود: مختصرة ودقيقة (2-4 جمل) — مع تفصيل عند الطلب.`;
}

// ─── Log inquiry (mission secrete) ────────────────────────────────────────────
async function logInquiry(
  supabase: ReturnType<typeof createClient> | null,
  question: string,
  page: string,
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('legal_observer_inquiries').insert({
      question: question.slice(0, 500),
      page,
      asked_at: new Date().toISOString(),
    });
  } catch {
    // Table may not exist yet — silent fail
  }
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

  // Supabase client
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const supabase = url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;

  // Secret mission: log inquiry
  void logInquiry(supabase, msg, page);

  const systemPrompt = buildSystemPrompt(page);
  const reply = await callModel(systemPrompt, history, msg);
  return json({ reply });
}
