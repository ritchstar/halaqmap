/**
 * أكواد تجربة باقة برونزي 30 يوماً — مسار موازٍ تماماً لميسر.
 * التنسيق: HM-TRY-XXXX-XXXX-XXXX (بصمة فقط في DB).
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fingerprintListingLicenseCode,
  getListingLicenseVoucherPepper,
  normalizeVoucherCodeInput,
} from './listingLicenseCrypto.js';
import { loadProductBySku, creditBarberListingEntitlement } from './listingLicenseService.js';
import { provisionBarberForPaidOrder } from './barberProvisionService.js';
import { activateGeospatialLicense } from './geospatialLicenseAssetService.js';
import { ensureBarberOpenStatusToken } from './barberOpenStatusService.js';
import {
  buildShopOpenMailUrls,
  sendBronzeOpsActivationEmail,
} from './bronzePartnerActivationMail.js';
import { dispatchPartnerActivationMails } from './partnerActivationMailDispatch.js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const HM_REQUEST_RE = /^HM-[A-Z0-9-]{6,64}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateBronzeTrialCode(): string {
  const seg = (n: number) => {
    const buf = randomBytes(n);
    let out = '';
    for (let i = 0; i < n; i += 1) {
      out += CODE_ALPHABET[buf[i]! % CODE_ALPHABET.length];
    }
    return out;
  };
  return `HM-TRY-${seg(4)}-${seg(4)}-${seg(4)}`;
}

export function fingerprintBronzeTrialCode(code: string, pepper: string): string {
  return fingerprintListingLicenseCode(code, pepper);
}

function verifyFingerprint(code: string, pepper: string, stored: string): boolean {
  const expected = fingerprintBronzeTrialCode(code, pepper);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(stored, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type IssueBronzeTrialCodesResult =
  | { ok: true; codes: string[]; count: number }
  | { ok: false; error: string };

export async function issueBronzeTrialCodes(
  supabase: SupabaseClient,
  input: {
    count: number;
    adminEmail?: string | null;
    note?: string | null;
    boundEmail?: string | null;
    applicationId?: string | null;
  },
): Promise<IssueBronzeTrialCodesResult> {
  const pepper = getListingLicenseVoucherPepper();
  if (!pepper) return { ok: false, error: 'voucher_pepper_not_configured' };

  const count = Math.min(50, Math.max(1, Math.trunc(input.count) || 1));
  const codes: string[] = [];
  const note = String(input.note ?? '').trim().slice(0, 500) || null;
  const adminEmail = String(input.adminEmail ?? '').trim().slice(0, 200) || null;
  const boundEmail = String(input.boundEmail ?? '').trim().toLowerCase() || null;
  const applicationId = String(input.applicationId ?? '').trim() || null;
  if (boundEmail && count !== 1) {
    return { ok: false, error: 'bound_email_requires_single_code' };
  }

  for (let i = 0; i < count; i += 1) {
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      const plaintext = generateBronzeTrialCode();
      const fingerprint = fingerprintBronzeTrialCode(plaintext, pepper);
      const { error } = await supabase.from('bronze_trial_codes').insert({
        code_fingerprint: fingerprint,
        status: 'issued',
        created_by_admin_email: adminEmail,
        note,
        bound_email: boundEmail,
        application_id: applicationId && UUID_RE.test(applicationId) ? applicationId : null,
      });
      if (!error) {
        codes.push(plaintext);
        inserted = true;
        break;
      }
      const code = String((error as { code?: string }).code ?? '');
      if (code !== '23505') return { ok: false, error: error.message };
    }
    if (!inserted) return { ok: false, error: 'code_insert_failed' };
  }

  return { ok: true, codes, count: codes.length };
}

export type RedeemBronzeTrialResult =
  | {
      ok: true;
      barberId: string;
      validUntil: string;
      listingDaysGranted: number;
      isTrial: true;
      tier: 'bronze';
      activationMailEmailed: boolean;
      shopOpenToggleUrl: string | null;
    }
  | { ok: false; error: string; status: number };

/**
 * استرداد كود تجربة برونزي على طلب تسجيل (أو حلاق مربوط) — بدون ميسر.
 */
