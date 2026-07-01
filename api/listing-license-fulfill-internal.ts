/**
 * POST /api/listing-license-fulfill-internal
 * استدعاء داخلي من moyasar-webhook (Edge) أو مسارات الخادم — ليس للعميل العام.
 */
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import {
  buildVoucherEmailBodies,
  fulfillListingLicenseOrder,
  tierLabelAr,
} from './_lib/listingLicenseService.js';
import { buildActivationCertificateEmailBodies } from './_lib/geospatialLicenseAssetService.js';
import {
  buildBronzePartnerActivationEmailBodies,
  buildShopOpenMailUrls,
} from './_lib/bronzePartnerActivationMail.js';
import { siteBaseUrlFromEnv } from './_lib/barberProvisionService.js';
import { tryEmailPartnerUnifiedContractAfterApprove } from './_lib/partnerContractNotify.js';
import { isBronzeTier } from './_lib/partnerTierMail.js';

export const config = { maxDuration: 60 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    return { ok: false, error: raw.slice(0, 400) };
  }
  return { ok: true };
}

type Body = {
  skuCode?: unknown;
  tier?: unknown;
  barberId?: unknown;
  buyerEmail?: unknown;
  buyerName?: unknown;
  paymentChannel?: unknown;
  moyasarPaymentId?: unknown;
  barberSubscriptionId?: unknown;
  registrationRequestId?: unknown;
  amountHalalas?: unknown;
  quantity?: unknown;
  autoRedeem?: unknown;
  metadata?: unknown;
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request): Promise<Response> {
  if (!verifyInternalSecret(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const barberIdRaw = String(body.barberId ?? '').trim();
  const barberId = UUID_RE.test(barberIdRaw) ? barberIdRaw : null;
  const buyerEmail = String(body.buyerEmail ?? '').trim();
  const buyerName = String(body.buyerName ?? 'عميلنا الكريم').trim();
  const paymentChannel = String(body.paymentChannel ?? 'moyasar').trim().toLowerCase();
  const channel =
    paymentChannel === 'bank_transfer' || paymentChannel === 'admin_manual'
      ? paymentChannel
      : 'moyasar';

  const autoRedeem =
    body.autoRedeem === true || body.autoRedeem === 'true' || (Boolean(barberId) && body.autoRedeem !== false);

  const amountRaw = body.amountHalalas;
  const amountHalalas =
    typeof amountRaw === 'number' && Number.isFinite(amountRaw)
      ? Math.trunc(amountRaw)
      : typeof amountRaw === 'string'
        ? Math.trunc(Number.parseFloat(amountRaw))
        : null;

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const quantityRaw = body.quantity;
  const quantity =
    typeof quantityRaw === 'number' && Number.isFinite(quantityRaw)
      ? Math.trunc(quantityRaw)
      : typeof quantityRaw === 'string'
        ? Math.trunc(Number.parseInt(quantityRaw, 10))
        : undefined;

  const result = await fulfillListingLicenseOrder(supabase, {
    skuCode: String(body.skuCode ?? '').trim() || undefined,
    tier: String(body.tier ?? '').trim() || undefined,
    barberId,
    buyerEmail: buyerEmail || null,
    paymentChannel: channel as 'moyasar' | 'bank_transfer' | 'admin_manual',
    moyasarPaymentId: String(body.moyasarPaymentId ?? '').trim() || null,
    barberSubscriptionId: String(body.barberSubscriptionId ?? '').trim() || null,
    registrationRequestId: String(body.registrationRequestId ?? '').trim() || null,
    amountHalalas,
    quantity,
    autoRedeem: Boolean(barberId) && autoRedeem,
    metadata:
      body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
        ? (body.metadata as Record<string, unknown>)
        : {},
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  const codesToEmail =
    result.voucherCodes && result.voucherCodes.length > 0
      ? result.voucherCodes
      : result.plaintextCode
        ? [result.plaintextCode]
        : [];

  const resendKey = (process.env.RESEND_API_KEY ?? '').trim();
  const resendFrom = (process.env.RESEND_FROM_EMAIL ?? '').trim();
  const resendReady = Boolean(resendKey && resendFrom);
  let voucherEmailed = false;
  let activationCertificateEmailed = false;
  let bronzeActivationEmailed = false;
  let contractEmailed = false;

  if (!result.autoRedeemed && codesToEmail.length > 0 && buyerEmail.includes('@') && resendReady) {
    const mail = buildVoucherEmailBodies({
      barberName: buyerName,
      plaintextCode: codesToEmail.join('\n'),
      tierLabelAr: tierLabelAr(result.tier),
      listingDaysGranted: result.listingDaysGranted,
    });
    const sent = await sendResend({
      apiKey: resendKey,
      from: resendFrom,
      to: buyerEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    voucherEmailed = sent.ok;
    if (!sent.ok) {
      console.error('[listing-license-fulfill-internal] voucher_email_failed', sent.error);
    }
  }

  if (result.activationCertificate && buyerEmail.includes('@') && resendReady) {
    const mail = buildActivationCertificateEmailBodies({
      barberName: buyerName,
      certificate: result.activationCertificate,
    });
    const sent = await sendResend({
      apiKey: resendKey,
      from: resendFrom,
      to: buyerEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    activationCertificateEmailed = sent.ok;
    if (!sent.ok) {
      console.error('[listing-license-fulfill-internal] certificate_email_failed', sent.error);
    }
  }

  if (isBronzeTier(result.tier) && buyerEmail.includes('@') && resendReady) {
    let openStatusToken: string | null = null;
    if (barberId) {
      const { data: barberRow } = await supabase
        .from('barbers')
        .select('open_status_token')
        .eq('id', barberId)
        .maybeSingle();
      openStatusToken = barberRow?.open_status_token ? String(barberRow.open_status_token) : null;
    }
    const shopUrls = buildShopOpenMailUrls(openStatusToken);
    const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
    const bronzeMail = buildBronzePartnerActivationEmailBodies({
      barberName: buyerName,
      certificate: result.activationCertificate ?? null,
      shopOpenToggleUrl: shopUrls.shopOpenToggleUrl,
      shopOpenRotateUrl: shopUrls.shopOpenRotateUrl,
      registrationOrderId: String(body.registrationRequestId ?? '').trim() || null,
      policyUrl: `${siteBase}/#/partners/subscription-policy`,
    });
    const sent = await sendResend({
      apiKey: resendKey,
      from: resendFrom,
      to: buyerEmail,
      subject: bronzeMail.subject,
      html: bronzeMail.html,
      text: bronzeMail.text,
    });
    bronzeActivationEmailed = sent.ok;
    if (!sent.ok) {
      console.error('[listing-license-fulfill-internal] bronze_activation_email_failed', sent.error);
    }
  }

  if (barberId && buyerEmail.includes('@') && resendReady) {
    contractEmailed = await tryEmailPartnerUnifiedContractAfterApprove({
      supabase,
      resendApiKey: resendKey,
      resendFrom,
      barberEmail: buyerEmail,
      barberName: buyerName,
      tier: result.tier,
      registrationRequestId: String(body.registrationRequestId ?? '').trim() || null,
      barberId,
    });
    if (!contractEmailed) {
      console.error('[listing-license-fulfill-internal] contract_email_failed', { barberId });
    }
  }

  return Response.json({
    ok: true,
    orderId: result.orderId,
    voucherId: result.voucherId,
    entitlementId: result.entitlementId,
    autoRedeemed: result.autoRedeemed,
    validUntil: result.validUntil,
    listingDaysGranted: result.listingDaysGranted,
    tier: result.tier,
    quantity: result.quantity,
    voucherEmailed,
    activationCertificateEmailed,
    bronzeActivationEmailed,
    contractEmailed,
    geospatialAssetId: result.geospatialAssetId ?? null,
    activationCertificate: result.activationCertificate ?? null,
  });
}
