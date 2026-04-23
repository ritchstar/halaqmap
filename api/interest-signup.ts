import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 15 };

const TABLE = 'barber_interest_signups';

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 254);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'interest-signup',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      ready: url && serviceRole,
      registrationGuard: registrationGuardDiagnostics(),
      note: 'POST { email, consentFollowUpdates: true } — honeypot field "website" must be empty.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'interest-signup');
  if (!guard.ok) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
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

  const b = body as {
    email?: unknown;
    consentFollowUpdates?: unknown;
    website?: unknown;
  };

  const honeypot = String(b.website ?? '').trim();
  if (honeypot.length > 0) {
    return Response.json({ ok: true }, { headers });
  }

  const email = normalizeEmail(String(b.email ?? ''));
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400, headers });
  }

  if (b.consentFollowUpdates !== true) {
    return Response.json(
      { error: 'Consent required', hint: 'consentFollowUpdates must be boolean true' },
      { status: 400, headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from(TABLE).insert({
    email_normalized: email,
    consent_follow_updates: true,
  });

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === '23505') {
      return Response.json({ ok: true, alreadyRegistered: true }, { headers });
    }
    return Response.json(
      { error: 'Could not save signup', hint: error.message },
      { status: 500, headers },
    );
  }

  return Response.json({ ok: true, alreadyRegistered: false }, { headers });
}
