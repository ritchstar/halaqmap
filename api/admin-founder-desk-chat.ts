/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  listFounderDeskInbox,
  listFounderDeskMessagesForAdmin,
  markFounderDeskConversationRead,
  sendFounderDeskAdminMessage,
} from './_lib/founderDeskChat.js';

export const config = { maxDuration: 25 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function authed(request: Request) {
  const headers = corsHeaders(request);
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return { blocked };
  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return { headers, error: Response.json({ error: 'server_misconfigured' }, { status: 503, headers }) };
  }
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_overview',
    'view_partner_marketing',
  ]);
  if (auth.ok === false) {
    return { headers, error: Response.json(auth.json, { status: auth.status, headers }) };
  }
  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { headers, supabase };
}

export async function GET(request: Request): Promise<Response> {
  const gate = await authed(request);
  if ('blocked' in gate && gate.blocked) return gate.blocked;
  if ('error' in gate && gate.error) return gate.error;
  const { headers, supabase } = gate;

  const result = await listFounderDeskInbox(supabase);
  if (!result.ok) {
    if (result.tableMissing) {
      return Response.json(
        { ok: true, tableMissing: true, conversations: [], hint: 'Apply migration 161_founder_desk_chat.sql' },
        { headers },
      );
    }
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json({ ok: true, tableMissing: false, conversations: result.conversations }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const gate = await authed(request);
  if ('blocked' in gate && gate.blocked) return gate.blocked;
  if ('error' in gate && gate.error) return gate.error;
  const { headers, supabase } = gate;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const action = String((body as { action?: unknown }).action ?? '').trim();
  const conversationId = String((body as { conversationId?: unknown }).conversationId ?? '').trim();

  if (action === 'list_messages') {
    const result = await listFounderDeskMessagesForAdmin(supabase, conversationId);
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    await markFounderDeskConversationRead(supabase, conversationId);
    return Response.json(
      { ok: true, messages: result.messages, conversation: result.conversation, expired: result.expired },
      { headers },
    );
  }

  if (action === 'send') {
    const text = String((body as { body?: unknown }).body ?? '');
    const result = await sendFounderDeskAdminMessage(supabase, { conversationId, body: text });
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    return Response.json({ ok: true, message: result.message }, { headers });
  }

  if (action === 'mark_read') {
    const result = await markFounderDeskConversationRead(supabase, conversationId);
    if (!result.ok) {
      return Response.json(
        { error: result.error, tableMissing: result.tableMissing === true },
        { status: result.status, headers },
      );
    }
    return Response.json({ ok: true }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
