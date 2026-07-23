import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fingerprintListingLicenseCode,
  generateListingLicenseVoucherCode,
  getListingLicenseVoucherPepper,
  normalizeVoucherCodeInput,
} from './listingLicenseCrypto.js';
import {
  defaultMoyasarSkuForTier,
  type ListingLicenseProductRow,
  type ListingLicenseTier,
} from './listingLicenseCatalog.js';
import {
  dispatchDigitalShiftOnboardingEmail,
  isDigitalShiftAddonInMetadata,
} from './digitalShiftOnboardingMail.js';
import {
  activateGeospatialLicense,
  refreshGeospatialLicenseAssetBinding,
} from './geospatialLicenseAssetService.js';
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ListingFulfillInput = {
  skuCode?: string;
  tier?: string;
  barberId?: string | null;
  buyerEmail?: string | null;
  paymentChannel: 'moyasar' | 'bank_transfer' | 'admin_manual';
  paymentReference?: string | null;
  moyasarPaymentId?: string | null;
  barberSubscriptionId?: string | null;
  registrationRequestId?: string | null;
  amountHalalas?: number | null;
  metadata?: Record<string, unknown>;
  /** عدد البطاقات (1–12) — كل بطاقة = 30 يوم إدراج */
  quantity?: number;
  /** عند true: استرداد فوري للحلاق المرتبط */
  autoRedeem?: boolean;
};

export type ListingFulfillResult =
  | {
      ok: true;
      orderId: string;
      voucherId: string | null;
      entitlementId: string | null;
      autoRedeemed: boolean;
      plaintextCode?: string;
      validUntil: string;
      listingDaysGranted: number;
      tier: ListingLicenseTier;
      quantity: number;
      voucherCodes?: string[];
      geospatialAssetId?: string;
      activationCertificate?: DigitalActivationCertificatePayload;
    }
  | { ok: false; error: string; status?: number };

const DIGITAL_SHIFT_ADDON_HALALAS_PER_CARD = 2500;
const SHIFT_ADDON_PURCHASE_SYNCED_KEY = 'shift_addon_purchase_synced';

function readConfigSnapshot(snapshot: unknown): Record<string, unknown> {
  return snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
    ? (snapshot as Record<string, unknown>)
    : {};
}

async function activateDigitalShiftAddonForBarber(
  supabase: SupabaseClient,
  barberId: string,
  opts: { enableOnPurchase?: boolean; force?: boolean } = {},
): Promise<void> {
  const { data: existing } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();

  const snap = readConfigSnapshot(existing?.banner_snapshot);
  const shouldEnable = Boolean(opts.force || opts.enableOnPurchase);

  if (!existing) {
    await supabase.from('barber_digital_shift_config').upsert(
      {
        barber_id: barberId,
        enabled: true,
        banner_snapshot: { ...snap, [SHIFT_ADDON_PURCHASE_SYNCED_KEY]: true },
      },
      { onConflict: 'barber_id' },
    );
  } else if (shouldEnable) {
    await supabase
      .from('barber_digital_shift_config')
      .update({
        enabled: true,
        banner_snapshot: { ...snap, [SHIFT_ADDON_PURCHASE_SYNCED_KEY]: true },
      })
      .eq('barber_id', barberId);
  }

  await supabase.from('barber_ai_wallet').upsert(
    { barber_id: barberId },
    { onConflict: 'barber_id', ignoreDuplicates: true },
  );
}

/** تفعيل إضافة المناوب (مكتب خاص) — للاستخدام من منح الشريك المرجعي والمسارات الإدارية. */
export async function enableDigitalShiftAddonForBarber(
  supabase: SupabaseClient,
  barberId: string,
  opts: { force?: boolean } = {},
): Promise<void> {
  await activateDigitalShiftAddonForBarber(supabase, barberId, {
    enableOnPurchase: true,
    force: opts.force ?? true,
  });
}

function registrationPayloadHasDigitalShiftAddon(payload: Record<string, unknown>): boolean {
  const tier = String(payload.tier ?? '').trim().toLowerCase();
  if (tier !== 'diamond') return false;
  const raw = payload.digitalShiftAddonSelected ?? payload.digital_shift_addon;
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}

function orderAmountIncludesDigitalShiftAddon(
  amountHalalas: number | null | undefined,
  product: ListingLicenseProductRow | null,
  metadata?: Record<string, unknown>,
): boolean {
  if (!product || product.tier !== 'diamond') return false;
  if (amountHalalas == null || !Number.isFinite(amountHalalas)) return false;
  const qty = clampLicenseQuantity(metadata?.license_quantity);
  const expectedWithAddon =
    product.amount_halalas * qty + DIGITAL_SHIFT_ADDON_HALALAS_PER_CARD * qty;
  return amountHalalas >= expectedWithAddon;
}

async function paidOrderGrantsDigitalShiftAddon(
  supabase: SupabaseClient,
  order: {
    metadata?: unknown;
    amount_halalas?: number | null;
    product_id?: string | null;
  },
): Promise<boolean> {
  const meta =
    order.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)
      ? (order.metadata as Record<string, unknown>)
      : undefined;
  if (isDigitalShiftAddonInMetadata(meta)) return true;

  if (!order.product_id) return false;
  const { data: product } = await supabase
    .from('listing_license_products')
    .select('*')
    .eq('id', order.product_id)
    .maybeSingle();
  if (!product) return false;
  return orderAmountIncludesDigitalShiftAddon(
    order.amount_halalas ?? null,
    product as ListingLicenseProductRow,
    meta,
  );
}

