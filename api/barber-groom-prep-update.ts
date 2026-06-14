import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const GROOM_PREP_CATEGORY = 'تجهيز عريس';

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-barber-portal-session, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function withGroomPrepInSpecialties(specialties: unknown, offered: boolean): string[] {
  const base = Array.isArray(specialties)
    ? specialties.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const without = base.filter((s) => s !== GROOM_PREP_CATEGORY);
  if (!offered) return without;
  if (without.includes(GROOM_PREP_CATEGORY)) return without;
  return [...without, GROOM_PREP_CATEGORY];
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
      route: 'barber-groom-prep-update',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-groom-prep-update');
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
  const offered = Boolean((body as { offered?: unknown }).offered);
  const priceRaw = (body as { priceSar?: unknown }).priceSar;
  const publicVisible = (body as { publicVisible?: unknown }).publicVisible !== false;
  const customerNote = String((body as { customerNote?: unknown }).customerNote ?? '')
    .trim()
    .slice(0, 800);

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

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active, specialties')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return Response.json({ error: selErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as { id: string; email: string; tier: string; is_active: boolean | null; specialties: unknown };
  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tier = String(b.tier ?? '').toLowerCase();
  if (tier !== 'diamond') {
    return Response.json(
      { error: 'Groom prep service controls are available for diamond partners only.' },
      { status: 403, headers },
    );
  }

  let priceSar: number | null = null;
  if (offered) {
    const p = priceRaw == null || priceRaw === '' ? NaN : Number(priceRaw);
    if (!Number.isFinite(p) || p <= 0) {
      return Response.json(
        { error: 'When groom prep is enabled, a displayed price greater than zero is required.' },
        { status: 400, headers },
      );
    }
    priceSar = Math.round(p * 100) / 100;
  }

  const nextSpecialties = withGroomPrepInSpecialties(b.specialties, offered);
  const updatePayload: Record<string, unknown> = {
    groom_prep_offered: offered,
    groom_prep_price_sar: offered ? priceSar : null,
    groom_prep_public_visible: offered ? publicVisible : true,
    groom_prep_customer_note: offered && customerNote ? customerNote : null,
    specialties: nextSpecialties.length ? nextSpecialties : null,
  };

  const { error: upErr } = await supabase.from('barbers').update(updatePayload).eq('id', barberId);
  if (upErr) {
    if (/groom_prep/i.test(upErr.message || '')) {
      return Response.json(
        {
          error: 'groom_prep_columns_missing',
          hint: 'Apply migration 113_barber_groom_prep_service.sql on Supabase.',
        },
        { status: 503, headers },
      );
    }
    return Response.json({ error: upErr.message || 'Update failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true }, { headers });
}
