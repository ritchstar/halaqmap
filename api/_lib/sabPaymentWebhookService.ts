/**
 * معالجة webhook دفع SAB — تسجيل تفعيل الرخصة، التفعيل، وإشعارات البريد.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import type { SabOppwaPaymentView } from './payment-gateway/sabOppwaClient.js';
import { metadataFromSabCustomParameters } from './payment-gateway/sabOppwaClient.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SabWebhookProcessInput = {
  payment: SabOppwaPaymentView;
  eventId?: string | null;
  eventType?: string | null;
};

export type SabWebhookProcessResult = {
  ok: boolean;
  paymentId: string;
  status: string;
  idempotent?: boolean;
  emailSent?: boolean;
  failureEmailSent?: boolean;
  accountActivated?: boolean;
  error?: string;
  detail?: unknown;
};

function tierFromMeta(meta: Record<string, unknown>): 'bronze' | 'gold' | 'diamond' | null {
  const t = String(meta.tier ?? '').toLowerCase();
  if (t === 'bronze' || t === 'gold' || t === 'diamond') return t;
  return null;
}

function licenseQuantityFromMeta(meta: Record<string, unknown>): number {
  const raw = meta.license_quantity ?? meta.licenseQuantity ?? 1;
  const n = typeof raw === 'number' ? Math.trunc(raw) : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

function licenseSkuFromMeta(meta: Record<string, unknown>, tier: 'bronze' | 'gold' | 'diamond' | null): string {
  const fromMeta = String(meta.license_sku ?? meta.licenseSku ?? '').trim().toLowerCase();
  if (fromMeta) return fromMeta;
  if (tier === 'gold') return 'gold_30';
  if (tier === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

function digitalShiftAddonFromMeta(meta: Record<string, unknown>): boolean {
  const raw = meta.digital_shift_addon ?? meta.digitalShiftAddon;
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}

function expectedAmountHalalasFromTier(tier: 'bronze' | 'gold' | 'diamond'): number {
  if (tier === 'gold') return 15000;
  if (tier === 'diamond') return 20000;
  return 10000;
}

function expectedAmountHalalasFromMeta(meta: Record<string, unknown>): number | null {
  const raw =
    meta.expected_amount_halalas ?? meta.expectedAmountHalalas ?? meta.amount_halalas_expected ?? null;
  if (raw == null) return null;
  const n = typeof raw === 'number' ? Math.trunc(raw) : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 100) return null;
  return n;
}

function appOrigin(): string {
  return String(process.env.APP_PUBLIC_ORIGIN || process.env.PUBLIC_SITE_ORIGIN || '')
    .trim()
    .replace(/\/+$/, '');
}

function internalSecret(): string {
  return String(
    process.env.LISTING_LICENSE_INTERNAL_SECRET ||
      process.env.BARBER_PROVISION_INTERNAL_SECRET ||
      '',
  ).trim();
}

function onboardingSecret(): string {
  return String(process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET || '').trim();
}

async function resolveRecipientContext(
  supabase: SupabaseClient,
  registrationRequestId: string | null,
  meta: Record<string, unknown>,
): Promise<{ email: string | null; barberName: string; linkedBarberId: string | null; phone: string | null }> {
  const fromMetaBarber = String(meta.linked_barber_id ?? meta.linkedBarberId ?? '').trim();

  if (!registrationRequestId) {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: 'عميلنا الكريم', linkedBarberId: bidOnly, phone: null };
  }

  const { data, error } = await supabase
    .from('registration_submissions')
    .select('payload')
    .eq('id', registrationRequestId)
    .maybeSingle();

  if (error || !data?.payload || typeof data.payload !== 'object') {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: 'عميلنا الكريم', linkedBarberId: bidOnly, phone: null };
  }

  const p = data.payload as Record<string, unknown>;
  const email = typeof p.email === 'string' ? p.email.trim() : '';
  const barberName = typeof p.barberName === 'string' ? p.barberName.trim() : 'عميلنا الكريم';
  const phone = typeof p.phone === 'string' ? p.phone.trim() : '';
  const linkedPayload = typeof p.linkedBarberId === 'string' ? p.linkedBarberId.trim() : '';
  const linked = UUID_RE.test(fromMetaBarber)
    ? fromMetaBarber
    : UUID_RE.test(linkedPayload)
      ? linkedPayload
      : null;

  return {
    email: email && email.includes('@') ? email : null,
    barberName: barberName || 'عميلنا الكريم',
    linkedBarberId: linked,
    phone: phone || null,
  };
}

async function provisionBarber(input: {
  registrationRequestId: string | null;
  buyerEmail: string | null;
  buyerName: string;
  buyerPhone: string | null;
  tier: 'bronze' | 'gold' | 'diamond' | null;
  moyasarPaymentId: string;
}): Promise<
  | { ok: true; barberId: string; created: boolean; credentialEmailSent: boolean }
  | { ok: false; error: string }
> {
  const origin = appOrigin();
  const secret = internalSecret();
  if (!origin || secret.length < 16) {
    return { ok: false, error: 'barber_provision_internal_not_configured' };
  }
  try {
    const resp = await fetch(`${origin}/api/barber-provision-from-payment-internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-barber-provision-internal-secret': secret,
      },
      body: JSON.stringify({
        registrationRequestId: input.registrationRequestId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        buyerPhone: input.buyerPhone,
        tier: input.tier ?? 'bronze',
        moyasarPaymentId: input.moyasarPaymentId,
      }),
    });
    const data = (await resp.json()) as Record<string, unknown>;
    if (!resp.ok) {
      return { ok: false, error: String(data.error || 'provision_failed') };
    }
    const barberId = String(data.barberId ?? '').trim();
    if (!UUID_RE.test(barberId)) {
      return { ok: false, error: 'invalid_barber_id' };
    }
    return {
      ok: true,
      barberId,
      created: data.created === true,
      credentialEmailSent: data.credentialEmailSent === true,
    };
  } catch {
    return { ok: false, error: 'provision_network' };
  }
}

async function fulfillListingLicense(input: {
  skuCode: string;
  tier: 'bronze' | 'gold' | 'diamond' | null;
  barberId: string | null;
  buyerEmail: string | null;
  buyerName: string;
  moyasarPaymentId: string;
  registrationRequestId: string | null;
  amountHalalas: number | null;
  quantity: number;
  autoRedeem: boolean;
  paymentMetadata: Record<string, unknown>;
}): Promise<
  | { ok: true; autoRedeemed: boolean; validUntil: string | null }
  | { ok: false; error: string }
> {
  const origin = appOrigin();
  const secret = internalSecret();
  if (!origin || secret.length < 16) {
    return { ok: false, error: 'listing_fulfill_internal_not_configured' };
  }
  try {
    const resp = await fetch(`${origin}/api/listing-license-fulfill-internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-listing-license-internal-secret': secret,
      },
      body: JSON.stringify({
        skuCode: input.skuCode,
        tier: input.tier,
        barberId: input.barberId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        paymentChannel: 'SAB',
        moyasarPaymentId: input.moyasarPaymentId,
        registrationRequestId: input.registrationRequestId,
        amountHalalas: input.amountHalalas,
        quantity: input.quantity,
        autoRedeem: input.autoRedeem,
        metadata: input.paymentMetadata,
      }),
    });
    const data = (await resp.json()) as Record<string, unknown>;
    if (!resp.ok) {
      return { ok: false, error: String(data.error || 'fulfill_failed') };
    }
    return {
      ok: true,
      autoRedeemed: data.autoRedeemed === true,
      validUntil: typeof data.validUntil === 'string' ? data.validUntil : null,
    };
  } catch {
    return { ok: false, error: 'fulfill_network' };
  }
}

export function verifySabWebhookSecret(request: Request): boolean {
  const secret = String(process.env.SAB_WEBHOOK_SECRET || '').trim();
  const mode = String(process.env.PAYMENT_ENV || 'test').trim().toLowerCase();
  const testSecret = String(process.env.SAB_WEBHOOK_TEST_SECRET || '').trim();
  const liveSecret = String(process.env.SAB_WEBHOOK_LIVE_SECRET || '').trim();
  const resolved = mode === 'live' ? liveSecret || secret : testSecret || secret;
  if (resolved.length < 16) return false;
  const sent =
    request.headers.get('x-sab-webhook-secret')?.trim() ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    '';
  if (!sent) return false;
  try {
    const a = Buffer.from(resolved, 'utf8');
    const b = Buffer.from(sent, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function processSabPaymentWebhook(
  supabase: SupabaseClient,
  input: SabWebhookProcessInput,
): Promise<SabWebhookProcessResult> {
  const paymentId = input.payment.checkoutId;
  const eventId = String(input.eventId ?? '').trim() || null;
  const eventType = String(input.eventType ?? 'payment.sab.paid').trim();

  if (eventId) {
    const { data: dup } = await supabase
      .from('barber_subscriptions')
      .select('id')
      .eq('moyasar_webhook_event_id', eventId)
      .maybeSingle();
    if (dup) {
      return { ok: true, paymentId, status: 'paid', idempotent: true };
    }
  }

  const meta = metadataFromSabCustomParameters(input.payment.customParameters);
  const requestId =
    String(meta.request_id ?? meta.requestId ?? input.payment.merchantTransactionId ?? '').trim() || null;
  const tier = tierFromMeta(meta);
  const amount = input.payment.amountHalalas;
  const currency = input.payment.currency || 'SAR';
  const paymentStatus = input.payment.status;
  const licenseQty = licenseQuantityFromMeta(meta);

  let rowStatus:
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'voided'
    | 'authorized'
    | 'cancelled'
    | 'pending_review'
    | 'approved' = 'pending';

  if (paymentStatus === 'paid') rowStatus = 'paid';
  else if (paymentStatus === 'failed') rowStatus = 'failed';
  else if (paymentStatus === 'cancelled') rowStatus = 'cancelled';
  else rowStatus = 'pending';

  const { email: resolvedEmail, barberName, linkedBarberId, phone: resolvedPhone } =
    await resolveRecipientContext(supabase, requestId, meta);
  const barberId = linkedBarberId && UUID_RE.test(linkedBarberId) ? linkedBarberId : null;

  const metaPayload = {
    sab_event_type: eventType,
    payment_gateway: 'SAB',
    payment_status: paymentStatus,
    sab_result_code: input.payment.resultCode,
    sab_result_description: input.payment.resultDescription,
    raw_payment_id: paymentId,
    ...(barberId ? { linked_barber_id: barberId } : {}),
  };

  const upsertRow: Record<string, unknown> = {
    moyasar_payment_id: paymentId,
    moyasar_webhook_event_id: eventId,
    registration_request_id: requestId,
    barber_id: barberId,
    tier: tier ?? null,
    amount_halalas: amount,
    currency,
    status: rowStatus,
    last_webhook_type: eventType,
    metadata: metaPayload,
    failure_reason:
      rowStatus === 'failed' || rowStatus === 'cancelled'
        ? input.payment.resultDescription || null
        : null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: selErr } = await supabase
    .from('barber_subscriptions')
    .select('id')
    .eq('moyasar_payment_id', paymentId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, paymentId, status: rowStatus, error: 'db_select_failed', detail: selErr.message };
  }

  if (existing?.id) {
    const { error: upErr } = await supabase.from('barber_subscriptions').update(upsertRow).eq('id', existing.id);
    if (upErr) {
      return { ok: false, paymentId, status: rowStatus, error: 'db_update_failed', detail: upErr.message };
    }
  } else {
    const { error: insErr } = await supabase.from('barber_subscriptions').insert({
      ...upsertRow,
      created_at: new Date().toISOString(),
    });
    if (insErr) {
      return { ok: false, paymentId, status: rowStatus, error: 'db_insert_failed', detail: insErr.message };
    }
  }

  if (rowStatus !== 'paid') {
    return { ok: true, paymentId, status: rowStatus };
  }

  const paidAmount = amount;
  const expectedFromMeta = expectedAmountHalalasFromMeta(meta);
  const expectedFromTier = tier ? expectedAmountHalalasFromTier(tier) * licenseQty : null;
  const expectedAmount = expectedFromMeta ?? expectedFromTier;
  const expectedCurrency = String(meta.expected_currency ?? meta.expectedCurrency ?? 'SAR')
    .trim()
    .toUpperCase();
  const currencyOk = !expectedCurrency || expectedCurrency === currency;
  const amountOk = expectedAmount != null && paidAmount != null && paidAmount === expectedAmount;

  if (!amountOk || !currencyOk) {
    const tsFail = new Date().toISOString();
    await supabase
      .from('barber_subscriptions')
      .update({
        failure_reason: 'Payment amount/currency mismatch with expected license SKU pricing.',
        metadata: {
          ...metaPayload,
          activation_blocked_at: tsFail,
          expected_amount_halalas: expectedAmount,
          actual_amount_halalas: paidAmount,
        },
        updated_at: tsFail,
      })
      .eq('moyasar_payment_id', paymentId);
    return {
      ok: false,
      paymentId,
      status: rowStatus,
      error: 'price_mismatch_before_activation',
    };
  }

  const skuCode = licenseSkuFromMeta(meta, tier);
  let effectiveBarberId = barberId;
  let accountActivated = false;

  if (!effectiveBarberId && (requestId || (resolvedEmail && resolvedEmail.includes('@')))) {
    const provision = await provisionBarber({
      registrationRequestId: requestId,
      buyerEmail: resolvedEmail,
      buyerName: barberName,
      buyerPhone: resolvedPhone,
      tier,
      moyasarPaymentId: paymentId,
    });
    if (!provision.ok) {
      return { ok: false, paymentId, status: rowStatus, error: 'barber_provision_failed', detail: provision.error };
    }
    effectiveBarberId = provision.barberId;
    await supabase
      .from('barber_subscriptions')
      .update({
        barber_id: effectiveBarberId,
        metadata: {
          ...metaPayload,
          barber_provisioned_at: new Date().toISOString(),
          barber_provision_created: provision.created,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('moyasar_payment_id', paymentId);
  }

  const fulfill = await fulfillListingLicense({
    skuCode,
    tier,
    barberId: effectiveBarberId,
    buyerEmail: resolvedEmail,
    buyerName: barberName,
    moyasarPaymentId: paymentId,
    registrationRequestId: requestId,
    amountHalalas: paidAmount,
    quantity: licenseQty,
    autoRedeem: Boolean(effectiveBarberId),
    paymentMetadata: meta,
  });

  if (!fulfill.ok) {
    return { ok: false, paymentId, status: rowStatus, error: 'license_fulfillment_failed', detail: fulfill.error };
  }

  accountActivated = fulfill.autoRedeemed;
  await supabase
    .from('barber_subscriptions')
    .update({
      metadata: {
        ...metaPayload,
        license_sku: skuCode,
        webhook_license_fulfilled_at: new Date().toISOString(),
        listing_valid_until: fulfill.validUntil,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('moyasar_payment_id', paymentId);

  const origin = appOrigin();
  const obSecret = onboardingSecret();
  if (origin && obSecret && effectiveBarberId && resolvedEmail) {
    const tierStr = tier === 'diamond' ? 'diamond' : tier === 'gold' ? 'gold' : 'bronze';
    try {
      await fetch(`${origin}/api/send-barber-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-onboarding-internal-secret': obSecret,
        },
        body: JSON.stringify({
          mode: 'single',
          barberEmail: resolvedEmail,
          barberName,
          tier: tierStr,
          barberId: effectiveBarberId,
          registrationOrderId: requestId || undefined,
          digitalShiftAddon: digitalShiftAddonFromMeta(meta),
        }),
      });
    } catch {
      /* non-fatal */
    }
  }

  return {
    ok: true,
    paymentId,
    status: rowStatus,
    accountActivated,
  };
}

export function createSabWebhookSupabase(): SupabaseClient | null {
  const url = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