/**
 * يُصلح حالات الدفع/الاعتماد التي لم تُفعِّل Add-on المناوب — يعتمد على metadata أو مبلغ 225 ر.س للماسي.
 */
export async function ensureDigitalShiftAddonFromPaidOrders(
  supabase: SupabaseClient,
  barberId: string,
): Promise<boolean> {
  const id = barberId.trim();
  if (!id) return false;

  const { data: existingCfg } = await supabase
    .from('barber_digital_shift_config')
    .select('enabled, banner_snapshot')
    .eq('barber_id', id)
    .maybeSingle();

  const snap = readConfigSnapshot(existingCfg?.banner_snapshot);
  if (snap[SHIFT_ADDON_PURCHASE_SYNCED_KEY] === true) {
    await supabase.from('barber_ai_wallet').upsert(
      { barber_id: id },
      { onConflict: 'barber_id', ignoreDuplicates: true },
    );
    return existingCfg?.enabled === true;
  }

  if (existingCfg?.enabled === true) {
    await supabase
      .from('barber_digital_shift_config')
      .update({
        banner_snapshot: { ...snap, [SHIFT_ADDON_PURCHASE_SYNCED_KEY]: true },
      })
      .eq('barber_id', id);
    return true;
  }

  const { data: directOrders } = await supabase
    .from('listing_license_orders')
    .select('id, metadata, amount_halalas, product_id, registration_request_id, barber_id')
    .eq('status', 'paid')
    .eq('barber_id', id);

  for (const order of directOrders ?? []) {
    if (await paidOrderGrantsDigitalShiftAddon(supabase, order)) {
      await activateDigitalShiftAddonForBarber(supabase, id, { enableOnPurchase: true });
      return true;
    }
  }

  const { data: registrations } = await supabase
    .from('registration_submissions')
    .select('id, payload')
    .eq('status', 'approved');

  const linkedRegIds: string[] = [];
  for (const row of registrations ?? []) {
    const payload =
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : null;
    if (!payload) continue;
    const linked = String(payload.linkedBarberId ?? '').trim();
    if (linked !== id) continue;
    linkedRegIds.push(String(row.id));
    if (registrationPayloadHasDigitalShiftAddon(payload)) {
      await activateDigitalShiftAddonForBarber(supabase, id, { enableOnPurchase: true });
      return true;
    }
  }

  if (linkedRegIds.length > 0) {
    const { data: regOrders } = await supabase
      .from('listing_license_orders')
      .select('id, metadata, amount_halalas, product_id, barber_id')
      .eq('status', 'paid')
      .in('registration_request_id', linkedRegIds);

    for (const order of regOrders ?? []) {
      if (!order.barber_id) {
        await supabase
          .from('listing_license_orders')
          .update({ barber_id: id, updated_at: new Date().toISOString() })
          .eq('id', order.id);
      }
      if (await paidOrderGrantsDigitalShiftAddon(supabase, order)) {
        await activateDigitalShiftAddonForBarber(supabase, id, { enableOnPurchase: true });
        return true;
      }
    }
  }

  return false;
}

function clampLicenseQuantity(raw: unknown): number {
  const n =
    typeof raw === 'number' && Number.isFinite(raw)
      ? Math.trunc(raw)
      : Number.parseInt(String(raw ?? '1').trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

export async function loadProductBySku(
  supabase: SupabaseClient,
  skuCode: string,
): Promise<{ ok: true; product: ListingLicenseProductRow } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('listing_license_products')
    .select('*')
    .eq('sku_code', skuCode.trim().toLowerCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'product_not_found' };
  return { ok: true, product: data as ListingLicenseProductRow };
}

function computeValidUntil(from: Date, daysGranted: number): Date {
  const out = new Date(from.getTime());
  out.setUTCDate(out.getUTCDate() + daysGranted);
  return out;
}

/** تمديد عند وجود صلاحية سارية: valid_until = max(now, current_max) + days */
async function resolveStackedValidUntil(
  supabase: SupabaseClient,
  barberId: string,
  daysGranted: number,
): Promise<Date> {
  const now = new Date();
  const { data: rows } = await supabase
    .from('barber_listing_entitlements')
    .select('valid_until')
    .eq('barber_id', barberId)
    .is('revoked_at', null)
    .gt('valid_until', now.toISOString())
    .order('valid_until', { ascending: false })
    .limit(1);
  const currentMax =
    rows?.[0]?.valid_until && typeof rows[0].valid_until === 'string'
      ? new Date(rows[0].valid_until)
      : null;
  const base =
    currentMax && currentMax.getTime() > now.getTime() ? currentMax : now;
  return computeValidUntil(base, daysGranted);
}

export async function creditBarberListingEntitlement(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    product: ListingLicenseProductRow;
    source:
      | 'voucher_redemption'
      | 'moyasar_auto_redeem'
      | 'admin_voucher_issue'
      | 'admin_payment_approve'
      | 'registration_approval_auto_redeem'
      | 'bronze_trial_code'
      | 'enterprise_cohort_grant';
    voucherId?: string | null;
    orderId?: string | null;
    stackFromExisting?: boolean;
  },
): Promise<
  | { ok: true; entitlementId: string; validUntil: string; listingDaysGranted: number }
  | { ok: false; error: string }
