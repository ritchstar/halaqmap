/**
 * تقديم طلب انضمام سفير ميداني (عام).
 */
import { createClient } from '@supabase/supabase-js';
import { submitAmbassadorApplicationRemote } from './_lib/ambassadorApplicationService.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'ambassador-apply');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  if (String(body.website ?? '').trim()) {
    await recordHoneypotTrip(request, 'ambassador-apply');
    return Response.json({ ok: true }, { headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await submitAmbassadorApplicationRemote(supabase, {
    displayName: String(body.displayName ?? ''),
    phone: String(body.phone ?? ''),
    email: body.email != null ? String(body.email) : null,
    coverageArea: String(body.coverageArea ?? ''),
    salesExperience: String(body.salesExperience ?? ''),
    socialProofUrl: body.socialProofUrl != null ? String(body.socialProofUrl) : null,
    socialProofPath: body.socialProofLabel != null ? String(body.socialProofLabel) : null,
    rulesVersion: String(body.rulesVersion ?? ''),
  });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: result.status ?? 400, headers },
    );
  }

  return Response.json(
    {
      ok: true,
      id: result.id,
      code: result.code,
      accountStatus: result.accountStatus,
    },
    { status: 201, headers },
  );
}
