import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { verifyBarberPortalMagicToken, getBarberPortalMagicSecret } from './_lib/barberPortalMagicToken.js';
import { consumeBarberPortalMagicToken } from './_lib/barberPortalMagicConsumeCore.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const sr = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const magic = Boolean(getBarberPortalMagicSecret());
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-magic-consume',
      supabaseUrlSet: Boolean(url),
      supabaseUrlHost: safeHost(url),
      serviceRoleKeySet: sr,
      magicSecretSet: magic,
      ready: Boolean(url) && sr && magic,
      publicApiGuard: registrationGuardDiagnostics(),
      postBody: '{ "token": "<from #/barber/enter?m=...>" }',
      browserEnterUrl: '/api/barber-portal-magic-enter?m=<token>',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-magic-consume');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = getBarberPortalMagicSecret();
  if (!secret) {
    return Response.json(
      { error: 'Magic links disabled (set BARBER_PORTAL_MAGIC_SECRET or REGISTRATION_INTENT_SECRET)' },
      { status: 503, headers },
    );
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== url) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(url),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const token = String((body as { token?: unknown }).token ?? '').trim();
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await consumeBarberPortalMagicToken(supabase, token, secret);
  if (result.ok === false) {
    return Response.json(
      { error: result.error, ...(result.code ? { code: result.code } : {}) },
      { status: result.status, headers },
    );
  }

  return Response.json(
    {
      ok: true,
      barber_session_token: result.barber_session_token,
      salon_role: result.salon_role,
      barber: {
        id: result.barber.id,
        name: result.barber.name,
        email: result.barber.email,
        phone: result.barber.phone,
        tier: result.barber.tier,
        rating_invite_token: result.barber.rating_invite_token,
        member_number: result.barber.member_number,
        inclusiveCare: result.barber.inclusiveCare,
      },
    },
    { headers },
  );
}