> {
  const now = new Date();
  const validUntil = input.stackFromExisting !== false
    ? await resolveStackedValidUntil(supabase, input.barberId, input.product.listing_days_granted)
    : computeValidUntil(now, input.product.listing_days_granted);

  const { data: ent, error: entErr } = await supabase
    .from('barber_listing_entitlements')
    .insert({
      barber_id: input.barberId,
      product_id: input.product.id,
      voucher_id: input.voucherId ?? null,
      order_id: input.orderId ?? null,
      tier: input.product.tier,
      listing_days_granted: input.product.listing_days_granted,
      valid_from: now.toISOString(),
      valid_until: validUntil.toISOString(),
      source: input.source,
    })
    .select('id')
    .single();

  if (entErr || !ent?.id) {
    return { ok: false, error: entErr?.message || 'entitlement_insert_failed' };
  }

  const ts = now.toISOString();
  const { error: barberErr } = await supabase
    .from('barbers')
    .update({
      is_active: true,
      is_verified: true,
      open_for_customers: true,
      tier: input.product.tier,
      updated_at: ts,
    })
    .eq('id', input.barberId);
  if (barberErr) return { ok: false, error: barberErr.message };

  return {
    ok: true,
    entitlementId: ent.id,
    validUntil: validUntil.toISOString(),
    listingDaysGranted: input.product.listing_days_granted,
  };
}

export async function issueVoucherForOrder(
  supabase: SupabaseClient,
  input: {
    orderId: string;
    product: ListingLicenseProductRow;
    deliveryEmail?: string | null;
    autoRedeem?: boolean;
    barberId?: string | null;
  },
): Promise<
  | {
      ok: true;
      voucherId: string;
      plaintextCode: string;
      autoRedeemed: boolean;
      entitlementId: string | null;
      validUntil: string | null;
    }
  | { ok: false; error: string }
> {
  const pepper = getListingLicenseVoucherPepper();
  if (!pepper) return { ok: false, error: 'voucher_pepper_not_configured' };

  const plaintextCode = generateListingLicenseVoucherCode();
  const fingerprint = fingerprintListingLicenseCode(plaintextCode, pepper);
  const now = new Date();

  const { data: voucher, error: vErr } = await supabase
    .from('listing_license_vouchers')
    .insert({
      order_id: input.orderId,
      product_id: input.product.id,
      code_fingerprint: fingerprint,
      status: input.autoRedeem ? 'redeemed' : 'issued',
      delivery_email: input.deliveryEmail?.trim() || null,
      auto_redeemed: Boolean(input.autoRedeem),
      redeemed_at: input.autoRedeem ? now.toISOString() : null,
      redeemed_barber_id: input.autoRedeem ? input.barberId ?? null : null,
      redeem_by: input.autoRedeem
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })
    .select('id')
    .single();

  if (vErr || !voucher?.id) {
    return { ok: false, error: vErr?.message || 'voucher_insert_failed' };
  }

  if (input.autoRedeem && input.barberId) {
    const credit = await creditBarberListingEntitlement(supabase, {
      barberId: input.barberId,
      product: input.product,
      source: 'moyasar_auto_redeem',
      voucherId: voucher.id,
      orderId: input.orderId,
    });
    if (!credit.ok) return { ok: false, error: credit.error };

    await supabase.from('listing_license_redemption_events').insert({
      voucher_id: voucher.id,
      barber_id: input.barberId,
      entitlement_id: credit.entitlementId,
      event_type: 'auto_redeem',
    });

    return {
      ok: true,
      voucherId: voucher.id,
      plaintextCode,
      autoRedeemed: true,
      entitlementId: credit.entitlementId,
      validUntil: credit.validUntil,
    };
  }

  return {
    ok: true,
    voucherId: voucher.id,
    plaintextCode,
    autoRedeemed: false,
    entitlementId: null,
    validUntil: null,
  };
}

