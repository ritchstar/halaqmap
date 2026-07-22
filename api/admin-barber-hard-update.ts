/**
 * تعديل جنائي لبيانات الصالون — للمؤسس/من يملك manage_barbers عبر service_role.
 * POST /api/admin-barber-hard-update
 * body: { barberId, patch?, restoreTrialGeo?: boolean }
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { applyApprovedBronzeTrialGeoToBarber } from './_lib/bronzeTrialGeoSync.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function parseCoord(raw: unknown): number | null {
  if (raw === null) return null;
  if (raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

const ALLOWED_PATCH_KEYS = [
  'name',
  'email',
  'phone',
  'city',
  'address',
  'latitude',
  'longitude',
  'tier',
  'is_active',
  'is_verified',
  'open_for_customers',
  'profile_image',
  'cover_image',
  'specialties',
] as const;

type PatchKey = (typeof ALLOWED_PATCH_KEYS)[number];

function sanitizePatch(raw: unknown): Record<string, unknown> | { error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'invalid_patch' };
  }
  const src = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_PATCH_KEYS) {
    if (!(key in src)) continue;
    const v = src[key];
    if (key === 'latitude' || key === 'longitude') {
      out[key] = parseCoord(v);
      continue;
    }
    if (key === 'is_active' || key === 'is_verified' || key === 'open_for_customers') {
      out[key] = v === true;
      continue;
    }
    if (key === 'tier') {
      const t = String(v ?? '').trim().toLowerCase();
      if (t !== 'bronze' && t !== 'gold' && t !== 'diamond') return { error: 'invalid_tier' };
      out[key] = t;
      continue;
    }
    if (key === 'specialties') {
      if (v == null) {
        out[key] = null;
      } else if (Array.isArray(v)) {
        out[key] = v.map((x) => String(x).trim()).filter(Boolean).slice(0, 40);
      } else if (typeof v === 'string') {
        out[key] = v
          .split(/[,،]/)
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 40);
      } else {
        return { error: 'invalid_specialties' };
      }
      continue;
    }
    if (key === 'profile_image' || key === 'cover_image' || key === 'city' || key === 'address') {
      const s = v == null ? null : String(v).trim();
      out[key] = s || null;
      continue;
    }
    if (key === 'name' || key === 'email' || key === 'phone') {
      const s = String(v ?? '').trim();
      if (!s) return { error: `missing_${key}` };
      out[key] = key === 'email' ? s.toLowerCase() : s;
    }
  }
  return out;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  // جلسة أدمن موثّقة — لا نمرّر حارس IP العام حتى لا يُعطَّل تعديل المؤسس.
  const sec = await runSecurityGuard(request, { sensitiveRoute: false, rateLimit: 120 });
  if (!sec.allowed) return sec.response;

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
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

  const barberId = String(body.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) {
    return Response.json({ error: 'invalid_barber_id' }, { status: 400, headers });
  }

  if (body.restoreTrialGeo === true) {
    const geo = await applyApprovedBronzeTrialGeoToBarber(auth.supabase, { barberId });
    if (!geo.ok) {
      return Response.json({ error: geo.error }, { status: 500, headers });
    }
    if (!geo.applied) {
      return Response.json(
        { error: 'no_approved_trial_application_geo', hint: 'لا يوجد طلب تجربة موافق عليه لهذا البريد.' },
        { status: 404, headers },
      );
    }
    const { data: row } = await auth.supabase
      .from('barbers')
      .select(
        'id, member_number, name, email, phone, city, address, latitude, longitude, tier, is_active, is_verified, open_for_customers, profile_image, cover_image, specialties, created_at',
      )
      .eq('id', barberId)
      .maybeSingle();
    return Response.json(
      {
        ok: true,
        restoredTrialGeo: true,
        actorEmail: auth.actorEmail,
        barber: row,
        geo: geo.geo,
      },
      { headers },
    );
  }

  const patchOrErr = sanitizePatch(body.patch);
  if ('error' in patchOrErr) {
    return Response.json({ error: patchOrErr.error }, { status: 400, headers });
  }
  const patch = patchOrErr as Record<PatchKey, unknown>;
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: 'empty_patch' }, { status: 400, headers });
  }

  const now = new Date().toISOString();
  const { data: updated, error } = await auth.supabase
    .from('barbers')
    .update({ ...patch, updated_at: now })
    .eq('id', barberId)
    .select(
      'id, member_number, name, email, phone, city, address, latitude, longitude, tier, is_active, is_verified, open_for_customers, profile_image, cover_image, specialties, created_at',
    )
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }
  if (!updated?.id) {
    return Response.json({ error: 'barber_not_found' }, { status: 404, headers });
  }

  console.info('[admin-barber-hard-update]', {
    actor: auth.actorEmail,
    barberId,
    keys: Object.keys(patch),
  });

  return Response.json({ ok: true, actorEmail: auth.actorEmail, barber: updated }, { headers });
}
