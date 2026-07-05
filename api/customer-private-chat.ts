import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  getCustomerPrivateConversation,
  listCustomerPrivateMessages,
  sendCustomerPrivateMessage,
  startCustomerPrivateConversation,
} from './_lib/customerPrivateChatService.js';
import { scheduleDigitalShiftInterceptAfterSend } from './_lib/digitalShiftInterceptService.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = {
  maxDuration: 120,
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
      route: 'customer-private-chat',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'customer-private-chat');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 30 });
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
  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const conversationId = String((body as { conversationId?: unknown }).conversationId ?? '').trim();

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === 'start') {
    if (!barberId) {
      return Response.json({ error: 'Missing barberId' }, { status: 400, headers });
    }
    const result = await startCustomerPrivateConversation(supabase, { guestClientId, barberId });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json(
      {
        ok: true,
        conversationId: result.conversationId,
        customerUserId: result.customerUserId,
        conversation: result.conversation,
      },
      { headers },
    );
  }

  if (!guestClientId || !conversationId) {
    return Response.json({ error: 'Missing guestClientId or conversationId' }, { status: 400, headers });
  }

  if (action === 'get_conversation') {
    const result = await getCustomerPrivateConversation(supabase, { guestClientId, conversationId });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json(
      { ok: true, conversation: result.conversation, customerUserId: result.customerUserId },
      { headers },
    );
  }

  if (action === 'list_messages') {
    const result = await listCustomerPrivateMessages(supabase, { guestClientId, conversationId });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json(
      { ok: true, messages: result.messages, expired: result.expired },
      { headers },
    );
  }

  if (action === 'send') {
    const text = String((body as { body?: unknown }).body ?? '').trim();
    const result = await sendCustomerPrivateMessage(supabase, {
      guestClientId,
      conversationId,
      body: text,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    const shiftSchedule = await scheduleDigitalShiftInterceptAfterSend(supabase, conversationId);
    return Response.json(
      {
        ok: true,
        message: result.message,
        shiftIntercept: shiftSchedule,
      },
      { headers },
    );
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
