/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بوابة طاقم خفيفة: تبادل رابط سري → جلسة staff، عرض مواعيد العضو، تأكيد مواعيده فقط.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  confirmStaffTeamBooking,
  listStaffTeamBookings,
  resolveTeamMemberByStaffToken,
  resolveTeamMemberForStaffSession,
  type BarberTeamMemberRow,
} from './_lib/namedBarberBookingService.js';
import {
  assertStaffPortalSessionFromRequest,
  getStaffPortalSessionSecret,
  mintStaffPortalSessionToken,
} from './_lib/staffPortalAuth.js';

export const config = {
  maxDuration: 20,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders:
    'Content-Type, x-supabase-anon, x-client-supabase-url, x-staff-portal-session',
} as const;

const STAFF_TOKEN_RE = /^[a-f0-9]{64}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function mapStaffError(error: string): { status: number; error: string } {
  if (error === 'invalid_token' || error === 'invalid_id' || error === 'invalid_session_ids') {
    return { status: 400, error: 'رابط المتابعة غير صالح.' };
  }
  if (error === 'token_not_found' || error === 'session_member_not_found') {
    return { status: 404, error: 'رابط المتابعة غير موجود أو أُعيد إصداره.' };
  }
  if (error === 'salon_inactive') return { status: 409, error: 'هذا الصالون غير مفعّل حالياً.' };
  if (error === 'booking_not_found') return { status: 404, error: 'الموعد غير موجود ضمن حجوزاتك.' };
  if (error === 'booking_not_confirmable') {
    return { status: 409, error: 'لا يمكن تأكيد هذا الموعد (ربما تغيّرت حالته).' };
  }
  if (error === 'missing_session_secret') {
    return { status: 503, error: 'الخادم غير مهيأ لجلسات الطاقم.' };
  }
  return { status: 500, error: error || 'تعذّر تنفيذ العملية.' };
}

function memberPayload(member: BarberTeamMemberRow, salonName: string) {
  return {
    member: {
      id: member.id,
      displayName: member.display_name,
      photoUrl: member.photo_url,
      isActive: member.is_active,
    },
    salon: {
      id: member.barber_id,
      name: salonName,
    },
  };
}

