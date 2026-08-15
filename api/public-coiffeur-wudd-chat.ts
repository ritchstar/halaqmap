/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * public-coiffeur-wudd-chat — ود، وكيلة انضمام كوافير ماب.
 * قناة مستقلة عن مدير مبيعات B2B. بلا حقن أعداد صالونات الرجال.
 */

import {
  createAgentLogSupabase,
  logAgentConversation,
} from './_lib/agentConversationLog.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { resolveRegulatoryReferral } from './_lib/platformManagementReferral.js';
import {
  buildCoiffeurWuddSystemPrompt,
  resolveCoiffeurWuddCanonicalReply,
} from './_lib/coiffeurWuddDoctrine.js';

export const config = { maxDuration: 50 };

type Turn = { role: 'user' | 'assistant'; content: string };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 2500) };
    })
    .filter((x): x is Turn => x !== null)
    .slice(-12);
}

async function callModel(systemPrompt: string, history: Turn[], msg: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'الخدمة غير متاحة مؤقتاً — عاودي بعد قليل.';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: msg }],
      max_tokens: 650,
      temperature: 0.55,
    }),
  });
  if (!res.ok) return 'حصل خلل — عاودي بعد ثانية.';
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || 'ما فهمت — ممكن تعيدين؟';
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

  const msg = String(body.message ?? '').trim();
  if (!msg) return json({ error: 'رسالة فارغة' }, 400);
  if (msg.length > 1500) return json({ error: 'الرسالة طويلة' }, 400);

  const history = parseHistory(body.history);
  const logSupabase = createAgentLogSupabase();
  const referral = resolveCoiffeurWuddCanonicalReply(msg);
  const reply = referral ?? (await callModel(buildCoiffeurWuddSystemPrompt(), history, msg));

  void logAgentConversation(logSupabase, {
    agentId: 'coiffeur_wudd',
    channel: 'كوافير ماب — صفحة الاهتمام',
    userMessage: msg,
    assistantReply: reply,
    referredToManagement: Boolean(resolveRegulatoryReferral(msg)),
  });

  return json({ reply });
}
