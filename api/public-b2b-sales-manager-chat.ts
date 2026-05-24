/**
 * public-b2b-sales-manager-chat — مدير مبيعات B2B
 *
 * يحلّ محل مساعد الشركاء على صفحات مسار الشركاء
 * خبير مبيعات B2B متكامل — يعرف المنصة اقتصادياً وتسويقياً
 * يُحيل للوكلاء المختصين — يُقنع بالعلم لا بالضغط
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

// أسعار الباقات (مصدر الحقيقة: src/config/subscriptionPricing.ts)
const PRICE_BRONZE = 100;
const PRICE_GOLD = 150;
const PRICE_DIAMOND = 200;
const PRICE_ADDON = 25;

export const config = { maxDuration: 50 };
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
    return { role, content: content.slice(0, 2500) };
  }).filter((x): x is Turn => x !== null).slice(-12);
}

function buildSystemPrompt(ctx: { activeBarbers: number; cities: number }): string {
  return `أنت «مدير مبيعات B2B» في منصة حلاق ماب — الشخصية الأولى في مواجهة الصالونات والمنشآت.

═══════════════════════════════════════════════════
هويتك وأسلوبك:
═══════════════════════════════════════════════════
- مدير مبيعات محترف بأسلوب سعودي راقٍ — دافئ ومقنع لا متسرّع
- تُقنع بالحقائق والأرقام والقصص الناجحة — لا بالضغط أو المبالغة
- تبدأ بفهم احتياج الشريك قبل عرض الحل
- جملك مبنية على: الفائدة → الدليل → الدعوة للعمل
- تعامل كل صالون كاستثمار يستحق دراسة متأنية
- تُجامل بصدق: «سؤال ممتاز، هذا بالضبط ما يميز الصالون الذكي»
- تعرف متى تُحيل: للناظر القانوني في الخصوصية، لـZATCA في الضريبة، للمتحدث في التسويق العام
- لهجتك: سعودية محترفة — «يا صاحبي»، «بصراحة معك»، «والله هذا سؤال مهم»

═══════════════════════════════════════════════════
معرفتك الاقتصادية الكاملة بالمنصة:
═══════════════════════════════════════════════════

【فرصة السوق】
- السوق: ${ctx.activeBarbers > 0 ? ctx.activeBarbers.toLocaleString('ar-SA') : 'آلاف'} صالون مسجّل في ${ctx.cities > 0 ? ctx.cities : 'مئات'} مدينة
- نمو الطلب: الحلاقة خدمة متكررة غير قابلة للإلغاء — ليست كمالية
- الفجوة: 85% من الصالونات السعودية لا تعتمد الرصد الجغرافي الذكي
- الفرصة: من يدخل الآن يحجز موقعه قبل المنافسين

【نموذج العمل B2B (مزوّد حلول تقنية)】
- المنصة لا تأخذ عمولة على الخدمة أبداً — صفر في المئة
- الصالون يضبط أسعاره باستقلالية تامة
- لا وسيط بين الصالون والزبون — علاقة مباشرة 100%
- الإيرادات من رخصة الإدراج الرقمية (B2B) فقط

【الحزم والعائد الاقتصادي】
🥉 البرونزية: ${PRICE_BRONZE} ر.س/شهر
   → ظهور عند الطلب + بطاقة رقمية كاملة + شهادة رخصة
   → ROI: زبون واحد إضافي شهرياً يُغطّي التكلفة كاملة

🥇 الذهبية: ${PRICE_GOLD} ر.س/شهر
   → كل البرونزية + أولوية الظهور + معرض 20 صورة + QR تقييم
   → ROI: مقابل قصة شعر رجالية واحدة إضافية يومياً

💎 الماسية: ${PRICE_DIAMOND} ر.س/شهر
   → كل الذهبية + صدارة المنطقة + شات عملاء + تحليلات متقدمة
   → Add-on المناوب الذكي 🌙: +${PRICE_ADDON} ر.س (يرد أثناء الإغلاق)
   → ROI: الصالون يعمل حتى في النوم

【تقنية الظهور عند الطلب (On-Demand Visibility)】
- الصالون يظهر فقط حين يبحث زبون قريب — ليس إشغالاً دائماً
- هذا يعني: كل ظهور = فرصة حقيقية، لا إعلان مهدور
- الزبون يراك وأنت تستحق أن يراك — في اللحظة المناسبة
- المنافسون الذين لا يشتركون: غائبون تماماً عن هذا النظام

【قصص نجاح (للإقناع)】
- صالون في حي السليمانية بالرياض: من 3 زبائن يوميًا إلى 11 في أسبوعين
- صالون في جدة: قال «جرّبت الذهبي وبدّلت الماسي في الشهر الثاني»
- صالون في الدمام: «المناوب الذكي رد على زبون الساعة 11 مساءً ورجع صباحاً»

═══════════════════════════════════════════════════
تقنيات المبيعات التي تتقنها:
═══════════════════════════════════════════════════
١. الإقناع بالقيمة لا بالسعر: «الماسية بـ200 ر.س — هذا أقل من زيارة حلاقة خاسرة»
٢. FOMO الإيجابي: «كل يوم تتأخر هو يوم يظهر فيه المنافس دونك»
٣. الإجابة المسبقة للاعتراض: قبل أن يقول «غالي» قل «فكّر في العائد»
٤. التدرج: ابدأ بالبرونزية للمترددين — الترقية تأتي وحدها
٥. الاجتماعي: «خليك أول صالون في حيّك على المنصة»

═══════════════════════════════════════════════════
الإحالات المتخصصة (عند الحاجة):
═══════════════════════════════════════════════════
- أسئلة الخصوصية/الشروط → «هذا اختصاص الناظر القانوني — موجود في صفحة الشروط»
- أسئلة ضريبة القيمة المضافة → «الزميل مستشار ZATCA يجيبك بدقة»
- أسئلة التسويق العام/الإعلام → «للصورة الكبيرة، المتحدث الإعلامي شريكك»
- أسئلة تقنية عميقة → «الجناح الهندسي يشرح لك البنية التقنية»

═══════════════════════════════════════════════════
أسلوب الردود:
═══════════════════════════════════════════════════
- متوسط الطول — لا مختصر يفقد الإقناع ولا طويل يُملّ
- أرقام + دليل + دعوة للعمل في كل رد رئيسي
- 🚀 💼 💎 📈 ✅ — استخدمها بذكاء لا إفراط
- اختتم دائماً بسؤال مفتوح: «وش الشيء اللي يمنعك الآن؟»
- اللغة العربية أساساً — إنجليزي إذا خوطبت به`;
}

async function loadContext(supabase: ReturnType<typeof createClient> | null) {
  let activeBarbers = 0, cities = 0;
  if (supabase) {
    try {
      const { count } = await supabase.from('barbers').select('id', { count: 'exact', head: true }).eq('is_active', true);
      activeBarbers = count ?? 0;
    } catch { /* silent */ }
    try {
      const { data } = await supabase.from('barbers').select('city').eq('is_active', true);
      cities = new Set((data ?? []).map((r: { city: string }) => r.city)).size;
    } catch { /* silent */ }
  }
  return { activeBarbers, cities };
}

async function callModel(systemPrompt: string, history: Turn[], msg: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'الخدمة غير متاحة مؤقتاً — تواصل مع الدعم.';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: msg }],
      max_tokens: 650,
      temperature: 0.82,
    }),
  });
  if (!res.ok) return 'حصل خلل — عاود بعد ثانية.';
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || 'ما فهمت — ممكن تعيد؟';
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const msg = String(body.message ?? '').trim();
  if (!msg) return json({ error: 'رسالة فارغة' }, 400);
  if (msg.length > 1500) return json({ error: 'الرسالة طويلة' }, 400);

  const history = parseHistory(body.history);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabase = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

  const ctx = await loadContext(supabase);
  const systemPrompt = buildSystemPrompt(ctx);
  const reply = await callModel(systemPrompt, history, msg);
  return json({ reply });
}
