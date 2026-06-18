/**
 * public-media-spokesperson-chat — المتحدث الإعلامي العام
 *
 * يستقبل المستخدمين (B2C) ومسار الشركاء (B2B) بمعرفة ملزمة بعقيدة المنصة
 * وسلسلة إحالات: تنظيمي → مختص → رد جاهز → نموذج
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  createAgentLogSupabase,
  logAgentConversation,
} from './_lib/agentConversationLog.js';
import { appendUniversalAgentDoctrines } from './_lib/platformManagementReferral.js';
import {
  buildPublicMediaSpokespersonSystemPrompt,
  resolvePublicMediaSpokespersonReply,
  type MediaSpokespersonAudience,
} from './_lib/mediaSpokespersonPublicKnowledge.js';

export const config = { maxDuration: 45 };

type ChatTurn = { role: 'user' | 'assistant'; content: string };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function parseHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 2000) };
    })
    .filter((x): x is ChatTurn => x !== null)
    .slice(-8);
}

function parseAudience(raw: unknown): MediaSpokespersonAudience {
  const v = String(raw ?? '').trim().toLowerCase();
  return v === 'partner' ? 'partner' : 'consumer';
}

async function loadPlatformBasics(supabase: ReturnType<typeof createClient> | null) {
  let activeBarbers = 0;
  let cities = 0;
  if (supabase) {
    try {
      const { count } = await supabase
        .from('barbers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      activeBarbers = count ?? 0;
    } catch {
      /* silent */
    }
    try {
      const { data } = await supabase.from('barbers').select('city').eq('is_active', true);
      cities = new Set((data ?? []).map((r: { city: string }) => r.city)).size;
    } catch {
      /* silent */
    }
  }
  return { activeBarbers, cities };
}

function getCurrentOccasion(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 9 && day === 23) return 'اليوم الوطني السعودي 93 🇸🇦';
  if (month === 2 && day === 22) return 'يوم تأسيس المملكة العربية السعودية 🏰';
  if (month === 3 || month === 4) return 'موسم الربيع والعروض';
  if (month === 12) return 'موسم الاحتفالات وآخر العام';
  return '';
}

function buildPublicSystemPrompt(
  basics: { activeBarbers: number; cities: number },
  audience: MediaSpokespersonAudience,
): string {
  const occasion = getCurrentOccasion();
  const occasionNote = occasion
    ? `\n\n🎉 المناسبة الحالية: ${occasion} — تفاعل بشكل طبيعي إذا ناسب السياق.`
    : '';

  const core = buildPublicMediaSpokespersonSystemPrompt(basics, audience);

  return appendUniversalAgentDoctrines(
    `${core}

═══════════════════════════════════════
مهام إضافية (بعد الدقة):
═══════════════════════════════════════
- تشجيع لطيف على تقييم المنصة بعد ردّ أو ردّين
- دعوة لمشاركة المنصة مع الأصدقاء
- مجتمع ماب: للشركاء المفعّلين — إضاءة فوشيا/سماوي = مشاركات جديدة${occasionNote}`,
    'media_spokesperson',
  );
}

async function callModel(
  systemPrompt: string,
  history: ChatTurn[],
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'عذراً، الخدمة غير متاحة مؤقتاً. جرّب لاحقاً.';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 450,
      temperature: 0.65,
    }),
  });

  if (!res.ok) return 'حصل خلل بسيط، عاود المحاولة بعد ثوانٍ.';
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || 'ما فهمت السؤال زين — ممكن تعيد؟';
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: false });
  if (!secGuard.allowed) return secGuard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const userMessage = String(body.message ?? body.content ?? '').trim();
  if (!userMessage || userMessage.length < 1) return json({ error: 'رسالة فارغة' }, 400);
  if (userMessage.length > 1000) return json({ error: 'الرسالة طويلة جداً' }, 400);

  const history = parseHistory(body.history);
  const audience = parseAudience(body.audience);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  let supabase: ReturnType<typeof createClient> | null = null;
  if (url && anonKey) {
    supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const basics = await loadPlatformBasics(supabase);
  const logSupabase = createAgentLogSupabase();
  const systemPrompt = buildPublicSystemPrompt(basics, audience);

  const resolved = resolvePublicMediaSpokespersonReply(userMessage, audience);
  const reply =
    resolved.reply ?? (await callModel(systemPrompt, history, userMessage));

  void logAgentConversation(logSupabase, {
    agentId: 'media_spokesperson',
    channel: audience === 'partner' ? 'مسار الشركاء' : 'الصفحة الرئيسية',
    userMessage,
    assistantReply: reply,
    referredToManagement: resolved.referredToManagement,
  });

  return json({ reply, source: resolved.source });
}
