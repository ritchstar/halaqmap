import { getSupabaseClient } from '@/integrations/supabase/client';
import type { AdminStats } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';
import { TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

function emptyStats(): AdminStats {
  return {
    totalBarbers: 0,
    bronzeBarbers: 0,
    goldBarbers: 0,
    diamondBarbers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    pendingRequests: 0, // يُحدَّث من واجهة الإدارة حسب قائمة الطلبات
    pendingPayments: 0, // يُحدَّث من واجهة الإدارة حسب قائمة المدفوعات
    totalAppointments: 0,
    totalUsers: 0,
  };
}

/**
 * تجميع إحصائيات لوحة الإدارة من الجداول (مع fallback جزئي عند فشل استعلام).
 * لاحقاً: يمكن استبداله بـ RPC أو Edge Function عند نمو الحجم.
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  const client = getSupabaseClient();
  if (!client) return emptyStats();

  const out = emptyStats();

  const barbersRes = await client.from('barbers').select('tier, is_active');
  if (!barbersRes.error && barbersRes.data) {
    const rows = barbersRes.data as { tier: string | null; is_active: boolean | null }[];
    out.totalBarbers = rows.length;
    const active = rows.filter((r) => r.is_active !== false);
    out.activeSubscriptions = active.length;
    for (const r of active) {
      const t = (r.tier ?? 'bronze').toLowerCase();
      if (t === 'gold') out.goldBarbers += 1;
      else if (t === 'diamond') out.diamondBarbers += 1;
      else out.bronzeBarbers += 1;
    }
    out.monthlyRevenue = Math.round(
      out.bronzeBarbers * TIER_MONTHLY_SAR[SubscriptionTier.BRONZE] +
        out.goldBarbers * TIER_MONTHLY_SAR[SubscriptionTier.GOLD] +
        out.diamondBarbers * TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND]
    );
  } else if (import.meta.env.DEV) {
    console.warn('[halaqmap] fetchAdminStats barbers:', barbersRes.error?.message);
  }

  const paymentsRes = await client.from('payments').select('status, amount');
  if (!paymentsRes.error && paymentsRes.data) {
    const rows = paymentsRes.data as { status: string | null; amount: number | string | null }[];
    let pending = 0;
    let revenue = 0;
    for (const r of rows) {
      const st = (r.status ?? '').toLowerCase();
      if (st === 'pending') pending += 1;
      if (st === 'completed') {
        const a = typeof r.amount === 'string' ? parseFloat(r.amount) : Number(r.amount);
        if (!Number.isNaN(a)) revenue += a;
      }
    }
    out.pendingPayments = pending;
    out.totalRevenue = Math.round(revenue);
  } else if (import.meta.env.DEV) {
    console.warn('[halaqmap] fetchAdminStats payments:', paymentsRes.error?.message);
  }

  const bookingsCount = await client.from('bookings').select('*', { count: 'exact', head: true });
  if (!bookingsCount.error && bookingsCount.count != null) {
    out.totalAppointments = bookingsCount.count;
  }

  const profilesCount = await client.from('profiles').select('*', { count: 'exact', head: true });
  if (!profilesCount.error && profilesCount.count != null) {
    out.totalUsers = profilesCount.count;
  }

  return out;
}
