/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * منحة المؤسس: تفعيل 90 يوماً بدون دفع لأي حساب حلاق.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { activateGeospatialLicense } from './geospatialLicenseAssetService.js';
import {
  creditBarberListingEntitlement,
  getBarberListingBalance,
  loadProductBySku,
} from './listingLicenseService.js';
import type { ListingLicenseTier } from './listingLicenseCatalog.js';
import { listingDaysRemainingFromValidUntil } from './listingDaysRemaining.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HM_ORDER_RE = /^HM-\d{8}-[A-Z0-9]{6}$/i;

export type FounderCompBarberHit = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tier: string | null;
  member_number: number | null;
  is_active: boolean | null;
  current_valid_until: string | null;
  /** أيام متبقية — نفس مصدر لوحة الحلاق */
  listing_days_remaining: number;
  active_tiers: string | null;
  has_active_listing: boolean;
};

function digitsOnly(raw: string): string {
  return raw.replace(/\D+/g, '');
}

function asTier(raw: string): ListingLicenseTier | null {
  const t = raw.trim().toLowerCase();
  if (t === 'bronze' || t === 'gold' || t === 'diamond') return t;
  return null;
}

export function skuForFounderCompTier(tier: ListingLicenseTier): string {
  return `${tier}_90`;
}

async function attachCurrentValidUntil(
  supabase: SupabaseClient,
  row: Omit<
    FounderCompBarberHit,
    'current_valid_until' | 'listing_days_remaining' | 'active_tiers' | 'has_active_listing'
  >,
): Promise<FounderCompBarberHit> {
  const balance = await getBarberListingBalance(supabase, row.id);
  return {
    ...row,
    current_valid_until: balance.validUntil,
    listing_days_remaining: balance.listingDaysRemaining,
    active_tiers: balance.activeTier,
    has_active_listing: balance.hasActiveListing,
  };
}

function mapBarberRow(
  b: Record<string, unknown>,
): Omit<
  FounderCompBarberHit,
  'current_valid_until' | 'listing_days_remaining' | 'active_tiers' | 'has_active_listing'
> {
  const mn = b.member_number;
  return {
    id: String(b.id),
    name: b.name != null ? String(b.name) : null,
    email: b.email != null ? String(b.email) : null,
    phone: b.phone != null ? String(b.phone) : null,
    tier: b.tier != null ? String(b.tier) : null,
    member_number:
      mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null,
    is_active: typeof b.is_active === 'boolean' ? b.is_active : null,
  };
}

/**
 * بحث آمن عن حلاق واحد: UUID / بريد / هاتف / رقم عضوية / معرّف طلب HM-…
 */
export async function lookupBarberForFounderComp(
  supabase: SupabaseClient,
  rawQuery: string,
): Promise<
  | { ok: true; barber: FounderCompBarberHit }
  | { ok: false; error: string; candidates?: FounderCompBarberHit[] }