export async function fulfillListingLicenseOrder(
  supabase: SupabaseClient,
  input: ListingFulfillInput,
): Promise<ListingFulfillResult> {
  const sku =
    (input.skuCode && input.skuCode.trim()) ||
    (input.tier ? defaultMoyasarSkuForTier(input.tier) : '');
  if (!sku) return { ok: false, error: 'missing_sku_or_tier', status: 400 };

  const productLoaded = await loadProductBySku(supabase, sku);
  if (!productLoaded.ok) return { ok: false, error: productLoaded.error, status: 404 };
  const product = productLoaded.product;

  const barberId =
    input.barberId && /^[0-9a-f-]{36}$/i.test(input.barberId) ? input.barberId : null;
  const autoRedeem = Boolean(input.autoRedeem && barberId);
  const quantity = clampLicenseQuantity(input.quantity ?? input.metadata?.license_quantity);

  if (input.moyasarPaymentId) {
    const { data: existingOrder } = await supabase
      .from('listing_license_orders')
      .select('id')
      .eq('moyasar_payment_id', input.moyasarPaymentId)
      .maybeSingle();
    if (existingOrder?.id) {
      return { ok: false, error: 'order_already_fulfilled', status: 409 };
    }
  }

  const ts = new Date().toISOString();
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: product.id,
      buyer_email: input.buyerEmail?.trim() || null,
      barber_id: barberId,
      payment_channel: input.paymentChannel,
      payment_reference: input.paymentReference ?? null,
      moyasar_payment_id: input.moyasarPaymentId ?? null,
      barber_subscription_id: input.barberSubscriptionId ?? null,
      registration_request_id: input.registrationRequestId ?? null,
      amount_halalas: input.amountHalalas ?? product.amount_halalas * quantity,
      currency: 'SAR',
      status: 'paid',
      paid_at: ts,
      metadata: {
        ...(input.metadata ?? {}),
        license_quantity: quantity,
        ...(isDigitalShiftAddonInMetadata(input.metadata)
          ? {
              digital_shift_addon: true,
              digital_shift_addon_halalas:
                DIGITAL_SHIFT_ADDON_HALALAS_PER_CARD * quantity,
            }
          : { digital_shift_addon: false, digital_shift_addon_halalas: 0 }),
      },
    })
    .select('id')
    .single();

  if (orderErr || !order?.id) {
    return { ok: false, error: orderErr?.message || 'order_insert_failed', status: 500 };
  }

  let firstIssued: Awaited<ReturnType<typeof issueVoucherForOrder>> | null = null;
  const voucherCodes: string[] = [];
  let lastValidUntil = '';

  for (let i = 0; i < quantity; i += 1) {
    const issued = await issueVoucherForOrder(supabase, {
      orderId: order.id,
      product,
      deliveryEmail: input.buyerEmail,
      autoRedeem,
      barberId,
    });
    if (!issued.ok) return { ok: false, error: issued.error, status: 500 };
    if (!firstIssued) firstIssued = issued;
    voucherCodes.push(issued.plaintextCode);
    if (issued.validUntil) lastValidUntil = issued.validUntil;
  }

  if (!firstIssued) {
    return { ok: false, error: 'voucher_issue_failed', status: 500 };
  }

  if (
    barberId &&
    product.tier === 'diamond' &&
    isDigitalShiftAddonInMetadata(input.metadata)
  ) {
    await activateDigitalShiftAddonForBarber(supabase, barberId, { enableOnPurchase: true });
    void dispatchDigitalShiftOnboardingEmail(supabase, {
      barberId,
      buyerEmail: input.buyerEmail,
      metadata: input.metadata,
      skipWhenWebhookMerged: true,
    }).catch(() => undefined);
  }

  const provision = await activateGeospatialLicense(supabase, {
    orderId: order.id,
    barberId,
    entitlementId: firstIssued.entitlementId,
    tier: product.tier,
    validUntil: (lastValidUntil || firstIssued.validUntil) ?? '',
    registrationRequestId: input.registrationRequestId ?? null,
  });

  return {
    ok: true,
    orderId: order.id,
    voucherId: firstIssued.voucherId,
    entitlementId: firstIssued.entitlementId,
    autoRedeemed: firstIssued.autoRedeemed,
    plaintextCode: firstIssued.autoRedeemed ? undefined : firstIssued.plaintextCode,
    validUntil: (lastValidUntil || firstIssued.validUntil) ?? '',
    listingDaysGranted: product.listing_days_granted * quantity,
    tier: product.tier,
    quantity,
    voucherCodes: firstIssued.autoRedeemed ? undefined : voucherCodes,
    geospatialAssetId: provision.status !== 'Failed' ? provision.assetId : undefined,
    activationCertificate: provision.status !== 'Failed' ? provision.certificate : undefined,
  };
}

export async function redeemListingLicenseVoucher(
  supabase: SupabaseClient,
  input: {
    code: string;
    barberId: string;
    clientIpHash?: string | null;
  },
): Promise<
  | {
      ok: true;
      entitlementId: string;
      validUntil: string;
      listingDaysRemaining: number;
      tier: ListingLicenseTier;
      listingDaysGranted: number;
    }
  | { ok: false; error: string; status: number }
