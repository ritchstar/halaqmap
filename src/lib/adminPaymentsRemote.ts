import { getSupabaseClient } from '@/integrations/supabase/client';
import type { Payment } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';

type PaymentRow = {
  id: string;
  barber_id: string;
  amount: number | string;
  tier: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  status: string | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string | null;
  barbers?: { name: string } | { name: string }[] | null;
};

function tierFromDb(t: string | null): SubscriptionTier {
  if (t === 'gold') return SubscriptionTier.GOLD;
  if (t === 'diamond') return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

function mapDbPaymentToPayment(row: PaymentRow): Payment {
  const embed = row.barbers;
  const barberName =
    Array.isArray(embed) ? embed[0]?.name ?? '—' : embed && typeof embed === 'object' ? embed.name : '—';

  const rawStatus = (row.status ?? 'pending').toLowerCase();
  let status: Payment['status'] = 'pending';
  if (rawStatus === 'completed') status = 'confirmed';
  else if (rawStatus === 'failed' || rawStatus === 'refunded') status = 'rejected';

  const methodRaw = (row.payment_method ?? '').toLowerCase();
  const method: Payment['method'] =
    methodRaw === 'bank_transfer' || methodRaw === 'cash' ? 'bank_transfer' : 'card';

  return {
    id: row.id,
    barberId: row.barber_id,
    barberName,
    amount: typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount,
    tier: tierFromDb(row.tier),
    method,
    receipt: row.receipt_url ?? undefined,
    status,
    period: row.notes?.trim() ? row.notes : '—',
    submittedAt: row.created_at ?? '',
    confirmedAt: row.paid_at ?? undefined,
  };
}

export async function fetchPaymentsForAdmin(): Promise<Payment[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('payments')
    .select(
      `
      id,
      barber_id,
      amount,
      tier,
      payment_method,
      receipt_url,
      status,
      notes,
      paid_at,
      created_at,
      barbers ( name )
    `
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    if (import.meta.env.DEV) console.warn('[halaqmap] fetchPaymentsForAdmin:', error?.message);
    return [];
  }

  return (data as PaymentRow[]).map(mapDbPaymentToPayment);
}

export async function updatePaymentStatusRemote(
  paymentId: string,
  decision: 'confirmed' | 'rejected'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const status = decision === 'confirmed' ? 'completed' : 'failed';
  const paidAt = decision === 'confirmed' ? new Date().toISOString() : null;

  const { error } = await client
    .from('payments')
    .update({ status, paid_at: paidAt })
    .eq('id', paymentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
