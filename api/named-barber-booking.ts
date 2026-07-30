/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة عامة لصفحة الحجز بالاسم: سياق الصالون + الأوقات المتاحة.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { resolveDiamondBarberForBooking } from './_lib/diamondAppointmentBookingService.js';
import { getPublicBookingContext, listAvailableSlots } from './_lib/namedBarberBookingService.js';

export const config = {
  maxDuration: 20,
};

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

  const guard = runRegistrationRouteGuards(request, 'named-barber-booking');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const requestUrl = new URL(request.url);
  const barberId = String(requestUrl.searchParams.get('barberId') ?? '').trim();
  const action = String(requestUrl.searchParams.get('action') ?? 'context').trim() || 'context';

  if (!barberId) {
    return Response.json(
      { ok: true, route: 'named-barber-booking', publicApiGuard: registrationGuardDiagnostics() },
      { headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const diamond = await resolveDiamondBarberForBooking(supabase, barberId);
  if (!diamond.ok) {
    return Response.json({ error: diamond.error }, { status: diamond.status, headers });
  }

  if (action === 'slots') {
    const bookingDate = String(requestUrl.searchParams.get('date') ?? '').trim();
    const teamMemberId = String(requestUrl.searchParams.get('teamMemberId') ?? '').trim() || null;
    const durationRaw = Number(requestUrl.searchParams.get('durationMinutes') ?? '');
    const durationMinutes = Number.isFinite(durationRaw) ? Math.floor(durationRaw) : undefined;
    const result = await listAvailableSlots(supabase, {
      barberId: diamond.barberRowId,
      teamMemberId,
      bookingDate,
      durationMinutes,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400, headers });
    }
    return Response.json({ ok: true, slots: result.slots }, { headers });
  }

  const ctx = await getPublicBookingContext(supabase, diamond.barberRowId);
  if (!ctx.ok) {
    return Response.json({ error: ctx.error }, { status: ctx.status, headers });
  }
  return Response.json({ ok: true, salon: ctx.salon, team: ctx.team }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'named-barber-booking');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const action = String((body as { action?: unknown }).action ?? '').trim();
  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === 'slots') {
    const bookingDate = String((body as { bookingDate?: unknown }).bookingDate ?? '').trim();
    const teamMemberId = String((body as { teamMemberId?: unknown }).teamMemberId ?? '').trim() || null;
    const durationMinutesRaw = (body as { durationMinutes?: unknown }).durationMinutes;
    const durationMinutes =
      typeof durationMinutesRaw === 'number' && Number.isFinite(durationMinutesRaw)
        ? Math.floor(durationMinutesRaw)
        : undefined;

    const diamond = await resolveDiamondBarberForBooking(supabase, barberId);
    if (!diamond.ok) {
      return Response.json({ error: diamond.error }, { status: diamond.status, headers });
    }

    const result = await listAvailableSlots(supabase, {
      barberId: diamond.barberRowId,
      teamMemberId,
      bookingDate,
      durationMinutes,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400, headers });
    }
    return Response.json({ ok: true, slots: result.slots }, { headers });
  }

  if (action === 'context') {
    const diamond = await resolveDiamondBarberForBooking(supabase, barberId);
    if (!diamond.ok) {
      return Response.json({ error: diamond.error }, { status: diamond.status, headers });
    }
    const ctx = await getPublicBookingContext(supabase, diamond.barberRowId);
    if (!ctx.ok) {
      return Response.json({ error: ctx.error }, { status: ctx.status, headers });
    }
    return Response.json({ ok: true, salon: ctx.salon, team: ctx.team }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
