import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { assertBarberEmailOwnsRow, assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-barber-portal-session, x-supabase-anon, x-client-supabase-url',
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
      route: 'barber-support-chat',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-support-chat');
  if (!guard.ok) {
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

  const action = String((body as { action?: unknown }).action ?? 'send').trim();
  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();
  const authGate = assertBarberPortalSessionFromRequest(request, barberId, rawEmail);
  if (!authGate.ok) {
    return Response.json({ error: authGate.message }, { status: authGate.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const gate = await assertBarberEmailOwnsRow<{ id: string; email: string; is_active: boolean | null }>(supabase, {
    barberId,
    rawEmail,
    select: 'id, email, is_active',
  });
  if (!gate.ok) {
    return Response.json({ error: gate.message }, { status: gate.status, headers });
  }

  if (action === 'list') {
    const { data: rows, error } = await supabase
      .from('platform_support_messages')
      .select('id, barber_id, from_admin, body, admin_sender_email, created_at')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      return Response.json({ error: error.message || 'Failed to load thread' }, { status: 500, headers });
    }

    return Response.json({ ok: true, messages: rows ?? [] }, { headers });
  }

  const text = String((body as { body?: unknown }).body ?? '').trim();
  if (text.length < 1 || text.length > 4000) {
    return Response.json({ error: 'body must be 1–4000 characters' }, { status: 400, headers });
  }

  const { data: inserted, error: insErr } = await supabase
    .from('platform_support_messages')
    .insert({
      barber_id: barberId,
      from_admin: false,
      body: text,
      admin_sender_email: null,
    })
    .select('id, barber_id, from_admin, body, created_at')
    .maybeSingle();

  if (insErr) {
    return Response.json({ error: insErr.message || 'Insert failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true, message: inserted }, { headers });
}
