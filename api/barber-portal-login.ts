import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildInclusiveCareSnapshotFromBarberRow } from './_lib/inclusiveCareBarberSnapshot.js';
import { buildChildrenServicesSnapshotFromBarberRow } from './_lib/childrenServicesBarberSnapshot.js';
import { buildHomeServiceSnapshotFromBarberRow } from './_lib/homeServiceBarberSnapshot.js';
import { buildGroomPrepSnapshotFromBarberRow } from './_lib/groomPrepBarberSnapshot.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { getBarberPortalSessionSecret, mintBarberPortalSessionToken } from './_lib/barberPortalAuth.js';
import { resolveSalonMemberRole } from './_lib/salonMemberAuth.js';

export const config = {
  maxDuration: 30,
};

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

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
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const portalPw = Boolean((process.env.BARBER_PORTAL_PASSWORD || '').trim());
  const anonKey = Boolean(
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
  );
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-login',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      barberPortalPasswordSet: portalPw,
      supabaseAnonKeySet: anonKey,
      publicApiGuard: registrationGuardDiagnostics(),
      ready: Boolean(resolvedUrl) && serviceRole && (portalPw || anonKey),
      loginModesNote:
        'يقبل إما BARBER_PORTAL_PASSWORD (رمز موحّد) أو بريد/كلمة مرور حساب Supabase (بعد اعتماد الإدارة وإنشاء المستخدم).',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-login');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const portalPassword = (process.env.BARBER_PORTAL_PASSWORD || '').trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }
  if (!portalPassword && !anonKey) {
    return Response.json(
      {
        error: 'Login not configured',
        hint: 'Set BARBER_PORTAL_PASSWORD (رمز موحّد) و/أو SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY لتفعيل الدخول ببريد/كلمة مرور Supabase.',
      },
      { status: 503, headers },
    );
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== url) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(url),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();
  const password = String((body as { password?: unknown }).password ?? '');

  if (!rawEmail || !password) {
    return Response.json({ error: 'Missing email or password' }, { status: 400, headers });
  }

  let passwordAccepted = Boolean(portalPassword) && password === portalPassword;
  let authSession: { access_token: string; refresh_token: string } | null = null;
  if (!passwordAccepted && anonKey) {
    const anonClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signData, error: signErr } = await anonClient.auth.signInWithPassword({
      email: rawEmail,
      password,
    });
    if (!signErr) {
      passwordAccepted = true;
      const session = signData.session;
      if (session?.access_token && session.refresh_token) {
        authSession = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        };
      }
      await anonClient.auth.signOut();
    }
  }
  if (!passwordAccepted) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const selectCols =
    'id, name, email, phone, tier, rating_invite_token, member_number, is_active, open_for_customers, open_status_token, specialties, children_specialist, inclusive_care_offered, inclusive_care_price_sar, inclusive_care_public_visible, inclusive_care_restrict_days, inclusive_care_days, inclusive_care_customer_note, home_service_offered, home_service_price_sar, home_service_radius_km, home_service_public_visible, home_service_customer_note, groom_prep_offered, groom_prep_price_sar, groom_prep_public_visible, groom_prep_customer_note';

  type BarberPortalRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    rating_invite_token: string | null;
    member_number: number | null;
    is_active: boolean | null;
    open_for_customers?: boolean | null;
    open_status_token?: string | null;
    specialties?: unknown;
    children_specialist?: boolean | null;
    inclusive_care_offered?: boolean | null;
    inclusive_care_price_sar?: unknown;
    inclusive_care_public_visible?: boolean | null;
    inclusive_care_restrict_days?: boolean | null;
    inclusive_care_days?: unknown;
    inclusive_care_customer_note?: string | null;
    home_service_offered?: boolean | null;
    home_service_price_sar?: unknown;
    home_service_radius_km?: unknown;
    home_service_public_visible?: boolean | null;
    home_service_customer_note?: string | null;
    groom_prep_offered?: boolean | null;
    groom_prep_price_sar?: unknown;
    groom_prep_public_visible?: boolean | null;
    groom_prep_customer_note?: string | null;
  };

  let barber: BarberPortalRow | null = null;
  let error: { message?: string } | null = null;

  const tryEq = async (addr: string) => {
    const r = await supabase.from('barbers').select(selectCols).eq('email', addr).maybeSingle();
    return r;
  };

  const r0 = await tryEq(rawEmail);
  if (r0.error) error = r0.error;
  else if (r0.data) barber = r0.data as BarberPortalRow;

  if (!barber && !error) {
    const r1 = await tryEq(rawEmail.toLowerCase());
    if (r1.error) error = r1.error;
    else if (r1.data) barber = r1.data as BarberPortalRow;
  }

  if (!barber && !error) {
    const r2 = await supabase
      .from('barbers')
      .select(selectCols)
      .ilike('email', rawEmail)
      .maybeSingle();
    if (r2.error) error = r2.error;
    else if (r2.data) barber = r2.data as BarberPortalRow;
  }

  if (error) {
    return Response.json({ error: error.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!barber || barber.is_active === false) {
    return Response.json({ error: 'No active barber account for this email' }, { status: 404, headers });
  }

  const tierNorm = String(barber.tier ?? '').toLowerCase();
  if (tierNorm !== 'gold' && tierNorm !== 'diamond') {
    return Response.json(
      {
        error:
          'باقتك البرونزية لا تتضمن لوحة التحكم الإلكترونية. للوصول إلى المحادثات والتقييمات والجدولة رقِّ باقتك إلى الذهبي أو الماسي.',
        code: 'TIER_BRONZE_NO_DASHBOARD',
      },
      { status: 403, headers }
    );
  }

  const sessionSecret = getBarberPortalSessionSecret();
  const barberSessionToken = sessionSecret
    ? mintBarberPortalSessionToken(String(barber.id), String(barber.email ?? ''), sessionSecret)
    : null;

  const salonRole = await resolveSalonMemberRole(supabase, String(barber.id), String(barber.email ?? ''));

  return Response.json(
    {
      ok: true,
      barber_session_token: barberSessionToken,
      salon_role: salonRole,
      barber: {
        id: String(barber.id),
        name: String(barber.name ?? ''),
        email: String(barber.email ?? ''),
        phone: String(barber.phone ?? ''),
        tier: String(barber.tier ?? 'bronze'),
        rating_invite_token: barber.rating_invite_token != null ? String(barber.rating_invite_token) : '',
        member_number:
          barber.member_number != null && Number.isFinite(Number(barber.member_number))
            ? Math.floor(Number(barber.member_number))
            : null,
        open_for_customers: barber.open_for_customers !== false,
        open_status_token:
          barber.open_status_token != null && String(barber.open_status_token).trim()
            ? String(barber.open_status_token).trim()
            : '',
        inclusiveCare: buildInclusiveCareSnapshotFromBarberRow(barber),
        childrenServices: buildChildrenServicesSnapshotFromBarberRow(barber),
        homeService: buildHomeServiceSnapshotFromBarberRow(barber),
        groomPrep: buildGroomPrepSnapshotFromBarberRow(barber),
      },
      ...(authSession ? { authSession } : {}),
    },
    { headers },
  );
}
