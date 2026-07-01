/**
 * POST/GET /api/resend-partner-activation-mails
 * إعادة إرسال بريد التفعيل (شهادة + برونزي + عقد) لعملية دفع مكتملة.
 *
 * GET: ?paymentId=<moyasar-uuid> أو ?registrationRequestId=HM-...
 * POST: نفس المعاملات في JSON — أو مصادقة إدارة.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { verifyManageBarbersAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { fetchCertificateByOrderId } from './_lib/geospatialLicenseAssetService.js';
import type { DigitalActivationCertificatePayload } from './_lib/geospatialLicenseDoctrine.js';
import { dispatchPartnerActivationMails } from './_lib/partnerActivationMailDispatch.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 60 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-listing-license-internal-secret',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function verifyInternalSecret(request: Request): boolean {
  const secret = (process.env.LISTING_LICENSE_INTERNAL_SECRET || '').trim();
  if (secret.length < 16) return false;
  const sent = request.headers.get('x-listing-license-internal-secret')?.trim() || '';
  if (!sent) return false;
  try {
    const a = Buffer.from(secret, 'utf8');
    const b = Buffer.from(sent, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type ResendInput = {
  paymentId: string;
  registrationRequestId: string;
  forceContract: boolean;
};

function parseResendInput(request: Request, body?: Record<string, unknown>): ResendInput {
  const url = new URL(request.url);
  const paymentId = (
    (body?.paymentId != null ? String(body.paymentId) : '') ||
    (body?.moyasarPaymentId != null ? String(body.moyasarPaymentId) : '') ||
    url.searchParams.get('paymentId') ||
    url.searchParams.get('moyasarPaymentId') ||
    url.searchParams.get('id') ||
    ''
  ).trim();
  const registrationRequestId = (
    (body?.registrationRequestId != null ? String(body.registrationRequestId) : '') ||
    (body?.requestId != null ? String(body.requestId) : '') ||
    url.searchParams.get('registrationRequestId') ||
    url.searchParams.get('requestId') ||
    ''
  ).trim();
  const forceRaw =
    body?.forceContract ??
    url.searchParams.get('forceContract') ??
    url.searchParams.get('force');
  const forceContract =
    forceRaw === true ||
    forceRaw === 'true' ||
    forceRaw === '1' ||
    forceRaw === 1;
  return { paymentId, registrationRequestId, forceContract };
}

type PaidOrderRow = {
  id: string;
  barber_id: string | null;
  registration_request_id: string | null;
  buyer_email: string | null;
  product_id: string;
  metadata?: Record<string, unknown> | null;
};

async function resolveActivationContext(
  supabase: SupabaseClient,
  input: ResendInput,
): Promise<
  | {
      ok: true;
      buyerEmail: string;
      buyerName: string;
      tier: string;
      barberId: string | null;
      registrationRequestId: string | null;
      certificate: DigitalActivationCertificatePayload;
      orderId: string;
      paymentMetadata?: Record<string, unknown>;
    }
  | { ok: false; error: string; status: number }
> {
  let orderRow: PaidOrderRow | null = null;

  if (input.paymentId && UUID_RE.test(input.paymentId)) {
    const { data, error } = await supabase
      .from('listing_license_orders')
      .select('id, barber_id, registration_request_id, buyer_email, product_id, metadata')
      .eq('moyasar_payment_id', input.paymentId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message, status: 500 };
    orderRow = data as PaidOrderRow | null;
  } else if (input.registrationRequestId && ORDER_ID_RE.test(input.registrationRequestId)) {
    const { data, error } = await supabase
      .from('listing_license_orders')
      .select('id, barber_id, registration_request_id, buyer_email, product_id, metadata')
      .eq('registration_request_id', input.registrationRequestId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { ok: false, error: error.message, status: 500 };
    orderRow = data as PaidOrderRow | null;
  } else {
    return { ok: false, error: 'invalid_query', status: 400 };
  }

  if (!orderRow?.id) {
    return { ok: false, error: 'order_not_found', status: 404 };
  }

  const cert = await fetchCertificateByOrderId(supabase, orderRow.id);
  if (!cert.ok) {
    return { ok: false, error: cert.error, status: 404 };
  }

  return buildContextFromOrder(supabase, orderRow, cert.certificate, orderRow.id);
}

async function buildContextFromOrder(
  supabase: SupabaseClient,
  orderRow: PaidOrderRow,
  certificate: DigitalActivationCertificatePayload,
  orderId: string,
): Promise<
  | {
      ok: true;
      buyerEmail: string;
      buyerName: string;
      tier: string;
      barberId: string | null;
      registrationRequestId: string | null;
      certificate: DigitalActivationCertificatePayload;
      orderId: string;
      paymentMetadata?: Record<string, unknown>;
    }
  | { ok: false; error: string; status: number }
> {
  const barberId = orderRow.barber_id && UUID_RE.test(String(orderRow.barber_id)) ? String(orderRow.barber_id) : null;
  let buyerEmail = orderRow.buyer_email?.trim() || '';
  let buyerName = 'شريك حلاق ماب';
  let tier = certificate.tier || 'bronze';

  if (barberId) {
    const { data: barber } = await supabase
      .from('barbers')
      .select('email, name, tier')
      .eq('id', barberId)
      .maybeSingle();
    if (barber?.email && String(barber.email).includes('@')) buyerEmail = String(barber.email).trim();
    if (barber?.name) buyerName = String(barber.name).trim();
    if (barber?.tier) tier = String(barber.tier);
  }

  const registrationRequestId = orderRow.registration_request_id
    ? String(orderRow.registration_request_id).trim()
    : null;

  if (registrationRequestId) {
    const { data: reg } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', registrationRequestId)
      .maybeSingle();
    const payload =
      reg?.payload && typeof reg.payload === 'object' && !Array.isArray(reg.payload)
        ? (reg.payload as Record<string, unknown>)
        : null;
    if (!buyerEmail.includes('@') && typeof payload?.email === 'string') {
      buyerEmail = payload.email.trim();
    }
    const bn =
      typeof payload?.barberName === 'string'
        ? payload.barberName
        : typeof payload?.shopName === 'string'
          ? payload.shopName
          : '';
    if (bn.trim()) buyerName = bn.trim();
  }

  if (!buyerEmail.includes('@')) {
    return { ok: false, error: 'buyer_email_missing', status: 422 };
  }

  return {
    ok: true,
    buyerEmail,
    buyerName,
    tier,
    barberId,
    registrationRequestId,
    certificate,
    orderId,
    paymentMetadata:
      orderRow.metadata && typeof orderRow.metadata === 'object' && !Array.isArray(orderRow.metadata)
        ? (orderRow.metadata as Record<string, unknown>)
        : undefined,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function handleResend(request: Request, body?: Record<string, unknown>): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const isPost = request.method === 'POST';
  const internalOk = verifyInternalSecret(request);
  let adminOk = false;

  if (isPost && !internalOk) {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (url && serviceRole) {
      const admin = await verifyManageBarbersAdminFromRequest(request, url, serviceRole);
      adminOk = admin.ok;
    }
  }

  if (!internalOk && !adminOk) {
    if (request.method === 'GET') {
      const guard = runRegistrationRouteGuards(request, 'resend-partner-activation-mails');
      if (guard.ok === false) {
        return Response.json(guard.json, { status: guard.status, headers });
      }
    } else {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });
    }
  }

  const input = parseResendInput(request, body);
  if (!input.paymentId && !input.registrationRequestId) {
    return Response.json(
      {
        ok: false,
        error: 'missing_query',
        hint: 'Provide paymentId or registrationRequestId (HM-...)',
      },
      { status: 400, headers },
    );
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ctx = await resolveActivationContext(supabase, input);
  if (!ctx.ok) {
    return Response.json({ ok: false, error: ctx.error }, { status: ctx.status, headers });
  }

  const mail = await dispatchPartnerActivationMails(supabase, {
    buyerEmail: ctx.buyerEmail,
    buyerName: ctx.buyerName,
    tier: ctx.tier,
    barberId: ctx.barberId,
    registrationRequestId: ctx.registrationRequestId,
    activationCertificate: ctx.certificate,
    forceContract: input.forceContract,
    paymentMetadata: ctx.paymentMetadata,
  });

  const sentOk = mail.unifiedActivationEmailed;

  return Response.json(
    {
      ok: sentOk || mail.errors.length === 0,
      orderId: ctx.orderId,
      tier: ctx.tier,
      buyerEmail: ctx.buyerEmail,
      certificateNumber: ctx.certificate.certificateNumber,
      ...mail,
    },
    { headers },
  );
}

export async function GET(request: Request): Promise<Response> {
  return handleResend(request);
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown> | undefined;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = undefined;
  }
  return handleResend(request, body);
}
