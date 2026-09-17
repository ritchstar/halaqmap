/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * public-daleelak-chat — «دليلك»، مساعد اختيار المسار في متجر خريطة الحل.
 *
 * يظهر على صفحات المتجر (بدءاً من "اختر مسارك") ويرشّح المنتج الأقرب لطريقة
 * عمل الزائر من قاعدة معرفة سكاي التأسيسية (api/_lib/daleelakKnowledge.ts).
 * نفس نمط public-media-spokesperson-chat.ts: canned reply أولاً، ثم النموذج.
 */

import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { createAgentLogSupabase, logAgentConversation } from './_lib/agentConversationLog.js';
import { appendUniversalAgentDoctrines, resolveRegulatoryReferral } from './_lib/platformManagementReferral.js';
import { buildDaleelakSystemPrompt, DALEELAK_OPENING_LINE_AR } from './_lib/daleelakKnowledge.js';

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

function buildPublicSystemPrompt(): string {
  return appendUniversalAgentDoctrines(buildDaleelakSystemPrompt(), 'daleelak_product_guide');
}

async function callModel(systemPrompt: string, history: ChatTurn[], userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'عذراً، الخدمة غير متاحة مؤقتاً. جرّب لاحقاً.';

  const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: userMessage }];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 450,
      temperature: 0.6,
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

export async function GET(): Promise<Response> {
  return json({ ok: true, opening: DALEELAK_OPENING_LINE_AR });
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
  if (!userMessage) return json({ error: 'رسالة فارغة' }, 400);
  if (userMessage.length > 1000) return json({ error: 'الرسالة طويلة جداً' }, 400);

  const history = parseHistory(body.history);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabase = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  void supabase; // محجوز لاستعلامات حية مستقبلية (مثل عدد المنتجات الفعّالة) — لا استخدام حالياً

  const logSupabase = createAgentLogSupabase();
  const systemPrompt = buildPublicSystemPrompt();

  // إحالة تنظيمية إلزامية أولاً (نفس قاعدة كل الوكلاء العامة) قبل أي رد نموذج.
  const regulatoryReferral = resolveRegulatoryReferral(userMessage);
  const reply = regulatoryReferral ?? (await callModel(systemPrompt, history, userMessage));

  void logAgentConversation(logSupabase, {
    agentId: 'daleelak_product_guide',
    channel: 'المتجر — اختر مسارك',
    userMessage,
    assistantReply: reply,
    referredToManagement: Boolean(regulatoryReferral),
  });

  return json({ reply, source: regulatoryReferral ? 'regulatory' : 'model' });
}
