/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إدارة طاقم الحلاقين + وضع الاتصال + جدول الحظر من لوحة الصالون.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { assertBarberPortalDiamondScheduling } from './_lib/diamondAppointmentBookingService.js';
import {
  buildDaySlots,
  deleteTeamMember,
  listAvailableSlots,
  listBusyIntervalsForMember,
  listTeamBlocks,
  listTeamMembers,
  normalizeContactMode,
  setTeamSlotBlocked,
  updateBarberContactMode,
  upsertTeamMember,
  getBarberContactMode,
} from './_lib/namedBarberBookingService.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-barber-portal-session, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function mapError(message: string): { status: number; error: string } {
  if (message === 'display_name_required') return { status: 400, error: 'أدخل اسم الحلاق.' };
  if (message === 'team_limit_reached') {
    return { status: 400, error: 'وصلت للحد الأقصى لعدد الحلاقين (25). احذف قبل الإضافة.' };
  }
  if (message === 'member_not_found') return { status: 404, error: 'الحلاق غير موجود في الطاقم.' };
  if (message === 'invalid_member_id') return { status: 400, error: 'معرّف الحلاق غير صالح.' };
  if (message === 'invalid_date' || message === 'invalid_time') {
    return { status: 400, error: 'التاريخ أو الوقت غير صالح.' };
  }
  return { status: 500, error: message || 'تعذّر تنفيذ العملية.' };
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
      route: 'barber-team-members',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-team');
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const action = String((body as { action?: unknown }).action ?? 'list').trim() || 'list';
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

  const diamondAccess = await assertBarberPortalDiamondScheduling(supabase, barberId);
  if (!diamondAccess.ok) {
    return Response.json({ error: diamondAccess.error }, { status: diamondAccess.status, headers });
  }

  if (action === 'list') {
    const members = await listTeamMembers(supabase, barberId);
    const contactMode = await getBarberContactMode(supabase, barberId);
    return Response.json({ ok: true, members, contactMode }, { headers });
  }

  if (action === 'upsert') {
    const result = await upsertTeamMember(supabase, {
      barberId,
      memberId: String((body as { memberId?: unknown }).memberId ?? '').trim() || undefined,
      displayName: String((body as { displayName?: unknown }).displayName ?? ''),
      photoUrl: (body as { photoUrl?: unknown }).photoUrl as string | null | undefined,
      sortOrder: (body as { sortOrder?: unknown }).sortOrder as number | undefined,
      isActive: (body as { isActive?: unknown }).isActive as boolean | undefined,
      defaultDurationMinutes: (body as { defaultDurationMinutes?: unknown }).defaultDurationMinutes as
        | number
        | undefined,
      internalNotes: (body as { internalNotes?: unknown }).internalNotes as string | null | undefined,
    });
    if (!result.ok) {
      const mapped = mapError(result.error);
      return Response.json({ error: mapped.error }, { status: mapped.status, headers });
    }
    return Response.json({ ok: true, member: result.member }, { headers });
  }

  if (action === 'delete') {
    const memberId = String((body as { memberId?: unknown }).memberId ?? '').trim();
    const result = await deleteTeamMember(supabase, barberId, memberId);
    if (!result.ok) {
      const mapped = mapError(result.error);
      return Response.json({ error: mapped.error }, { status: mapped.status, headers });
    }
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'update_contact_mode') {
    const contactMode = normalizeContactMode((body as { contactMode?: unknown }).contactMode);
    const result = await updateBarberContactMode(supabase, barberId, contactMode);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 500, headers });
    }
    return Response.json({ ok: true, contactMode: result.contactMode }, { headers });
  }

  if (action === 'list_day_schedule') {
    const teamMemberId = String((body as { teamMemberId?: unknown }).teamMemberId ?? '').trim();
    const bookingDate = String((body as { bookingDate?: unknown }).bookingDate ?? '').trim();
    if (!teamMemberId || !bookingDate) {
      return Response.json({ error: 'teamMemberId and bookingDate required' }, { status: 400, headers });
    }
    const [blocks, available, busy] = await Promise.all([
      listTeamBlocks(supabase, { barberId, teamMemberId, blockDate: bookingDate }),
      listAvailableSlots(supabase, { barberId, teamMemberId, bookingDate }),
      listBusyIntervalsForMember(supabase, { barberId, teamMemberId, bookingDate }),
    ]);
    const allSlots = buildDaySlots();
    return Response.json(
      {
        ok: true,
        slots: allSlots,
        availableSlots: available.ok ? available.slots : [],
        blocks,
        busyCount: busy.length,
      },
      { headers },
    );
  }

  if (action === 'set_slot_block') {
    const teamMemberId = String((body as { teamMemberId?: unknown }).teamMemberId ?? '').trim();
    const bookingDate = String((body as { bookingDate?: unknown }).bookingDate ?? '').trim();
    const startTime = String((body as { startTime?: unknown }).startTime ?? '').trim();
    const blocked = Boolean((body as { blocked?: unknown }).blocked);
    const result = await setTeamSlotBlocked(supabase, {
      barberId,
      teamMemberId,
      blockDate: bookingDate,
      startTime,
      blocked,
      reason: String((body as { reason?: unknown }).reason ?? '').trim() || null,
    });
    if (!result.ok) {
      const mapped = mapError(result.error);
      return Response.json({ error: mapped.error }, { status: mapped.status, headers });
    }
    return Response.json({ ok: true, blocks: result.blocks }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
