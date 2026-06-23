import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import {
  MENS_GROOMING_CENTER_CATEGORY_AR,
  MENS_GROOMING_MANDATORY_HAIRCUT_AR,
  normalizeGroomingCenterBannerLines,
  resolveMensGroomingCenterFlag,
} from './_lib/mensGroomingCenterPolicy.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

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

function withGroomingSpecialties(specialties: unknown, active: boolean): string[] {
  const base = Array.isArray(specialties)
    ? specialties.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const without = base.filter(
    (s) => s !== MENS_GROOMING_CENTER_CATEGORY_AR && s !== MENS_GROOMING_MANDATORY_HAIRCUT_AR,
  );
  if (!active) return without;
  const next = [...without, MENS_GROOMING_MANDATORY_HAIRCUT_AR, MENS_GROOMING_CENTER_CATEGORY_AR];
  return [...new Set(next)];
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
      route: 'barber-mens-grooming-center-update',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-mens-grooming-center-update');
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

  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();
  const bannerLines = normalizeGroomingCenterBannerLines(
    (body as { groomingCenterBannerLines?: unknown }).groomingCenterBannerLines,
  );

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  if (bannerLines.length < 2) {
    return Response.json(
      { error: 'أضف خدمتين على الأقل — حلاقة رجالية وخدمة أخرى.' },
      { status: 400, headers },
    );
  }

  const authGate = assertBarberPortalSessionFromRequest(request, barberId, rawEmail);
  if (!authGate.ok) {
    return Response.json({ error: authGate.message }, { status: authGate.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active, specialties, mens_grooming_center')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return Response.json({ error: selErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as {
    id: string;
    email: string;
    tier: string;
    is_active: boolean | null;
    specialties: unknown;
    mens_grooming_center?: boolean | null;
  };

  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tier = String(b.tier ?? '').toLowerCase();
  if (tier !== 'diamond' || b.mens_grooming_center !== true) {
    return Response.json(
      { error: 'مسار مراكز العناية بالرجل متاح للشركاء الماسيين المفعّلين فقط.' },
      { status: 403, headers },
    );
  }

  const hasMensHaircut = bannerLines.some(
    (line) => line === MENS_GROOMING_MANDATORY_HAIRCUT_AR || line.includes('حلاقة رجال'),
  );
  if (!hasMensHaircut) {
    return Response.json(
      { error: 'يجب تضمين «حلاقة رجالي» ضمن خدمات البنر.' },
      { status: 400, headers },
    );
  }

  const mensGroomingCenter = resolveMensGroomingCenterFlag({
    requested: true,
    tier: b.tier,
    hasMensHaircutInSpecialties: true,
  });

  const updatePayload: Record<string, unknown> = {
    specialties: withGroomingSpecialties(b.specialties, mensGroomingCenter),
    mens_grooming_center: mensGroomingCenter,
    grooming_center_banner_lines: bannerLines,
  };

  const { error: upErr } = await supabase.from('barbers').update(updatePayload).eq('id', barberId);
  if (upErr) {
    if (/mens_grooming_center|grooming_center_banner_lines/i.test(upErr.message || '')) {
      return Response.json(
        {
          error: 'mens_grooming_center_columns_missing',
          hint: 'Apply migration 118_barber_mens_grooming_center.sql on Supabase.',
        },
        { status: 503, headers },
      );
    }
    return Response.json({ error: upErr.message || 'Update failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true }, { headers });
}
