import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import { provisionBarberForPaidOrder } from './barberProvisionService.js';
import {
  activateGeospatialLicense,
  fetchCertificateByMoyasarPaymentId,
  fetchCertificateByOrderId,
  promoteGeospatialBindForMoyasarPayment,
} from './geospatialLicenseAssetService.js';
import { fulfillListingLicenseOrder, autoRedeemIssuedVouchersForRegistration } from './listingLicenseService.js';
import {
  fetchMoyasarPayment,
  moyasarPaymentIsPaid,
  resolveMoyasarApiBase,
  resolveMoyasarSecretKey,
  secretKeyLooksValid,
} from './moyasarApiClient.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

type ListingTier = 'bronze' | 'gold' | 'diamond';

type MoyasarPaymentJson = {
  id?: string;
  status?: string;
  amount?: number;
  description?: string;
  metadata?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
};

function tierFromMeta(meta: Record<string, unknown>): ListingTier | null {
  const t = String(meta.tier ?? '').trim().toLowerCase();
  if (t === 'bronze' || t === 'gold' || t === 'diamond') return t;
  return null;
}

function licenseQuantityFromMeta(meta: Record<string, unknown>): number {
  const raw = meta.license_quantity ?? meta.licenseQuantity ?? 1;
  const n =
    typeof raw === 'number' ? Math.trunc(raw) : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

function licenseSkuFromMeta(meta: Record<string, unknown>, tier: ListingTier | null): string {
  const fromMeta = String(meta.license_sku ?? meta.licenseSku ?? '').trim().toLowerCase();
  if (fromMeta) return fromMeta;
  if (tier === 'gold') return 'gold_30';
  if (tier === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

function requestIdFromMeta(meta: Record<string, unknown>, description: string | null): string {
  const fromMeta =
    (typeof meta.request_id === 'string' ? meta.request_id.trim() : '') ||
    (typeof meta.requestId === 'string' ? meta.requestId.trim() : '');
  if (ORDER_ID_RE.test(fromMeta)) return fromMeta;
  const desc = String(description ?? '').trim();
  const match = desc.match(/(HM-\d{8}-[A-Z0-9]{6})\s*$/);
  return match?.[1] && ORDER_ID_RE.test(match[1]) ? match[1] : '';
}

function linkedBarberIdFromMeta(meta: Record<string, unknown>): string | null {
  const a = String(meta.linked_barber_id ?? '').trim();
  const b = String(meta.linkedBarberId ?? '').trim();
  if (UUID_RE.test(a)) return a;
  if (UUID_RE.test(b)) return b;
  return null;
}

async function resolveRegistrationContext(
  supabase: SupabaseClient,
  registrationRequestId: string,
  payment: MoyasarPaymentJson,
): Promise<{ email: string | null; barberName: string; phone: string | null }> {
  const src = payment.source;
  const sourceEmail =
    src && typeof src === 'object' ? String(src.email ?? src.number ?? '').trim() : '';
  const sourceName = src && typeof src === 'object' ? String(src.name ?? '').trim() : '';
  const sourcePhone =
    src && typeof src === 'object'
      ? String(src.number ?? '')
          .trim()
          .replace(/^00/, '+')
      : '';

  if (!registrationRequestId) {
    return {
      email: sourceEmail.includes('@') ? sourceEmail : null,
      barberName: sourceName || 'عميلنا الكريم',
      phone: sourcePhone || null,
    };
  }

  const { data } = await supabase
    .from('registration_submissions')
    .select('payload')
    .eq('id', registrationRequestId)
    .maybeSingle();

  if (!data?.payload || typeof data.payload !== 'object' || Array.isArray(data.payload)) {
    return {
      email: sourceEmail.includes('@') ? sourceEmail : null,
      barberName: sourceName || 'عميلنا الكريم',
      phone: sourcePhone || null,
    };
  }

  const p = data.payload as Record<string, unknown>;
  const email = typeof p.email === 'string' ? p.email.trim() : '';
  const barberName = typeof p.barberName === 'string' ? p.barberName.trim() : '';
  const phone = typeof p.phone === 'string' ? p.phone.trim() : '';

  return {
    email: email.includes('@') ? email : sourceEmail.includes('@') ? sourceEmail : null,
    barberName: barberName || sourceName || 'عميلنا الكريم',
    phone: phone || sourcePhone || null,
  };
}

async function repairMissingCertificateForPayment(
  supabase: SupabaseClient,
  moyasarPaymentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .select(
      'id, barber_id, registration_request_id, paid_at, product_id, listing_license_products(tier, listing_days_granted)',
    )
    .eq('moyasar_payment_id', moyasarPaymentId.trim())
    .maybeSingle();

  if (orderErr || !order?.id) {
    return { ok: false, error: orderErr?.message || 'order_not_found' };
  }

  const existingCert = await fetchCertificateByOrderId(supabase, order.id);
  if (existingCert.ok) return { ok: true };

  const productJoin = order.listing_license_products as
    | { tier?: ListingTier; listing_days_granted?: number }
    | { tier?: ListingTier; listing_days_granted?: number }[]
    | null;
  const product = Array.isArray(productJoin) ? productJoin[0] : productJoin;
  const tier: ListingTier =
    product?.tier === 'gold' || product?.tier === 'diamond' ? product.tier : 'bronze';

  let barberId =
    order.barber_id && UUID_RE.test(String(order.barber_id)) ? String(order.barber_id) : null;
  let entitlementId: string | null = null;
  let validUntil = '';

  const { data: voucher } = await supabase
    .from('listing_license_vouchers')
    .select('redeemed_barber_id')
    .eq('order_id', order.id)
    .not('redeemed_barber_id', 'is', null)
    .order('redeemed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!barberId && voucher?.redeemed_barber_id && UUID_RE.test(String(voucher.redeemed_barber_id))) {
    barberId = String(voucher.redeemed_barber_id);
  }

  if (barberId) {
    const { data: ent } = await supabase
      .from('barber_listing_entitlements')
      .select('id, valid_until')
      .eq('barber_id', barberId)
      .is('revoked_at', null)
      .order('valid_until', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ent?.id) {
      entitlementId = String(ent.id);
      validUntil = String(ent.valid_until ?? '');
    }
  }

  if (!validUntil) {
    const days = Number(product?.listing_days_granted) > 0 ? Number(product?.listing_days_granted) : 30;
    const base = order.paid_at ? new Date(String(order.paid_at)) : new Date();
    const until = new Date(base.getTime());
    until.setUTCDate(until.getUTCDate() + days);
    validUntil = until.toISOString();
  }

  const provision = await activateGeospatialLicense(supabase, {
    orderId: order.id,
    barberId,
    entitlementId,
    tier,
    validUntil,
    registrationRequestId: order.registration_request_id
      ? String(order.registration_request_id)
      : null,
  });

  if (provision.status === 'Failed') {
    return { ok: false, error: provision.error };
  }

  return { ok: true };
}

async function ensureBarberAndEntitlementForPayment(
  supabase: SupabaseClient,
  moyasarPaymentId: string,
  tier: ListingTier,
): Promise<void> {
  const { data: order } = await supabase
    .from('listing_license_orders')
    .select('id, barber_id, registration_request_id')
    .eq('moyasar_payment_id', moyasarPaymentId.trim())
    .maybeSingle();
  if (!order?.id) return;

  const registrationRequestId = order.registration_request_id
    ? String(order.registration_request_id).trim()
    : '';
  let barberId =
    order.barber_id && UUID_RE.test(String(order.barber_id)) ? String(order.barber_id) : null;

  if (!barberId && registrationRequestId) {
    const { data: reg } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', registrationRequestId)
      .maybeSingle();
    const payload =
      reg?.payload && typeof reg.payload === 'object' && !Array.isArray(reg.payload)
        ? (reg.payload as Record<string, unknown>)
        : null;
    const email = typeof payload?.email === 'string' ? payload.email.trim() : '';
    const barberName =
      typeof payload?.barberName === 'string'
        ? payload.barberName.trim()
        : typeof payload?.shopName === 'string'
          ? payload.shopName.trim()
          : '';
    const phone = typeof payload?.phone === 'string' ? payload.phone.trim() : null;

    if (email.includes('@')) {
      const provision = await provisionBarberForPaidOrder(supabase, {
        registrationRequestId,
        buyerEmail: email,
        buyerName: barberName || 'شريك حلاق ماب',
        buyerPhone: phone,
        tier,
        moyasarPaymentId: moyasarPaymentId.trim(),
      });
      if (provision.ok && UUID_RE.test(provision.barberId)) {
        barberId = provision.barberId;
        await supabase
          .from('listing_license_orders')
          .update({ barber_id: barberId, updated_at: new Date().toISOString() })
          .eq('id', order.id);
      }
    }
  }

  if (barberId && registrationRequestId) {
    await autoRedeemIssuedVouchersForRegistration(supabase, {
      registrationRequestId,
      barberId,
    });
  }
}

async function promotePaymentGeospatialBind(
  supabase: SupabaseClient,
  moyasarPaymentId: string,
  tier: ListingTier,
): Promise<void> {
  await ensureBarberAndEntitlementForPayment(supabase, moyasarPaymentId, tier);
  await promoteGeospatialBindForMoyasarPayment(supabase, moyasarPaymentId);
}

export type SyncMoyasarPaidFulfillmentResult =
  | {
      ok: true;
      alreadyFulfilled: boolean;
      orderId: string;
      certificate?: DigitalActivationCertificatePayload;
    }
  | { ok: false; error: string; status: number };

export async function syncMoyasarPaidFulfillment(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<SyncMoyasarPaidFulfillmentResult> {
  const normalizedPaymentId = paymentId.trim();
  if (!UUID_RE.test(normalizedPaymentId)) {
    return { ok: false, error: 'invalid_payment_id', status: 400 };
  }

  const existingCert = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);
  if (existingCert.ok) {
    const certTier: ListingTier =
      existingCert.certificate.tier === 'gold' || existingCert.certificate.tier === 'diamond'
        ? existingCert.certificate.tier
        : 'bronze';
    await promotePaymentGeospatialBind(supabase, normalizedPaymentId, certTier);
    const refreshed = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);
    if (refreshed.ok) {
      return {
        ok: true,
        alreadyFulfilled: true,
        orderId: refreshed.orderId,
        certificate: refreshed.certificate,
      };
    }
    return {
      ok: true,
      alreadyFulfilled: true,
      orderId: existingCert.orderId,
      certificate: existingCert.certificate,
    };
  }

  const secret = resolveMoyasarSecretKey();
  if (!secret || !secretKeyLooksValid(secret)) {
    return { ok: false, error: 'moyasar_disabled', status: 503 };
  }

  let upstream: Awaited<ReturnType<typeof fetchMoyasarPayment>>;
  try {
    upstream = await fetchMoyasarPayment(normalizedPaymentId, secret, resolveMoyasarApiBase());
  } catch {
    return { ok: false, error: 'upstream_network', status: 502 };
  }

  if (upstream.status < 200 || upstream.status >= 300) {
    return { ok: false, error: 'moyasar_error', status: upstream.status === 404 ? 404 : 502 };
  }

  let payment: MoyasarPaymentJson;
  try {
    payment = JSON.parse(upstream.text) as MoyasarPaymentJson;
  } catch {
    return { ok: false, error: 'invalid_upstream', status: 502 };
  }

  const status = String(payment.status ?? '');
  if (!moyasarPaymentIsPaid(status)) {
    return { ok: false, error: 'payment_not_paid', status: 409 };
  }

  const meta =
    payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
      ? payment.metadata
      : {};
  const requestId = requestIdFromMeta(meta, payment.description ?? null);
  const tier = tierFromMeta(meta);
  const licenseQty = licenseQuantityFromMeta(meta);
  const skuCode = licenseSkuFromMeta(meta, tier);
  const amountHalalas =
    typeof payment.amount === 'number' && Number.isFinite(payment.amount)
      ? Math.trunc(payment.amount)
      : null;

  const recipient = await resolveRegistrationContext(supabase, requestId, payment);
  let barberId = linkedBarberIdFromMeta(meta);

  if (!barberId && (requestId || recipient.email)) {
    const provision = await provisionBarberForPaidOrder(supabase, {
      registrationRequestId: requestId || null,
      buyerEmail: recipient.email,
      buyerName: recipient.barberName,
      buyerPhone: recipient.phone,
      tier: tier ?? 'bronze',
      moyasarPaymentId: normalizedPaymentId,
    });
    if (provision.ok && UUID_RE.test(provision.barberId)) {
      barberId = provision.barberId;
    }
  }

  const fulfill = await fulfillListingLicenseOrder(supabase, {
    skuCode,
    tier: tier ?? 'bronze',
    barberId,
    buyerEmail: recipient.email,
    paymentChannel: 'moyasar',
    moyasarPaymentId: normalizedPaymentId,
    registrationRequestId: requestId || null,
    amountHalalas,
    quantity: licenseQty,
    autoRedeem: Boolean(barberId),
    metadata: {
      ...meta,
      source: 'moyasar_paid_fulfillment_sync',
      license_quantity: licenseQty,
    },
  });

  let alreadyFulfilled = false;
  if (!fulfill.ok) {
    if (fulfill.error === 'order_already_fulfilled') {
      alreadyFulfilled = true;
    } else {
      return { ok: false, error: fulfill.error, status: fulfill.status ?? 500 };
    }
  }

  const cert = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);
  if (!cert.ok) {
    if (cert.error === 'certificate_not_found' || cert.error === 'order_not_found') {
      const repaired = await repairMissingCertificateForPayment(supabase, normalizedPaymentId);
      if (!repaired.ok) {
        return { ok: false, error: repaired.error, status: 404 };
      }
      const retryCert = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);
      if (!retryCert.ok) {
        return { ok: false, error: retryCert.error, status: 404 };
      }
      await promotePaymentGeospatialBind(supabase, normalizedPaymentId, tier ?? 'bronze');
      const reboundCert = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);
      return {
        ok: true,
        alreadyFulfilled,
        orderId: (reboundCert.ok ? reboundCert : retryCert).orderId,
        certificate: (reboundCert.ok ? reboundCert : retryCert).certificate,
      };
    }
    return { ok: false, error: cert.error, status: 404 };
  }

  await promotePaymentGeospatialBind(supabase, normalizedPaymentId, tier ?? 'bronze');
  const reboundCert = await fetchCertificateByMoyasarPaymentId(supabase, normalizedPaymentId);

  return {
    ok: true,
    alreadyFulfilled,
    orderId: reboundCert.ok ? reboundCert.orderId : cert.orderId,
    certificate: reboundCert.ok ? reboundCert.certificate : cert.certificate,
  };
}