> {
  const pepper = getListingLicenseVoucherPepper();
  if (!pepper) return { ok: false, error: 'voucher_pepper_not_configured', status: 503 };

  const normalized = normalizeVoucherCodeInput(input.code);
  if (normalized.length < 12) {
    return { ok: false, error: 'invalid_code', status: 400 };
  }

  const fingerprint = fingerprintListingLicenseCode(normalized, pepper);
  const { data: voucher, error: vSel } = await supabase
    .from('listing_license_vouchers')
    .select('id, status, product_id, order_id, redeem_by')
    .eq('code_fingerprint', fingerprint)
    .maybeSingle();

  if (vSel) return { ok: false, error: vSel.message, status: 500 };
  if (!voucher) return { ok: false, error: 'code_not_found', status: 404 };

  if (voucher.status === 'redeemed') {
    return { ok: false, error: 'already_redeemed', status: 409 };
  }
  if (voucher.status === 'revoked' || voucher.status === 'expired') {
    return { ok: false, error: 'code_not_valid', status: 410 };
  }

  if (voucher.redeem_by && new Date(String(voucher.redeem_by)).getTime() < Date.now()) {
    return { ok: false, error: 'code_expired', status: 410 };
  }

  const { data: product, error: pErr } = await supabase
    .from('listing_license_products')
    .select('*')
    .eq('id', voucher.product_id)
    .maybeSingle();
  if (pErr || !product) {
    return { ok: false, error: 'product_not_found', status: 500 };
  }

  const productRow = product as ListingLicenseProductRow;
  const now = new Date();

  const credit = await creditBarberListingEntitlement(supabase, {
    barberId: input.barberId,
    product: productRow,
    source: 'voucher_redemption',
    voucherId: voucher.id,
    orderId: voucher.order_id,
  });
  if (!credit.ok) return { ok: false, error: credit.error, status: 500 };

  const { error: vUp } = await supabase
    .from('listing_license_vouchers')
    .update({
      status: 'redeemed',
      redeemed_at: now.toISOString(),
      redeemed_barber_id: input.barberId,
      updated_at: now.toISOString(),
    })
    .eq('id', voucher.id)
    .eq('status', 'issued');
  if (vUp) return { ok: false, error: vUp.message, status: 500 };

  await supabase.from('listing_license_redemption_events').insert({
    voucher_id: voucher.id,
    barber_id: input.barberId,
    entitlement_id: credit.entitlementId,
    event_type: 'redeem',
    client_ip_hash: input.clientIpHash ?? null,
  });

  if (voucher.order_id) {
    await refreshGeospatialLicenseAssetBinding(supabase, {
      orderId: voucher.order_id,
      barberId: input.barberId,
      entitlementId: credit.entitlementId,
      validUntil: credit.validUntil,
      tier: productRow.tier,
    });
  }

  if (productRow.tier === 'diamond' && voucher.order_id) {
    const { data: orderRow } = await supabase
      .from('listing_license_orders')
      .select('metadata')
      .eq('id', voucher.order_id)
      .maybeSingle();
    const orderMeta =
      orderRow?.metadata && typeof orderRow.metadata === 'object' && !Array.isArray(orderRow.metadata)
        ? (orderRow.metadata as Record<string, unknown>)
        : undefined;
    if (isDigitalShiftAddonInMetadata(orderMeta)) {
      await activateDigitalShiftAddonForBarber(supabase, input.barberId, { enableOnPurchase: true });
      void dispatchDigitalShiftOnboardingEmail(supabase, {
        barberId: input.barberId,
        metadata: orderMeta,
      }).catch(() => undefined);
    }
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(credit.validUntil).getTime() - now.getTime()) / 86400000),
  );

  return {
    ok: true,
    entitlementId: credit.entitlementId,
    validUntil: credit.validUntil,
    listingDaysRemaining: daysRemaining,
    tier: productRow.tier,
    listingDaysGranted: productRow.listing_days_granted,
  };
}

async function redeemIssuedVoucherForBarber(
  supabase: SupabaseClient,
  input: {
    voucherId: string;
    barberId: string;
    orderMetadata?: Record<string, unknown>;
  },
): Promise<
  | { ok: true; entitlementId: string; validUntil: string; tier: ListingLicenseTier }
  | { ok: false; error: string }
> {
  const { data: voucher, error: vSel } = await supabase
    .from('listing_license_vouchers')
    .select('id, status, product_id, order_id')
    .eq('id', input.voucherId)
    .maybeSingle();

  if (vSel) return { ok: false, error: vSel.message };
  if (!voucher) return { ok: false, error: 'voucher_not_found' };
  if (voucher.status === 'redeemed') return { ok: false, error: 'already_redeemed' };
  if (voucher.status !== 'issued') return { ok: false, error: 'voucher_not_issued' };

  const { data: product, error: pErr } = await supabase
    .from('listing_license_products')
    .select('*')
    .eq('id', voucher.product_id)
    .maybeSingle();
  if (pErr || !product) return { ok: false, error: 'product_not_found' };

  const productRow = product as ListingLicenseProductRow;
  const now = new Date();

  const credit = await creditBarberListingEntitlement(supabase, {
    barberId: input.barberId,
    product: productRow,
    source: 'registration_approval_auto_redeem',
    voucherId: voucher.id,
    orderId: voucher.order_id,
  });
  if (!credit.ok) return { ok: false, error: credit.error };

  const { error: vUp } = await supabase
    .from('listing_license_vouchers')
    .update({
      status: 'redeemed',
      redeemed_at: now.toISOString(),
      redeemed_barber_id: input.barberId,
      updated_at: now.toISOString(),
    })
    .eq('id', voucher.id)
    .eq('status', 'issued');
  if (vUp) return { ok: false, error: vUp.message };

  await supabase.from('listing_license_redemption_events').insert({
    voucher_id: voucher.id,
    barber_id: input.barberId,
    entitlement_id: credit.entitlementId,
    event_type: 'auto_redeem',
  });

  if (voucher.order_id) {
    await refreshGeospatialLicenseAssetBinding(supabase, {
      orderId: voucher.order_id,
      barberId: input.barberId,
      entitlementId: credit.entitlementId,
      validUntil: credit.validUntil,
      tier: productRow.tier,
    });
  }

  const orderMeta = input.orderMetadata;
  if (productRow.tier === 'diamond' && voucher.order_id && isDigitalShiftAddonInMetadata(orderMeta)) {
    await activateDigitalShiftAddonForBarber(supabase, input.barberId, { enableOnPurchase: true });
    void dispatchDigitalShiftOnboardingEmail(supabase, {
      barberId: input.barberId,
      metadata: orderMeta,
    }).catch(() => undefined);
  }

  return {
    ok: true,
    entitlementId: credit.entitlementId,
    validUntil: credit.validUntil,
    tier: productRow.tier,
  };
}

