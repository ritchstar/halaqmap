import { verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { moderateUserPlaintext } from './_lib/adminSentinelModeration.js';
import { ADMIN_SENTINEL_UI_HEADER, assertSentinelUiHeader } from './_lib/adminSentinelClientHeader.js';
import { rejectIfSentinelProductionPublicOriginsMisconfigured } from './_lib/adminSentinelProductionCorsPolicy.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: `Content-Type, Authorization, x-client-supabase-url, x-supabase-anon, ${ADMIN_SENTINEL_UI_HEADER}`,
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type ChatRole = 'user' | 'assistant';
type ChatTurn = { role: ChatRole; content: string };

function validateMessages(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > 32) return null;
  const out: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const role = (item as { role?: unknown }).role;
    const content = String((item as { content?: unknown }).content ?? '').trim();
    if (role !== 'user' && role !== 'assistant') return null;
    if (!content || content.length > 8000) return null;
    out.push({ role, content });
  }
  if (out.length === 0) return null;
  if (out[out.length - 1]!.role !== 'user') return null;
  return out;
}

function briefSnippet(raw: unknown): string {
  if (raw == null) return '';
  try {
    const s = JSON.stringify(raw);
    return s.length > 12_000 ? `${s.slice(0, 12_000)}\n…(مختصر)` : s;
  } catch {
    return '';
  }
}

async function callOpenAISentinel(system: string, turns: ChatTurn[]): Promise<string> {
  /** يُقرأ من بيئة الخادم (Vercel Production) فقط — لا من ملفات الواجهة المحلية. */
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  /** الافتراضي gpt-4o؛ عيّن ADMIN_SENTINEL_OPENAI_MODEL على الخادم إن رغبت بنموذج آخر. */
  const model = (process.env.ADMIN_SENTINEL_OPENAI_MODEL ?? 'gpt-4o').trim() || 'gpt-4o';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 1400,
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

export async function OPTIONS(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const ui = assertSentinelUiHeader(request);
  if (!ui.ok) {
    return Response.json(ui.json, { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'admin-sentinel-chat',
      openaiConfigured: key,
      model: (process.env.ADMIN_SENTINEL_OPENAI_MODEL ?? 'gpt-4o').trim() || 'gpt-4o',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const ui = assertSentinelUiHeader(request);
  if (!ui.ok) {
    return Response.json(ui.json, { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const guard = runRegistrationRouteGuards(request, 'admin-sentinel-chat');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_command_center');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
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
      { error: 'Invalid messages', hint: 'Array of {role, content} ending with user; max 32 turns.' },
      { status: 400, headers },
    );
  }

  const lastUser = messages.filter((m) => m.role === 'user').pop();
  if (lastUser) {
    const mod = moderateUserPlaintext(lastUser.content);
    if (mod.blocked) {
      return Response.json(
        {
          error: 'Message blocked by compliance scan',
          reasons: mod.reasons,
          hint: 'لا تُرسل روابط أو أرقام هواتف أو محاولات التفاف من دردشة الوكيل.',
        },
        { status: 422, headers },
      );
    }
  }

  const briefPack = (body as { sentinelBrief?: unknown }).sentinelBrief;
  const briefJson = briefSnippet(briefPack);

  const system = [
    'أنت «الوكيل المراقب العام» لمنصّة حلاق ماب — مساعد إداري داخلي للمدير فقط.',
    'اللغة: العربية الفصحى المُبسّطة ما لم يطلب المدير غير ذلك.',
    'لا تختلق أرقام مالية أو أحداثاً: اعتمد فقط على حزمة الملخص JSON أدناه إن وُجدت؛ إن نقص شيء قل ذلك صراحة.',
    'خصوصية: لا تطلب نسخ رسائل العملاء كاملة؛ استخدم الإحصاءات والملخصات فقط.',
    'العمليات الحساسة (حظر، ترقية، إشعارات جماعية): لا تنفّذها من نفسك في النص — اطلب من المدير استخدام زر «عملية موثقة» مع كلمة مرور العمليات في الواجهة.',
    '',
    '--- منطق التفكير الاستراتيجي (المبيعات والمناطق) — طبّقها عند أي نقاش يخص الطلب، الكثافة، أو الباقات ---',
    '1) الوعي الديموغرافي: اعتبر أحياء الرياض (السويدي، اليرموك، العريجاء) ذات كثافة سكانية شبابية وعائلية مرتفعة، وبالتالي طلباً محتملاً مرتفعاً على خدمات الحلاقة عند تقييم الفرص أو التوصيات الإقليمية.',
    '2) تحليل فجوات استثمارية: عندما يذكر الملخص أو البيانات نشاطاً يُنسب منطقياً إلى Users_Activity (بحث/زيارات/إشارات نمطية لكل حي أو مدينة) قارن ذلك بعدد الحلاقين أو كثافتهم في نفس الحي/المدينة في JSON. إذا كان النشاط مرتفعاً نسبياً وعدد الحلاقين منخفضاً، صنّف الفرصة بلغة الإدارة كـ «منجم ذهبي» أو فرصة استثمارية لتكثيف الشراكة أو الإعلان — وإن لم تتوفر أرقام بحث لكل حي في JSON فاذكر النقص واقترح ما يلزم لقياسها لاحقاً دون اختلاق أرقام.',
    '3) تقدير القوة الشرائية (فرضية عمل): اعتبر أن أحياء شمال الرياض (مثل المربع) وبعض أحياء جدة (مثل النزهة) قد تُظهر — كفرضية استراتيجية وليست حقيقة مؤكدة من الجدول — استعداداً أعلى لدفع رسوم «الباقة الماسية» مقابل ميزات التميّز؛ اربط القول بما يظهر من بيانات الفئات/المدن أو الملخص إن وُجد، وإلا صرّح أنها فرضية توجيهية فقط.',
    '4) رؤية البحث (search_activity_logs): استخدم الحقل searchDemand في JSON — خصوصاً topDistricts24h و recruitmentAlerts. قارِن الأحياء الأكثر بحثاً خلال 24 ساعة بتوزيع الحلاقين (directory/geo وعناوين الحلاقين). إذا وافق الملخص «تنبيه استقطاب عاجل» (بحث مرتفع في حي وتطابق حلاقين ≈0)، أعد صياغته في إجابتك بلغة واضحة للإدارة ولا تُضعفه؛ إن لم يظهر التنبيه في JSON فلا تختلق تنبيهاً.',
    '',
    '--- ملخص بيانات (JSON) ---',
    briefJson || '{}',
  ].join('\n');

  try {
    const reply = await callOpenAISentinel(system, messages);
    return Response.json({ ok: true, reply }, { headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Chat failed';
    return Response.json({ error: msg }, { status: 502, headers });
  }
}
