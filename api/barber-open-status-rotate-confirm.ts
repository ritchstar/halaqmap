import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  assertBronzeBarberForRotateConfirm,
  buildShopOpenManageUrl,
  rotateBarberOpenStatusToken,
  sendOpenStatusRotateEmail,
} from './_lib/barberOpenStatusService.js';
import {
  getBarberOpenStatusRotateSecret,
  verifyBarberOpenStatusRotateConfirmToken,
} from './_lib/barberOpenStatusRotateToken.js';

export const config = { maxDuration: 25 };

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
      route: 'barber-open-status-rotate-confirm',
      ready: Boolean(getBarberOpenStatusRotateSecret()),
      publicApiGuard: registrationGuardDiagnostics(),
      postBody: '{ "confirmToken": "<from email link ?c=...>" }',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-open-status-rotate-confirm');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = getBarberOpenStatusRotateSecret();
  if (!secret) {
    return Response.json({ error: 'الخدمة غير مهيّأة.' }, { status: 503, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ error: 'الخادم غير مهيّأ.' }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const confirmToken = String((body as { confirmToken?: unknown }).confirmToken ?? '').trim();
  const verified = verifyBarberOpenStatusRotateConfirmToken(confirmToken, secret);
  if (!verified.ok) {
    const msg =
      verified.reason === 'expired'
        ? 'انتهت صلاحية رابط التأكيد. اطلب تجديداً جديداً.'
        : 'رابط التأكيد غير صالح.';
    return Response.json({ error: msg }, { status: 400, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: used } = await supabase
    .from('barber_open_status_rotate_redemptions')
    .select('jti')
    .eq('jti', verified.jti)
    .maybeSingle();
  if (used) {
    return Response.json({ error: 'تم استخدام رابط التأكيد مسبقاً.' }, { status: 409, headers });
  }

  const lookup = await assertBronzeBarberForRotateConfirm(
    supabase,
    verified.barberId,
    verified.email,
    verified.licenseFingerprint,
  );
  if (lookup.ok === false) {
    return Response.json({ error: 'تعذّر التحقق من بيانات الصالون.' }, { status: 403, headers });
  }

  const rotated = await rotateBarberOpenStatusToken(supabase, verified.barberId);
  if (rotated.ok === false) {
    return Response.json({ error: 'تعذّر توليد الرابط الجديد.' }, { status: 500, headers });
  }

  const { error: insErr } = await supabase.from('barber_open_status_rotate_redemptions').insert({
    jti: verified.jti,
    barber_id: verified.barberId,
  });
  if (insErr) {
    return Response.json({ error: 'تعذّر إتمام التأكيد.' }, { status: 500, headers });
  }

  const shopOpenUrl = buildShopOpenManageUrl(rotated.token);

  if (resendApiKey && fromEmail) {
    void sendOpenStatusRotateEmail({
      to: lookup.email,
      barberName: lookup.barberName,
      subject: 'حلاق ماب | تم تجديد رابط مفتوح/مغلق',
      intro:
        'تم تجديد رابط التبديل السريع بنجاح. الرابط القديم لم يعد يعمل. احفظ الرابط الجديد ووزّعه على المناوبين الحاليين فقط.',
      ctaLabel: 'فتح صفحة التبديل',
      ctaUrl: shopOpenUrl,
      footerNote: 'إذا لم تكن أنت من طلب التجديد، تواصل مع الدعم فوراً.',
      resendApiKey,
      fromEmail,
    }).catch((err) => {
      console.warn('[barber-open-status-rotate-confirm] notify email failed:', err);
    });
  }

  return Response.json(
    {
      ok: true,
      barberName: lookup.barberName,
      openStatusToken: rotated.token,
      shopOpenUrl,
    },
    { headers },
  );
}
