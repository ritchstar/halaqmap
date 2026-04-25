import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 25,
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
      route: 'barber-customer-private-chat',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

async function assertBarberEmailOwnsRow(
  supabase: SupabaseClient,
  barberId: string,
  rawEmail: string
): Promise<
  | { ok: true; row: { id: string; email: string; is_active: boolean | null; user_id: string | null } }
  | { ok: false; status: number; message: string }
> {
  const emailNorm = rawEmail.trim().toLowerCase();
  if (!barberId || !emailNorm) {
    return { ok: false, status: 400, message: 'Missing barberId or email' };
  }

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, is_active, user_id')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, status: 500, message: selErr.message || 'Lookup failed' };
  }
  if (!row) {
    return { ok: false, status: 404, message: 'Barber not found' };
  }

  const b = row as { id: string; email: string; is_active: boolean | null; user_id: string | null };
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return { ok: false, status: 403, message: 'Email does not match this barber account' };
  }
  if (b.is_active === false) {
    return { ok: false, status: 403, message: 'Account is not active' };
  }
  if (!b.user_id) {
    return { ok: false, status: 409, message: 'Barber profile is not linked to a user account yet' };
  }

  return { ok: true, row: b };
}

function conversationOpen(row: {
  status: string;
  closed_at: string | null;
  expires_at: string;
}): boolean {
  if (row.status !== 'active' || row.closed_at) return false;
  const exp = new Date(row.expires_at).getTime();
  return Number.isFinite(exp) && exp > Date.now();
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-customer-private-chat');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

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
  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const gate = await assertBarberEmailOwnsRow(supabase, barberId, rawEmail);
  if (gate.ok === false) {
    return Response.json({ error: gate.message }, { status: gate.status, headers });
  }

  const barberUserId = gate.row.user_id as string;

  if (action === 'list_conversations') {
    const { data: rows, error } = await supabase
      .from('private_conversations')
      .select('id, customer_id, status, started_at, expires_at, closed_at, last_message_at')
      .eq('barber_user_id', barberUserId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(80);

    if (error) {
      return Response.json({ error: error.message || 'Failed to list conversations' }, { status: 500, headers });
    }
    return Response.json({ ok: true, conversations: rows ?? [] }, { headers });
  }

  const conversationId = String((body as { conversationId?: unknown }).conversationId ?? '').trim();
  if (!conversationId) {
    return Response.json({ error: 'Missing conversationId' }, { status: 400, headers });
  }

  const { data: conv, error: convErr } = await supabase
    .from('private_conversations')
    .select('id, barber_user_id, customer_id, status, expires_at, closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convErr || !conv) {
    return Response.json({ error: 'Conversation not found' }, { status: 404, headers });
  }

  const c = conv as {
    id: string;
    barber_user_id: string;
    customer_id: string;
    status: string;
    expires_at: string;
    closed_at: string | null;
  };

  if (c.barber_user_id !== barberUserId) {
    return Response.json({ error: 'Forbidden' }, { status: 403, headers });
  }

  if (action === 'list_messages') {
    if (!conversationOpen(c)) {
      return Response.json({ ok: true, messages: [], expired: true }, { headers });
    }
    const { data: msgs, error } = await supabase
      .from('private_messages')
      .select('id, conversation_id, sender_id, body, created_at, read_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      return Response.json({ error: error.message || 'Failed to load messages' }, { status: 500, headers });
    }
    return Response.json({ ok: true, messages: msgs ?? [], expired: false }, { headers });
  }

  if (action === 'send') {
    if (!conversationOpen(c)) {
      return Response.json({ error: 'Conversation expired or closed' }, { status: 409, headers });
    }

    const text = String((body as { body?: unknown }).body ?? '').trim();
    if (text.length < 1 || text.length > 2000) {
      return Response.json({ error: 'body must be 1–2000 characters' }, { status: 400, headers });
    }

    const { data: inserted, error: insErr } = await supabase
      .from('private_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: barberUserId,
        body: text,
      })
      .select('id, conversation_id, sender_id, body, created_at, read_at')
      .maybeSingle();

    if (insErr) {
      return Response.json({ error: insErr.message || 'Insert failed' }, { status: 500, headers });
    }

    return Response.json({ ok: true, message: inserted }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
