import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  extractBarberPortalSessionToken,
  getBarberPortalSessionSecret,
  verifyBarberPortalSessionToken,
} from './_lib/barberPortalAuth.js';
import {
  createDiamondAppointmentRequest,
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

function tierAllowsAppointments(tierRaw: string): boolean {
  return String(tierRaw || '').toLowerCase() === 'diamond';
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

  const sessionSecret = getBarberPortalSessionSecret();
  if (!sessionSecret) {
    return Response.json({ error: 'الخدمة غير مهيّأة.' }, { status: 503, headers });
  }

  const sessionToken = extractBarberPortalSessionToken(request);
  const verified = verifyBarberPortalSessionToken(sessionToken, sessionSecret);
  if (!verified.ok) {
    return Response.json({ error: 'جلسة غير صالحة. سجّل الدخول من لوحة التحكم.' }, { status: 401, headers });
  }

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .select('id, tier, is_active')
    .eq('id', verified.barberId)
    .maybeSingle();

  if (barberErr || !barber) {
    return Response.json({ error: 'الحساب غير موجود.' }, { status: 404, headers });
  }

  if (barber.is_active === false) {
    return Response.json({ error: 'الحساب غير مفعّل.' }, { status: 409, headers });
  }

  if (!tierAllowsAppointments(String(barber.tier ?? ''))) {
    return Response.json({ error: 'جدولة المواعيد متاحة لباقة ماسي فقط.' }, { status: 403, headers });
  }

  if (action === 'list') {
    const result = await listBarberBookings(supabase, verified.barberId);
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
      barberId: verified.barberId,
      bookingId,
      status,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status, headers });
    }
    return Response.json({ ok: true, booking: result.booking }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
