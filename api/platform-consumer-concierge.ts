/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مرشد حلاق ماب — شات البنر التوضيحي للمستهلك (عام، بلا محفظة مناوب).
 */
import { createClient } from '@supabase/supabase-js';
import { recordFleetDemandSignal } from './_lib/fleetDemandSignals.js';
import {
  buildPlatformConsumerConciergeSystemPrompt,
  callPlatformConciergeModel,
  parseConciergeHistory,
  platformConciergeFallbackReply,
} from './_lib/platformConsumerConcierge.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 40 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(request: Request, data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const guard = await runSecurityGuard(request, {
    rateLimit: 18,
    sensitiveRoute: true,
    supabaseUrl: url || undefined,
    supabaseServiceKey: serviceRole || undefined,
  });
  if (guard.allowed === false) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(request, { ok: false, error: 'invalid_json' }, 400);
  }

  const msg = String(body.message ?? '').trim();
  if (!msg) return json(request, { ok: false, error: 'empty_message' }, 400);
  if (msg.length > 800) return json(request, { ok: false, error: 'message_too_long' }, 400);

  const history = parseConciergeHistory(body.history);
  if (history.filter((t) => t.role === 'user').length >= 12) {
    return json(request, {
      ok: true,
      reply:
        'اكتملت أسئلة هذه الجلسة. أعد الاستعلام من الخريطة أو وسّع النطاق لرؤية صالونات حقيقية عند توفرها.',
      source: 'session_limit',
    });
  }

  const cityAr = String(body.cityAr ?? body.city ?? '').trim().slice(0, 80);
  const coverageHint = String(body.coverageHint ?? '').trim().slice(0, 200);

  const systemPrompt = buildPlatformConsumerConciergeSystemPrompt({ cityAr, coverageHint });
  const llm = await callPlatformConciergeModel(systemPrompt, history, msg);
  const reply = (llm || platformConciergeFallbackReply(msg)).slice(0, 1200);

  if (url && isLikelyHttpUrl(url) && serviceRole && cityAr) {
    try {
      const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });
      void recordFleetDemandSignal(supabase, {
        cityAr,
        signalType: 'conversation_started',
        districtAr: String(body.districtAr ?? '').trim().slice(0, 80) || undefined,
      });
    } catch {
      /* telemetry must not block */
    }
  }

  return json(request, {
    ok: true,
    reply,
    source: llm ? 'llm' : 'fallback',
    agent: 'platform_consumer_concierge',
  });
}
