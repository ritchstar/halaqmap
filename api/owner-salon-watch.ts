import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  assertBarberPortalSessionFromRequest,
  assertBarberEmailOwnsRow,
} from './_lib/barberPortalAuth.js';
import { assertSalonOwnerWatchAccess } from './_lib/salonMemberAuth.js';
import { buildOwnerSalonWatchSnapshot } from './_lib/ownerSalonWatchSnapshot.js';

export const config = {
  maxDuration: 20,
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
      route: 'owner-salon-watch',
      publicApiGuard: registrationGuardDiagnostics(),
      note: 'POST barberId + email with x-barber-portal-session — read-only owner watch snapshot.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'owner-salon-watch');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();
  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const authGate = assertBarberPortalSessionFromRequest(request, barberId, rawEmail);
  if (!authGate.ok) {
    return Response.json({ error: authGate.message }, { status: authGate.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const owns = await assertBarberEmailOwnsRow(supabase, {
    barberId,
    rawEmail,
    select: 'id, email, tier, is_active',
  });
  if (!owns.ok) {
    return Response.json({ error: owns.message }, { status: owns.status, headers });
  }

  const tierNorm = String((owns.row as { tier?: string }).tier ?? '').toLowerCase();
  if (tierNorm !== 'gold' && tierNorm !== 'diamond') {
    return Response.json(
      {
        error: 'غرفة المراقبة متاحة في باقتي الذهبي والماسي.',
        code: 'TIER_NO_OWNER_WATCH',
      },
      { status: 403, headers },
    );
  }

  const watchGate = await assertSalonOwnerWatchAccess(supabase, barberId, rawEmail);
  if (!watchGate.ok) {
    return Response.json({ error: watchGate.message }, { status: watchGate.status, headers });
  }

  const snapshot = await buildOwnerSalonWatchSnapshot(supabase, barberId);
  if (!snapshot) {
    return Response.json({ error: 'Salon snapshot unavailable' }, { status: 404, headers });
  }

  return Response.json(
    {
      ok: true,
      salonRole: watchGate.role,
      snapshot,
    },
    { headers },
  );
}
