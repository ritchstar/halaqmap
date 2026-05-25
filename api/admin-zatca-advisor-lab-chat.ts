import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildZatcaAdvisorLabSystemPrompt,
  callZatcaAdvisorLabVision,
  loadZatcaLabContext,
  type ZatcaLabChatTurn,
} from './_lib/zatcaAdvisorLab.js';
import { assertVisionMime } from './_lib/opsBillingAi.js';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): ZatcaLabChatTurn[] {
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
    .filter((x): x is ZatcaLabChatTurn => x !== null)
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

async function authorizeRead(request: Request) {
  const base = await getServiceSupabase();
  if (!base.ok) return { ok: false as const, status: base.status, json: base.body };

  const gate = await verifyPlatformAdminFromRequestAny(request, base.url, process.env.SUPABASE_SERVICE_ROLE_KEY || '', [
    'manage_platform_commerce_rules',
    'view_ops_billing_monitor',
    'manage_centralized_billing_ops',
    'activate_zatca_tax_live',
  ]);
  if (gate.ok === false) return { ok: false as const, status: gate.status, json: gate.json };
  return { ok: true as const, supabase: gate.supabase, actorEmail: gate.actorEmail };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await authorizeRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return json({
    ok: true,
    route: 'admin-zatca-advisor-lab-chat',
    openaiConfigured: key,
    model: (process.env.ZATCA_LAB_OPENAI_MODEL || 'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authorizeRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const imageBase64Raw = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  const imageMime = String(body.imageMime || body.mimeType || '').trim().toLowerCase();
  const conversationHistory = parseHistory(body.conversationHistory);

  if (!userMessage && !imageBase64Raw) {
    return json({ error: 'أدخل رسالة أو ارفع صورة للمناقشة' }, 400);
  }

  let imageBase64: string | undefined;
  if (imageBase64Raw) {
    const mimeErr = assertVisionMime(imageMime);
    if (mimeErr) return json({ error: mimeErr }, 400);
    const buf = Buffer.from(imageBase64Raw, 'base64');
    if (buf.length > MAX_IMAGE_BYTES) {
      return json({ error: 'حجم الصورة يتجاوز 4 ميغابايت' }, 400);
    }
    imageBase64 = imageBase64Raw;
  }

  try {
    const labContext = await loadZatcaLabContext(auth.supabase);
    const system = buildZatcaAdvisorLabSystemPrompt(labContext);
    const reply = await callZatcaAdvisorLabVision({
      system,
      userText: userMessage || 'حلّل الصورة المرفقة في سياق ZATCA وامتثال حلاق ماب.',
      imageBase64,
      imageMime: imageBase64 ? imageMime : undefined,
      conversationHistory,
    });

    return json({
      ok: true,
      reply,
      context: {
        taxEnabledLive: labContext.taxEnabledLive,
        totalHistoricalSar: labContext.totalHistoricalSar,
        trailing31dSar: labContext.trailing31dSar,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر توليد الرد';
    return json({ error: msg }, 502);
  }
}
