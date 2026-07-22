/**
 * تصحيح حقول طلب التسجيل من لوحة الأدمن عبر service_role.
 * POST /api/admin-registration-submission-patch
 * body: { requestId, patch: { email?, phone?, barberName?, location? } }
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const HM_ID_RE = /^HM-[A-Z0-9-]{6,64}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function parseCoord(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const sec = await runSecurityGuard(request, { sensitiveRoute: false, rateLimit: 60 });
  if (!sec.allowed) return sec.response;

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'review_requests',
    'manage_barbers',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const requestId = String(body.requestId ?? '').trim();
  if (!HM_ID_RE.test(requestId)) {
    return Response.json({ error: 'invalid_request_id' }, { status: 400, headers });
  }

  const patchIn =
    body.patch && typeof body.patch === 'object' && !Array.isArray(body.patch)
      ? (body.patch as Record<string, unknown>)
      : null;
  if (!patchIn) {
    return Response.json({ error: 'invalid_patch' }, { status: 400, headers });
  }

  const { data: row, error: fetchErr } = await auth.supabase
    .from('registration_submissions')
    .select('id, payload')
    .eq('id', requestId)
    .maybeSingle();
  if (fetchErr) {
    return Response.json({ error: fetchErr.message }, { status: 500, headers });
  }
  if (!row?.payload || typeof row.payload !== 'object' || Array.isArray(row.payload)) {
    return Response.json({ error: 'request_not_found' }, { status: 404, headers });
  }

  const payload = { ...(row.payload as Record<string, unknown>) };
  const applied: string[] = [];

  if (patchIn.email !== undefined) {
    const email = String(patchIn.email ?? '')
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: 'invalid_email' }, { status: 400, headers });
    }
    payload.email = email;
    applied.push('email');
  }
  if (patchIn.phone !== undefined) {
    const phone = String(patchIn.phone ?? '').trim();
    if (phone.length < 8) {
      return Response.json({ error: 'invalid_phone' }, { status: 400, headers });
    }
    payload.phone = phone;
    applied.push('phone');
  }
  if (patchIn.barberName !== undefined) {
    const name = String(patchIn.barberName ?? '').trim();
    if (!name) {
      return Response.json({ error: 'invalid_barber_name' }, { status: 400, headers });
    }
    payload.barberName = name;
    applied.push('barberName');
  }
  if (patchIn.location !== undefined && patchIn.location && typeof patchIn.location === 'object') {
    const locIn = patchIn.location as Record<string, unknown>;
    const prev =
      payload.location && typeof payload.location === 'object' && !Array.isArray(payload.location)
        ? (payload.location as Record<string, unknown>)
        : {};
    const lat = locIn.lat !== undefined ? parseCoord(locIn.lat) : parseCoord(prev.lat);
    const lng = locIn.lng !== undefined ? parseCoord(locIn.lng) : parseCoord(prev.lng);
    const address =
      locIn.address !== undefined
        ? String(locIn.address ?? '').trim()
        : String(prev.address ?? '').trim();
    if (lat == null || lng == null) {
      return Response.json({ error: 'invalid_location' }, { status: 400, headers });
    }
    payload.location = { lat, lng, address: address || 'غير محدد' };
    applied.push('location');
  }

  if (applied.length === 0) {
    return Response.json({ error: 'empty_patch' }, { status: 400, headers });
  }

  const { error: updErr } = await auth.supabase
    .from('registration_submissions')
    .update({ payload })
    .eq('id', requestId);
  if (updErr) {
    return Response.json({ error: updErr.message }, { status: 500, headers });
  }

  console.info('[admin-registration-submission-patch]', {
    actor: auth.actorEmail,
    requestId,
    applied,
  });

  return Response.json(
    {
      ok: true,
      requestId,
      applied,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      barberName: payload.barberName ?? null,
      location: payload.location ?? null,
    },
    { headers },
  );
}
