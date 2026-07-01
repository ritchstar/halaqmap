import type { SupabaseClient } from '@supabase/supabase-js';
import { siteBaseUrlFromEnv } from './barberProvisionService.js';
import {
  buildBronzePartnerActivationEmailBodies,
  buildShopOpenMailUrls,
} from './bronzePartnerActivationMail.js';
import { buildActivationCertificateEmailBodies } from './geospatialLicenseAssetService.js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import type { PartnerUnifiedContractFields } from './partnerUnifiedContractAr.js';
import { emailPartnerUnifiedContractPdf } from './partnerContractNotify.js';
import { isBronzeTier, tierLabelAr } from './partnerTierMail.js';

async function sendResendEmail(input: {
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

export type PartnerActivationMailDispatchInput = {
  buyerEmail: string;
  buyerName: string;
  tier: string;
  barberId: string | null;
  registrationRequestId: string | null;
  activationCertificate: DigitalActivationCertificatePayload | null;
  /** إعادة إرسال العقد حتى لو أُرسل مسبقاً */
  forceContract?: boolean;
};

export type PartnerActivationMailDispatchResult = {
  resendConfigured: boolean;
  activationCertificateEmailed: boolean;
  bronzeActivationEmailed: boolean;
  contractEmailed: boolean;
  skippedBronzeOps: boolean;
  errors: string[];
};

async function sendContractEmail(
  supabase: SupabaseClient,
  input: {
    resendApiKey: string;
    resendFrom: string;
    barberEmail: string;
    barberName: string;
    tier: string;
    registrationRequestId: string | null;
    barberId: string | null;
    forceContract: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const barberId = String(input.barberId ?? '').trim();
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (input.forceContract && barberId && UUID_RE.test(barberId)) {
    const ts = new Date().toISOString();
    await supabase
      .from('barber_subscriptions')
      .update({ partner_unified_contract_email_sent_at: null, updated_at: ts })
      .eq('barber_id', barberId);
  }

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

  const fields: PartnerUnifiedContractFields = {
    establishmentName,
    commercialRegistration,
    packageTypeAr: `باقة ${tierLabelAr(input.tier)}`,
    contractDateDisplay: new Date().toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' }),
    registrationOrderId: orderId,
  };

  const sent = await emailPartnerUnifiedContractPdf({
    apiKey: input.resendApiKey,
    from: input.resendFrom,
    to: input.barberEmail,
    fields,
    tier: input.tier,
  });
  if (!sent.ok) return { ok: false, error: sent.error };

  if (barberId && UUID_RE.test(barberId)) {
    const ts = new Date().toISOString();
    await supabase
      .from('barber_subscriptions')
      .update({ partner_unified_contract_email_sent_at: ts, updated_at: ts })
      .eq('barber_id', barberId);
  }
  return { ok: true };
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

  const result: PartnerActivationMailDispatchResult = {
    resendConfigured: resendReady,
    activationCertificateEmailed: false,
    bronzeActivationEmailed: false,
    contractEmailed: false,
    skippedBronzeOps: !isBronzeTier(input.tier),
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

  if (input.activationCertificate) {
    const mail = buildActivationCertificateEmailBodies({
      barberName: input.buyerName,
      certificate: input.activationCertificate,
    });
    const sent = await sendResendEmail({
      apiKey: resendKey,
      from: resendFrom,
      to: buyerEmail,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    result.activationCertificateEmailed = sent.ok;
    if (!sent.ok) errors.push(`certificate_email:${sent.error}`);
  } else {
    errors.push('certificate_missing');
  }

  if (isBronzeTier(input.tier)) {
    let openStatusToken: string | null = null;
    if (input.barberId) {
      const { data: barberRow } = await supabase
        .from('barbers')
        .select('open_status_token')
        .eq('id', input.barberId)
        .maybeSingle();
      openStatusToken = barberRow?.open_status_token ? String(barberRow.open_status_token) : null;
    }
    const shopUrls = buildShopOpenMailUrls(openStatusToken);
    const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
    const bronzeMail = buildBronzePartnerActivationEmailBodies({
      barberName: input.buyerName,
      certificate: input.activationCertificate,
      shopOpenToggleUrl: shopUrls.shopOpenToggleUrl,
      shopOpenRotateUrl: shopUrls.shopOpenRotateUrl,
      registrationOrderId: input.registrationRequestId,
      policyUrl: `${siteBase}/#/partners/subscription-policy`,
    });
    const sent = await sendResendEmail({
      apiKey: resendKey,
      from: resendFrom,
      to: buyerEmail,
      subject: bronzeMail.subject,
      html: bronzeMail.html,
      text: bronzeMail.text,
    });
    result.bronzeActivationEmailed = sent.ok;
    if (!sent.ok) errors.push(`bronze_activation_email:${sent.error}`);
  }

  if (input.barberId) {
    const contract = await sendContractEmail(supabase, {
      resendApiKey: resendKey,
      resendFrom,
      barberEmail: buyerEmail,
      barberName: input.buyerName,
      tier: input.tier,
      registrationRequestId: input.registrationRequestId,
      barberId: input.barberId,
      forceContract: input.forceContract === true,
    });
    result.contractEmailed = contract.ok;
    if (!contract.ok) errors.push(`contract_email:${contract.error ?? 'failed'}`);
  } else {
    errors.push('missing_barber_id_for_contract');
  }

  return result;
}
