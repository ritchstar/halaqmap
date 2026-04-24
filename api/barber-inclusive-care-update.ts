import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const SAUDI_WEEK_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

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
  return Response.json(
    {
      ok: true,
      route: 'barber-inclusive-care-update',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

function sanitizeDays(raw: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const o = raw as Record<string, unknown>;
  for (const day of SAUDI_WEEK_DAYS) {
    if (Object.prototype.hasOwnProperty.call(o, day)) {
      out[day] = Boolean(o[day]);
    }
  }
  return out;
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-inclusive-care-update');
  if (guard.ok === false) {
    const { json, status } = guard;
    return Response.json(json, { status, headers });
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
  const restrictDays = Boolean((body as { restrictDays?: unknown }).restrictDays);
  const days = sanitizeDays((body as { days?: unknown }).days);
  const customerNote = String((body as { customerNote?: unknown }).customerNote ?? '').trim().slice(0, 800);

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return Response.json({ error: selErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as { id: string; email: string; tier: string; is_active: boolean | null };
  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tier = String(b.tier ?? '').toLowerCase();
  if (tier !== 'gold' && tier !== 'diamond') {
    return Response.json(
      { error: 'Inclusive care dashboard controls are available for gold and diamond partners only.' },
      { status: 403, headers },
    );
  }

  let priceSar: number | null = null;
  if (offered) {
    const p = priceRaw == null || priceRaw === '' ? NaN : Number(priceRaw);
    if (!Number.isFinite(p) || p <= 0) {
      return Response.json(
        { error: 'When service is enabled, a displayed price greater than zero is required.' },
        { status: 400, headers },
      );
    }
    priceSar = Math.round(p * 100) / 100;
  }

  const updatePayload: Record<string, unknown> = {
    inclusive_care_offered: offered,
    inclusive_care_price_sar: offered ? priceSar : null,
    inclusive_care_public_visible: offered ? publicVisible : true,
    inclusive_care_restrict_days: offered ? restrictDays : false,
    inclusive_care_days: offered && restrictDays ? days : {},
    inclusive_care_customer_note: offered && customerNote ? customerNote : null,
  };

  const { error: upErr } = await supabase.from('barbers').update(updatePayload).eq('id', barberId);
  if (upErr) {
    return Response.json({ error: upErr.message || 'Update failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true }, { headers });
}
