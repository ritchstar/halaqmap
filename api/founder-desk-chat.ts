/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  listFounderDeskMessagesForVisitor,
  sendFounderDeskVisitorMessage,
  startFounderDeskConversation,
} from './_lib/founderDeskChat.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = {
  maxDuration: 30,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return Response.json(
    {
      ok: true,
      route: 'founder-desk-chat',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'founder-desk-chat');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 24 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const action = String((body as { action?: unknown }).action ?? '').trim();
  const guestClientId = String((body as { guestClientId?: unknown }).guestClientId ?? '').trim();
  const conversationId = String((body as { conversationId?: unknown }).conversationId ?? '').trim();

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === 'start') {
    const origin = (body as { origin?: unknown }).origin;
    const result = await startFounderDeskConversation(supabase, guestClientId, origin);
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    return Response.json({ ok: true, conversation: result.conversation }, { headers });
  }

  if (!guestClientId || !conversationId) {
    return Response.json({ error: 'Missing guestClientId or conversationId' }, { status: 400, headers });
  }

  if (action === 'list_messages') {
    const result = await listFounderDeskMessagesForVisitor(supabase, { guestClientId, conversationId });
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    return Response.json(
      { ok: true, messages: result.messages, expired: result.expired, conversation: result.conversation },
      { headers },
    );
  }

  if (action === 'send') {
    const text = String((body as { body?: unknown }).body ?? '');
    const result = await sendFounderDeskVisitorMessage(supabase, {
      guestClientId,
      conversationId,
      body: text,
    });
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    return Response.json(
      { ok: true, message: result.message, conversation: result.conversation },
      { headers },
    );
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
