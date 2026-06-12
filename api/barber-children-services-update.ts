import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const CHILDREN_CATEGORY = 'حلاقة أطفال';
const CHILDREN_ALIASES = new Set(['حلاقة أطفال', 'أطفال', 'حلاق أطفال', 'صالون أطفال']);

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function withChildrenInSpecialties(specialties: unknown, acceptsChildren: boolean): string[] {
  const base = Array.isArray(specialties)
    ? specialties.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const without = base.filter((s) => !CHILDREN_ALIASES.has(s));
  if (!acceptsChildren) return without;
  if (without.includes(CHILDREN_CATEGORY)) return without;
  return [...without, CHILDREN_CATEGORY];
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
      route: 'barber-children-services-update',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-children-services-update');
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
  const acceptsChildren = Boolean((body as { acceptsChildren?: unknown }).acceptsChildren);
  const childrenSpecialist = acceptsChildren && Boolean((body as { childrenSpecialist?: unknown }).childrenSpecialist);

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
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

  const b = row as { id: string; email: string; is_active: boolean | null; specialties: unknown };
  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const nextSpecialties = withChildrenInSpecialties(b.specialties, acceptsChildren);
  const updatePayload: Record<string, unknown> = {
    specialties: nextSpecialties.length ? nextSpecialties : null,
    children_specialist: childrenSpecialist,
  };

  const { error: upErr } = await supabase.from('barbers').update(updatePayload).eq('id', barberId);
  if (upErr) {
    if (/children_specialist/i.test(upErr.message || '')) {
      return Response.json(
        {
          error: 'children_specialist_column_missing',
          hint: 'Apply migration 108_barber_children_specialist.sql on Supabase.',
        },
        { status: 503, headers },
      );
    }
    return Response.json({ error: upErr.message || 'Update failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true }, { headers });
}
