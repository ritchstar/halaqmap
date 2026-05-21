import type { SupabaseClient } from '@supabase/supabase-js';
import {
  computePerformanceDelta,
  capturePlatformBaseline,
  formatPerformanceDeltaMarkdown,
  type PerformanceDelta,
} from './performanceDelta.js';
import { evaluateProsecutorInterject, type PublicProsecutorGovernanceAction } from './publicProsecutorLab.js';
import {
  buildSystemCrisisAdvisorLabSystemPrompt,
  callSystemCrisisAdvisorLabChat,
  loadSystemCrisisLabContext,
  loadCrisisPlaybookMarkdown,
} from './systemCrisisAdvisorLab.js';

export type ProsecutorGateResult = {
  passed: boolean;
  blocked: boolean;
  severity: 'info' | 'watch' | 'urgent';
  headlineAr: string;
  directiveAr: string;
  checks: {
    uptimeImpact: boolean;
    zeroTrustSecurity: boolean;
    maintainability: boolean;
  };
  interject: PublicProsecutorGovernanceAction | null;
};

export type PeerReviewResult = {
  ready: boolean;
  prosecutorApproved: boolean;
  consultantValidated: boolean;
  headlineAr: string;
  bodyAr: string;
  objections: string[];
  resolutions: string[];
};

export type CrisisConsultResult = {
  consulted: boolean;
  required: boolean;
  headlineAr: string;
  simulationMarkdown: string;
};

function evaluateZeroTrustChecks(planMarkdown: string, taskDescription: string) {
  const text = `${planMarkdown}\n${taskDescription}`.toLowerCase();
  return {
    uptimeImpact:
      /uptime|p0|availability|rollback|health|failover|monitor|ops|rada/i.test(text) ||
      text.includes('استمرارية'),
    zeroTrustSecurity:
      (/rls|service_role|cors|auth|verify|secret|server.?only|api\//i.test(text) &&
        !/client.*service_role|vite_.*service/i.test(text)) ||
      text.includes('zero-trust'),
    maintainability:
      /unit test|vitest|jest|migration|modular|refactor|document/i.test(text) ||
      text.split('\n').filter((l) => l.trim().startsWith('- [ ]')).length >= 2,
  };
}

export function runProsecutorGate(planMarkdown: string, taskDescription: string): ProsecutorGateResult {
  const interject = evaluateProsecutorInterject({
    userMessage: `${taskDescription}\n${planMarkdown}`,
    watchAgent: 'technical_consultant_engineering',
  });

  const checks = evaluateZeroTrustChecks(planMarkdown, taskDescription);
  const checksPassed = checks.uptimeImpact && checks.zeroTrustSecurity && checks.maintainability;

  const urgentBlock = Boolean(interject?.severity === 'urgent' && interject.p0RecoveryRequired);
  const blocked = urgentBlock || !checksPassed;

  let headlineAr = 'Prosecutor Gate — PASS';
  let directiveAr =
    'الخطة تستوفي Uptime Impact · Zero-Trust Security · Maintainability — يُسمح بالمتابعة.';

  if (urgentBlock && interject) {
    headlineAr = interject.headlineAr;
    directiveAr = interject.directiveAr;
  } else if (!checksPassed) {
    headlineAr = "Prosecutor's Gate — BLOCKED";
    const missing: string[] = [];
    if (!checks.uptimeImpact) missing.push('Maximum Uptime Impact');
    if (!checks.zeroTrustSecurity) missing.push('Zero-Trust Security');
    if (!checks.maintainability) missing.push('Long-term Maintainability');
    directiveAr = `الخطة ناقصة: ${missing.join(' · ')} — أعد الصياغة قبل أي commit.`;
  } else if (interject?.severity === 'watch') {
    headlineAr = interject.headlineAr;
    directiveAr = interject.directiveAr;
  }

  return {
    passed: !blocked,
    blocked,
    severity: blocked ? 'urgent' : interject?.severity ?? (checksPassed ? 'info' : 'watch'),
    headlineAr,
    directiveAr,
    checks,
    interject,
  };
}

export function runDoubleBlindPeerReview(
  planMarkdown: string,
  taskDescription: string,
  prosecutorGate: ProsecutorGateResult,
): PeerReviewResult {
  const objections: string[] = [];
  const resolutions: string[] = [];

  if (!prosecutorGate.checks.uptimeImpact) {
    objections.push('Prosecutor: لا يوجد تحليل Uptime / rollback واضح.');
  } else {
    resolutions.push('Consultant: الخطة تذكر Uptime/ops/radar.');
  }

  if (!prosecutorGate.checks.zeroTrustSecurity) {
    objections.push('Prosecutor: Zero-Trust — RLS/service_role/CORS غير موثّقة.');
  } else {
    resolutions.push('Consultant: Zero-Trust patterns present.');
  }

  if (!prosecutorGate.checks.maintainability) {
    objections.push('Prosecutor: Maintainability — unit tests / migration plan missing.');
  } else {
    resolutions.push('Consultant: Maintainability checklist documented.');
  }

  if (prosecutorGate.interject?.severity === 'urgent') {
    objections.push(`Prosecutor interject: ${prosecutorGate.interject.headlineAr}`);
  }

  const prosecutorApproved = prosecutorGate.passed && objections.length === 0;
  const consultantValidated =
    prosecutorApproved &&
    planMarkdown.length >= 120 &&
    !/todo|tbd|later/i.test(planMarkdown.slice(0, 500));

  const ready = prosecutorApproved && consultantValidated;

  return {
    ready,
    prosecutorApproved,
    consultantValidated,
    headlineAr: ready
      ? 'Double-Blind Peer Review — READY'
      : 'Double-Blind Peer Review — NOT READY',
    bodyAr: ready
      ? 'المدعي العام والـ Technical Consultant وافقا — يُسمح بوسم Ready.'
      : 'مراجعة الأقران لم تكتمل — راجع الاعتراضات قبل Pending Approval.',
    objections,
    resolutions,
  };
}

