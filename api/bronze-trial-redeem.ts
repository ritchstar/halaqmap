/**
 * استرداد كود تجربة برونزي من صفحة الدفع — بدون ميسر.
 * POST { code, requestId?, linkedBarberId? }
 */
import { createClient } from '@supabase/supabase-js';
import { redeemBronzeTrialCode } from './_lib/bronzeTrialCodeService.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 45 };

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
      route: 'bronze-trial-redeem',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'bronze-trial-redeem');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  let body: { code?: unknown; requestId?: unknown; linkedBarberId?: unknown; email?: unknown };
  try {
    body = (await request.json()) as { code?: unknown; requestId?: unknown; linkedBarberId?: unknown; email?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await redeemBronzeTrialCode(supabase, {
    code: String(body.code ?? ''),
    registrationRequestId: String(body.requestId ?? '').trim() || null,
    linkedBarberId: String(body.linkedBarberId ?? '').trim() || null,
    email: String(body.email ?? '').trim() || null,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }

  return Response.json(
    {
      ok: true,
      barberId: result.barberId,
      validUntil: result.validUntil,
      listingDaysGranted: result.listingDaysGranted,
      isTrial: true,
      tier: 'bronze',
      messageAr: 'تم تفعيل تجربة برونزي لمدة 30 يوماً — مشترك تجريبي.',
    },
    { status: 200, headers },
  );
}
