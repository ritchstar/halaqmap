/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 15 };

const TABLE = 'coiffeur_interest_signups';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(['visitor', 'salon', 'investor']);
const INTENTS = new Set([
  'near_open',
  'coiffeur',
  'beauty_salon',
  'spa',
  'makeup',
  'nails',
  'skin',
  'independents',
]);

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').trim().slice(0, max);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return Response.json(
    {
      ok: true,
      route: 'coiffeur-interest-signup',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'coiffeur-interest-signup');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 8 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  if (clip(body.website, 200).length > 0) {
    await recordHoneypotTrip(request, 'coiffeur-interest-signup');
    return Response.json({ ok: true }, { headers });
  }

  const email = clip(body.email, 254).toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400, headers });
  }
  if (body.consentFollowUpdates !== true) {
    return Response.json({ error: 'Consent required' }, { status: 400, headers });
  }

  const roleRaw = clip(body.role, 24).toLowerCase();
  const role = ROLES.has(roleRaw) ? roleRaw : null;
  const intentRaw = clip(body.intentId, 40);
  const intentId = INTENTS.has(intentRaw) ? intentRaw : null;
  const phoneDigits = clip(body.phone, 20).replace(/[^\d+]/g, '');
  const source = clip(body.source, 40).replace(/[^\w.-]/g, '').slice(0, 40);

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from(TABLE).insert({
    email_normalized: email,
    consent_follow_updates: true,
    display_name: clip(body.displayName, 80) || null,
    role,
    intent_id: intentId,
    source: source || null,
    phone: phoneDigits || null,
  });

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === '23505') {
      return Response.json({ ok: true, alreadyRegistered: true }, { headers });
    }
    if (/coiffeur_interest_signups/i.test(error.message || '')) {
      return Response.json(
        {
          error: 'coiffeur_interest_table_missing',
          hint: 'Apply migration 159_coiffeur_interest_signups.sql on Supabase.',
        },
        { status: 503, headers },
      );
    }
    return Response.json({ error: 'Could not save signup', hint: error.message }, { status: 500, headers });
  }

  return Response.json({ ok: true, alreadyRegistered: false }, { headers });
}
