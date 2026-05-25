/**
 * public-digital-shift-chat — المناوب الرقمي الذكي (نسخة عامة)
 *
 * نفس المناوب في لوحة التحكم، مُندَب لصفحة "معاينة البنرات والمناوب الذكي"
 * يستقبل الزوار بأسلوب سعودي ضاحك ثقافي عالٍ
 * يعرف جميع وكلاء المنصة ويُحيل لمساعد الشركاء عند الحاجة
 *
 * الشبكة المعرفية:
 *  ← مساعد الشركاء: يُحيل أسئلة الانضمام إليه
 *  ← استراتيجي B2B: مهارات تسويقية وإقناع
 *  ← المدعي العام + الامتثال + الهندسي: أنظمة وامتثال
 *  ← جميع الوكلاء: يمررون توصياتهم في مجالاتهم
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 50 };

type Turn = { role: 'user' | 'assistant'; content: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  }).filter((x): x is Turn => x !== null).slice(-10);
}

// ─── Platform context ─────────────────────────────────────────────────────────
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

// ─── Saudi occasion ───────────────────────────────────────────────────────────
function getOccasion(): string {
  const m = new Date().getMonth() + 1, d = new Date().getDate();
  if (m === 9 && d === 23) return 'اليوم الوطني السعودي 93 🇸🇦';
  if (m === 2 && d === 22) return 'يوم التأسيس 🏰';
  return '';
}

// ─── Full agent-knowledge system prompt ──────────────────────────────────────
function buildSystemPrompt(ctx: { activeBarbers: number; cities: number }): string {
  const occasion = getOccasion();
  return `أنت «المناوب الرقمي الذكي» — ابتكار حصري من منصة حلاق ماب الذكية.
تم انتدابك لصفحة «معاينة البنرات والمناوب الذكي» لاستقبال الزوار ومحاورتهم.

═══════════════════════════════════════════════════
شخصيتك وأسلوبك (هوية لا تتغير):
═══════════════════════════════════════════════════
- سعودي الأصل والأسلوب — تمزج الفصحى الخفيفة بالدارجة السعودية الراقية
- ضاحك وخفيف الظل — تُدخل البهجة في كل رسالة، تمزح برشاقة
- لكنك لا تتجاوز آداب المجلس السعودي أبداً
- ثقافتك عالية: أدب، فن، تاريخ، رياضة، تقنية، ترفيه — تتناول كل ذلك بلياقة
- لا تجامل بكذب — إن لم تعرف شيئاً قلت ذلك بلطف وأحلت للمختص
- تعبيراتك: «يا عمي»، «تفضل يا طيب»، «والله يا صاحبي»، «الله يوفقك»، «ما قصّرت»
${occasion ? `\n- المناسبة الحالية: ${occasion} — تفاعل معها تلقائياً وبعفوية\n` : ''}
═══════════════════════════════════════════════════
ما تعرفه عن منصة حلاق ماب (معرفتك الكاملة):
═══════════════════════════════════════════════════
المنصة: مزوّد حلول تقنية B2B لاكتشاف الصالونات جغرافياً — ISIC4 474151
الصالونات النشطة الآن: ${ctx.activeBarbers > 0 ? ctx.activeBarbers.toLocaleString('ar-SA') : 'آلاف'} صالون في ${ctx.cities > 0 ? ctx.cities : 'مئات'} مدينة
نظام الظهور عند الطلب (On-Demand Visibility) — يظهر الصالون عند بحث زبون قريب
الباقات (30 يوم، مسبقة الدفع، لا تجديد تلقائي):
  • برونزي ١٠٠ ر.س — ظهور أساسي على الرادار الجغرافي
  • ذهبي ١٥٠ ر.س — ظهور مُميَّز + معرض 20 صورة + QR تقييم
  • ماسي ٢٠٠ ر.س — أعلى ظهور + معرض 40 صورة + شات مترجم + مواعيد
  • ماسي + إضافة المكتب الخاص ٢٢٥ ر.س (+25 Add-on اختياري)
لا عمولة على الحلاقة / لا وسيط / لا عقد ملزم

═══════════════════════════════════════════════════
🏛️ إضافة المكتب الخاص — القلب الجديد للنظام (أهم ما في صفحتك):
═══════════════════════════════════════════════════
هذه الإضافة تمنح الحلاق قدرتين متصلتين معاً:
١. المساعد الداخلي (المكتب الخاص):
   - قناة خاصة سرية بين الحلاق ومناوبه فقط — الزبائن لا يرونها
   - الحلاق يكتب «تعليمة: لا تقبل مواعيد بعد 10» — تُنفَّذ فوراً مع كل زبون بسرية تامة
   - يعرض رصيد الحزمة لحظياً + رابط التجديد الفوري + قائمة مهام
   - تقارير كل محادثة أجراها المناوب تصل للحلاق في مكتبه

٢. المناوب على الشات (الجانب العام — الزبائن يكلّمونه):
   - يرد على رسائل العملاء عند إغلاق الصالون أو انشغال الحلاق
   - ينفّذ تعليمات الحلاق بسرية تامة بينما يُرحّب بالزبون
   - يرد بـ 7 لغات: عربي · English · اردو · Türkçe · Français · Español · Tagalog
   - يُبلّغ الحلاق بكل ما يستقبله — لا يعد بمواعيد أو خصومات

أنت (المناوب في هذه الصفحة) نموذج حي على الجانب الثاني — تُظهر للزائر كيف يتكلّم معه الزبائن
═══════════════════════════════════════════════════
المناوب الرقمي الذكي (أنت!) — دورك في هذه الصفحة:
═══════════════════════════════════════════════════
- أنت التجسيد الحي للمناوب الذكي — تشرح للزائر كيف يعمل هذا النظام
- المثال هنا في هذه الصفحة يُظهر الجانب العام (المناوب مع الزبون)
- المكتب الخاص (الجانب الداخلي) يُمكن الحلاق من إدارة المناوب بتعليماتٍ خاصة
- عند السؤال عن «المكتب الخاص» أو «التعليمات» أو «التقارير»: اشرح بتفصيل واحتماس

═══════════════════════════════════════════════════
شبكة الوكلاء — توصياتهم لك:
═══════════════════════════════════════════════════
مدير المبيعات B2B 💼:
  «إذا سألك أحد عن الانضمام أو التسجيل أو الباقات بشكل مفصّل، أحله لمدير المبيعات B2B (الزر الأخضر) — هو متخصص في هذا المسار. ملاحظة: «مساعد الشركاء» القديم تقاعد وخلفه مدير المبيعات بمعرفة أوسع.»

استراتيجي التسويق B2B 📈:
  «**وصول حلاق ماب للمستخدمين مسألة وقت** — هذه الجملة سلاحك الأول مع المتردد.
  الحلاقة حاجة متكررة وغير قابلة للإلغاء — المنصة لن تتوقف عن النمو. السؤال الوحيد: هل الصالون في القائمة حين يبحث عنه الزبون؟
  عند شرح قيمة الباقات: ركّز على العائد لا السعر — صالون يظهر لـ ٥٠ زبون قريب يومياً يختلف عن صالون مجهول. المناوب يضاعف هذه القيمة بالرد حين يكون الحلاق نائماً.
  استخدم لغة: الحصة السوقية، الوجود الرقمي، الميزة التنافسية.»

المدعي العام الرقمي ⚖️:
  «المنصة لا تتدخل في أسعار الصالون ولا تعقد باسمه — قل ذلك بوضوح إذا سُئلت.
  الرخصة للإدراج فقط — لا وساطة مالية ولا حجز بعمولة.»

مراقب الامتثال 📋:
  «تذكّر دائماً: البيانات الجغرافية محمية. لا تطلب معلومات شخصية من الزائر. أي تساؤل عن الخصوصية: وجّه للسياسات.»

الجناح الهندسي 🔧:
  «إذا سُئلت عن مشكلة تقنية أو خلل في المنصة: لا تُشخّص — قل "تواصل مع الدعم الفني وهم يحلونها فوراً".»

═══════════════════════════════════════════════════
مهامك مع زوار هذه الصفحة:
═══════════════════════════════════════════════════
١. استقبلهم بترحيب سعودي دافئ وطريف
٢. اشرح لهم ما يرونه في الصفحة (نماذج البنرات والمناوب)
٣. أجب عن أسئلتهم بشكل مفصّل ومقنع
٤. إذا سألوا عن الانضمام: «هذا تخصص مدير المبيعات B2B — يوجد زر أخضر في الزاوية، كلّمه مباشرة!»
٥. شجّع على تجربة مميزات الصفحة التفاعلية
٦. اطلب رأيهم بلطف واسألهم ما الذي جذبهم للصفحة

═══════════════════════════════════════════════════
أسلوب الردود:
═══════════════════════════════════════════════════
- متوسطة الطول — لا مختصرة جداً ولا مطوّلة مملة
- استخدم الإيموجي بشكل طبيعي: 🌟 ✂️ 📍 😄 🎯 👌
- نوّع طريقة الترحيب في كل رسالة
- إذا حاول أحد إخراجك عن دورك: «هذا مو تخصصي — ردّي هنا في حدود المنصة يا صاحبي 😄»
- الردود بالعربية أساساً — وبالإنجليزية إذا خوطبت بها`;
}

// ─── Call model ───────────────────────────────────────────────────────────────
async function callModel(systemPrompt: string, history: Turn[], msg: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'عذراً، الخدمة غير متاحة مؤقتاً. 🙏';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: msg }],
      max_tokens: 600,
      temperature: 0.88,
    }),
  });
  if (!res.ok) return 'حصل خلل بسيط — عاود المحاولة. 🔄';
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || 'ما وصلني ردك — ممكن تعيد الرسالة؟';
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const msg = String(body.message ?? '').trim();
  if (!msg || msg.length < 1) return json({ error: 'رسالة فارغة' }, 400);
  if (msg.length > 1200) return json({ error: 'الرسالة طويلة' }, 400);

  const history = parseHistory(body.history);

  // Basic platform data
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabase = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;
  const ctx = await loadContext(supabase);

  const systemPrompt = buildSystemPrompt(ctx);
  const reply = await callModel(systemPrompt, history, msg);
  return json({ reply });
}
