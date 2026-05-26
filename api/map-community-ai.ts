/**
 * map-community-ai — مساعد ماب لمجتمع الشركاء.
 *
 * API خفيف يعمل على Vercel:
 * - رقابة نصية تقنية قبل تمرير الرسالة.
 * - استدعاء OpenAI عند مناداة @مساعد_ماب أو وجود سؤال مهني.
 * - لا يعتمد على WebSocket دائم؛ واجهة الشات Socket-ready من جهة العميل.
 */

export const config = { maxDuration: 45 };

type ChatTurn = { role: 'user' | 'assistant'; content: string };

const BLOCKED_TERMS = [
  'سب',
  'لعن',
  'قذف',
  'عنصري',
  'إهانة',
  'فضيحة',
] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}

function normalize(v: string): string {
  return v.trim().replace(/\s+/g, ' ');
}

function moderateMessage(text: string): { ok: true } | { ok: false; reason: string } {
  const t = normalize(text).toLowerCase();
  if (!t) return { ok: false, reason: 'الرسالة فارغة.' };
  if (t.length > 1600) return { ok: false, reason: 'الرسالة طويلة جداً.' };
  const hit = BLOCKED_TERMS.find((term) => t.includes(term));
  if (hit) return { ok: false, reason: 'خلّونا نحافظ على آداب مجتمع ماب ونصيغ الرسالة باحترام.' };
  return { ok: true };
}

function parseHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = normalize(String(o.content || '')).slice(0, 2200);
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((x): x is ChatTurn => x !== null)
    .slice(-10);
}

function shouldSummonAssistant(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('@مساعد_ماب') ||
    t.includes('مساعد ماب') ||
    t.includes('كيف') ||
    t.includes('وش') ||
    t.includes('أفضل') ||
    t.includes('تسويق') ||
    t.includes('إدارة') ||
    t.includes('قصات') ||
    t.includes('صالون') ||
    t.includes('زبائن')
  );
}

function buildSystemPrompt(): string {
  return [
    'أنت **مساعد ماب** — وكيل ذكي داخل مجتمع ماب لحلاقين وشركاء حلاق ماب.',
    '',
    'اكتب بالعربية السعودية البيضاء المهنية، علامات الترقيم في نهاية الجملة، وتجنّب الفصحى الجامدة.',
    '',
    '## نطاق خبرتك',
    '- تطوير الصالونات: تحسين تجربة العميل، إدارة المواعيد، رفع جودة الخدمة.',
    '- صيحات القصات والعناية: قصات رجالية رائجة، عناية باللحية، تنظيم معرض الأعمال.',
    '- إدارة الأعمال: التسعير، الاحتفاظ بالزبائن، العروض الأخلاقية، قراءة الطلب في الأحياء.',
    '- حلاق ماب: رخصة نفاذ رقمية، ظهور جغرافي عند الطلب، لا عمولة على الحلاقة، المكتب الخاص والمناوب الذكي.',
    '',
    '## قواعد المجتمع',
    '- لا تحرج أحداً ولا تسخر من أعمال الحلاقين.',
    '- اجعل الردود قصيرة ومفيدة ومهنية.',
    '- إذا رأيت نقاشاً خاملاً، افتح موضوعاً عملياً: صورة قبل/بعد، طريقة استقبال، كيف تزيد العودة، أو كيف تختار بنر مناسب.',
    '- لا تقدّم نصائح قانونية أو طبية، أحِل للمختص.',
  ].join('\n');
}

async function callModel(message: string, history: ChatTurn[]): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    return 'يا هلا، أنا مساعد ماب. سؤالك ممتاز — حالياً خدمة الذكاء غير مفعّلة، لكن نصيحتي العامة: ركّز على صور واضحة، رد سريع، وتجربة عميل محترمة؛ هذه الثلاث ترفع فرص عودة الزبون.';
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.MAP_COMMUNITY_OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.55,
      max_tokens: 700,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        { role: 'user', content: message },
      ],
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);
  return data.choices?.[0]?.message?.content?.trim() || 'ما وصلني سياق كافي. وضّح سؤالك أكثر وأبشر.';
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const message = normalize(String(body.message || ''));
  const moderation = moderateMessage(message);
  if (!moderation.ok) return json({ ok: false, moderated: true, reply: moderation.reason }, 200);

  const history = parseHistory(body.history);
  const summoned = shouldSummonAssistant(message);
  if (!summoned) {
    return json({
      ok: true,
      shouldReply: false,
      reply: '',
    });
  }

  try {
    const reply = await callModel(message, history);
    return json({ ok: true, shouldReply: true, reply });
  } catch (e) {
    return json({
      ok: false,
      shouldReply: true,
      reply: e instanceof Error ? e.message : 'تعذر رد مساعد ماب حالياً.',
    }, 500);
  }
}
