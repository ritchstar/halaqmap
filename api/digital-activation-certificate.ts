/**
 * GET /api/digital-activation-certificate
 * استعلام عام عن شهادة التفعيل الرقمية بعد الدفع (بروتوكول ربط آلي).
 * ?moyasarPaymentId= | ?token=
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import {
  fetchCertificateByMoyasarPaymentId,
  fetchCertificateByPublicToken,
} from './_lib/geospatialLicenseAssetService.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
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
  const guard = runRegistrationRouteGuards(request, 'digital-activation-certificate');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = new URL(request.url);
  const moyasarPaymentId = (url.searchParams.get('moyasarPaymentId') || '').trim();
  const token = (url.searchParams.get('token') || '').trim();

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (token) {
    const result = await fetchCertificateByPublicToken(supabase, token);
    if (!result.ok) {
      const status = result.error === 'certificate_not_found' ? 404 : 410;
      return Response.json({ ok: false, error: result.error }, { status, headers });
    }
    return Response.json({ ok: true, certificate: result.certificate }, { headers });
  }

  if (!moyasarPaymentId) {
    return Response.json(
      { ok: false, error: 'missing_query', hint: 'Provide moyasarPaymentId or token' },
      { status: 400, headers },
    );
  }

  const result = await fetchCertificateByMoyasarPaymentId(supabase, moyasarPaymentId);
  if (!result.ok) {
    const status =
      result.error === 'order_not_found' || result.error === 'certificate_not_found' ? 404 : 410;
    return Response.json({ ok: false, error: result.error }, { status, headers });
  }

  return Response.json(
    { ok: true, orderId: result.orderId, certificate: result.certificate },
    { headers },
  );
}
