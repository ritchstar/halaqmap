import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPublicProsecutorLabContext } from './publicProsecutorLab.js';

export type PlatformIntelligenceBaseline = {
  capturedAt: string;
  complianceGaps: number;
  inspectorPulseCount24h: number;
  urgentOpsReports24h: number;
  failedPayments24h: number | null;
  pendingEngineeringApprovals: number;
  handshakeOk: boolean;
  crisisWatchActive: boolean;
};

export type PerformanceDeltaImpact = {
  uptimeImpact: 'high' | 'medium' | 'low';
  securityCompliance: 'zero_trust_ok' | 'review_required' | 'blocked';
  maintainability: 'high' | 'medium' | 'low';
};

export type PerformanceDelta = {
  capturedAt: string;
  baseline: PlatformIntelligenceBaseline;
  projectedImpact: PerformanceDeltaImpact;
  radarIntelligenceDelta: string;
  registrationComplianceDelta: string;
  summaryAr: string;
  readyForFounder: boolean;
};

export async function capturePlatformBaseline(
  supabase: SupabaseClient,
): Promise<PlatformIntelligenceBaseline> {
  const ctx = await loadPublicProsecutorLabContext(supabase);
  let pendingEngineeringApprovals = 0;
  let handshakeOk = false;

  try {
    const { count } = await supabase
      .from('platform_engineering_executions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_approval');
    if (typeof count === 'number') pendingEngineeringApprovals = count;
  } catch {
    // partial
  }

  try {
    const { data } = await supabase
      .from('platform_engineering_handshake')
      .select('status, ops_controller_enabled')
      .eq('id', 'founder')
      .maybeSingle();
    handshakeOk = data?.status === 'ok' && data?.ops_controller_enabled === true;
  } catch {
    // migration may be pending
  }

  return {
    capturedAt: new Date().toISOString(),
    complianceGaps: ctx.complianceGaps,
    inspectorPulseCount24h: ctx.inspectorPulseCount24h,
    urgentOpsReports24h: ctx.urgentOpsReports24h,
    failedPayments24h: ctx.failedPayments24h,
    pendingEngineeringApprovals,
    handshakeOk,
    crisisWatchActive: ctx.crisisWatchActive,
  };
}

function scoreUptimeImpact(planMarkdown: string, taskDescription: string): PerformanceDeltaImpact['uptimeImpact'] {
  const text = `${planMarkdown}\n${taskDescription}`.toLowerCase();
  if (/p0|uptime|availability|failover|rollback|circuit.?breaker|health.?check/.test(text)) {
    return 'high';
  }
  if (/api|vercel|supabase|realtime|cron|ops/.test(text)) return 'medium';
  return 'low';
}

function scoreSecurityCompliance(
  planMarkdown: string,
  taskDescription: string,
  gatePassed: boolean,
): PerformanceDeltaImpact['securityCompliance'] {
  if (!gatePassed) return 'blocked';
  const text = `${planMarkdown}\n${taskDescription}`.toLowerCase();
  const risky =
    /service_role.*client|vite_.*secret|allow.*\*|bypass.*rls|hardcoded.*key/.test(text) ||
    (text.includes('service_role') && !text.includes('server') && !text.includes('api/'));
  if (risky) return 'review_required';
  if (/rls|zero.?trust|cors|auth|verifyPlatformAdmin|service_role.*api/.test(text)) {
    return 'zero_trust_ok';
  }
  return 'review_required';
}

function scoreMaintainability(planMarkdown: string): PerformanceDeltaImpact['maintainability'] {
  const text = planMarkdown.toLowerCase();
  const signals =
    (text.includes('unit test') || text.includes('vitest') || text.includes('jest') ? 1 : 0) +
    (text.includes('migration') ? 1 : 0) +
    (text.includes('rollback') ? 1 : 0) +
    (text.split('\n').filter((l) => /^\d+\./.test(l.trim())).length >= 3 ? 1 : 0);
  if (signals >= 3) return 'high';
  if (signals >= 1) return 'medium';
  return 'low';
}

export function computePerformanceDelta(input: {
  baseline: PlatformIntelligenceBaseline;
  planMarkdown: string;
  taskDescription: string;
  gatePassed: boolean;
  peerReviewReady: boolean;
  crisisConsulted: boolean;
}): PerformanceDelta {
  const projectedImpact: PerformanceDeltaImpact = {
    uptimeImpact: scoreUptimeImpact(input.planMarkdown, input.taskDescription),
    securityCompliance: scoreSecurityCompliance(
      input.planMarkdown,
      input.taskDescription,
      input.gatePassed,
    ),
    maintainability: scoreMaintainability(input.planMarkdown),
  };

  const radarDelta =
    input.baseline.inspectorPulseCount24h > 0
      ? `Radar: ${input.baseline.inspectorPulseCount24h} inspector pulses/24h — plan ${
          projectedImpact.uptimeImpact === 'high' ? 'may reduce false-positive load' : 'should not widen radar noise'
        }.`
      : 'Radar: no inspector surge — baseline stable; monitor after deploy.';

  const complianceDelta =
    input.baseline.complianceGaps > 0
      ? `Registration Compliance: ${input.baseline.complianceGaps} gap(s) active — refactor must not regress ComplianceCheckbox / professionalCommitmentAccepted.`
      : 'Registration Compliance: no open gaps — maintain audit trail on registration_submissions.';

  const readyForFounder =
    input.gatePassed &&
    input.peerReviewReady &&
    projectedImpact.securityCompliance !== 'blocked';

  const summaryAr = [
    `Performance Delta @ ${input.baseline.capturedAt}`,
    `A) Uptime Impact: ${projectedImpact.uptimeImpact}`,
    `B) Zero-Trust Security: ${projectedImpact.securityCompliance}`,
    `C) Maintainability: ${projectedImpact.maintainability}`,
    input.crisisConsulted ? 'Crisis failure simulation: executed.' : 'Crisis: not required (no bottleneck).',
    readyForFounder ? 'Status: READY for Founder Pending Approval.' : 'Status: NOT READY — gate or peer review blocked.',
  ].join(' · ');

  return {
    capturedAt: input.baseline.capturedAt,
    baseline: input.baseline,
    projectedImpact,
    radarIntelligenceDelta: radarDelta,
    registrationComplianceDelta: complianceDelta,
    summaryAr,
    readyForFounder,
  };
}

export function formatPerformanceDeltaMarkdown(delta: PerformanceDelta): string {
  return [
    '## Performance Delta',
    '',
    delta.summaryAr,
    '',
    '### Platform Radar Intelligence',
    delta.radarIntelligenceDelta,
    '',
    '### Registration Compliance',
    delta.registrationComplianceDelta,
    '',
    '### Baseline Snapshot',
    `- Compliance gaps: ${delta.baseline.complianceGaps}`,
    `- Inspector pulses (24h): ${delta.baseline.inspectorPulseCount24h}`,
    `- Urgent OPS (24h): ${delta.baseline.urgentOpsReports24h}`,
    `- Pending engineering approvals: ${delta.baseline.pendingEngineeringApprovals}`,
    `- Handshake OK: ${delta.baseline.handshakeOk ? 'yes' : 'no'}`,
  ].join('\n');
}
