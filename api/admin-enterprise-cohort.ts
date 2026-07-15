/**
 * إدارة برنامج الشريك المرجعي (مقاعد + تقرير HQ).
 * صلاحيات: review_payments أو manage_partner_billing
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  activateCohortSeat,
  assignCohortSeat,
  buildCohortHqReport,
  listCohortSeats,
  listEnterpriseCohorts,
  resolveDefaultCohortSlug,
  revokeCohortSeat,
} from './_lib/enterpriseCohortService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

const ADMIN_PERMS = ['review_payments', 'manage_partner_billing'] as const;

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    ...ADMIN_PERMS,
  ]);
  if (auth.ok === false) {
    const raw = String(auth.json.error || 'unauthorized');
    const code = raw.toLowerCase() === 'unauthorized' ? 'unauthorized' : raw;
    return Response.json({ ...auth.json, error: code }, { status: auth.status, headers });
  }

  const url = new URL(request.url);
  const view = String(url.searchParams.get('view') || 'overview').trim();
  const cohortIdParam = String(url.searchParams.get('cohortId') || '').trim();
  const slugParam = String(url.searchParams.get('slug') || resolveDefaultCohortSlug()).trim();

  const cohortsRes = await listEnterpriseCohorts(auth.supabase);
  if (!cohortsRes.ok) {
    return Response.json({ ok: false, error: cohortsRes.error }, { status: 500, headers });
  }

  const cohort =
    (cohortIdParam
      ? cohortsRes.cohorts.find((c) => c.id === cohortIdParam)
      : cohortsRes.cohorts.find((c) => c.slug === slugParam)) || cohortsRes.cohorts[0];

  if (!cohort) {
    return Response.json({ ok: false, error: 'cohort_not_found' }, { status: 404, headers });
  }

  if (view === 'hq') {
    const report = await buildCohortHqReport(auth.supabase, cohort.id);
    if (!report.ok) {
      return Response.json({ ok: false, error: report.error }, { status: 500, headers });
    }
    return Response.json(
      {
        ok: true,
        cohorts: cohortsRes.cohorts,
        cohort: report.cohort,
        seats: report.seats,
        summary: report.summary,
      },
      { status: 200, headers },
    );
  }

  const seatsRes = await listCohortSeats(auth.supabase, cohort.id);
  if (!seatsRes.ok) {
    return Response.json({ ok: false, error: seatsRes.error }, { status: 500, headers });
  }

  return Response.json(
    {
      ok: true,
      cohorts: cohortsRes.cohorts,
      cohort,
      seats: seatsRes.seats,
    },
    { status: 200, headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    ...ADMIN_PERMS,
  ]);
  if (auth.ok === false) {
    const raw = String(auth.json.error || 'unauthorized');
    const code = raw.toLowerCase() === 'unauthorized' ? 'unauthorized' : raw;
    return Response.json({ ...auth.json, error: code }, { status: auth.status, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();

  if (action === 'assign_seat') {
    const result = await assignCohortSeat(auth.supabase, {
      seatId: String(body.seatId ?? ''),
      boundEmail: body.boundEmail != null ? String(body.boundEmail) : null,
      branchLabel: body.branchLabel != null ? String(body.branchLabel) : null,
    });
    if (!result.ok) {
      const status =
        result.error === 'seat_not_found'
          ? 404
          : result.error === 'seat_already_activated' || result.error === 'seat_revoked'
            ? 409
            : 400;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json({ ok: true, seat: result.seat }, { status: 200, headers });
  }

  if (action === 'activate_seat') {
    const result = await activateCohortSeat(auth.supabase, {
      seatId: String(body.seatId ?? ''),
      barberId: String(body.barberId ?? ''),
      adminEmail: auth.actorEmail,
      requireEmailMatch: body.requireEmailMatch !== false,
    });
    if (!result.ok) {
      const status =
        result.error === 'seat_not_found' || result.error === 'barber_not_found'
          ? 404
          : result.error === 'seat_already_activated' ||
              result.error === 'barber_already_has_active_seat' ||
              result.error === 'email_mismatch'
            ? 409
            : 400;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json(
      {
        ok: true,
        seat: result.seat,
        validUntil: result.validUntil,
        listingDaysGranted: result.listingDaysGranted,
      },
      { status: 200, headers },
    );
  }

  if (action === 'revoke_seat') {
    const result = await revokeCohortSeat(auth.supabase, {
      seatId: String(body.seatId ?? ''),
      reason: body.reason != null ? String(body.reason) : undefined,
      adminEmail: auth.actorEmail,
    });
    if (!result.ok) {
      const status =
        result.error === 'seat_not_found'
          ? 404
          : result.error === 'seat_already_revoked'
            ? 409
            : 400;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json({ ok: true, seat: result.seat }, { status: 200, headers });
  }

  return Response.json({ ok: false, error: 'unknown_action' }, { status: 400, headers });
}