export async function redeemBronzeTrialCode(
  supabase: SupabaseClient,
  input: {
    code: string;
    registrationRequestId?: string | null;
    linkedBarberId?: string | null;
    /** مطلوب إن كان للكود bound_email — يجب المطابقة */
    email?: string | null;
  },
): Promise<RedeemBronzeTrialResult> {
  const pepper = getListingLicenseVoucherPepper();
  if (!pepper) return { ok: false, error: 'voucher_pepper_not_configured', status: 503 };

  const normalized = normalizeVoucherCodeInput(input.code);
  if (!normalized.startsWith('HM-TRY-') || normalized.length < 16) {
    return { ok: false, error: 'invalid_trial_code', status: 400 };
  }

  const requestId = String(input.registrationRequestId ?? '').trim();
  const linkedBarberId = String(input.linkedBarberId ?? '').trim();
  const hasRequest = HM_REQUEST_RE.test(requestId);
  const hasLinked = UUID_RE.test(linkedBarberId);
  if (!hasRequest && !hasLinked) {
    return { ok: false, error: 'missing_registration_or_barber', status: 400 };
  }

  const fingerprint = fingerprintBronzeTrialCode(normalized, pepper);
  const { data: row, error: findErr } = await supabase
    .from('bronze_trial_codes')
    .select('id, status, code_fingerprint, bound_email')
    .eq('code_fingerprint', fingerprint)
    .maybeSingle();

  if (findErr) return { ok: false, error: findErr.message, status: 500 };
  if (!row?.id) return { ok: false, error: 'trial_code_not_found', status: 404 };
  if (!verifyFingerprint(normalized, pepper, String(row.code_fingerprint))) {
    return { ok: false, error: 'trial_code_not_found', status: 404 };
  }
  if (String(row.status) === 'revoked') return { ok: false, error: 'trial_code_revoked', status: 409 };
  if (String(row.status) !== 'issued') return { ok: false, error: 'trial_code_already_used', status: 409 };

  const boundEmail = String(row.bound_email ?? '').trim().toLowerCase();
  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimErr } = await supabase
    .from('bronze_trial_codes')
    .update({
      status: 'redeemed',
      redeemed_at: claimedAt,
      updated_at: claimedAt,
      redeemed_registration_request_id: hasRequest ? requestId : null,
    })
    .eq('id', row.id)
    .eq('status', 'issued')
    .select('id')
    .maybeSingle();

  if (claimErr) return { ok: false, error: claimErr.message, status: 500 };
  if (!claimed?.id) return { ok: false, error: 'trial_code_already_used', status: 409 };

  const rollbackCode = async () => {
    await supabase
      .from('bronze_trial_codes')
      .update({
        status: 'issued',
        redeemed_at: null,
        redeemed_barber_id: null,
        redeemed_registration_request_id: null,
        redeemed_order_id: null,
        redeemed_entitlement_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('status', 'redeemed');
  };

  let buyerEmail: string | null = String(input.email ?? '').trim().toLowerCase() || null;
  let buyerName: string | null = null;

  if (hasRequest) {
    const { data: sub } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', requestId)
      .maybeSingle();
    const payload =
      sub?.payload && typeof sub.payload === 'object' && !Array.isArray(sub.payload)
        ? (sub.payload as Record<string, unknown>)
        : null;
    if (!payload) {
      await rollbackCode();
      return { ok: false, error: 'registration_not_found', status: 404 };
    }
    const tierRaw = String(payload.tier ?? '').trim().toLowerCase();
    if (tierRaw && tierRaw !== 'bronze') {
      await rollbackCode();
      return { ok: false, error: 'trial_bronze_only', status: 409 };
    }
    const regEmail = String(payload.email ?? payload.barberEmail ?? '').trim().toLowerCase() || null;
    buyerEmail = buyerEmail || regEmail;
    buyerName = String(payload.barberName ?? payload.name ?? '').trim() || null;
  }

  if (boundEmail) {
    if (!buyerEmail) {
      await rollbackCode();
      return { ok: false, error: 'email_required_for_bound_code', status: 400 };
    }
    if (buyerEmail !== boundEmail) {
      await rollbackCode();
      return { ok: false, error: 'email_mismatch_bound_code', status: 403 };
    }
  }

  let barberId: string;

  if (hasLinked && !hasRequest) {
    const { data: b } = await supabase.from('barbers').select('id, email, tier').eq('id', linkedBarberId).maybeSingle();
    if (!b?.id) {
      await rollbackCode();
      return { ok: false, error: 'barber_not_found', status: 404 };
    }
    barberId = String(b.id);
    const barberEmail = String(b.email ?? '').trim().toLowerCase() || null;
    buyerEmail = buyerEmail || barberEmail;
    if (boundEmail && buyerEmail !== boundEmail) {
      await rollbackCode();
      return { ok: false, error: 'email_mismatch_bound_code', status: 403 };
    }
  } else {
    const provision = await provisionBarberForPaidOrder(supabase, {
      registrationRequestId: requestId,
      buyerEmail,
      buyerName,
      tier: 'bronze',
      moyasarPaymentId: null,
      sendCredentialsEmail: false,
    });
    if (!provision.ok) {
      await rollbackCode();
      return { ok: false, error: provision.error, status: 500 };
    }
    barberId = provision.barberId;
  }

  const { data: priorTrial } = await supabase
    .from('barber_listing_entitlements')
    .select('id')
    .eq('barber_id', barberId)
    .eq('source', 'bronze_trial_code')
    .limit(1)
    .maybeSingle();
  if (priorTrial?.id) {
    await rollbackCode();
    return { ok: false, error: 'trial_already_used_for_barber', status: 409 };
  }

  const productLoaded = await loadProductBySku(supabase, 'bronze_30');
  if (!productLoaded.ok) {
    await rollbackCode();
    return { ok: false, error: productLoaded.error, status: 500 };
  }

  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: productLoaded.product.id,
      buyer_email: buyerEmail,
      barber_id: barberId,
      payment_channel: 'bronze_trial',
      payment_reference: `trial:${row.id}`,
      moyasar_payment_id: null,
      registration_request_id: hasRequest ? requestId : null,
      amount_halalas: 0,
      currency: 'SAR',
      status: 'paid',
      paid_at: claimedAt,
      metadata: {
        product: 'bronze_trial',
        trial_code_id: row.id,
        listing_days: 30,
      },
    })
    .select('id')
    .single();

  if (orderErr || !order?.id) {
    await rollbackCode();
    return { ok: false, error: orderErr?.message ?? 'order_insert_failed', status: 500 };
  }

  const credit = await creditBarberListingEntitlement(supabase, {
    barberId,
    product: productLoaded.product,
    source: 'bronze_trial_code',
    orderId: order.id,
    stackFromExisting: true,
  });

  if (!credit.ok) {
    await rollbackCode();
    await supabase.from('listing_license_orders').update({ status: 'cancelled' }).eq('id', order.id);
    return { ok: false, error: credit.error, status: 500 };
  }

  await supabase.from('listing_license_redemption_events').insert({
    voucher_id: null,
    barber_id: barberId,
    entitlement_id: credit.entitlementId,
    event_type: 'bronze_trial',
  });

  let activationCertificate: DigitalActivationCertificatePayload | null = null;
  try {
    const geo = await activateGeospatialLicense(supabase, {
      orderId: order.id,
      barberId,
      entitlementId: credit.entitlementId,
      tier: 'bronze',
      validUntil: credit.validUntil,
      registrationRequestId: hasRequest ? requestId : null,
    });
    if (geo.status !== 'Failed') {
      activationCertificate = geo.certificate;
    }
  } catch {
    // الشهادة اختيارية — الصلاحية كافية للظهور؛ البريد الاحتياطي يغطي روابط التشغيل
  }

  await supabase
    .from('bronze_trial_codes')
    .update({
      redeemed_barber_id: barberId,
      redeemed_order_id: order.id,
      redeemed_entitlement_id: credit.entitlementId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  if (hasRequest) {
    const { data: sub } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', requestId)
      .maybeSingle();
    if (sub?.payload && typeof sub.payload === 'object' && !Array.isArray(sub.payload)) {
      const payload = { ...(sub.payload as Record<string, unknown>) };
      payload.status = 'activated';
      payload.bronzeTrialRedeemedAtIso = claimedAt;
      payload.linkedBarberId = barberId;
      await supabase.from('registration_submissions').update({ payload }).eq('id', requestId);
    }
  }

  // بريد بعد التفعيل: تعليمات + رابط مفتوح/مغلق (مثل المسار المدفوع).
  let activationMailEmailed = false;
  const tokenEnsured = await ensureBarberOpenStatusToken(supabase, barberId);
  const shopUrls = buildShopOpenMailUrls(tokenEnsured.ok ? tokenEnsured.token : null);

  const { data: barberMailRow } = await supabase
    .from('barbers')
    .select('email, name')
    .eq('id', barberId)
    .maybeSingle();
  const mailEmail =
    (buyerEmail && buyerEmail.includes('@') ? buyerEmail : '') ||
    String((barberMailRow as { email?: string | null } | null)?.email ?? '')
      .trim()
      .toLowerCase();
  const mailName =
    (buyerName && buyerName.trim()) ||
    String((barberMailRow as { name?: string | null } | null)?.name ?? '').trim() ||
    'شريك حلاق ماب';

  if (mailEmail.includes('@')) {
    if (activationCertificate) {
      const mail = await dispatchPartnerActivationMails(supabase, {
        buyerEmail: mailEmail,
        buyerName: mailName,
        tier: 'bronze',
        barberId,
        registrationRequestId: hasRequest ? requestId : null,
        activationCertificate,
        paymentMetadata: {
          product: 'bronze_trial',
          trial_code_id: row.id,
        },
      });
      activationMailEmailed = mail.unifiedActivationEmailed;
      if (mail.errors.length > 0) {
        console.error('[bronze-trial-redeem] activation_mail_errors', mail.errors);
      }
    }

    if (!activationMailEmailed) {
      const fallback = await sendBronzeOpsActivationEmail({
        to: mailEmail,
        barberName: mailName,
        shopOpenToggleUrl: shopUrls.shopOpenToggleUrl,
        shopOpenRotateUrl: shopUrls.shopOpenRotateUrl,
        registrationOrderId: hasRequest ? requestId : null,
        certificate: activationCertificate,
      });
      activationMailEmailed = fallback.ok;
      if (!fallback.ok) {
        console.error('[bronze-trial-redeem] bronze_ops_mail_failed', fallback.error);
      }
    }
  } else {
    console.error('[bronze-trial-redeem] activation_mail_skipped_no_email', { barberId });
  }

  return {
    ok: true,
    barberId,
    validUntil: credit.validUntil,
    listingDaysGranted: credit.listingDaysGranted,
    isTrial: true,
    tier: 'bronze',
    activationMailEmailed,
    shopOpenToggleUrl: shopUrls.shopOpenToggleUrl,
  };
}

export async function barberHasActiveBronzeTrial(
  supabase: SupabaseClient,
  barberId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('barber_listing_entitlements')
    .select('id')
    .eq('barber_id', barberId)
    .eq('source', 'bronze_trial_code')
    .is('revoked_at', null)
    .gt('valid_until', now)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}
