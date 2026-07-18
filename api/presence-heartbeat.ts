/**
 * POST /api/presence-heartbeat
 * Client presence pulse — no lat/lng/city. Service-role upsert only.
 */
import { createClient } from '@supabase/supabase-js';
import {
  assertBarberPortalSessionFromRequest,
  extractBarberPortalSessionToken,
  getBarberPortalSessionSecret,
  verifyBarberPortalSessionToken,
} from './_lib/barberPortalAuth.js';
import { isBootstrapAdminEmail } from './_lib/adminManageBarbersAuth.js';
import {
  isPresenceKey,
  isPresencePersona,
  isRouteBucket,
  isUuid,
  type PresencePersona,
  type RouteBucket,
} from './_lib/platformPresence.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders:
    'Content-Type, Authorization, x-client-supabase-url, x-barber-portal-session',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type Body = {
  presence_key?: unknown;
  persona?: unknown;
  route_bucket?: unknown;
  subject_id?: unknown;
  barber_id?: unknown;
  email?: unknown;
};

export async function OPTIONS(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return Response.json({ ok: false, error: 'Server not configured' }, { status: 503, headers });
  }

  const routeGuard = runRegistrationRouteGuards(request, 'presence-heartbeat');
  if (routeGuard.ok === false) {
    return Response.json(routeGuard.json, { status: routeGuard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, {
    sensitiveRoute: true,
    rateLimit: 36,
    supabaseUrl: serverUrl,
    supabaseServiceKey: serviceRole,
  });
  if (!secGuard.allowed) return secGuard.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers });
  }

  // Reject any geo / location fields if a client tries to send them.
  for (const forbidden of [
    'lat',
    'lng',
    'latitude',
    'longitude',
    'city',
    'district',
    'geo',
    'coords',
    'accuracy',
  ]) {
    if (Object.prototype.hasOwnProperty.call(body, forbidden)) {
      return Response.json(
        { ok: false, error: 'Geo fields are not accepted' },
        { status: 400, headers },
      );
    }
  }

  if (!isPresenceKey(body.presence_key) || !isPresencePersona(body.persona) || !isRouteBucket(body.route_bucket)) {
    return Response.json({ ok: false, error: 'Invalid presence payload' }, { status: 400, headers });
  }

  const presenceKey = body.presence_key.trim();
  const persona = body.persona as PresencePersona;
  const routeBucket = body.route_bucket as RouteBucket;
  let subjectId: string | null = null;

  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (persona === 'barber') {
    const barberId = typeof body.barber_id === 'string' ? body.barber_id.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!isUuid(barberId) || !email) {
      return Response.json(
        { ok: false, error: 'Barber persona requires barber_id and email' },
        { status: 400, headers },
      );
    }
    const gate = assertBarberPortalSessionFromRequest(request, barberId, email);
    if (!gate.ok) {
      return Response.json({ ok: false, error: gate.message }, { status: gate.status, headers });
    }
    subjectId = barberId;
  } else if (persona === 'admin') {
    const authHeader = request.headers.get('authorization')?.trim() || '';
    if (!authHeader.startsWith('Bearer ')) {
      return Response.json({ ok: false, error: 'Admin session required' }, { status: 401, headers });
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.id || !userData.user.email?.trim()) {
      return Response.json({ ok: false, error: 'Invalid admin session' }, { status: 401, headers });
    }
    const email = userData.user.email.trim().toLowerCase();
    if (!isBootstrapAdminEmail(email)) {
      const { data: row } = await supabase
        .from('platform_admin_roles')
        .select('is_active')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      if (!row) {
        return Response.json({ ok: false, error: 'Not an active admin' }, { status: 403, headers });
      }
    }
    subjectId = userData.user.id;
  } else {
    // anon / ambassador — never accept client-supplied subject elevation
    subjectId = null;
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('platform_presence').upsert(
    {
      presence_key: presenceKey,
      persona,
      subject_id: subjectId,
      route_bucket: routeBucket,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'presence_key' },
  );

  if (error) {
    return Response.json({ ok: false, error: error.message || 'Upsert failed' }, { status: 502, headers });
  }

  // Touch barber push last_seen when a valid portal session is present (best-effort).
  if (persona === 'barber' && subjectId) {
    const secret = getBarberPortalSessionSecret();
    const token = extractBarberPortalSessionToken(request);
    if (secret && token) {
      const verified = verifyBarberPortalSessionToken(token, secret);
      if (verified.ok && verified.barberId === subjectId) {
        void supabase
          .from('barber_push_subscriptions')
          .update({ last_seen_at: now })
          .eq('barber_id', subjectId);
      }
    }
  }

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
