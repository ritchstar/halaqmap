import type { SupabaseClient } from '@supabase/supabase-js';
import { buildShopOpenMailUrls } from './bronzePartnerActivationMail.js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import type { PartnerUnifiedContractFields } from './partnerUnifiedContractAr.js';
import { loadStaticUnifiedContractPdf } from './partnerUnifiedContractStatic.js';
import {
  RATING_QR_CONTENT_ID,
  resolveDashboardSupplementForBarber,
} from './partnerOnboardingMailBuild.js';
import { buildUnifiedPartnerActivationEmailBodies } from './partnerUnifiedActivationMail.js';
import { isBronzeTier, tierLabelAr } from './partnerTierMail.js';
import { resolveResendFromAddress } from './resendFrom.js';
import { rotateBarberPortalLoginPassword } from './barberProvisionService.js';

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendResendEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{ filename: string; content: string; content_id?: string }>;
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
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    return { ok: false, error: raw.slice(0, 400) };
  }
  return { ok: true };
}

async function sendResendEmailWithRetry(
  input: Parameters<typeof sendResendEmail>[0],
  opts?: { attempts?: number; delayMs?: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const attempts = opts?.attempts ?? 3;
  const delayMs = opts?.delayMs ?? 700;
  let lastError = 'send_failed';
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(delayMs * i);
    const sent = await sendResendEmail(input);
    if (sent.ok) return sent;
    lastError = sent.error;
    if (!/too many requests|rate limit/i.test(sent.error)) return sent;
  }
  return { ok: false, error: lastError };
}

export type PartnerActivationMailDispatchInput = {
  buyerEmail: string;
  buyerName: string;
  tier: string;
  barberId: string | null;
  registrationRequestId: string | null;
  activationCertificate: DigitalActivationCertificatePayload | null;
  /** إعادة إرسال العقد حتى لو أُرسل مسبقاً */
  forceContract?: boolean;
  /** بيانات الدفع (مثلاً digital_shift_addon) */
  paymentMetadata?: Record<string, unknown>;
};