> {
  const q = String(rawQuery ?? '').trim();
  if (!q) return { ok: false, error: 'missing_query' };

  const selectCols = 'id, name, email, phone, tier, member_number, is_active';

  if (UUID_RE.test(q)) {
    const { data, error } = await supabase.from('barbers').select(selectCols).eq('id', q).maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'barber_not_found' };
    return {
      ok: true,
      barber: await attachCurrentValidUntil(supabase, mapBarberRow(data as Record<string, unknown>)),
    };
  }

  if (HM_ORDER_RE.test(q)) {
    const orderId = q.toUpperCase();
    const { data: sub } = await supabase
      .from('barber_subscriptions')
      .select('barber_id')
      .eq('registration_request_id', orderId)
      .not('barber_id', 'is', null)
      .limit(5);
    const fromSubs = (sub ?? [])
      .map((r) => String((r as { barber_id?: string }).barber_id ?? '').trim())
      .filter((id) => UUID_RE.test(id));

    const { data: licOrder } = await supabase
      .from('listing_license_orders')
      .select('barber_id')
      .eq('payment_reference', orderId)
      .not('barber_id', 'is', null)
      .limit(5);
    for (const r of licOrder ?? []) {
      const id = String((r as { barber_id?: string }).barber_id ?? '').trim();
      if (UUID_RE.test(id)) fromSubs.push(id);
    }

    let emailFromReg: string | null = null;
    const { data: reg } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', orderId)
      .maybeSingle();
    if (reg?.payload && typeof reg.payload === 'object' && !Array.isArray(reg.payload)) {
      const p = reg.payload as Record<string, unknown>;
      const email = String(p.email ?? p.Email ?? '').trim().toLowerCase();
      if (email.includes('@')) emailFromReg = email;
      const linked = String(p.linkedBarberId ?? p.linked_barber_id ?? p.barberId ?? '').trim();
      if (UUID_RE.test(linked)) fromSubs.push(linked);
    }

    const uniqueIds = [...new Set(fromSubs)];
    if (uniqueIds.length === 1) {
      return lookupBarberForFounderComp(supabase, uniqueIds[0]!);
    }
    if (uniqueIds.length > 1) {
      const { data: rows } = await supabase.from('barbers').select(selectCols).in('id', uniqueIds);
      const candidates = await Promise.all(
        (rows ?? []).map((r) =>
          attachCurrentValidUntil(supabase, mapBarberRow(r as Record<string, unknown>)),
        ),
      );
      return { ok: false, error: 'ambiguous_match', candidates };
    }
    if (emailFromReg) {
      return lookupBarberForFounderComp(supabase, emailFromReg);
    }
    return { ok: false, error: 'barber_not_found' };
  }

  if (q.includes('@')) {
    const email = q.toLowerCase();
    const { data, error } = await supabase
      .from('barbers')
      .select(selectCols)
      .ilike('email', email)
      .limit(5);
    if (error) return { ok: false, error: error.message };
    const rows = data ?? [];
    if (rows.length === 0) return { ok: false, error: 'barber_not_found' };
    if (rows.length > 1) {
      const candidates = await Promise.all(
        rows.map((r) => attachCurrentValidUntil(supabase, mapBarberRow(r as Record<string, unknown>))),
      );
      return { ok: false, error: 'ambiguous_match', candidates };
    }
    return {
      ok: true,
      barber: await attachCurrentValidUntil(supabase, mapBarberRow(rows[0]! as Record<string, unknown>)),
    };
  }

  const digits = digitsOnly(q);
  if (/^\d{1,8}$/.test(digits) && !digits.startsWith('05') && digits.length <= 6) {
    const memberNum = Number.parseInt(digits, 10);
    if (Number.isFinite(memberNum)) {
      const { data, error } = await supabase
        .from('barbers')
        .select(selectCols)
        .eq('member_number', memberNum)
        .limit(5);
      if (error) return { ok: false, error: error.message };
      const rows = data ?? [];
      if (rows.length === 1) {
        return {
          ok: true,
          barber: await attachCurrentValidUntil(
            supabase,
            mapBarberRow(rows[0]! as Record<string, unknown>),
          ),
        };
      }
      if (rows.length > 1) {
        const candidates = await Promise.all(
          rows.map((r) => attachCurrentValidUntil(supabase, mapBarberRow(r as Record<string, unknown>))),
        );
        return { ok: false, error: 'ambiguous_match', candidates };
      }
    }
  }

  if (digits.length >= 8) {
    const { data, error } = await supabase
      .from('barbers')
      .select(selectCols)
      .or(`phone.ilike.%${digits.slice(-9)}%,phone.ilike.%${digits}%`)
      .limit(8);
    if (error) return { ok: false, error: error.message };
    const rows = (data ?? []).filter((r) => {
      const p = digitsOnly(String((r as { phone?: string }).phone ?? ''));
      return p.endsWith(digits.slice(-9)) || p.includes(digits) || digits.endsWith(p.slice(-9));
    });
    if (rows.length === 0) return { ok: false, error: 'barber_not_found' };
    if (rows.length > 1) {
      const candidates = await Promise.all(
        rows.map((r) => attachCurrentValidUntil(supabase, mapBarberRow(r as Record<string, unknown>))),
      );
      return { ok: false, error: 'ambiguous_match', candidates };
    }
    return {
      ok: true,
      barber: await attachCurrentValidUntil(supabase, mapBarberRow(rows[0]! as Record<string, unknown>)),
    };
  }

  return { ok: false, error: 'unsupported_query' };
}

