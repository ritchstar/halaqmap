import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildTechnicalConsultantLabSystemPrompt,
  callTechnicalConsultantLabChat,
  loadTechnicalConsultantLabContext,
  type TechnicalConsultantLabChatTurn,
} from './_lib/technicalConsultantLab.js';

export const config = { maxDuration: 60 };

const CONSULTANT_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): TechnicalConsultantLabChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 8000) };
    })
    .filter((x): x is TechnicalConsultantLabChatTurn => x !== null)
    .slice(-10);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CONSULTANT_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  return json({
    ok: true,
    route: 'admin-technical-consultant-lab-chat',
    role: 'Technical Consultant — Engineering Wing',
    openaiConfigured: Boolean((process.env.OPENAI_API_KEY || '').trim()),
    model:
      (process.env.TECHNICAL_CONSULTANT_OPENAI_MODEL ||
        process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CONSULTANT_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const conversationHistory = parseHistory(body.conversationHistory);
  if (!userMessage) return json({ error: 'Describe the engineering task' }, 400);

  const ctx = await loadTechnicalConsultantLabContext(auth.supabase);
  const system = buildTechnicalConsultantLabSystemPrompt(ctx);

  try {
    const reply = await callTechnicalConsultantLabChat({
      system,
      userText: userMessage,
      conversationHistory,
    });
    return json({ ok: true, reply, context: ctx });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Chat failed' }, 502);
  }
}
