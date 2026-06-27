import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  BRONZE_ROTATE_GENERIC_ERROR_AR,
  BRONZE_ROTATE_REQUEST_ACK_AR,
  buildShopOpenRotateConfirmUrl,
  resolveBronzeBarberByLicenseAndEmail,
  sendOpenStatusRotateEmail,
} from './_lib/barberOpenStatusService.js';
import {
  getBarberOpenStatusRotateSecret,
  mintBarberOpenStatusRotateConfirmToken,
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
      route: 'barber-open-status-rotate-request',
      ready: Boolean(getBarberOpenStatusRotateSecret()),
      publicApiGuard: registrationGuardDiagnostics(),
      postBody: '{ "licenseCode": "HM-LIC-....", "email": "owner@example.com" }',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-open-status-rotate-request');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = getBarberOpenStatusRotateSecret();
  if (!secret) {
    return Response.json({ error: BRONZE_ROTATE_GENERIC_ERROR_AR }, { status: 503, headers });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ error: BRONZE_ROTATE_GENERIC_ERROR_AR }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const licenseCode = String((body as { licenseCode?: unknown }).licenseCode ?? '').trim();
  const email = String((body as { email?: unknown }).email ?? '').trim();

  const ack = { ok: true, message: BRONZE_ROTATE_REQUEST_ACK_AR };

  if (!licenseCode || !email) {
    return Response.json(ack, { headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const lookup = await resolveBronzeBarberByLicenseAndEmail(supabase, licenseCode, email);
  if (lookup.ok === false) {
    return Response.json(ack, { headers });
  }

  if (!resendApiKey || !fromEmail) {
    return Response.json(ack, { headers });
  }

  const confirmToken = mintBarberOpenStatusRotateConfirmToken(
    lookup.barberId,
    lookup.email,
    lookup.licenseFingerprint,
    secret,
  );
  const confirmUrl = buildShopOpenRotateConfirmUrl(confirmToken);

  const mail = await sendOpenStatusRotateEmail({
    to: lookup.email,
    barberName: lookup.barberName,
    subject: 'حلاق ماب | تأكيد تجديد رابط مفتوح/مغلق',
    intro:
      'طُلب تجديد رابط التبديل السريع لحالة المحل (مفتوح/مغلق). إذا كنت أنت من طلب ذلك، اضغط الزر أدناه خلال 30 دقيقة. إن لم تطلب ذلك، تجاهل الرسالة.',
    ctaLabel: 'تأكيد التجديد',
    ctaUrl: confirmUrl,
    footerNote: 'الرابط يعمل مرة واحدة وينتهي تلقائياً. بعد التأكيد يُبطَل الرابط القديم.',
    resendApiKey,
    fromEmail,
  });

  if (mail.ok === false) {
    console.warn('[barber-open-status-rotate-request] email failed:', mail.error);
  }

  return Response.json(ack, { headers });
}
