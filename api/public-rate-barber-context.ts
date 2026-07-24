import { createClient } from '@supabase/supabase-js';
import {
  checkBarberQrAlreadySubmitted,
  validateBarberRatingInviteToken,
} from './_lib/barberQrReviewService.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'public-rate-barber-context',
      ready: url && serviceRole,
      note: 'POST { barberId, token, clientInstanceId? } — اسم الصالون + هل سبق التقييم من هذا المتصفح.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'public-rate-barber-context');
  if (guard.ok === false) {
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

  const b = body as { barberId?: unknown; token?: unknown; clientInstanceId?: unknown };
  const barberId = String(b.barberId ?? '').trim();
  const token = String(b.token ?? '').trim();
  const clientInstanceId = String(b.clientInstanceId ?? '').trim();

  if (!UUID_RE.test(barberId) || token.length < 8) {
    return Response.json({ error: 'bad_request' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const gate = await validateBarberRatingInviteToken(supabase, barberId, token);
  if (!gate.ok) {
    const status =
      gate.error === 'invalid_token' || gate.error === 'tier_not_eligible'
        ? 403
        : gate.error === 'not_found' || gate.error === 'inactive'
          ? 404
          : 400;
    return Response.json({ error: gate.error }, { status, headers });
  }

  let alreadySubmitted = false;
  if (clientInstanceId) {
    const checked = await checkBarberQrAlreadySubmitted(supabase, {
      barberId,
      token,
      clientInstanceId,
    });
    if (checked.ok) alreadySubmitted = checked.alreadySubmitted;
  }

  return Response.json(
    { ok: true, barberId, name: gate.name, alreadySubmitted },
    { headers },
  );
}