export type PartnerActivationMailDispatchResult = {
  resendConfigured: boolean;
  /** بريد واحد موحّد (شهادة + برونزي إن وُجد + عقد PDF) */
  unifiedActivationEmailed: boolean;
  activationCertificateEmailed: boolean;
  bronzeActivationEmailed: boolean;
  contractEmailed: boolean;
  skippedBronzeOps: boolean;
  errors: string[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolvePartnerContractFields(
  supabase: SupabaseClient,
  input: {
    barberName: string;
    tier: string;
    registrationRequestId: string | null;
  },
): Promise<PartnerUnifiedContractFields> {
  const orderId = input.registrationRequestId?.trim() || null;
  let commercialRegistration: string | null =
    (process.env.LEGAL_COMMERCIAL_REGISTRATION || '').trim() || '7054117093';
  let establishmentName = input.barberName;

  if (orderId) {
    const { data } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', orderId)
      .maybeSingle();
    const p =
      data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)
        ? (data.payload as Record<string, unknown>)
        : {};
    const cr = String(p.commercialRegistration ?? p.crNumber ?? p.commercial_reg ?? p.cr ?? '').trim();
    if (cr) commercialRegistration = cr;
    const bn = String(p.salonName ?? p.shopName ?? p.barbershopName ?? p.establishmentName ?? '').trim();
    if (bn) establishmentName = bn;
  }

  return {
    establishmentName,
    commercialRegistration,
    packageTypeAr: `باقة ${tierLabelAr(input.tier)}`,
    contractDateDisplay: new Date().toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' }),
    registrationOrderId: orderId,
  };
}

export async function dispatchPartnerActivationMails(
  supabase: SupabaseClient,
  input: PartnerActivationMailDispatchInput,
): Promise<PartnerActivationMailDispatchResult> {
  const errors: string[] = [];
  const buyerEmail = input.buyerEmail.trim();
  const resendKey = (process.env.RESEND_API_KEY ?? '').trim();
  const resendFrom = (process.env.RESEND_FROM_EMAIL ?? '').trim();
  const resendReady = Boolean(resendKey && resendFrom);
  const bronze = isBronzeTier(input.tier);

  const result: PartnerActivationMailDispatchResult = {
    resendConfigured: resendReady,
    unifiedActivationEmailed: false,
    activationCertificateEmailed: false,
    bronzeActivationEmailed: false,
    contractEmailed: false,
    skippedBronzeOps: !bronze,
    errors,
  };

  if (!buyerEmail.includes('@')) {
    errors.push('invalid_buyer_email');
    return result;
  }
  if (!resendReady) {
    errors.push('resend_not_configured');
    return result;
  }
  if (!input.activationCertificate) {
    errors.push('certificate_missing');
    return result;
  }
  if (!input.barberId) {
    errors.push('missing_barber_id_for_contract');
    return result;
  }

  const barberId = String(input.barberId).trim();
  if (input.forceContract && UUID_RE.test(barberId)) {
    const ts = new Date().toISOString();
    await supabase
      .from('barber_subscriptions')
      .update({ partner_unified_contract_email_sent_at: null, updated_at: ts })
      .eq('barber_id', barberId);
  }

  let pdf: Buffer;
  try {
    pdf = loadStaticUnifiedContractPdf();
  } catch {
    errors.push('static_contract_pdf_missing');
    return result;
  }

  const contractFields = await resolvePartnerContractFields(supabase, {
    barberName: input.buyerName,
    tier: input.tier,
    registrationRequestId: input.registrationRequestId,
  });

  let shopOpenToggleUrl: string | null = null;
  let shopOpenRotateUrl: string | null = null;
  let dashboardSectionHtml = '';
  let dashboardSectionText = '';
  let ratingQrBase64: string | null = null;

  if (bronze) {
    let openStatusToken: string | null = null;
    const { data: barberRow } = await supabase
      .from('barbers')
      .select('open_status_token')
      .eq('id', barberId)
      .maybeSingle();
    openStatusToken = barberRow?.open_status_token ? String(barberRow.open_status_token) : null;
    const shopUrls = buildShopOpenMailUrls(openStatusToken);
    shopOpenToggleUrl = shopUrls.shopOpenToggleUrl;
    shopOpenRotateUrl = shopUrls.shopOpenRotateUrl;
  } else if (UUID_RE.test(barberId)) {
    let portalPassword: string | null = null;
    const rotated = await rotateBarberPortalLoginPassword(supabase, buyerEmail, input.buyerName);
    if (rotated.ok) {
      portalPassword = rotated.password;
      await supabase.from('barbers').update({ user_id: rotated.userId }).eq('id', barberId);
    } else {
      errors.push(`portal_password_rotate:${rotated.error}`);
    }

    const dashboardCtx = await resolveDashboardSupplementForBarber(supabase, {
      barberId,
      buyerEmail,
      tier: input.tier,
      registrationOrderId: input.registrationRequestId,
      paymentMetadata: input.paymentMetadata,
      portalPassword,
    });
    if (dashboardCtx) {
      dashboardSectionHtml = dashboardCtx.supplement.html;
      dashboardSectionText = dashboardCtx.supplement.text;
      ratingQrBase64 = dashboardCtx.rating.qrPngBase64;
    }
  }

  const mail = buildUnifiedPartnerActivationEmailBodies({
    barberName: input.buyerName,
    buyerEmail,
    tier: input.tier,
    certificate: input.activationCertificate,
    establishmentName: contractFields.establishmentName,
    commercialRegistration: contractFields.commercialRegistration,
    packageTypeAr: contractFields.packageTypeAr,
    contractDateDisplay: contractFields.contractDateDisplay,
    registrationOrderId: input.registrationRequestId,
    shopOpenToggleUrl,
    shopOpenRotateUrl,
    dashboardSectionHtml,
    dashboardSectionText,
  });

  const safeId = String(input.registrationRequestId || input.activationCertificate.certificateNumber || 'contract')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80);
  const filename = `Halaqmap-Partner-Unified-Contract-${safeId}.pdf`;

  const attachments: Array<{ filename: string; content: string; content_id?: string }> = [
    { filename, content: pdf.toString('base64') },
  ];
  if (ratingQrBase64) {
    attachments.push({
      filename: 'halaqmap-rating-qr.png',
      content: ratingQrBase64,
      content_id: RATING_QR_CONTENT_ID,
    });
  }

  const sent = await sendResendEmailWithRetry({
    apiKey: resendKey,
    from: resendFrom,
    to: buyerEmail,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments,
  });

  if (!sent.ok) {
    errors.push(`unified_activation_email:${sent.error}`);
    return result;
  }

  result.unifiedActivationEmailed = true;
  result.activationCertificateEmailed = true;
  result.bronzeActivationEmailed = bronze;
  result.contractEmailed = true;

  if (UUID_RE.test(barberId)) {
    const ts = new Date().toISOString();
    await supabase
      .from('barber_subscriptions')
      .update({ partner_unified_contract_email_sent_at: ts, updated_at: ts })
      .eq('barber_id', barberId);
  }

  return result;
}