export async function consultCrisisAdvisorForPlan(
  supabase: SupabaseClient,
  input: { planMarkdown: string; taskDescription: string; title: string; required: boolean },
): Promise<CrisisConsultResult> {
  if (!input.required) {
    return {
      consulted: false,
      required: false,
      headlineAr: 'Crisis Advisor — not required (no performance bottleneck)',
      simulationMarkdown: '',
    };
  }

  const ctx = await loadSystemCrisisLabContext(supabase);
  const playbook = loadCrisisPlaybookMarkdown();
  const system = buildSystemCrisisAdvisorLabSystemPrompt(ctx, playbook);

  const userText = [
    'SUPER-INTELLIGENCE FEED — Failure Simulation (read-only consult).',
    `Task: ${input.title}`,
    '',
    'Simulate failure scenarios BEFORE this refactor/fix is applied.',
    'Focus: uptime regression, data integrity, payment path, RLS leak.',
    'Do NOT suggest UX improvements.',
    '',
    '### Plan under review',
    input.planMarkdown.slice(0, 6000),
    '',
    '### Task context',
    input.taskDescription.slice(0, 2000),
  ].join('\n');

  const key = (process.env.OPENAI_API_KEY || '').trim();
  let simulationMarkdown: string;

  if (!key) {
    simulationMarkdown = [
      '## Crisis Failure Simulation (rules-only fallback)',
      '',
      '1. **Uptime:** deploy during low traffic; verify /api health + AdminDashboard load.',
      '2. **Data integrity:** run registration compliance audit before/after.',
      '3. **Rollback:** keep draft branch isolated; Founder approval required.',
      '4. **Do not:** merge to main without prosecutor gate PASS.',
    ].join('\n');
  } else {
    simulationMarkdown = await callSystemCrisisAdvisorLabChat({
      system,
      userText,
      timeoutMs: 45_000,
    });
  }

  return {
    consulted: true,
    required: true,
    headlineAr: 'Crisis Advisor — failure simulation complete',
    simulationMarkdown,
  };
}

export async function runSuperIntelligencePipeline(
  supabase: SupabaseClient,
  input: {
    title: string;
    taskDescription: string;
    planMarkdown: string;
  },
): Promise<{
  prosecutorGate: ProsecutorGateResult;
  crisisConsult: CrisisConsultResult;
  peerReview: PeerReviewResult;
  performanceDelta: PerformanceDelta;
  performanceDeltaMarkdown: string;
  ready: boolean;
}> {
  const baseline = await capturePlatformBaseline(supabase);
  const bottleneck = detectPerformanceBottleneck(`${input.taskDescription}\n${input.planMarkdown}`);

  const crisisConsult = await consultCrisisAdvisorForPlan(supabase, {
    title: input.title,
    taskDescription: input.taskDescription,
    planMarkdown: input.planMarkdown,
    required: bottleneck || baseline.crisisWatchActive,
  });

  const prosecutorGate = runProsecutorGate(input.planMarkdown, input.taskDescription);
  const peerReview = runDoubleBlindPeerReview(
    input.planMarkdown,
    input.taskDescription,
    prosecutorGate,
  );

  const performanceDelta = computePerformanceDelta({
    baseline,
    planMarkdown: input.planMarkdown,
    taskDescription: input.taskDescription,
    gatePassed: prosecutorGate.passed,
    peerReviewReady: peerReview.ready,
    crisisConsulted: crisisConsult.consulted,
  });

  const ready = performanceDelta.readyForFounder && !prosecutorGate.blocked;

  return {
    prosecutorGate,
    crisisConsult,
    peerReview,
    performanceDelta,
    performanceDeltaMarkdown: formatPerformanceDeltaMarkdown(performanceDelta),
    ready,
  };
}

function detectPerformanceBottleneck(text: string): boolean {
  const triggers = [
    'performance',
    'bottleneck',
    'latency',
    'slow',
    'uptime',
    'bundle',
    'cache',
    'scale',
    'throughput',
    'timeout',
    'degradation',
    'أداء',
    'بطء',
  ];
  const lower = text.toLowerCase();
  return triggers.some((t) => lower.includes(t));
}

export async function buildSuperIntelligenceFeedSnapshot(supabase: SupabaseClient) {
  const baseline = await capturePlatformBaseline(supabase);

  const { data: recentMessages } = await supabase
    .from('platform_agent_council_messages')
    .select('id, created_at, from_agent, to_agent, message_type, severity, title, body')
    .order('created_at', { ascending: false })
    .limit(25);

  const { data: recentExecutions } = await supabase
    .from('platform_engineering_executions')
    .select('id, title, status, updated_at, detail')
    .order('updated_at', { ascending: false })
    .limit(10);

  return {
    baseline,
    councilMessages: recentMessages ?? [],
    executions: recentExecutions ?? [],
    doctrineMode: 'executive_strategic',
  };
}
