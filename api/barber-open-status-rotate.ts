import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  assertBarberPortalSessionFromRequest,
  extractBarberPortalSessionToken,
  getBarberPortalSessionSecret,
  verifyBarberPortalSessionToken,
} from './_lib/barberPortalAuth.js';
import { resolveSalonMemberRole } from './_lib/salonMemberAuth.js';
import {
  buildShopOpenManageUrl,
  rotateBarberOpenStatusToken,
  sendOpenStatusRotateEmail,
} from './_lib/barberOpenStatusService.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url, x-barber-portal-session, Authorization',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function tierAllowsDashboardRotate(tierRaw: string): boolean {
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
  return Response.json(
    {
      ok: true,
      route: 'barber-open-status-rotate',
      ready: Boolean(getBarberPortalSessionSecret()),
      publicApiGuard: registrationGuardDiagnostics(),
      auth: 'x-barber-portal-session header (owner, gold/diamond only)',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-open-status-rotate');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const sessionSecret = getBarberPortalSessionSecret();
  if (!sessionSecret) {
    return Response.json({ error: 'الخدمة غير مهيّأة.' }, { status: 503, headers });
  }

  const sessionToken = extractBarberPortalSessionToken(request);
  const verified = verifyBarberPortalSessionToken(sessionToken, sessionSecret);
  if (!verified.ok) {
    return Response.json({ error: 'جلسة غير صالحة. سجّل الدخول من لوحة التحكم.' }, { status: 401, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ error: 'الخادم غير مهيّأ.' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, name, email, tier, is_active')
    .eq('id', verified.barberId)
    .maybeSingle();

  if (bErr || !barber) {
    return Response.json({ error: 'الحساب غير موجود.' }, { status: 404, headers });
  }

  const row = barber as {
    id: string;
    name: string | null;
    email: string | null;
    tier: string | null;
    is_active: boolean | null;
  };

  if (row.is_active === false) {
    return Response.json({ error: 'الحساب غير نشط.' }, { status: 403, headers });
  }

  const email = String(row.email ?? '').trim().toLowerCase();
  if (!email || email !== verified.email) {
    return Response.json({ error: 'جلسة لا تطابق حساب الصالون.' }, { status: 403, headers });
  }

  const sessionCheck = assertBarberPortalSessionFromRequest(request, row.id, email);
  if (sessionCheck.ok === false) {
    return Response.json({ error: sessionCheck.message }, { status: sessionCheck.status, headers });
  }

  if (!tierAllowsDashboardRotate(String(row.tier ?? ''))) {
    return Response.json(
      {
        error: 'تجديد الرابط من لوحة التحكم متاح للذهبي والماسي. البرونزي يستخدم مسار الرخصة والبريد.',
        code: 'bronze_use_email_flow',
      },
      { status: 403, headers },
    );
  }

  const role = await resolveSalonMemberRole(supabase, row.id, email);
  if (role !== 'owner') {
    return Response.json(
      { error: 'تجديد الرابط متاح لصاحب الرخصة (المالك) فقط.' },
      { status: 403, headers },
    );
  }

  const rotated = await rotateBarberOpenStatusToken(supabase, row.id);
  if (rotated.ok === false) {
    return Response.json({ error: 'تعذّر توليد الرابط الجديد.' }, { status: 500, headers });
  }

  const shopOpenUrl = buildShopOpenManageUrl(rotated.token);
  const barberName = String(row.name ?? '').trim() || 'صالونك';

  if (resendApiKey && fromEmail) {
    void sendOpenStatusRotateEmail({
      to: email,
      barberName,
      subject: 'حلاق ماب | تم تجديد رابط مفتوح/مغلق',
      intro:
        'تم تجديد رابط التبديل السريع من لوحة التحكم. الرابط القديم لم يعد يعمل — وزّع الرابط الجديد على المناوبين الحاليين فقط.',
      ctaLabel: 'فتح صفحة التبديل',
      ctaUrl: shopOpenUrl,
      footerNote: 'إذا لم تكن أنت من طلب التجديد، غيّر كلمة المرور وتواصل مع الدعم.',
      resendApiKey,
      fromEmail,
    }).catch((err) => {
      console.warn('[barber-open-status-rotate] notify email failed:', err);
    });
  }

  return Response.json(
    {
      ok: true,
      barberName,
      openStatusToken: rotated.token,
      shopOpenUrl,
    },
    { headers },
  );
}
