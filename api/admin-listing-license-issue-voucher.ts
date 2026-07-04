/**
 * إصدار رمز حزمة إدراج برمجية يدوياً (تحويل بنكي / إدارة).
 * POST + جلسة إدارية + review_payments أو manage_partner_billing
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildVoucherEmailBodies,
  fulfillListingLicenseOrder,
  tierLabelAr,
} from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { resolveResendFromAddress } from './_lib/resendFrom.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

async function sendResend(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: resolveResendFromAddress(input.from),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) return { ok: false, error: raw.slice(0, 400) };
  return { ok: true };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

type PostBody = {
  skuCode?: unknown;
  barberId?: unknown;
  buyerEmail?: unknown;
  barberName?: unknown;
  sendEmail?: unknown;
  autoRedeem?: unknown;
  adminNotes?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'review_payments',
    'manage_partner_billing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }
  const { supabase, actorEmail } = auth;

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const skuCode = String(body.skuCode ?? '').trim().toLowerCase();
  const barberId = String(body.barberId ?? '').trim();
  const buyerEmail = String(body.buyerEmail ?? '').trim();
  const barberName = String(body.barberName ?? 'عميلنا الكريم').trim();
  const sendEmail = body.sendEmail !== false;
  const autoRedeem = body.autoRedeem === true;
  const adminNotes = String(body.adminNotes ?? '').trim();

  if (!skuCode) {
    return Response.json({ error: 'missing_sku' }, { status: 400, headers });
  }
  if (autoRedeem && !UUID_RE.test(barberId)) {
    return Response.json({ error: 'invalid_barber_id_for_auto_redeem' }, { status: 400, headers });
  }

  let resolvedEmail = buyerEmail;
  if (UUID_RE.test(barberId)) {
    const { data: b } = await supabase.from('barbers').select('email, name').eq('id', barberId).maybeSingle();
    if (b?.email) resolvedEmail = String(b.email).trim();
  }

  const result = await fulfillListingLicenseOrder(supabase, {
    skuCode,
    barberId: UUID_RE.test(barberId) ? barberId : null,
    buyerEmail: resolvedEmail || null,
    paymentChannel: 'admin_manual',
    paymentReference: `admin:${actorEmail}:${Date.now()}`,
    autoRedeem: autoRedeem && UUID_RE.test(barberId),
    metadata: {
      admin_issued_by: actorEmail,
      admin_notes: adminNotes || null,
    },
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status ?? 500, headers });
  }

  let emailSent = false;
  if (
    sendEmail &&
    !result.autoRedeemed &&
    result.plaintextCode &&
    resolvedEmail.includes('@')
  ) {
    const resendKey = (process.env.RESEND_API_KEY ?? '').trim();
    const resendFrom = (process.env.RESEND_FROM_EMAIL ?? '').trim();
    if (resendKey && resendFrom) {
      const mail = buildVoucherEmailBodies({
        barberName,
        plaintextCode: result.plaintextCode,
        tierLabelAr: tierLabelAr(result.tier),
        listingDaysGranted: result.listingDaysGranted,
      });
      const mailResult = await sendResend({
        apiKey: resendKey,
        from: resendFrom,
        to: resolvedEmail,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      emailSent = mailResult.ok;
    }
  }

  return Response.json(
    {
      ok: true,
      orderId: result.orderId,
      voucherId: result.voucherId,
      entitlementId: result.entitlementId,
      autoRedeemed: result.autoRedeemed,
      validUntil: result.validUntil,
      listingDaysGranted: result.listingDaysGranted,
      tier: result.tier,
      /** يُعرض مرة واحدة للإدارة عند الإصدار اليدوي */
      voucherCode: result.plaintextCode ?? null,
      emailSent,
    },
    { headers },
  );
}