function createServiceClient(): SupabaseClient | null {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function resolveActor(
  request: Request,
  supabase: SupabaseClient,
  bodyToken: string,
): Promise<
  | { ok: true; member: BarberTeamMemberRow; salonName: string }
  | { ok: false; status: number; error: string }
> {
  const session = assertStaffPortalSessionFromRequest(request);
  if (session.ok) {
    const resolved = await resolveTeamMemberForStaffSession(supabase, {
      teamMemberId: session.teamMemberId,
      barberId: session.barberId,
    });
    if (!resolved.ok) {
      const mapped = mapStaffError(resolved.error);
      return { ok: false, status: mapped.status, error: mapped.error };
    }
    return { ok: true, member: resolved.member, salonName: resolved.salonName };
  }

  const token = bodyToken.trim();
  if (token && STAFF_TOKEN_RE.test(token)) {
    const resolved = await resolveTeamMemberByStaffToken(supabase, token);
    if (!resolved.ok) {
      const mapped = mapStaffError(resolved.error);
      return { ok: false, status: mapped.status, error: mapped.error };
    }
    return { ok: true, member: resolved.member, salonName: resolved.salonName };
  }

  return {
    ok: false,
    status: session.status === 503 ? 503 : 401,
    error:
      session.status === 503
        ? mapStaffError('missing_session_secret').error
        : 'يلزم رابط المتابعة أو جلسة الطاقم.',
  };
}

async function handleList(
  request: Request,
  bodyToken: string,
): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'staff-team-bookings');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 60 });
  if (!secGuard.allowed) return secGuard.response;

  const supabase = createServiceClient();
  if (!supabase) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const actor = await resolveActor(request, supabase, bodyToken);
  if (!actor.ok) {
    return Response.json({ error: actor.error }, { status: actor.status, headers });
  }

  const listed = await listStaffTeamBookings(supabase, actor.member.id);
  if (!listed.ok) {
    const mapped = mapStaffError(listed.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const pendingCount = listed.bookings.filter((b) => b.status === 'pending').length;
  const base = memberPayload(actor.member, actor.salonName);

  return Response.json(
    {
      ok: true,
      ...base,
      bookings: listed.bookings,
      pendingCount,
    },
    { headers },
  );
}

async function handleExchange(request: Request, token: string): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'staff-team-bookings');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 20 });
  if (!secGuard.allowed) return secGuard.response;

  const accessToken = token.trim();
  if (!STAFF_TOKEN_RE.test(accessToken)) {
    const mapped = mapStaffError('invalid_token');
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const secret = getStaffPortalSessionSecret();
  if (!secret) {
    const mapped = mapStaffError('missing_session_secret');
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const resolved = await resolveTeamMemberByStaffToken(supabase, accessToken);
  if (!resolved.ok) {
    const mapped = mapStaffError(resolved.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  let minted: { token: string; exp: number };
  try {
    minted = mintStaffPortalSessionToken(
      { teamMemberId: resolved.member.id, barberId: resolved.member.barber_id },
      secret,
    );
  } catch {
    return Response.json({ error: 'تعذّر إنشاء جلسة الطاقم.' }, { status: 500, headers });
  }

  const base = memberPayload(resolved.member, resolved.salonName);
  return Response.json(
    {
      ok: true,
      staffSessionToken: minted.token,
      expiresAt: minted.exp,
      ...base,
    },
    { headers },
  );
}

async function handleConfirm(request: Request, bookingIdRaw: string): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'staff-team-bookings');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 30 });
  if (!secGuard.allowed) return secGuard.response;

  const bookingId = String(bookingIdRaw ?? '').trim();
  if (!bookingId) {
    return Response.json({ error: 'معرّف الموعد مطلوب.' }, { status: 400, headers });
  }

  const session = assertStaffPortalSessionFromRequest(request);
  if (!session.ok) {
    return Response.json(
      {
        error:
          session.status === 503
            ? mapStaffError('missing_session_secret').error
            : 'انتهت جلسة الطاقم. أعد فتح الرابط.',
      },
      { status: session.status, headers },
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const memberCheck = await resolveTeamMemberForStaffSession(supabase, {
    teamMemberId: session.teamMemberId,
    barberId: session.barberId,
  });
  if (!memberCheck.ok) {
    const mapped = mapStaffError(memberCheck.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const confirmed = await confirmStaffTeamBooking(supabase, {
    teamMemberId: session.teamMemberId,
    barberId: session.barberId,
    bookingId,
  });
  if (!confirmed.ok) {
    const mapped = mapStaffError(confirmed.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  return Response.json({ ok: true, booking: confirmed.booking }, { headers });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const requestUrl = new URL(request.url);
  const token = String(requestUrl.searchParams.get('token') ?? '').trim();
  if (!token) {
    return Response.json(
      {
        ok: true,
        route: 'staff-team-bookings',
        publicApiGuard: registrationGuardDiagnostics(),
        note: 'POST exchange|list|confirm — بوابة طاقم (عرض + تأكيد مواعيد العضو)',
      },
      { headers },
    );
  }
  return handleList(request, token);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const actionRaw = String((body as { action?: unknown }).action ?? '').trim().toLowerCase();
  const token = String((body as { token?: unknown }).token ?? '').trim();
  const bookingId = String((body as { bookingId?: unknown }).bookingId ?? '').trim();

  // توافق خلفي: بدون action = list (كما كان)
  const action = actionRaw || 'list';

  if (action === 'exchange') {
    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400, headers });
    }
    return handleExchange(request, token);
  }

  if (action === 'confirm') {
    return handleConfirm(request, bookingId);
  }

  if (action === 'list') {
    return handleList(request, token);
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
