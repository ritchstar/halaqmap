/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة عامة لصفحة حجوزات عضو الطاقم عبر رابط سري (عرض + منبّه فقط).
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  listStaffTeamBookings,
  resolveTeamMemberByStaffToken,
} from './_lib/namedBarberBookingService.js';

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

function mapStaffError(error: string): { status: number; error: string } {
  if (error === 'invalid_token') return { status: 400, error: 'رابط المتابعة غير صالح.' };
  if (error === 'token_not_found') return { status: 404, error: 'رابط المتابعة غير موجود أو أُعيد إصداره.' };
  if (error === 'salon_inactive') return { status: 409, error: 'هذا الصالون غير مفعّل حالياً.' };
  return { status: 500, error: error || 'تعذّر تحميل الحجوزات.' };
}

async function handleList(request: Request, token: string): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'staff-team-bookings');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 60 });
  if (!secGuard.allowed) return secGuard.response;

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

  const resolved = await resolveTeamMemberByStaffToken(supabase, token);
  if (!resolved.ok) {
    const mapped = mapStaffError(resolved.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const listed = await listStaffTeamBookings(supabase, resolved.member.id);
  if (!listed.ok) {
    const mapped = mapStaffError(listed.error);
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }

  const pendingCount = listed.bookings.filter((b) => b.status === 'pending').length;

  return Response.json(
    {
      ok: true,
      member: {
        id: resolved.member.id,
        displayName: resolved.member.display_name,
        photoUrl: resolved.member.photo_url,
        isActive: resolved.member.is_active,
      },
      salon: {
        id: resolved.member.barber_id,
        name: resolved.salonName,
      },
      bookings: listed.bookings,
      pendingCount,
    },
    { headers },
  );
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
        note: 'GET/POST ?token=… أو body.token — قائمة حجوزات عضو الطاقم فقط',
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

  const token = String((body as { token?: unknown }).token ?? '').trim();
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400, headers });
  }
  return handleList(request, token);
}
