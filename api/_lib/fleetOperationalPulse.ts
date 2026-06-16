/**
 * Fleet operational pulse — silent upward telemetry from salon insights (B2B, no customer PII).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DigitalShiftContext } from './digitalShiftAssistant.js';
import type { SalonOperationalAudit } from './digitalShiftSalonInsights.js';

export type FleetPulseSeverity = 'info' | 'watch' | 'urgent';

export type FleetPulseSource = 'salon_insights' | 'refresh' | 'barber_chat' | 'banner_chat';

export type FleetOperationalPulseSnapshot = {
  collectedAt: string;
  bucketDay: string;
  salonsPulsedToday: number;
  urgentCount: number;
  watchCount: number;
  avgFrictionScore: number | null;
  topFrictionByCity: { cityAr: string; salonCount: number; avgFriction: number }[];
  recentUrgentSamples: {
    cityAr: string;
    frictionScore: number;
    summaryAr: string;
    reportedAt: string;
  }[];
};

function countBrokenBanners(audit: SalonOperationalAudit): number {
  return audit.bannerProbes.filter(
    (p) => p.status === 'broken' || p.status === 'timeout' || p.status === 'invalid',
  ).length;
}

function countVisionIssues(audit: SalonOperationalAudit): number {
  return audit.bannerVision?.issues?.length ?? 0;
}

export function computeFleetPulseSeverity(
  audit: SalonOperationalAudit,
  frictionScore: number,
): FleetPulseSeverity {
  if (audit.listingDaysRemaining <= 0 || frictionScore >= 60) return 'urgent';
  if (frictionScore >= 30) return 'watch';
  return 'info';
}

export function computeFleetFrictionScore(audit: SalonOperationalAudit): number {
  let score = 0;

  if (audit.listingDaysRemaining <= 0) score += 40;
  else if (audit.listingDaysRemaining <= 7) score += 20;

  if (audit.walletLow) score += 15;
  if (!audit.shopOpen) score += 10;

  const broken = countBrokenBanners(audit);
  if (broken > 0) score += Math.min(30, broken * 15);

  if (audit.bannerCount === 0) score += 20;
  if (audit.galleryCount === 0) score += 15;
  if (audit.stagnation.stagnant) score += 25;

  score += Math.min(15, countVisionIssues(audit) * 5);

  return Math.min(100, score);
}

export function buildFleetPulseSummaryAr(audit: SalonOperationalAudit, severity: FleetPulseSeverity): string {
  const priority = audit.findingsAr.filter((f) => f.includes('❌') || f.includes('🚨') || f.includes('⚠️'));
  const picked = (priority.length > 0 ? priority : audit.findingsAr).slice(0, 3);
  const prefix =
    severity === 'urgent' ? '◆ نبض عاجل' : severity === 'watch' ? '◆ نبض مراقبة' : '◆ نبض تشغيلي';
  if (picked.length === 0) return `${prefix} — فحص روتيني بدون احتكاك حاد.`;
  return `${prefix}: ${picked.join(' · ')}`.slice(0, 500);
}

function buildPulseSnapshot(audit: SalonOperationalAudit, pulseSource: FleetPulseSource): Record<string, unknown> {
  const probes = audit.bannerProbes;
  return {
    pulseSource,
    findingsAr: audit.findingsAr.slice(0, 8),
    bannerProbeSummary: {
      ok: probes.filter((p) => p.status === 'ok').length,
      broken: probes.filter((p) => p.status === 'broken').length,
      localOnly: probes.filter((p) => p.status === 'local_only').length,
      invalid: probes.filter((p) => p.status === 'invalid').length,
      timeout: probes.filter((p) => p.status === 'timeout').length,
    },
    visionIssueCount: countVisionIssues(audit),
    showDiscountBadge: audit.showDiscountBadge,
    discountPercent: audit.discountPercent,
    daysSinceLastContact: audit.stagnation.daysSinceLastContact,
    refreshedAt: audit.refreshedAt,
  };
}

export async function emitFleetOperationalPulse(
  supabase: SupabaseClient,
  barberId: string,
  ctx: DigitalShiftContext,
  audit: SalonOperationalAudit,
  pulseSource: FleetPulseSource = 'salon_insights',
): Promise<void> {
  const cityAr = ctx.cityAr?.trim().slice(0, 120) ?? '';
  if (!cityAr) return;

  const frictionScore = computeFleetFrictionScore(audit);
  const severity = computeFleetPulseSeverity(audit, frictionScore);
  const summaryAr = buildFleetPulseSummaryAr(audit, severity);
  const brokenBannerCount = countBrokenBanners(audit);
  const bucketDay = new Date().toISOString().slice(0, 10);

  await supabase.from('fleet_operational_pulse').upsert(
    {
      barber_id: barberId,
      city_ar: cityAr,
      bucket_day: bucketDay,
      severity,
      friction_score: frictionScore,
      listing_days_remaining: audit.listingDaysRemaining,
      shop_open: audit.shopOpen,
      wallet_low: audit.walletLow,
      banner_count: audit.bannerCount,
      broken_banner_count: brokenBannerCount,
      gallery_count: audit.galleryCount,
      stagnant: audit.stagnation.stagnant,
      conversations_7d: audit.stagnation.conversations7d,
      findings_count: audit.findingsAr.length,
      summary_ar: summaryAr,
      snapshot: buildPulseSnapshot(audit, pulseSource),
      pulse_source: pulseSource,
      reported_at: new Date().toISOString(),
    },
    { onConflict: 'barber_id,bucket_day' },
  );
}

export async function loadFleetOperationalPulseSnapshot(
  supabase: SupabaseClient,
): Promise<FleetOperationalPulseSnapshot> {
  const bucketDay = new Date().toISOString().slice(0, 10);
  const empty: FleetOperationalPulseSnapshot = {
    collectedAt: new Date().toISOString(),
    bucketDay,
    salonsPulsedToday: 0,
    urgentCount: 0,
    watchCount: 0,
    avgFrictionScore: null,
    topFrictionByCity: [],
    recentUrgentSamples: [],
  };

  try {
    const { data: rows } = await supabase
      .from('fleet_operational_pulse')
      .select(
        'city_ar, severity, friction_score, summary_ar, reported_at',
      )
      .eq('bucket_day', bucketDay)
      .limit(2000);

    if (!rows?.length) return empty;

    let urgentCount = 0;
    let watchCount = 0;
    let frictionSum = 0;

    const byCity = new Map<string, { count: number; frictionSum: number }>();
    const urgentSamples: FleetOperationalPulseSnapshot['recentUrgentSamples'] = [];

    for (const row of rows) {
      const severity = String(row.severity ?? 'info');
      const friction = Number(row.friction_score ?? 0);
      frictionSum += friction;

      if (severity === 'urgent') {
        urgentCount += 1;
        if (urgentSamples.length < 6) {
          urgentSamples.push({
            cityAr: String(row.city_ar ?? '').trim(),
            frictionScore: friction,
            summaryAr: String(row.summary_ar ?? '').slice(0, 200),
            reportedAt: String(row.reported_at ?? ''),
          });
        }
      } else if (severity === 'watch') {
        watchCount += 1;
      }

      const cityAr = String(row.city_ar ?? '').trim();
      if (!cityAr) continue;
      const agg = byCity.get(cityAr) ?? { count: 0, frictionSum: 0 };
      agg.count += 1;
      agg.frictionSum += friction;
      byCity.set(cityAr, agg);
    }

    const topFrictionByCity = [...byCity.entries()]
      .map(([cityAr, agg]) => ({
        cityAr,
        salonCount: agg.count,
        avgFriction: Math.round(agg.frictionSum / agg.count),
      }))
      .sort((a, b) => b.avgFriction - a.avgFriction || b.salonCount - a.salonCount)
      .slice(0, 8);

    return {
      collectedAt: new Date().toISOString(),
      bucketDay,
      salonsPulsedToday: rows.length,
      urgentCount,
      watchCount,
      avgFrictionScore: Math.round(frictionSum / rows.length),
      topFrictionByCity,
      recentUrgentSamples: urgentSamples,
    };
  } catch {
    return empty;
  }
}
