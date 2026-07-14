/**
 * خدمة برنامج الشريك المرجعي — منح مقاعد ماسي+مناوب مستقلة لكل فرع.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ANCHOR_EXPIRY_WARN_DAYS,
  ANCHOR_PARTNER_AL_ENWAN_SLUG,
} from './enterpriseCohortPolicy.js';
import {
  creditBarberListingEntitlement,
  enableDigitalShiftAddonForBarber,
  loadProductBySku,
} from './listingLicenseService.js';
import { activateGeospatialLicense } from './geospatialLicenseAssetService.js';

export type EnterpriseCohortRow = {
  id: string;
  slug: string;
  name_ar: string;
  seat_quota: number;
  listing_days_granted: number;
  tier: string;
  product_sku: string;
  digital_shift_included: boolean;
  wallet_seed_halalas: number;
  wallet_funding_policy: string;
  conversion_policy: string;
  grant_clock: string;
  marketing_case_study_allowed: boolean;
  perks_tier_a: unknown;
  perks_tier_b: unknown;
  perks_tier_c_deferred: unknown;
  brand_instruction_seeds: unknown;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EnterpriseSeatRow = {
  id: string;
  cohort_id: string;
  seat_index: number;
  branch_label: string | null;
  bound_email: string | null;
  status: string;
  barber_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  order_id: string | null;
  entitlement_id: string | null;
  activated_by_admin_email: string | null;
  revoke_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type HqSeatReport = {
  seatId: string;
  seatIndex: number;
  branchLabel: string | null;
  status: string;
  barberId: string | null;
  barberName: string | null;
  barberEmail: string | null;
  boundEmail: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  expiryWarning: boolean;
  shiftEnabled: boolean | null;
  walletBalanceHalalas: number | null;
  activeInstructions: number | null;
  anchorBadge: boolean;
};

function asStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x ?? '').trim()).filter(Boolean);
}

function daysRemainingUntil(iso: string | null): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000)));
}

export async function listEnterpriseCohorts(
  supabase: SupabaseClient,
): Promise<{ ok: true; cohorts: EnterpriseCohortRow[] } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('enterprise_partner_cohorts')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, cohorts: (data ?? []) as EnterpriseCohortRow[] };
}

export async function listCohortSeats(
  supabase: SupabaseClient,
  cohortId: string,
): Promise<{ ok: true; seats: EnterpriseSeatRow[] } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('enterprise_cohort_seats')
    .select('*')
    .eq('cohort_id', cohortId)
    .order('seat_index', { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, seats: (data ?? []) as EnterpriseSeatRow[] };
}

export async function assignCohortSeat(
  supabase: SupabaseClient,
  input: {
    seatId: string;
    boundEmail?: string | null;
    branchLabel?: string | null;
  },
): Promise<{ ok: true; seat: EnterpriseSeatRow } | { ok: false; error: string }> {
  const { data: seat, error } = await supabase
    .from('enterprise_cohort_seats')
    .select('*')
    .eq('id', input.seatId)
    .maybeSingle();
  if (error || !seat) return { ok: false, error: error?.message || 'seat_not_found' };
  if (seat.status === 'activated') return { ok: false, error: 'seat_already_activated' };
  if (seat.status === 'revoked') return { ok: false, error: 'seat_revoked' };

  const email = String(input.boundEmail ?? seat.bound_email ?? '')
    .trim()
    .toLowerCase();
  const label = String(input.branchLabel ?? seat.branch_label ?? '').trim() || null;

  const { data: updated, error: updErr } = await supabase
    .from('enterprise_cohort_seats')
    .update({
      bound_email: email || null,
      branch_label: label,
      status: email ? 'assigned' : 'reserved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.seatId)
    .select('*')
    .single();

  if (updErr || !updated) return { ok: false, error: updErr?.message || 'seat_update_failed' };
  return { ok: true, seat: updated as EnterpriseSeatRow };
}

async function seedBrandInstructions(
  supabase: SupabaseClient,
  barberId: string,
  seeds: string[],
): Promise<void> {
  if (!seeds.length) return;

  const { data: existing } = await supabase
    .from('barber_ai_recommendations')
    .select('id, metadata')
    .eq('barber_id', barberId)
    .eq('category', 'private_office_instruction')
    .eq('status', 'active');

  const brandIds = (existing ?? [])
    .filter((row) => {
      const meta =
        row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : {};
      return meta.source === 'enterprise_cohort_brand';
    })
    .map((row) => row.id);

  if (brandIds.length) {
    await supabase
      .from('barber_ai_recommendations')
      .update({ status: 'dismissed' })
      .in('id', brandIds);
  }

  await supabase.from('barber_ai_recommendations').insert(
    seeds.map((text, idx) => ({
      barber_id: barberId,
      category: 'private_office_instruction',
      title: `تعليمة علامة #${idx + 1}`,
      body: text,
      priority: 90,
      status: 'active',
      metadata: { source: 'enterprise_cohort_brand', anchor: true },
    })),
  );
}

async function markAnchorBadge(
  supabase: SupabaseClient,
  barberId: string,
  cohortSlug: string,
): Promise<void> {
  const { data: row } = await supabase
    .from('barber_digital_shift_config')
    .select('banner_snapshot')
    .eq('barber_id', barberId)
    .maybeSingle();
  const snap =
    row?.banner_snapshot && typeof row.banner_snapshot === 'object' && !Array.isArray(row.banner_snapshot)
      ? (row.banner_snapshot as Record<string, unknown>)
      : {};
  await supabase
    .from('barber_digital_shift_config')
    .update({
      banner_snapshot: {
        ...snap,
        anchor_partner: true,
        anchor_cohort_slug: cohortSlug,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('barber_id', barberId);
}

async function creditOperationalWalletSeed(
  supabase: SupabaseClient,
  barberId: string,
  seatId: string,
  amountHalalas: number,
): Promise<void> {
  if (amountHalalas <= 0) return;
  const reason = `enterprise_cohort_seed:${seatId}`;
  const { data: prior } = await supabase
    .from('barber_ai_wallet_transactions')
    .select('id')
    .eq('barber_id', barberId)
    .eq('direction', 'credit')
    .eq('reason', reason)
    .maybeSingle();
  if (prior?.id) return;

  await supabase.from('barber_ai_wallet').upsert(
    { barber_id: barberId },
    { onConflict: 'barber_id', ignoreDuplicates: true },
  );

  const { data: wallet } = await supabase
    .from('barber_ai_wallet')
    .select('balance_halalas')
    .eq('barber_id', barberId)
    .maybeSingle();
  if (!wallet) return;

  const next = Number(wallet.balance_halalas ?? 0) + amountHalalas;
  await supabase
    .from('barber_ai_wallet')
    .update({ balance_halalas: next, updated_at: new Date().toISOString() })
    .eq('barber_id', barberId);

  await supabase.from('barber_ai_wallet_transactions').insert({
    barber_id: barberId,
    amount_halalas: amountHalalas,
    direction: 'credit',
    reason,
    metadata: { source: 'enterprise_cohort', seat_id: seatId },
  });
}

/**
 * تفعيل مقعد شريك مرجعي على حساب حلاق مستقل:
 * رخصة ماسية 180 يوماً + مناوب/مكتب خاص + بذرة محفظة + تعليمات علامة + شارة.
 */