/**
 * بعد اعتماد التسجيل وربط barberId: استرداد تلقائي لقسائم «issued» المرتبطة بنفس رقم الطلب.
 * يغطي مسار الدفع قبل الاعتماد الإداري (autoRedeem=false لأن barberId لم يكن موجوداً).
 */
export async function autoRedeemIssuedVouchersForRegistration(
  supabase: SupabaseClient,
  input: { registrationRequestId: string; barberId: string },
): Promise<
  | { ok: true; redeemedCount: number; validUntil: string | null; skippedAlreadyRedeemed: number }
  | { ok: false; error: string }
> {
  const requestId = input.registrationRequestId.trim();
  const barberId = input.barberId.trim();
  if (!requestId || !barberId) return { ok: false, error: 'missing_ids' };

  const { data: orders, error: orderErr } = await supabase
    .from('listing_license_orders')
    .select('id, metadata, barber_id')
    .eq('registration_request_id', requestId)
    .eq('status', 'paid');

  if (orderErr) return { ok: false, error: orderErr.message };
  if (!orders?.length) {
    return { ok: true, redeemedCount: 0, validUntil: null, skippedAlreadyRedeemed: 0 };
  }

  let redeemedCount = 0;
  let skippedAlreadyRedeemed = 0;
  let lastValidUntil: string | null = null;

  for (const order of orders) {
    const orderMeta =
      order.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)
        ? (order.metadata as Record<string, unknown>)
        : undefined;

    if (!order.barber_id) {
      await supabase
        .from('listing_license_orders')
        .update({ barber_id: barberId, updated_at: new Date().toISOString() })
        .eq('id', order.id);
    }

    const { data: vouchers, error: vErr } = await supabase
      .from('listing_license_vouchers')
      .select('id, status')
      .eq('order_id', order.id)
      .in('status', ['issued', 'redeemed']);

    if (vErr) return { ok: false, error: vErr.message };
    if (!vouchers?.length) continue;

    for (const voucher of vouchers) {
      if (voucher.status === 'redeemed') {
        skippedAlreadyRedeemed += 1;
        continue;
      }
      const redeemed = await redeemIssuedVoucherForBarber(supabase, {
        voucherId: voucher.id,
        barberId,
        orderMetadata: orderMeta,
      });
      if (!redeemed.ok) {
        if (redeemed.error === 'already_redeemed') {
          skippedAlreadyRedeemed += 1;
          continue;
        }
        return { ok: false, error: redeemed.error };
      }
      redeemedCount += 1;
      lastValidUntil = redeemed.validUntil;
    }
  }

  await ensureDigitalShiftAddonFromPaidOrders(supabase, barberId);

  return { ok: true, redeemedCount, validUntil: lastValidUntil, skippedAlreadyRedeemed };
}

/**
 * بعد اعتماد طلب تسجيل: إن لم يوجد إدراج نشط (لا قسيمة مدفوعة / لا تجربة)
 * يُمنح برونزي 30 يوماً للباقة البرونزية حتى يظهر في البحث فوراً.
 */
export async function ensureBronzeListingAfterRegistrationApprove(
  supabase: SupabaseClient,
  input: { barberId: string; registrationRequestId?: string | null },
): Promise<
  | { ok: true; granted: boolean; entitlementId?: string; validUntil?: string; via?: string }
  | { ok: false; error: string }
> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  const balance = await getBarberListingBalance(supabase, barberId);
  if (balance.hasActiveListing) {
    return { ok: true, granted: false, validUntil: balance.validUntil ?? undefined };
  }

  try {
    const { ensureBronzeTrialListingForBarber } = await import('./bronzeTrialListingEnsure.js');
    const trial = await ensureBronzeTrialListingForBarber(supabase, { barberId });
    if (trial.ok && trial.granted) {
      return {
        ok: true,
        granted: true,
        entitlementId: trial.entitlementId,
        validUntil: trial.validUntil,
        via: 'bronze_trial',
      };
    }
  } catch (err) {
    console.error('[ensureBronzeListingAfterRegistrationApprove] trial_ensure_threw', err);
  }

  const { data: barber } = await supabase
    .from('barbers')
    .select('email, tier')
    .eq('id', barberId)
    .maybeSingle();
  const tier = String((barber as { tier?: string | null } | null)?.tier ?? '')
    .trim()
    .toLowerCase();
  if (tier && tier !== 'bronze') {
    // ذهب/ماسي بدون قسيمة مدفوعة — لا نمنح إدراج مجاني تلقائياً
    return { ok: true, granted: false };
  }

  const productLoaded = await loadProductBySku(supabase, 'bronze_30');
  if (!productLoaded.ok) return { ok: false, error: productLoaded.error };

  const email =
    String((barber as { email?: string | null } | null)?.email ?? '')
      .trim()
      .toLowerCase() || null;
  const nowIso = new Date().toISOString();
  const regId = String(input.registrationRequestId ?? '').trim() || null;

  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: productLoaded.product.id,
      buyer_email: email,
      barber_id: barberId,
      payment_channel: 'admin_manual',
      payment_reference: regId ? `reg:${regId}:bronze_listing` : `barber:${barberId}:bronze_listing`,
      moyasar_payment_id: null,
      registration_request_id: regId && /^HM-/i.test(regId) ? regId : null,
      amount_halalas: 0,
      currency: 'SAR',
      status: 'paid',
      paid_at: nowIso,
      metadata: {
        product: 'bronze_registration_listing',
        auto_ensure: true,
        registration_request_id: regId,
      },
    })
    .select('id')
    .single();

  if (orderErr || !order?.id) {
    return { ok: false, error: orderErr?.message ?? 'order_insert_failed' };
  }

  const credit = await creditBarberListingEntitlement(supabase, {
    barberId,
    product: productLoaded.product,
    source: 'registration_approval_auto_redeem',
    orderId: order.id,
    stackFromExisting: true,
  });

  if (!credit.ok) {
    await supabase.from('listing_license_orders').update({ status: 'cancelled' }).eq('id', order.id);
    return { ok: false, error: credit.error };
  }

  await supabase.from('listing_license_redemption_events').insert({
    voucher_id: null,
    barber_id: barberId,
    entitlement_id: credit.entitlementId,
    event_type: 'auto_redeem',
  });

  return {
    ok: true,
    granted: true,
    entitlementId: credit.entitlementId,
    validUntil: credit.validUntil,
    via: 'bronze_registration',
  };
}

/** استرداد/إصلاح قسائم طلب دفع ميسر — يشمل القسائم issued والـ redeemed بلا entitlement. */
export async function redeemIssuedVouchersForMoyasarPayment(
  supabase: SupabaseClient,
  input: { moyasarPaymentId: string; barberId: string },
): Promise<
  | { ok: true; redeemedCount: number; repairedCount: number }
  | { ok: false; error: string }
