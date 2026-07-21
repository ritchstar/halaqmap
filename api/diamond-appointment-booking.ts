import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { resolveBarberPortalBookingActor } from './_lib/barberPortalBookingAuth.js';
import {
  assertBarberPortalDiamondScheduling,
  createDiamondAppointmentRequest,
  deleteClosedBarberBooking,
  listBarberBookings,
  updateBarberBookingStatus,
} from './_lib/diamondAppointmentBookingService.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url, x-barber-portal-session, Authorization',
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
      route: 'diamond-appointment-booking',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'diamond-appointment-booking');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
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
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === 'create') {
    const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
    const bookingDate = String((body as { bookingDate?: unknown }).bookingDate ?? '').trim();
    const bookingTime = String((body as { bookingTime?: unknown }).bookingTime ?? '').trim();
    const customerPhone = String((body as { customerPhone?: unknown }).customerPhone ?? '').trim();
    const durationMinutesRaw = (body as { durationMinutes?: unknown }).durationMinutes;
    const durationMinutes =
      typeof durationMinutesRaw === 'number' && Number.isFinite(durationMinutesRaw)
        ? Math.floor(durationMinutesRaw)
        : 30;

    const result = await createDiamondAppointmentRequest({
      barberId,
      bookingDate,
      bookingTime,
      customerPhone,
      durationMinutes,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json(
      { ok: true, bookingId: result.bookingId, booking: result.booking },
      { headers },
    );
  }

  const actor = await resolveBarberPortalBookingActor(request, body as { barberId?: unknown; email?: unknown }, supabase);
  if (!actor.ok) {
    const message =
      actor.status === 401 || actor.status === 403
        ? 'جلسة غير صالحة. أعد تسجيل الدخول من لوحة التحكم.'
        : actor.error;
    return Response.json({ error: message }, { status: actor.status, headers });
  }

  const diamondAccess = await assertBarberPortalDiamondScheduling(supabase, actor.barberId);
  if (!diamondAccess.ok) {
    return Response.json({ error: diamondAccess.error }, { status: diamondAccess.status, headers });
  }

  if (action === 'list') {
    const result = await listBarberBookings(supabase, actor.barberId);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true, bookings: result.bookings }, { headers });
  }

  if (action === 'update_status') {
    const bookingId = String((body as { bookingId?: unknown }).bookingId ?? '').trim();
    const status = String((body as { status?: unknown }).status ?? '').trim();
    if (status !== 'confirmed' && status !== 'cancelled' && status !== 'completed') {
      return Response.json({ error: 'Invalid status' }, { status: 400, headers });
    }
    const result = await updateBarberBookingStatus(supabase, {
      barberId: actor.barberId,
      bookingId,
      status,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true, booking: result.booking }, { headers });
  }

  if (action === 'delete_closed') {
    const bookingId = String((body as { bookingId?: unknown }).bookingId ?? '').trim();
    const result = await deleteClosedBarberBooking(supabase, {
      barberId: actor.barberId,
      bookingId,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