export async function activateCohortSeat(
  supabase: SupabaseClient,
  input: {
    seatId: string;
    barberId: string;
    adminEmail: string;
    requireEmailMatch?: boolean;
  },
): Promise<
  | {
      ok: true;
      seat: EnterpriseSeatRow;
      validUntil: string;
      listingDaysGranted: number;
    }
  | { ok: false; error: string }
> {
  const barberId = String(input.barberId ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  const { data: seat, error: seatErr } = await supabase
    .from('enterprise_cohort_seats')
    .select('*')
    .eq('id', input.seatId)
    .maybeSingle();
  if (seatErr || !seat) return { ok: false, error: seatErr?.message || 'seat_not_found' };
  if (seat.status === 'activated') return { ok: false, error: 'seat_already_activated' };
  if (seat.status === 'revoked') return { ok: false, error: 'seat_revoked' };

  const { data: cohort, error: cErr } = await supabase
    .from('enterprise_partner_cohorts')
    .select('*')
    .eq('id', seat.cohort_id)
    .maybeSingle();
  if (cErr || !cohort) return { ok: false, error: cErr?.message || 'cohort_not_found' };
  if (cohort.status !== 'active') return { ok: false, error: 'cohort_not_active' };

  const { data: otherSeat } = await supabase
    .from('enterprise_cohort_seats')
    .select('id')
    .eq('cohort_id', seat.cohort_id)
    .eq('barber_id', barberId)
    .eq('status', 'activated')
    .maybeSingle();
  if (otherSeat?.id) return { ok: false, error: 'barber_already_has_active_seat' };

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, email, name, tier')
    .eq('id', barberId)
    .maybeSingle();
  if (bErr || !barber) return { ok: false, error: bErr?.message || 'barber_not_found' };

  const barberEmail = String(barber.email ?? '')
    .trim()
    .toLowerCase();
  const bound = String(seat.bound_email ?? '')
    .trim()
    .toLowerCase();
  if (input.requireEmailMatch !== false && bound && bound !== barberEmail) {
    return { ok: false, error: 'email_mismatch' };
  }

  const productLoaded = await loadProductBySku(supabase, String(cohort.product_sku || 'diamond_180'));
  if (!productLoaded.ok) return { ok: false, error: productLoaded.error };
  const product = productLoaded.product;

  const ts = new Date().toISOString();
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: product.id,
      buyer_email: barberEmail || bound || null,
      barber_id: barberId,
      payment_channel: 'enterprise_cohort',
      payment_reference: `anchor:${cohort.slug}:seat:${seat.seat_index}`,
      amount_halalas: 0,
      currency: 'SAR',
      status: 'paid',
      paid_at: ts,
      metadata: {
        enterprise_cohort: true,
        cohort_id: cohort.id,
        cohort_slug: cohort.slug,
        seat_id: seat.id,
        seat_index: seat.seat_index,
        digital_shift_addon: true,
        digital_shift_addon_halalas: 0,
        anchor_partner: true,
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
    source: 'enterprise_cohort_grant',
    orderId: order.id,
    stackFromExisting: false,
  });
  if (!credit.ok) return { ok: false, error: credit.error };

  await enableDigitalShiftAddonForBarber(supabase, barberId, { force: true });
  await creditOperationalWalletSeed(
    supabase,
    barberId,
    seat.id,
    Number(cohort.wallet_seed_halalas ?? 0),
  );
  await seedBrandInstructions(supabase, barberId, asStringArray(cohort.brand_instruction_seeds));
  await markAnchorBadge(supabase, barberId, String(cohort.slug));

  try {
    await activateGeospatialLicense(supabase, {
      orderId: order.id,
      barberId,
      entitlementId: credit.entitlementId,
      tier: 'diamond',
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
    event_type: 'enterprise_cohort',
  });

  const { data: updated, error: updErr } = await supabase
    .from('enterprise_cohort_seats')
    .update({
      status: 'activated',
      barber_id: barberId,
      bound_email: bound || barberEmail || null,
      activated_at: ts,
      expires_at: credit.validUntil,
      order_id: order.id,
      entitlement_id: credit.entitlementId,
      activated_by_admin_email: input.adminEmail,
      updated_at: ts,
      metadata: {
        ...(typeof seat.metadata === 'object' && seat.metadata && !Array.isArray(seat.metadata)
          ? seat.metadata
          : {}),
        activated_barber_name: barber.name,
      },
    })
    .eq('id', seat.id)
    .select('*')
    .single();

  if (updErr || !updated) return { ok: false, error: updErr?.message || 'seat_activate_failed' };

  return {
    ok: true,
    seat: updated as EnterpriseSeatRow,
    validUntil: credit.validUntil,
    listingDaysGranted: credit.listingDaysGranted,
  };
}

export async function revokeCohortSeat(
  supabase: SupabaseClient,
  input: { seatId: string; reason?: string; adminEmail: string },
): Promise<{ ok: true; seat: EnterpriseSeatRow } | { ok: false; error: string }> {
  const { data: seat, error } = await supabase
    .from('enterprise_cohort_seats')
    .select('*')
    .eq('id', input.seatId)
    .maybeSingle();
  if (error || !seat) return { ok: false, error: error?.message || 'seat_not_found' };
  if (seat.status === 'revoked') return { ok: false, error: 'seat_already_revoked' };

  if (seat.entitlement_id) {
    await supabase
      .from('barber_listing_entitlements')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', seat.entitlement_id)
      .is('revoked_at', null);
  }

  if (seat.barber_id) {
    await supabase
      .from('barber_digital_shift_config')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('barber_id', seat.barber_id);
  }

  const { data: updated, error: updErr } = await supabase
    .from('enterprise_cohort_seats')
    .update({
      status: 'revoked',
      revoke_reason: String(input.reason ?? '').trim() || 'revoked_by_admin',
      updated_at: new Date().toISOString(),
      metadata: {
        ...(typeof seat.metadata === 'object' && seat.metadata && !Array.isArray(seat.metadata)
          ? seat.metadata
          : {}),
        revoked_by: input.adminEmail,
      },
    })
    .eq('id', input.seatId)
    .select('*')
    .single();

  if (updErr || !updated) return { ok: false, error: updErr?.message || 'seat_revoke_failed' };
  return { ok: true, seat: updated as EnterpriseSeatRow };
}

/** تقرير HQ للقراءة فقط — بلا محادثات زبائن. */
export async function buildCohortHqReport(
  supabase: SupabaseClient,
  cohortId: string,
): Promise<
  | {
      ok: true;
      cohort: EnterpriseCohortRow;
      seats: HqSeatReport[];
      summary: {
        reserved: number;
        assigned: number;
        activated: number;
        expired: number;
        revoked: number;
        expiringSoon: number;
      };
    }
  | { ok: false; error: string }
> {
  const { data: cohort, error: cErr } = await supabase
    .from('enterprise_partner_cohorts')
    .select('*')
    .eq('id', cohortId)
    .maybeSingle();
  if (cErr || !cohort) return { ok: false, error: cErr?.message || 'cohort_not_found' };

  const seatsRes = await listCohortSeats(supabase, cohortId);
  if (!seatsRes.ok) return seatsRes;

  const barberIds = seatsRes.seats.map((s) => s.barber_id).filter(Boolean) as string[];

  const barbersById = new Map<string, { name: string | null; email: string | null }>();
  const shiftById = new Map<string, { enabled: boolean; badge: boolean }>();
  const walletById = new Map<string, number>();
  const instrById = new Map<string, number>();

  if (barberIds.length) {
    const [{ data: barbers }, { data: shifts }, { data: wallets }, { data: instr }] =
      await Promise.all([
        supabase.from('barbers').select('id, name, email').in('id', barberIds),
        supabase
          .from('barber_digital_shift_config')
          .select('barber_id, enabled, banner_snapshot')
          .in('barber_id', barberIds),
        supabase.from('barber_ai_wallet').select('barber_id, balance_halalas').in('barber_id', barberIds),
        supabase
          .from('barber_ai_recommendations')
          .select('barber_id')
          .in('barber_id', barberIds)
          .eq('category', 'private_office_instruction')
          .eq('status', 'active'),
      ]);

    for (const b of barbers ?? []) {
      barbersById.set(b.id, { name: b.name, email: b.email });
    }
    for (const s of shifts ?? []) {
      const snap =
        s.banner_snapshot && typeof s.banner_snapshot === 'object' && !Array.isArray(s.banner_snapshot)
          ? (s.banner_snapshot as Record<string, unknown>)
          : {};
      shiftById.set(s.barber_id, {
        enabled: s.enabled === true,
        badge: snap.anchor_partner === true,
      });
    }
    for (const w of wallets ?? []) {
      walletById.set(w.barber_id, Number(w.balance_halalas ?? 0));
    }
    for (const row of instr ?? []) {
      instrById.set(row.barber_id, (instrById.get(row.barber_id) ?? 0) + 1);
    }
  }

  const nowIso = new Date().toISOString();
  const reports: HqSeatReport[] = [];
  const summary = {
    reserved: 0,
    assigned: 0,
    activated: 0,
    expired: 0,
    revoked: 0,
    expiringSoon: 0,
  };

  for (const seat of seatsRes.seats) {
    let status = seat.status;
    if (status === 'activated' && seat.expires_at && seat.expires_at < nowIso) {
      status = 'expired';
      await supabase
        .from('enterprise_cohort_seats')
        .update({ status: 'expired', updated_at: nowIso })
        .eq('id', seat.id)
        .eq('status', 'activated');
    }

    if (status === 'reserved') summary.reserved += 1;
    else if (status === 'assigned') summary.assigned += 1;
    else if (status === 'activated') summary.activated += 1;
    else if (status === 'expired') summary.expired += 1;
    else if (status === 'revoked') summary.revoked += 1;

    const days = daysRemainingUntil(seat.expires_at);
    const warn =
      status === 'activated' && days != null && days <= ANCHOR_EXPIRY_WARN_DAYS && days >= 0;
    if (warn) summary.expiringSoon += 1;

    const b = seat.barber_id ? barbersById.get(seat.barber_id) : null;
    const sh = seat.barber_id ? shiftById.get(seat.barber_id) : null;

    reports.push({
      seatId: seat.id,
      seatIndex: seat.seat_index,
      branchLabel: seat.branch_label,
      status,
      barberId: seat.barber_id,
      barberName: b?.name ?? null,
      barberEmail: b?.email ?? null,
      boundEmail: seat.bound_email,
      activatedAt: seat.activated_at,
      expiresAt: seat.expires_at,
      daysRemaining: days,
      expiryWarning: warn,
      shiftEnabled: sh?.enabled ?? null,
      walletBalanceHalalas: seat.barber_id ? (walletById.get(seat.barber_id) ?? null) : null,
      activeInstructions: seat.barber_id ? (instrById.get(seat.barber_id) ?? 0) : null,
      anchorBadge: sh?.badge ?? false,
    });
  }

  return {
    ok: true,
    cohort: cohort as EnterpriseCohortRow,
    seats: reports,
    summary,
  };
}

export function resolveDefaultCohortSlug(): string {
  return ANCHOR_PARTNER_AL_ENWAN_SLUG;
}
