/**
 * ضمان إدراج نشط لأي صالون مرتبط بتجربة برونزي (كود صادر/مُسترد بلا entitlement).
 * يغطي الفجوة: إنشاء حساب حلاق عبر التسجيل دون استرداد HM-TRY.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadProductBySku, creditBarberListingEntitlement } from './listingLicenseService.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hasActiveListing(supabase: SupabaseClient, barberId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('barber_listing_entitlements')
    .select('id')
    .eq('barber_id', barberId)
    .is('revoked_at', null)
    .gt('valid_until', now)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

type TrialCodeRow = {
  id: string;
  status: string;
  redeemed_entitlement_id: string | null;
  bound_email: string | null;
  application_id: string | null;
};

async function findEligibleTrialCode(
  supabase: SupabaseClient,
  input: { barberId: string; email: string | null },
): Promise<TrialCodeRow | null> {
  const { data: byBarber } = await supabase
    .from('bronze_trial_codes')
    .select('id, status, redeemed_entitlement_id, bound_email, application_id')
    .eq('redeemed_barber_id', input.barberId)
    .eq('status', 'redeemed')
    .is('redeemed_entitlement_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byBarber?.id) return byBarber as TrialCodeRow;

  const email = (input.email || '').trim().toLowerCase();
  if (!email.includes('@')) return null;

  const { data: byBound } = await supabase
    .from('bronze_trial_codes')
    .select('id, status, redeemed_entitlement_id, bound_email, application_id')
    .eq('status', 'issued')
    .ilike('bound_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byBound?.id) return byBound as TrialCodeRow;

  const { data: app } = await supabase
    .from('bronze_trial_applications')
    .select('id, trial_code_id, status')
    .ilike('email', email)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const codeId = String((app as { trial_code_id?: string | null } | null)?.trial_code_id ?? '').trim();
  if (!UUID_RE.test(codeId)) return null;

  const { data: byApp } = await supabase
    .from('bronze_trial_codes')
    .select('id, status, redeemed_entitlement_id, bound_email, application_id')
    .eq('id', codeId)
    .maybeSingle();
  if (!byApp?.id) return null;
  if (byApp.status === 'issued') return byApp as TrialCodeRow;
  if (byApp.status === 'redeemed' && !byApp.redeemed_entitlement_id) return byApp as TrialCodeRow;
  return null;
}

/**
 * إن وُجد كود تجربة برونزي مؤهل للحلاق ولا إدراج نشط → يمنح 30 يوماً ويعلّم الكود مسترداً.
 */
export async function ensureBronzeTrialListingForBarber(
  supabase: SupabaseClient,
  input: { barberId: string; email?: string | null },
): Promise<
  | { ok: true; granted: boolean; entitlementId?: string; validUntil?: string }
  | { ok: false; error: string }
> {
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'invalid_barber_id' };

  if (await hasActiveListing(supabase, barberId)) {
    return { ok: true, granted: false };
  }

  let email = String(input.email ?? '').trim().toLowerCase() || null;
  if (!email) {
    const { data: b } = await supabase.from('barbers').select('email').eq('id', barberId).maybeSingle();
    email = String((b as { email?: string | null } | null)?.email ?? '')
      .trim()
      .toLowerCase() || null;
  }

  const code = await findEligibleTrialCode(supabase, { barberId, email });
  if (!code) return { ok: true, granted: false };

  const productLoaded = await loadProductBySku(supabase, 'bronze_30');
  if (!productLoaded.ok) return { ok: false, error: productLoaded.error };

  const nowIso = new Date().toISOString();
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .insert({
      product_id: productLoaded.product.id,
      buyer_email: email,
      barber_id: barberId,
      payment_channel: 'bronze_trial',
      payment_reference: `trial:${code.id}:auto_ensure`,
      moyasar_payment_id: null,
      registration_request_id: null,
      amount_halalas: 0,
      currency: 'SAR',
      status: 'paid',
      paid_at: nowIso,
      metadata: {
        product: 'bronze_trial',
        trial_code_id: code.id,
        listing_days: 30,
        auto_ensure: true,
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
    source: 'bronze_trial_code',
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
    event_type: 'bronze_trial',
  });

  await supabase
    .from('bronze_trial_codes')
    .update({
      status: 'redeemed',
      redeemed_at: nowIso,
      redeemed_barber_id: barberId,
      redeemed_order_id: order.id,
      redeemed_entitlement_id: credit.entitlementId,
      updated_at: nowIso,
    })
    .eq('id', code.id);

  return {
    ok: true,
    granted: true,
    entitlementId: credit.entitlementId,
    validUntil: credit.validUntil,
  };
}
