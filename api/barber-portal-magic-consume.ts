import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildInclusiveCareSnapshotFromBarberRow } from './_lib/inclusiveCareBarberSnapshot.js';
import { verifyBarberPortalMagicToken, getBarberPortalMagicSecret } from './_lib/barberPortalMagicToken.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { getBarberPortalSessionSecret, mintBarberPortalSessionToken } from './_lib/barberPortalAuth.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function tierAllowsDashboard(tierRaw: string): boolean {
  const t = String(tierRaw || '').toLowerCase();
  return t === 'gold' || t === 'diamond';
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const sr = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const magic = Boolean(getBarberPortalMagicSecret());
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-magic-consume',
      supabaseUrlSet: Boolean(url),
      supabaseUrlHost: safeHost(url),
      serviceRoleKeySet: sr,
      magicSecretSet: magic,
      ready: Boolean(url) && sr && magic,
      publicApiGuard: registrationGuardDiagnostics(),
      postBody: '{ "token": "<from #/barber/enter?m=...>" }',
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-magic-consume');
  if (!guard.ok) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = getBarberPortalMagicSecret();
  if (!secret) {
    return Response.json(
      { error: 'Magic links disabled (set BARBER_PORTAL_MAGIC_SECRET or REGISTRATION_INTENT_SECRET)' },
      { status: 503, headers }
    );
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== url) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(url),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const token = String((body as { token?: unknown }).token ?? '').trim();
  const verified = verifyBarberPortalMagicToken(token, secret);
  if (!verified.ok) {
    const ar: Record<string, string> = {
      missing_token: 'الرابط ناقص أو غير صالح.',
      malformed: 'الرابط غير صالح.',
      bad_signature: 'الرابط غير موثوق أو مُلاعَب.',
      bad_payload: 'الرابط غير صالح.',
      expired: 'انتهت صلاحية الرابط. اطلب بريداً جديداً من الإدارة أو سجّل الدخول يدوياً.',
    };
    return Response.json(
      { error: ar[verified.reason] || 'الرابط غير صالح.', code: verified.reason },
      { status: 401, headers }
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const selectCols =
    'id, name, email, phone, tier, rating_invite_token, member_number, is_active, inclusive_care_offered, inclusive_care_price_sar, inclusive_care_public_visible, inclusive_care_restrict_days, inclusive_care_days, inclusive_care_customer_note';

  const { data: row, error: loadErr } = await supabase
    .from('barbers')
    .select(selectCols)
    .eq('id', verified.barberId)
    .maybeSingle();

  if (loadErr) {
    return Response.json({ error: loadErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'الحساب غير موجود.' }, { status: 404, headers });
  }

  const b = row as {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    rating_invite_token: string | null;
    member_number: number | null;
    is_active: boolean | null;
    inclusive_care_offered?: boolean | null;
    inclusive_care_price_sar?: unknown;
    inclusive_care_public_visible?: boolean | null;
    inclusive_care_restrict_days?: boolean | null;
    inclusive_care_days?: unknown;
    inclusive_care_customer_note?: string | null;
  };

  const emailNorm = verified.email;
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'البريد لا يطابق هذا الرابط.' }, { status: 403, headers });
  }

  if (b.is_active === false) {
    return Response.json({ error: 'الحساب غير مفعّل.' }, { status: 403, headers });
  }

  if (!tierAllowsDashboard(String(b.tier ?? ''))) {
    return Response.json(
      {
        error: 'باقتك البرونزية لا تتضمن لوحة التحكم الإلكترونية. رقِ للذهبي أو الماسي للوصول.',
        code: 'TIER_BRONZE_NO_DASHBOARD',
      },
      { status: 403, headers }
    );
  }

  const sessionSecret = getBarberPortalSessionSecret();
  const barberSessionToken = sessionSecret ? mintBarberPortalSessionToken(String(b.id), String(b.email ?? ''), sessionSecret) : null;

  const jti = verified.jti;
  const { error: insErr } = await supabase.from('barber_portal_magic_redemptions').insert({
    jti,
    barber_id: verified.barberId,
  });

  if (insErr) {
    const msg = insErr.message || '';
    if (msg.includes('duplicate') || msg.includes('unique') || insErr.code === '23505') {
      return Response.json(
        { error: 'تم استخدام هذا الرابط مسبقاً. استخدم رابطاً جديداً من أحدث بريد أو سجّل الدخول يدوياً.', code: 'magic_already_used' },
        { status: 410, headers }
      );
    }
    return Response.json({ error: insErr.message || 'تعذر تسجيل الدخول السريع.' }, { status: 500, headers });
  }

  return Response.json(
    {
      ok: true,
      barber_session_token: barberSessionToken,
      barber: {
        id: String(b.id),
        name: String(b.name ?? ''),
        email: String(b.email ?? ''),
        phone: String(b.phone ?? ''),
        tier: String(b.tier ?? 'bronze'),
        rating_invite_token: b.rating_invite_token != null ? String(b.rating_invite_token) : '',
        member_number:
          b.member_number != null && Number.isFinite(Number(b.member_number))
            ? Math.floor(Number(b.member_number))
            : null,
        inclusiveCare: buildInclusiveCareSnapshotFromBarberRow(b),
      },
    },
    { headers }
  );
}