> {
  const barberId = input.barberId.trim();
  const moyasarPaymentId = input.moyasarPaymentId.trim();
  if (!barberId || !moyasarPaymentId) return { ok: false, error: 'missing_ids' };

  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .select('id, metadata, product_id, amount_halalas, barber_id')
    .eq('moyasar_payment_id', moyasarPaymentId)
    .maybeSingle();
  if (orderErr) return { ok: false, error: orderErr.message };
  if (!order?.id) return { ok: false, error: 'order_not_found' };

  if (!order.barber_id) {
    await supabase
      .from('listing_license_orders')
      .update({ barber_id: barberId, updated_at: new Date().toISOString() })
      .eq('id', order.id);
  }

  const orderMeta =
    order.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)
      ? (order.metadata as Record<string, unknown>)
      : undefined;

  const { data: vouchers, error: vErr } = await supabase
    .from('listing_license_vouchers')
    .select('id, status, product_id, redeemed_barber_id')
    .eq('order_id', order.id);

  if (vErr) return { ok: false, error: vErr.message };

  let redeemedCount = 0;
  let repairedCount = 0;

  for (const voucher of vouchers ?? []) {
    if (voucher.status === 'issued') {
      const redeemed = await redeemIssuedVoucherForBarber(supabase, {
        voucherId: voucher.id,
        barberId,
        orderMetadata: orderMeta,
      });
      if (!redeemed.ok) {
        if (redeemed.error === 'already_redeemed') continue;
        return { ok: false, error: redeemed.error };
      }
      redeemedCount += 1;
      continue;
    }

    if (voucher.status !== 'redeemed') continue;

    const { data: entByVoucher } = await supabase
      .from('barber_listing_entitlements')
      .select('id')
      .eq('voucher_id', voucher.id)
      .maybeSingle();
    if (entByVoucher?.id) continue;

    const { data: entForBarber } = await supabase
      .from('barber_listing_entitlements')
      .select('id')
      .eq('barber_id', barberId)
      .eq('order_id', order.id)
      .is('revoked_at', null)
      .maybeSingle();
    if (entForBarber?.id) continue;

    const { data: product, error: pErr } = await supabase
      .from('listing_license_products')
      .select('*')
      .eq('id', voucher.product_id)
      .maybeSingle();
    if (pErr || !product) return { ok: false, error: 'product_not_found' };

    const productRow = product as ListingLicenseProductRow;
    const credit = await creditBarberListingEntitlement(supabase, {
      barberId,
      product: productRow,
      source: 'moyasar_auto_redeem',
      voucherId: voucher.id,
      orderId: order.id,
    });
    if (!credit.ok) return { ok: false, error: credit.error };

    if (!voucher.redeemed_barber_id || String(voucher.redeemed_barber_id) !== barberId) {
      await supabase
        .from('listing_license_vouchers')
        .update({
          redeemed_barber_id: barberId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', voucher.id);
    }

    await supabase.from('listing_license_redemption_events').insert({
      voucher_id: voucher.id,
      barber_id: barberId,
      entitlement_id: credit.entitlementId,
      event_type: 'auto_redeem',
    });

    await refreshGeospatialLicenseAssetBinding(supabase, {
      orderId: order.id,
      barberId,
      entitlementId: credit.entitlementId,
      validUntil: credit.validUntil,
      tier: productRow.tier,
    });

    repairedCount += 1;
  }

  if (!vouchers?.length && order.product_id) {
    const { data: existingEnt } = await supabase
      .from('barber_listing_entitlements')
      .select('id')
      .eq('barber_id', barberId)
      .eq('order_id', order.id)
      .is('revoked_at', null)
      .maybeSingle();
    if (!existingEnt?.id) {
      const { data: product, error: pErr } = await supabase
        .from('listing_license_products')
        .select('*')
        .eq('id', order.product_id)
        .maybeSingle();
      if (pErr || !product) return { ok: false, error: 'product_not_found' };

      const productRow = product as ListingLicenseProductRow;
      const credit = await creditBarberListingEntitlement(supabase, {
        barberId,
        product: productRow,
        source: 'moyasar_auto_redeem',
        orderId: order.id,
      });
      if (!credit.ok) return { ok: false, error: credit.error };

      await refreshGeospatialLicenseAssetBinding(supabase, {
        orderId: order.id,
        barberId,
        entitlementId: credit.entitlementId,
        validUntil: credit.validUntil,
        tier: productRow.tier,
      });
      repairedCount += 1;
    }
  }

  await ensureDigitalShiftAddonFromPaidOrders(supabase, barberId);

  return { ok: true, redeemedCount, repairedCount };
}

export async function getBarberListingBalance(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{
  hasActiveListing: boolean;
  listingDaysRemaining: number;
  validUntil: string | null;
  activeTier: string | null;
  isTrial: boolean;
}> {
  const { data, error } = await supabase.rpc('barber_listing_summary', {
    p_barber_id: barberId,
  });
  if (error || !data) {
    return {
      hasActiveListing: false,
      listingDaysRemaining: 0,
      validUntil: null,
      activeTier: null,
      isTrial: false,
    };
  }
  const row = Array.isArray(data) ? data[0] : data;
  const r = row as {
    has_active_listing?: boolean;
    listing_days_remaining?: number;
    valid_until?: string;
    active_tier?: string;
  };

  let isTrial = false;
  if (r.has_active_listing === true) {
    const now = new Date().toISOString();
    const { data: trialEnt } = await supabase
      .from('barber_listing_entitlements')
      .select('id')
      .eq('barber_id', barberId)
      .eq('source', 'bronze_trial_code')
      .is('revoked_at', null)
      .gt('valid_until', now)
      .limit(1)
      .maybeSingle();
    isTrial = Boolean(trialEnt?.id);
  }

  return {
    hasActiveListing: r.has_active_listing === true,
    listingDaysRemaining: Number(r.listing_days_remaining ?? 0),
    validUntil: r.valid_until ?? null,
    activeTier: r.active_tier ?? null,
    isTrial,
  };
}

export function buildVoucherEmailBodies(input: {
  barberName: string;
  plaintextCode: string;
  tierLabelAr: string;
  listingDaysGranted: number;
  validUntilHint?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'حلاق ماب | كود تفعيل — حزمة رخصة لخدمات الإدراج';
  const text = [
    `أهلًا ${input.barberName}،`,
    '',
    'نوع المنتج: Halaqmap Software Package (حزمة رخصة لخدمات الإدراج)',
    'شكراً لشرائك حزمة رخصة نفاذ رقمية مسبقة الدفع ضمن نظام الاستجابة الذكية على منصة حلاق ماب — يُفعَّل ظهور صالونك برمجياً عند وجود طلب نشط في محيطه.',
    '',
    `الباقة: ${input.tierLabelAr}`,
    `مدة صلاحية الإدراج: ${input.listingDaysGranted} يوماً`,
    '',
    `رمز الاسترداد: ${input.plaintextCode}`,
    '',
    'ادخل إلى لوحة الشريك → استرداد حزمة الرخصة، والصق الرمز.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f0fdf4">
<p>أهلًا <strong>${input.barberName}</strong>،</p>
<p><strong>نوع المنتج:</strong> Halaqmap Software Package (حزمة رخصة لخدمات الإدراج)</p>
<p>كود التفعيل الرقمي لحزمة الرخصة جاهز للاسترداد:</p>
<p style="font-size:20px;font-weight:bold;letter-spacing:2px;background:#fff;border:2px dashed #16a34a;padding:16px;border-radius:12px;text-align:center">${input.plaintextCode}</p>
<p>الباقة: <strong>${input.tierLabelAr}</strong> — <strong>${input.listingDaysGranted}</strong> يوم إدراج.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;
  return { subject, html, text };
}

export function tierLabelAr(tier: string): string {
  const t = tier.toLowerCase();
  if (t === 'gold') return 'ذهبي';
  if (t === 'diamond') return 'ماسي';
  return 'برونزي';
}
