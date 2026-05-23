import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdminStats } from '@/lib/adminStatsRemote';
import { fetchAdminSentinelBrief } from '@/lib/adminSentinelRemote';
import { fetchOpsControllerFeed } from '@/lib/opsControllerRemote';
import { playPlatformRadarPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import type { PlatformRadarBriefSlice, PlatformRadarSnapshot } from '@/modules/platform-radar/types';
import { OPS_INTELLIGENCE_DIGEST_SOURCE } from '@/modules/ops-controller/types';

const DEFAULT_POLL_MS = 30_000;

function emptyBrief(): PlatformRadarBriefSlice {
  return {
    topDistricts24h: [],
    recruitmentAlerts: [],
    logsScanned24h: 0,
    failedPayments24h: 0,
    pendingSubmissions24h: 0,
    supabasePingMs: null,
    securityEvents7d: 0,
  };
}

function buildPulseSignature(
  stats: Awaited<ReturnType<typeof fetchAdminStats>>,
  brief: PlatformRadarSnapshot['brief'],
  ops: PlatformRadarSnapshot['ops'],
): string {
  return [
    stats.totalBarbers,
    stats.activeSubscriptions,
    stats.pendingPayments,
    stats.totalUsers,
    brief?.logsScanned24h ?? 0,
    brief?.failedPayments24h ?? 0,
    ops.urgentCount24h,
    brief?.topDistricts24h?.[0]?.searchCount ?? 0,
  ].join('|');
}

export function usePlatformRadarData(options?: {
  pollMs?: number;
  soundEnabled?: boolean;
  enableSentinel?: boolean;
  enableOpsFeed?: boolean;
}) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
  const soundEnabled = options?.soundEnabled ?? true;
  const enableSentinel = options?.enableSentinel ?? true;
  const enableOpsFeed = options?.enableOpsFeed ?? true;

  const [snapshot, setSnapshot] = useState<PlatformRadarSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevSignatureRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const stats = await fetchAdminStats();

      let brief: PlatformRadarBriefSlice | null = null;
      if (enableSentinel) {
        const briefRes = await fetchAdminSentinelBrief();
        if (briefRes.ok) {
          const j = briefRes.json as Record<string, unknown>;
          const searchDemand = j.searchDemand as Record<string, unknown> | undefined;
          const subscriptionHealth = j.subscriptionHealth as Record<string, unknown> | undefined;
          const paymentFailure = subscriptionHealth?.paymentFailureRadar as
            | Record<string, unknown>
            | undefined;
          const stuckForms = subscriptionHealth?.stuckFormsRadar as Record<string, unknown> | undefined;
          const supabaseLatency = subscriptionHealth?.supabaseLatency as Record<string, unknown> | undefined;
          const security = j.security as Record<string, unknown> | undefined;
          const executive = j.executiveSummary as Record<string, unknown> | undefined;

          brief = {
            searchDemandLine:
              typeof executive?.searchDemandLine === 'string' ? executive.searchDemandLine : undefined,
            recruitmentAlertsLine:
              typeof executive?.recruitmentAlertsLine === 'string'
                ? executive.recruitmentAlertsLine
                : undefined,
            topDistricts24h: Array.isArray(searchDemand?.topDistricts24h)
              ? (searchDemand.topDistricts24h as PlatformRadarBriefSlice['topDistricts24h'])
              : [],
            recruitmentAlerts: Array.isArray(searchDemand?.recruitmentAlerts)
              ? (searchDemand.recruitmentAlerts as PlatformRadarBriefSlice['recruitmentAlerts'])
              : [],
            logsScanned24h: Number(searchDemand?.logsScanned24h ?? 0),
            failedPayments24h: Number(paymentFailure?.failedPaymentsTotal ?? 0),
            pendingSubmissions24h: Number(stuckForms?.pendingPartnerSubmissions ?? 0),
            supabasePingMs:
              typeof supabaseLatency?.roundTripMs === 'number' ? supabaseLatency.roundTripMs : null,
            securityEvents7d: Number(security?.eventsLast7d ?? 0),
          };
        }
      }

      let ops: PlatformRadarSnapshot['ops'] = {
        urgentCount24h: 0,
        latestDigestSummary: null,
      };

      if (enableOpsFeed) {
        const feedRes = await fetchOpsControllerFeed(24);
        if (feedRes.ok) {
          const since = Date.now() - 24 * 60 * 60 * 1000;
          let urgent = 0;
          let digestSummary: string | null = null;
          for (const report of feedRes.body.reports) {
            const t = Date.parse(report.submittedAt);
            if (report.severity === 'urgent' && Number.isFinite(t) && t >= since) urgent += 1;
            const source = report.detail?.source;
            if (source === OPS_INTELLIGENCE_DIGEST_SOURCE && !digestSummary) {
              digestSummary = report.summary;
            }
          }
          ops = { urgentCount24h: urgent, latestDigestSummary: digestSummary };
        }
      }

      const pulseSignature = buildPulseSignature(stats, brief, ops);

      if (
        soundEnabled &&
        !isFirstLoadRef.current &&
        prevSignatureRef.current !== null &&
        prevSignatureRef.current !== pulseSignature
      ) {
        playPlatformRadarPulseSound();
      }

      prevSignatureRef.current = pulseSignature;
      isFirstLoadRef.current = false;

      setSnapshot({
        loadedAt: new Date().toISOString(),
        stats,
        brief,
        ops,
        pulseSignature,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل الرادار');
    } finally {
      setLoading(false);
    }
  }, [enableOpsFeed, enableSentinel, soundEnabled]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [load, pollMs]);

  return { snapshot, loading, error, refresh: load };
}
