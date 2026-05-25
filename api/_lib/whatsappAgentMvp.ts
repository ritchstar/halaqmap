import { createHmac, timingSafeEqual } from 'node:crypto';

type ChatRole = 'user' | 'assistant';
export type WhatsAppAgentTurn = { role: ChatRole; content: string };

export type InboundWhatsAppMessage = {
  fromE164: string;
  text: string;
  messageId: string;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORY_TURNS = 8;
const MAX_SEEN_IDS = 500;

const sessions = new Map<string, { turns: WhatsAppAgentTurn[]; updatedAt: number }>();
const seenMessageIds: string[] = [];

/** أسئلة شائعة — MVP للوكيل على واتساب */
export const WHATSAPP_AGENT_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'هل حلاق ماب تأخذ عمولة على كل قصة شعر؟',
    a: 'لا — حلاق ماب مزوّد حلول تقنية فقط. تدفع رخصة نفاذ شهرية ثابتة، والعلاقة بين صالونك والزبون مباشرة بدون وسيط أو عمولة.',
  },
  {
    q: 'ما معنى «الظهور عند الطلب»؟',
    a: 'يظهر صالونك في نتائج البحث فقط عندما يبحث زبون فعلي قريب منك — كل ظهور فرصة حقيقية، لا وجود شكلي.',
  },
  {
    q: 'كيف أشترك إذا لم تكن المنطقة مغطاة؟',
    a: 'لا تقلق، سوف نصلك قريباً — راسل الدعم على واتساب 0559602685.',
  },
  {
    q: 'هل يمكنني تغيير باقتي لاحقاً؟',
    a: 'نعم — عند انتهاء الحزمة الحالية تشتري الباقة الجديدة التي تناسبك. لا عقد ملزم ولا رسوم ترقية.',
  },
  {
    q: 'ماذا يحدث عند انتهاء صلاحية الحزمة؟',
    a: 'يتوقف ظهورك تلقائياً حتى تُجدّد — بياناتك محفوظة، وتفعيل حزمة جديدة يعيدك فوراً.',
  },
  {
    q: 'هل أحتاج وثائق حكومية للتسجيل؟',
    a: 'لا — التسجيل يعتمد على بيانات الصالون الأساسية. تعهّدك بأن نشاطك ممتثل للأنظمة هو مسؤوليتك وفق الشروط.',
  },
  {
    q: 'ما هي حلاق ماب؟',
    a: 'منصة سعودية تقنية تبيع رخص إدراج رقمية لصالونات الحلاقة — ظهور عند الطلب، بدون عمولة على الخدمة.',
  },
  {
    q: 'ما الباقات المتاحة؟',
    a: 'برونزي، ذهبي، وماسي — كل باقة رخصة نفاذ لمدة 30 يوماً. التفاصيل والأسعار على halaqmap.com في قسم الشركاء.',
  },
  {
    q: 'كيف أفعّل حسابي بعد الدفع؟',
    a: 'بعد تأكيد الدفع يُفعَّل حسابك تلقائياً ويصلك بريد ترحيب. ادخل من بوابة الشركاء وابدأ إعداد ملف صالونك.',
  },
  {
    q: 'كيف أتواصل مع الدعم؟',
    a: 'البريد admin@halaqmap.com أو واتساب 0559602685 — فريق الدعم يرد على استفسارات الشركاء.',
  },
];

function pruneSessions(now = Date.now()): void {
  for (const [key, value] of sessions) {
    if (now - value.updatedAt > SESSION_TTL_MS) sessions.delete(key);
  }
}

export function rememberInboundMessage(messageId: string): boolean {
  if (!messageId) return false;
  if (seenMessageIds.includes(messageId)) return false;
  seenMessageIds.push(messageId);
  if (seenMessageIds.length > MAX_SEEN_IDS) seenMessageIds.splice(0, seenMessageIds.length - MAX_SEEN_IDS);
  return true;
}

export function getSessionHistory(phoneE164: string): WhatsAppAgentTurn[] {
  pruneSessions();
  return sessions.get(phoneE164)?.turns.slice(-MAX_HISTORY_TURNS) ?? [];
}

export function appendSessionTurn(phoneE164: string, role: ChatRole, content: string): void {
  const trimmed = content.trim().slice(0, 2000);
  if (!trimmed) return;
  pruneSessions();
  const prev = sessions.get(phoneE164);
  const turns = [...(prev?.turns ?? []), { role, content: trimmed }].slice(-MAX_HISTORY_TURNS);
  sessions.set(phoneE164, { turns, updatedAt: Date.now() });
}

export function isWhatsAppAgentEnabled(): boolean {
  return String(process.env.ENABLE_WHATSAPP_AGENT || 'false').trim().toLowerCase() === 'true';
}

