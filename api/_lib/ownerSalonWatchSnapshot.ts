import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnerSalonWatchAlert = {
  severity: 'info' | 'watch' | 'urgent';
  titleAr: string;
  bodyAr: string;
  createdAt: string;
};

export type OwnerSalonWatchSnapshot = {
  collectedAt: string;
  salonName: string;
  tier: string;
  shopOpen: boolean;
  profileUpdatedAt: string | null;
  activeConversations: number;
  conversationsStartedToday: number;
  operationalPulse: {
    severity: 'info' | 'watch' | 'urgent';
    frictionScore: number;
    summaryAr: string;
    reportedAt: string;
    listingDaysRemaining: number | null;
    shopOpen: boolean;
    walletLow: boolean;
    stagnant: boolean;
  } | null;
  alerts: OwnerSalonWatchAlert[];
  recentEvents: OwnerSalonWatchAlert[];
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function severityFromPriority(priority: number): 'info' | 'watch' | 'urgent' {
  if (priority >= 80) return 'urgent';
  if (priority >= 60) return 'watch';
  return 'info';
}

export async function buildOwnerSalonWatchSnapshot(
  supabase: SupabaseClient,
  barberId: string,
): Promise<OwnerSalonWatchSnapshot | null> {
  const id = String(barberId || '').trim();
  if (!id) return null;

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .select('id, name, tier, open_for_customers, updated_at, created_at')
    .eq('id', id)
    .maybeSingle();

  if (barberErr || !barber) return null;

  const nowIso = new Date().toISOString();
  const todayStart = startOfTodayIso();

  const [activeConvRes, todayConvRes, pulseRes, recsRes, eventsRes] = await Promise.all([
    supabase
      .from('private_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('barber_id', id)
      .eq('status', 'active')
      .gt('expires_at', nowIso),
    supabase
      .from('private_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('barber_id', id)
      .gte('started_at', todayStart),
    supabase
      .from('fleet_operational_pulse')
      .select(
        'severity, friction_score, summary_ar, reported_at, listing_days_remaining, shop_open, wallet_low, stagnant, bucket_day',
      )
      .eq('barber_id', id)
      .order('bucket_day', { ascending: false })
      .order('reported_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('barber_ai_recommendations')
      .select('category, title, body, priority, status, created_at')
      .eq('barber_id', id)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('salon_ops_events')
      .select('event_type, severity, title_ar, body_ar, created_at')
      .eq('barber_id', id)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const pulseRow = pulseRes.data as {
    severity?: string;
    friction_score?: number;
    summary_ar?: string;
    reported_at?: string;
    listing_days_remaining?: number | null;
    shop_open?: boolean;
    wallet_low?: boolean;
    stagnant?: boolean;
  } | null;

  const operationalPulse =
    pulseRow && pulseRow.reported_at
      ? {
          severity: (pulseRow.severity === 'urgent' || pulseRow.severity === 'watch'
            ? pulseRow.severity
            : 'info') as 'info' | 'watch' | 'urgent',
          frictionScore: Number(pulseRow.friction_score ?? 0),
          summaryAr: String(pulseRow.summary_ar ?? '').trim() || 'لا ملخص متاح.',
          reportedAt: String(pulseRow.reported_at),
          listingDaysRemaining:
            pulseRow.listing_days_remaining != null ? Number(pulseRow.listing_days_remaining) : null,
          shopOpen: pulseRow.shop_open !== false,
          walletLow: Boolean(pulseRow.wallet_low),
          stagnant: Boolean(pulseRow.stagnant),
        }
      : null;

  const recAlerts: OwnerSalonWatchAlert[] = (recsRes.data ?? []).map((row) => {
    const r = row as { title?: string; body?: string; priority?: number; created_at?: string };
    const priority = Number(r.priority ?? 50);
    return {
      severity: severityFromPriority(priority),
      titleAr: String(r.title ?? 'تنبيه المناوب'),
      bodyAr: String(r.body ?? '').trim(),
      createdAt: String(r.created_at ?? nowIso),
    };
  });

  const recentEvents: OwnerSalonWatchAlert[] = (eventsRes.data ?? []).map((row) => {
    const r = row as {
      severity?: string;
      title_ar?: string;
      body_ar?: string;
      created_at?: string;
    };
    return {
      severity: (r.severity === 'urgent' ? 'urgent' : r.severity === 'watch' ? 'watch' : 'info') as
        | 'info'
        | 'watch'
        | 'urgent',
      titleAr: String(r.title_ar ?? 'حدث'),
      bodyAr: String(r.body_ar ?? '').trim(),
      createdAt: String(r.created_at ?? nowIso),
    };
  });

  const profileUpdatedAt = String(barber.updated_at ?? barber.created_at ?? '') || null;

  return {
    collectedAt: nowIso,
    salonName: String(barber.name ?? ''),
    tier: String(barber.tier ?? 'bronze'),
    shopOpen: barber.open_for_customers !== false,
    profileUpdatedAt,
    activeConversations: activeConvRes.count ?? 0,
    conversationsStartedToday: todayConvRes.count ?? 0,
    operationalPulse,
    alerts: recAlerts,
    recentEvents,
  };
}
