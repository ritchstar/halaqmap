import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import { provisionBarberForPaidOrder } from './barberProvisionService.js';
import { fetchCertificateByMoyasarPaymentId } from './geospatialLicenseAssetService.js';
import { fulfillListingLicenseOrder } from './listingLicenseService.js';
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
    return { ok: false, error: cert.error, status: 404 };
  }

  return {
    ok: true,
    alreadyFulfilled,
    orderId: cert.orderId,
    certificate: cert.certificate,
  };
}
