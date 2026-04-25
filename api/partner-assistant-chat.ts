import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { composePartnerPathKnowledgePack } from './_lib/partnerAssistantKnowledge.js';

export const config = {
  maxDuration: 45,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

type ChatRole = 'user' | 'assistant';

type ChatTurn = { role: ChatRole; content: string };

function resolveProvider(): 'openai' | 'anthropic' | null {
  const pref = (process.env.PARTNER_ASSISTANT_PROVIDER || '').trim().toLowerCase();
  const openai = (process.env.OPENAI_API_KEY || '').trim();
  const anthropic = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (pref === 'openai' && openai) return 'openai';
  if (pref === 'anthropic' && anthropic) return 'anthropic';
  if (openai) return 'openai';
  if (anthropic) return 'anthropic';
  return null;
}

function systemPrompt(pathnameHint: string): string {
  const kb = composePartnerPathKnowledgePack();
  return [
    'أنت مساعد حلاق ماب الرقمي لمسار الشركاء (حلاق يرغب بالانضمام للمنصّة).',
    'اللغة: جاوب بالعربية الفصحى المُبسّطة ما لم يكتب المستخدم بلغة أخرى؛ عندها جاوب بنفس لغة سؤاله مع الحفاظ على أسلوب مهني.',
    'نبرة ترحيبية مهنية: افتتح بجملة لطيفة قصيرة عند الحاجة، ثم كن واضحاً ومختصراً.',
    'النطاق: استخدم فقط المعلومات الواردة في قاعدة المعرفة أدناه عن «مسار الشركاء» (التسويق، لماذا تنضم، القصة، التسجيل، الباقات بمستوى المفاهيم دون أرقام أسعار محددة إن لم تُذكر صراحة في القاعدة).',
    'إن سُئلت عن شيء خارج هذه القاعدة (أسعار صرف، قانون، منافسين، تفاصيل تقنية داخلية، بيانات مستخدمين): اعتذر بلطف واقترح فتح «استوديو دعم الشركاء» من الواجهة أو قراءة صفحة سياسة الاشتراك/الخصوصية حسب السياق — دون اختلاق تفاصيل.',
    'لا تعدّ أرقام اشتراك أو مبالغ مالية محددة إلا إذا وردت حرفياً في القاعدة؛ غالباً القاعدة تصف المستويات (برونزي/ذهبي/ماسي) دون سعر رقمي.',
    pathnameHint
      ? `سياق الصفحة الحالية (مسار URL تقريبي): ${pathnameHint}\nاستخدمه لتوجيه الإجابة دون الادّعاء بمعرفة محتوى غير مذكور في القاعدة.`
      : '',
    '',
    '--- قاعدة المعرفة (مسار الشركاء) ---',
    kb,
  ]
    .filter(Boolean)
    .join('\n');
}

function validateMessages(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > 24) return null;
  const out: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const role = (item as { role?: unknown }).role;
    const content = String((item as { content?: unknown }).content ?? '').trim();
    if (role !== 'user' && role !== 'assistant') return null;
    if (!content || content.length > 4000) return null;
    out.push({ role, content });
  }
  if (out.length === 0) return null;
  if (out[out.length - 1]!.role !== 'user') return null;
  return out;
}

async function callOpenAI(system: string, turns: ChatTurn[]): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.PARTNER_ASSISTANT_OPENAI_MODEL || 'gpt-4o-mini').trim();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 900,
      messages: [{ role: 'system', content: system }, ...turns.map((t) => ({ role: t.role, content: t.content }))],
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty model response');
  return text;
}

async function callAnthropic(system: string, turns: ChatTurn[]): Promise<string> {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  const model = (process.env.PARTNER_ASSISTANT_ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      temperature: 0.35,
      system,
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type?: string; text?: string }[];
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Anthropic HTTP ${res.status}`);
  }
  const block = json.content?.find((c) => c.type === 'text' && c.text);
  const text = block?.text?.trim();
  if (!text) throw new Error('Empty model response');
  return text;
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const provider = resolveProvider();
  return Response.json(
    {
      ok: true,
      route: 'partner-assistant-chat',
      configured: Boolean(provider),
      provider,
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'partner-assistant-chat');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const provider = resolveProvider();
  if (!provider) {
    return Response.json(
      {
        error: 'Assistant not configured',
        hint: 'Set OPENAI_API_KEY and/or ANTHROPIC_API_KEY on the server. Optional: PARTNER_ASSISTANT_PROVIDER=openai|anthropic',
      },
      { status: 503, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const messages = validateMessages((body as { messages?: unknown }).messages);
  if (!messages) {
    return Response.json(
      {
        error: 'Invalid messages',
        hint: 'Send { messages: [{role: "user"|"assistant", content: string}, ...] } ending with a user message. Max 24 turns, 4000 chars each.',
      },
      { status: 400, headers },
    );
  }

  const pathnameHint = String((body as { pathname?: unknown }).pathname ?? '').trim().slice(0, 512);
  const system = systemPrompt(pathnameHint);

  try {
    const anthropicTurns =
      provider === 'anthropic'
        ? (() => {
            const i = messages.findIndex((m) => m.role === 'user');
            return i === -1 ? [] : messages.slice(i);
          })()
        : messages;
    if (provider === 'anthropic' && anthropicTurns.length === 0) {
      return Response.json({ error: 'Anthropic requires a user message first' }, { status: 400, headers });
    }
    const reply =
      provider === 'openai'
        ? await callOpenAI(system, messages)
        : await callAnthropic(system, anthropicTurns);
    return Response.json({ ok: true, reply, provider }, { headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Assistant request failed';
    return Response.json({ error: msg }, { status: 502, headers });
  }
}