export async function activateFounderComp90(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    tier: ListingLicenseTier;
    reason: string;
    actorEmail: string;
    lookupQuery?: string | null;
  },
): Promise<
  | {
      ok: true;
      barberId: string;
      tier: ListingLicenseTier;
      entitlementId: string;
      orderId: string;
      validUntil: string;
      listingDaysGranted: number;
      listingDaysRemaining: number;
      previousValidUntil: string | null;
      previousListingDaysRemaining: number;
    }
  | { ok: false; error: string }
> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  const tier = asTier(input.tier);
  if (!tier) return { ok: false, error: 'invalid_tier' };

  const reason = String(input.reason ?? '').trim();
  if (reason.length < 3) return { ok: false, error: 'reason_too_short' };

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, name, email, phone, tier, member_number, is_active')
    .eq('id', barberId)
    .maybeSingle();
  if (bErr || !barber) return { ok: false, error: bErr?.message || 'barber_not_found' };

  const withUntil = await attachCurrentValidUntil(
    supabase,
    mapBarberRow(barber as Record<string, unknown>),
  );

  const sku = skuForFounderCompTier(tier);
  const productLoaded = await loadProductBySku(supabase, sku);
  if (!productLoaded.ok) return { ok: false, error: productLoaded.error };
  const product = productLoaded.product;

  const ts = new Date().toISOString();
  const actor = String(input.actorEmail ?? '').trim().toLowerCase();
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: product.id,
      buyer_email: withUntil.email,
      barber_id: barberId,
      payment_channel: 'founder_comp',
      payment_reference: `founder_comp:${barberId}:${Date.now()}`,
      amount_halalas: 0,
      currency: 'SAR',
      status: 'paid',
      paid_at: ts,
      metadata: {
        founder_comp: true,
        days: 90,
        reason,
        by: actor,
        lookup_query: input.lookupQuery ?? null,
        previous_valid_until: withUntil.current_valid_until,
        previous_tier: withUntil.tier,
      },
    })
    .select('id')
    .single();

  if (orderErr || !order?.id) {
    return { ok: false, error: orderErr?.message || 'order_insert_failed' };
  }

  const credit = await creditBarberListingEntitlement(supabase, {
    barberId,
    product,
    source: 'founder_comp_grant',
    orderId: order.id,
    stackFromExisting: true,
  });
  if (!credit.ok) return { ok: false, error: credit.error };

  try {
    await activateGeospatialLicense(supabase, {
      orderId: order.id,
      barberId,
      entitlementId: credit.entitlementId,
      tier,
      validUntil: credit.validUntil,
      registrationRequestId: null,
    });
  } catch {
    /* الشهادة اختيارية — الصلاحية كافية */
  }

  await supabase.from('listing_license_redemption_events').insert({
    voucher_id: null,
    barber_id: barberId,
    entitlement_id: credit.entitlementId,
    event_type: 'founder_comp',
  });

  /* رقيب: التحقق من نفس مصدر لوحة الحلاق بعد المنحة */
  const verified = await getBarberListingBalance(supabase, barberId);
  const expectedMin = listingDaysRemainingFromValidUntil(credit.validUntil);
  if (
    !verified.hasActiveListing ||
    verified.listingDaysRemaining < Math.max(1, expectedMin - 1) ||
    !verified.validUntil
  ) {
    return {
      ok: false,
      error: `grant_verify_failed:remaining=${verified.listingDaysRemaining};expected≈${expectedMin}`,
    };
  }

  return {
    ok: true,
    barberId,
    tier,
    entitlementId: credit.entitlementId,
    orderId: order.id,
    validUntil: verified.validUntil ?? credit.validUntil,
    listingDaysGranted: credit.listingDaysGranted,
    listingDaysRemaining: verified.listingDaysRemaining,
    previousValidUntil: withUntil.current_valid_until,
    previousListingDaysRemaining: withUntil.listing_days_remaining,
  };
}