export function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = (process.env.META_WHATSAPP_APP_SECRET || '').trim();
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`;
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseInboundMetaPayload(body: unknown): InboundWhatsAppMessage[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const entries = Array.isArray(root.entry) ? root.entry : [];
  const out: InboundWhatsAppMessage[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const changes = Array.isArray((entry as { changes?: unknown }).changes)
      ? (entry as { changes: unknown[] }).changes
      : [];
    for (const change of changes) {
      if (!change || typeof change !== 'object') continue;
      const value = (change as { value?: unknown }).value;
      if (!value || typeof value !== 'object') continue;
      const messages = Array.isArray((value as { messages?: unknown }).messages)
        ? (value as { messages: unknown[] }).messages
        : [];
      for (const message of messages) {
        if (!message || typeof message !== 'object') continue;
        const msg = message as Record<string, unknown>;
        if (msg.type !== 'text') continue;
        const textObj = msg.text;
        const text =
          textObj && typeof textObj === 'object'
            ? String((textObj as { body?: unknown }).body || '').trim()
            : '';
        const from = String(msg.from || '').trim();
        const messageId = String(msg.id || '').trim();
        if (!from || !text || !messageId) continue;
        out.push({ fromE164: from.startsWith('+') ? from : `+${from}`, text, messageId });
      }
    }
  }
  return out;
}

function buildFaqKnowledgeBlock(): string {
  return WHATSAPP_AGENT_FAQ.map((item, index) => `${index + 1}. س: ${item.q}\n   ج: ${item.a}`).join('\n');
}

export function buildWhatsAppAgentSystemPrompt(): string {
  return [
    'أنت وكيل دعم واتساب لمنصة حلاق ماب — مساعد شركاء B2B.',
    'اكتب بالعربية الفصحى الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط.',
    'ضع أي مصطلح إنجليزي بين علامتي `backtick` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة.',
    'لا تبدأ الفقرة العربية برقم لاتيني أو علامة Markdown مثل ###.',
    '',
    'قواعد الرد:',
    '- ردود قصيرة (2–4 جمل) مناسبة لواتساب.',
    '- اعتمد على الأسئلة الشائعة أدناه — لا تخترع أسعاراً أو وعوداً غير موجودة.',
    '- عند سؤال خارج المعرفة أو طلب بشري: «لا تقلق، سوف نصلك قريباً — راسل الدعم على 0559602685».',
    '- لا تطلب بيانات بطاقة أو كلمات مرور.',
    '',
    'الأسئلة الشائعة:',
    buildFaqKnowledgeBlock(),
  ].join('\n');
}

function faqFallbackReply(userMessage: string): string {
  const q = userMessage.trim().toLowerCase();
  for (const item of WHATSAPP_AGENT_FAQ) {
    const keywords = item.q.replace(/[؟?«»]/g, '').split(/\s+/).filter((w) => w.length > 3);
    if (keywords.some((word) => q.includes(word.toLowerCase()))) return item.a;
  }
  if (/دعم|مساعد|تواصل|اتصل/i.test(q)) {
    return WHATSAPP_AGENT_FAQ[9]?.a ?? 'راسل الدعم على 0559602685.';
  }
  return 'مرحباً بك في حلاق ماب. كيف أخدمك؟ يمكنك السؤال عن الباقات، التسجيل، أو التغطية الجغرافية.';
}

async function callOpenAI(system: string, history: WhatsAppAgentTurn[], userMessage: string): Promise<string | null> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return null;
  const model = (process.env.WHATSAPP_AGENT_OPENAI_MODEL || process.env.PARTNER_ASSISTANT_OPENAI_MODEL || 'gpt-4o-mini').trim();
  const messages = [
    { role: 'system', content: system },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: userMessage },
  ];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 350,
      messages,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function generateWhatsAppAgentReply(input: {
  phoneE164: string;
  userMessage: string;
}): Promise<string> {
  const history = getSessionHistory(input.phoneE164);
  const system = buildWhatsAppAgentSystemPrompt();
  const aiReply = await callOpenAI(system, history, input.userMessage).catch(() => null);
  return aiReply || faqFallbackReply(input.userMessage);
}

export async function sendMetaWhatsAppText(toPhoneE164: string, body: string): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const token = (process.env.META_WHATSAPP_TOKEN || '').trim();
  const phoneId = (process.env.META_WHATSAPP_PHONE_NUMBER_ID || '').trim();
  if (!token || !phoneId) return { ok: false, error: 'meta_not_configured' };

  const to = toPhoneE164.replace(/^\+/, '');
  const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneId)}/messages`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: body.slice(0, 3900) },
    }),
  });
  const txt = await resp.text();
  if (!resp.ok) return { ok: false, error: txt.slice(0, 400) || 'meta_send_failed' };
  let id = 'meta_sent';
  try {
    const j = JSON.parse(txt) as { messages?: Array<{ id?: string }> };
    if (j.messages?.[0]?.id) id = j.messages[0].id;
  } catch {
    // ignore
  }
  return { ok: true, messageId: id };
}
