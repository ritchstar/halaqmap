import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildB2cMarketingSystemPrompt,
  callMarketingCouncilChat,
  getMarketingCouncilModelLabel,
  loadB2cMarketingContext,
  type MarketingLabChatTurn,
} from './_lib/marketingCouncilLab.js';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): MarketingLabChatTurn[] {
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
    .filter((x): x is MarketingLabChatTurn => x !== null)
    .slice(-10);
}

async function getServiceSupabase() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return { ok: false as const, status: 503, body: { error: 'Server not configured' } };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { ok: true as const, supabase, url };
}

async function authorize(request: Request) {
  const base = await getServiceSupabase();
  if (!base.ok) return { ok: false as const, status: base.status, json: base.body };

  const gate = await verifyPlatformAdminFromRequestAny(
    request,
    base.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    [
      'manage_admins',
      'view_overview',
      'view_partner_marketing',
      'manage_partner_marketing',
    ],
  );
  if (gate.ok === false) return { ok: false as const, status: gate.status, json: gate.json };
  return { ok: true as const, supabase: gate.supabase, actorEmail: gate.actorEmail };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await authorize(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  const openaiConfigured = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return json({
    ok: true,
    route: 'admin-b2c-marketing-lab-chat',
    openaiConfigured,
    model: getMarketingCouncilModelLabel(),
  });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authorize(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const conversationHistory = parseHistory(body.conversationHistory);
  if (!userMessage) {
    return json({ error: 'أدخل رسالتك لاستراتيجي B2C' }, 400);
  }

  try {
    const ctx = await loadB2cMarketingContext(auth.supabase);
    const system = buildB2cMarketingSystemPrompt(ctx);
    const reply = await callMarketingCouncilChat({
      system,
      userText: userMessage,
      conversationHistory,
    });

    return json({
      ok: true,
      reply,
      context: {
        totalSearches7d: ctx.totalSearches7d,
        totalSearches24h: ctx.totalSearches24h,
        zeroResultRatioOverall: ctx.zeroResultRatioOverall,
        topCities: ctx.topCities.slice(0, 5),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
