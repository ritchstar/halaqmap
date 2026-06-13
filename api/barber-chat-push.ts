import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { assertBarberEmailOwnsRow, assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import {
  getBarberChatPushVapidPublicKey,
  isBarberChatPushConfigured,
} from './_lib/barberChatPushLib.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-barber-portal-session, x-supabase-anon, x-client-supabase-url',
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
      route: 'barber-chat-push',
      pushConfigured: isBarberChatPushConfigured(),
      vapidPublicKey: getBarberChatPushVapidPublicKey(),
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-chat-push');
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
  const authGate = assertBarberPortalSessionFromRequest(request, barberId, rawEmail);
  if (!authGate.ok) {
    return Response.json({ error: authGate.message }, { status: authGate.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const gate = await assertBarberEmailOwnsRow(supabase, {
    barberId,
    rawEmail,
    select: 'id, email, is_active',
  });
  if (!gate.ok) {
    return Response.json({ error: gate.message }, { status: gate.status, headers });
  }

  if (action === 'subscribe') {
    if (!isBarberChatPushConfigured()) {
      return Response.json({ error: 'Push notifications not configured on server' }, { status: 503, headers });
    }
    const subscription = (body as { subscription?: unknown }).subscription as
      | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
      | undefined;
    const endpoint = String(subscription?.endpoint ?? '').trim();
    const p256dh = String(subscription?.keys?.p256dh ?? '').trim();
    const authKey = String(subscription?.keys?.auth ?? '').trim();
    if (!endpoint || !p256dh || !authKey) {
      return Response.json({ error: 'Invalid push subscription payload' }, { status: 400, headers });
    }
    const userAgent = String(request.headers.get('user-agent') ?? '').slice(0, 500);
    const { error } = await supabase.from('barber_push_subscriptions').upsert(
      {
        barber_id: barberId,
        endpoint,
        p256dh,
        auth_key: authKey,
        user_agent: userAgent || null,
        enabled: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );
    if (error) {
      return Response.json({ error: error.message || 'Failed to save subscription' }, { status: 500, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'unsubscribe') {
    const endpoint = String((body as { endpoint?: unknown }).endpoint ?? '').trim();
    if (!endpoint) {
      return Response.json({ error: 'Missing endpoint' }, { status: 400, headers });
    }
    const { error } = await supabase
      .from('barber_push_subscriptions')
      .delete()
      .eq('barber_id', barberId)
      .eq('endpoint', endpoint);
    if (error) {
      return Response.json({ error: error.message || 'Failed to unsubscribe' }, { status: 500, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