/** بعد sync من صفحة الدفع — بريد موحّد إن لم يُرسل بعد (تجنّب تكرار webhook). */
export async function dispatchPartnerActivationMailAfterFulfill(
  supabase: SupabaseClient,
  input: {
    moyasarPaymentId: string;
    barberId: string | null;
    certificate: DigitalActivationCertificatePayload;
  },
): Promise<PartnerActivationMailDispatchResult | null> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return null;

  const { data: sub } = await supabase
    .from('barber_subscriptions')
    .select('partner_unified_contract_email_sent_at')
    .eq('barber_id', barberId)
    .maybeSingle();
  if (sub?.partner_unified_contract_email_sent_at) return null;

  const paymentId = input.moyasarPaymentId.trim();
  const { data: order } = await supabase
    .from('listing_license_orders')
    .select('buyer_email, registration_request_id, metadata')
    .eq('moyasar_payment_id', paymentId)
    .maybeSingle();

  const { data: barber } = await supabase
    .from('barbers')
    .select('email, name, tier')
    .eq('id', barberId)
    .maybeSingle();

  const snap = input.certificate.geoSnapshot;
  const registrationRequestId =
    (typeof snap?.registrationRequestId === 'string' ? snap.registrationRequestId.trim() : '') ||
    (order?.registration_request_id ? String(order.registration_request_id).trim() : '') ||
    null;

  let buyerEmail = String(order?.buyer_email ?? barber?.email ?? '').trim();
  let buyerName =
    (typeof snap?.businessName === 'string' ? snap.businessName.trim() : '') ||
    String(barber?.name ?? '').trim() ||
    'شريك حلاق ماب';

  if (registrationRequestId && !buyerEmail.includes('@')) {
    const { data: reg } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', registrationRequestId)
      .maybeSingle();
    const p =
      reg?.payload && typeof reg.payload === 'object' && !Array.isArray(reg.payload)
        ? (reg.payload as Record<string, unknown>)
        : null;
    const em = typeof p?.email === 'string' ? p.email.trim() : '';
    if (em.includes('@')) buyerEmail = em;
    const bn = typeof p?.barberName === 'string' ? p.barberName.trim() : '';
    if (bn) buyerName = bn;
  }

  if (!buyerEmail.includes('@')) return null;

  const orderMeta =
    order?.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)
      ? (order.metadata as Record<string, unknown>)
      : undefined;

  const tier =
    input.certificate.tier === 'gold' || input.certificate.tier === 'diamond'
      ? input.certificate.tier
      : String(barber?.tier ?? input.certificate.tier ?? 'bronze');

  return dispatchPartnerActivationMails(supabase, {
    buyerEmail,
    buyerName,
    tier,
    barberId,
    registrationRequestId,
    activationCertificate: input.certificate,
    paymentMetadata: orderMeta,
  });
}
