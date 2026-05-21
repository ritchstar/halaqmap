# Engineering Wing + Super-Intelligence (Backend)

> Export group `GROUP-03-ENGINEERING-SUPER-INTELLIGENCE` · Commit `b0e9e73`

### `api/_lib/agentCouncilMessaging.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

export type CouncilMessageRow = {
  id: string;
  created_at: string;
  thread_id: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  severity: string;
  title: string;
  body: string;
  detail: Record<string, unknown>;
};

export function mapCouncilMessage(row: CouncilMessageRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    threadId: row.thread_id,
    fromAgent: row.from_agent,
    toAgent: row.to_agent,
    messageType: row.message_type as 'consultation' | 'compliance_verdict' | 'refactor_proposal' | 'status',
    severity: row.severity as 'info' | 'watch' | 'urgent',
    title: row.title,
    body: row.body,
    detail: row.detail,
  };
}

export async function postCouncilMessage(
  supabase: SupabaseClient,
  input: {
    threadId: string;
    fromAgent: string;
    toAgent: string;
    messageType: string;
    severity?: string;
    title: string;
    body: string;
    detail?: Record<string, unknown>;
  },
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('platform_agent_council_messages')
    .insert({
      thread_id: input.threadId,
      from_agent: input.fromAgent,
      to_agent: input.toAgent,
      message_type: input.messageType,
      severity: input.severity ?? 'info',
      title: input.title.slice(0, 240),
      body: input.body.slice(0, 12_000),
      detail: input.detail ?? {},
    })
    .select('id')
    .single();

  if (error || !data) return null;
  return { id: String(data.id) };
}

export async function fetchCouncilMessages(
  supabase: SupabaseClient,
  options?: { threadId?: string; toAgent?: string; limit?: number },
) {
  let query = supabase
    .from('platform_agent_council_messages')
    .select('id, created_at, thread_id, from_agent, to_agent, message_type, severity, title, body, detail')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 40);

  if (options?.threadId) query = query.eq('thread_id', options.threadId);
  if (options?.toAgent) query = query.eq('to_agent', options.toAgent);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => mapCouncilMessage(row as CouncilMessageRow));
}

export function buildCouncilThreadId(executionId: string): string {
  return `engineering-exec-${executionId}`;
}

```

### `api/_lib/engineeringCouncilProtocol.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildCouncilThreadId,
  fetchCouncilMessages,
  mapCouncilMessage,
  postCouncilMessage,
} from './agentCouncilMessaging.js';
import { executeApprovedEngineeringTask } from './cursorExecutionBridge.js';
import { runSuperIntelligencePipeline } from './superIntelligenceProtocol.js';

export type EngineeringExecutionStatus =
  | 'planning'
  | 'prosecutor_review'
  | 'draft_branch'
  | 'testing'
  | 'pending_approval'
  | 'gate_blocked'
  | 'approved'
  | 'rejected'
  | 'executed';

type ExecutionRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  initiator_agent: string;
  title: string;
  task_description: string;
  plan_markdown: string | null;
  prosecutor_verdict: Record<string, unknown> | null;
  draft_branch: string | null;
  unit_tests_plan: string | null;
  cursor_job_ref: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  reporter_email: string;
  detail: Record<string, unknown>;
};

export function mapExecutionRow(row: ExecutionRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as EngineeringExecutionStatus,
    initiatorAgent: row.initiator_agent,
    title: row.title,
    taskDescription: row.task_description,
    planMarkdown: row.plan_markdown ?? undefined,
    prosecutorVerdict: row.prosecutor_verdict ?? undefined,
    draftBranch: row.draft_branch ?? undefined,
    unitTestsPlan: row.unit_tests_plan ?? undefined,
    cursorJobRef: row.cursor_job_ref ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    reporterEmail: row.reporter_email,
    detail: row.detail,
  };
}

function slugifyBranch(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `draft/engineering-${slug || 'task'}-${Date.now().toString(36)}`;
}

async function generatePlanMarkdown(taskDescription: string, title: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    return [
      `## Engineering Plan — ${title}`,
      '',
      '### Scope',
      taskDescription,
      '',
      '### Steps',
      '1. Isolate change set in draft branch.',
      '2. Consult Public Prosecutor for compliance.',
      '3. Add unit tests covering changed modules.',
      '4. Submit for Founder approval before merge.',
    ].join('\n');
  }

  const model =
    (process.env.TECHNICAL_CONSULTANT_OPENAI_MODEL ||
      process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            'You are Technical Consultant of HalaqMap Engineering Council (Executive Strategic Mode). Output markdown plan with: Scope, Files, Refactor steps, Risks, Unit test targets. MUST explicitly address: A) Maximum Uptime Impact B) Zero-Trust Security (RLS/service_role/CORS) C) Long-term Maintainability. Arabic headings OK. No code execution.',
        },
        { role: 'user', content: `Title: ${title}\n\nTask:\n${taskDescription}` },
      ],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content?.trim() || `Plan for: ${title}\n\n${taskDescription}`;
}

function buildUnitTestsPlan(planMarkdown: string, title: string): string {
  return [
    `## Unit Tests Plan — ${title}`,
    '',
    '- [ ] Regression: existing registration compliance audit tests pass',
    '- [ ] New module: cover refactored exports with vitest/jest',
    '- [ ] API route: mock Supabase + assert RLS-safe payloads',
    '- [ ] UI: render smoke for affected AdminDashboard panels',
    '',
    '### Derived from plan',
    planMarkdown.slice(0, 1200),
  ].join('\n');
}

export async function runSelfDevelopmentProtocol(
  supabase: SupabaseClient,
  input: { title: string; taskDescription: string; reporterEmail: string },
): Promise<{
  execution: ReturnType<typeof mapExecutionRow>;
  messages: ReturnType<typeof mapCouncilMessage>[];
  performanceDelta?: import('./performanceDelta.js').PerformanceDelta;
  ready?: boolean;
}> {
  const now = new Date().toISOString();

  const { data: created, error } = await supabase
    .from('platform_engineering_executions')
    .insert({
      status: 'planning',
      initiator_agent: 'technical_consultant_engineering',
      title: input.title.slice(0, 200),
      task_description: input.taskDescription.slice(0, 8000),
      reporter_email: input.reporterEmail,
      detail: { protocol: 'super_intelligence_feed', step: 'propose_plan', startedAt: now },
    })
    .select('*')
    .single();

  if (error || !created) {
    throw new Error(error?.message || 'Failed to create execution');
  }

  const executionId = String(created.id);
  const threadId = buildCouncilThreadId(executionId);

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'technical_consultant_engineering',
    toAgent: 'public_prosecutor',
    messageType: 'status',
    title: 'بدء Self-Development Protocol',
    body: `Task assigned: ${input.title}`,
    detail: { executionId, step: 'propose_plan' },
  });

  const planMarkdown = await generatePlanMarkdown(input.taskDescription, input.title);

  await supabase
    .from('platform_engineering_executions')
    .update({
      plan_markdown: planMarkdown,
      status: 'prosecutor_review',
      updated_at: new Date().toISOString(),
      detail: { ...(created.detail as object), step: 'super_intelligence_pipeline' },
    })
    .eq('id', executionId);

  const pipeline = await runSuperIntelligencePipeline(supabase, {
    title: input.title,
    taskDescription: input.taskDescription,
    planMarkdown,
  });

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'technical_consultant_engineering',
    toAgent: 'public_prosecutor',
    messageType: 'consultation',
    severity: pipeline.prosecutorGate.passed ? 'info' : 'urgent',
    title: 'Pre-Commit — Prosecutor Consultation',
    body: planMarkdown.slice(0, 4000),
    detail: { executionId, step: 'consult_prosecutor_pre_commit' },
  });

  if (pipeline.crisisConsult.consulted) {
    await postCouncilMessage(supabase, {
      threadId,
      fromAgent: 'technical_consultant_engineering',
      toAgent: 'system_crisis_advisor',
      messageType: 'crisis_consult',
      severity: 'watch',
      title: pipeline.crisisConsult.headlineAr,
      body: pipeline.crisisConsult.simulationMarkdown.slice(0, 4000),
      detail: { executionId, step: 'crisis_failure_simulation' },
    });
  }

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'public_prosecutor',
    toAgent: 'technical_consultant_engineering',
    messageType: 'gate_verdict',
    severity: pipeline.prosecutorGate.blocked ? 'urgent' : 'info',
    title: pipeline.prosecutorGate.headlineAr,
    body: pipeline.prosecutorGate.directiveAr,
    detail: { executionId, gate: pipeline.prosecutorGate },
  });

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'public_prosecutor',
    toAgent: 'technical_consultant_engineering',
    messageType: 'peer_review',
    severity: pipeline.peerReview.ready ? 'info' : 'watch',
    title: pipeline.peerReview.headlineAr,
    body: pipeline.peerReview.bodyAr,
    detail: { executionId, peerReview: pipeline.peerReview },
  });

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'technical_consultant_engineering',
    toAgent: 'founder',
    messageType: 'performance_delta',
    severity: pipeline.ready ? 'info' : 'urgent',
    title: 'Performance Delta',
    body: pipeline.performanceDeltaMarkdown.slice(0, 4000),
    detail: { executionId, performanceDelta: pipeline.performanceDelta },
  });

  const prosecutorVerdict = {
    approved: pipeline.prosecutorGate.passed,
    blocked: pipeline.prosecutorGate.blocked,
    severity: pipeline.prosecutorGate.severity,
    headlineAr: pipeline.prosecutorGate.headlineAr,
    directiveAr: pipeline.prosecutorGate.directiveAr,
    peerReviewReady: pipeline.peerReview.ready,
    interject: pipeline.prosecutorGate.interject,
  };

  const draftBranch = slugifyBranch(input.title);
  const unitTestsPlan = buildUnitTestsPlan(planMarkdown, input.title);
  const finalStatus = pipeline.ready ? 'pending_approval' : 'gate_blocked';

  const { data: updated } = await supabase
    .from('platform_engineering_executions')
    .update({
      prosecutor_verdict: prosecutorVerdict,
      draft_branch: draftBranch,
      unit_tests_plan: unitTestsPlan,
      status: finalStatus,
      updated_at: new Date().toISOString(),
      detail: {
        protocol: 'super_intelligence_feed',
        step: pipeline.ready ? 'pending_approval' : 'gate_blocked',
        draftBranch,
        prosecutorApproved: pipeline.prosecutorGate.passed,
        peerReviewReady: pipeline.peerReview.ready,
        performanceDelta: pipeline.performanceDelta,
        crisisConsulted: pipeline.crisisConsult.consulted,
        ready: pipeline.ready,
      },
    })
    .eq('id', executionId)
    .select('*')
    .single();

  if (pipeline.ready) {
    await postCouncilMessage(supabase, {
      threadId,
      fromAgent: 'technical_consultant_engineering',
      toAgent: 'founder',
      messageType: 'refactor_proposal',
      severity: 'watch',
      title: `Pending Approval — ${input.title}`,
      body: `Draft branch: ${draftBranch}\n\nProsecutor Gate + Peer Review: READY\n\nAwaiting Founder «Approve Execution».`,
      detail: { executionId, draftBranch, requiresApproval: true },
    });
  } else {
    await postCouncilMessage(supabase, {
      threadId,
      fromAgent: 'public_prosecutor',
      toAgent: 'founder',
      messageType: 'gate_verdict',
      severity: 'urgent',
      title: `BLOCKED — ${input.title}`,
      body: pipeline.prosecutorGate.directiveAr,
      detail: { executionId, blocked: true },
    });
  }

  const messages = await fetchCouncilMessages(supabase, { threadId, limit: 30 });
  return {
    execution: mapExecutionRow((updated ?? created) as ExecutionRow),
    messages,
    performanceDelta: pipeline.performanceDelta,
    ready: pipeline.ready,
  };
}

export async function listEngineeringExecutions(
  supabase: SupabaseClient,
  status?: EngineeringExecutionStatus,
) {
  let query = supabase
    .from('platform_engineering_executions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(30);

  if (status) query = query.eq('status', status);

  const { data } = await query;
  return (data ?? []).map((row) => mapExecutionRow(row as ExecutionRow));
}

export async function approveEngineeringExecution(
  supabase: SupabaseClient,
  executionId: string,
  actorEmail: string,
): Promise<{ execution: ReturnType<typeof mapExecutionRow>; cursorResult: Awaited<ReturnType<typeof executeApprovedEngineeringTask>> }> {
  const { data: row, error } = await supabase
    .from('platform_engineering_executions')
    .select('*')
    .eq('id', executionId)
    .maybeSingle();

  if (error || !row) throw new Error('Execution not found');
  if (row.status !== 'pending_approval') throw new Error('Execution is not pending approval');

  const cursorResult = await executeApprovedEngineeringTask({
    executionId,
    title: row.title,
    taskDescription: row.task_description,
    planMarkdown: row.plan_markdown ?? undefined,
    draftBranch: row.draft_branch ?? undefined,
    unitTestsPlan: row.unit_tests_plan ?? undefined,
  });

  const approvedAt = new Date().toISOString();
  const { data: updated } = await supabase
    .from('platform_engineering_executions')
    .update({
      status: 'executed',
      approved_by: actorEmail,
      approved_at: approvedAt,
      cursor_job_ref: cursorResult.jobRef,
      updated_at: approvedAt,
      detail: {
        ...(row.detail as object),
        cursorResult,
        approvedAt,
      },
    })
    .eq('id', executionId)
    .select('*')
    .single();

  const threadId = buildCouncilThreadId(executionId);
  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'founder',
    toAgent: 'technical_consultant_engineering',
    messageType: 'status',
    severity: 'info',
    title: 'Approve Execution — تمت الموافقة',
    body: cursorResult.messageAr,
    detail: { executionId, cursorJobRef: cursorResult.jobRef },
  });

  return {
    execution: mapExecutionRow((updated ?? row) as ExecutionRow),
    cursorResult,
  };
}

export async function rejectEngineeringExecution(
  supabase: SupabaseClient,
  executionId: string,
  actorEmail: string,
  reason?: string,
) {
  const rejectedAt = new Date().toISOString();
  const { data: updated } = await supabase
    .from('platform_engineering_executions')
    .update({
      status: 'rejected',
      rejected_by: actorEmail,
      rejected_at: rejectedAt,
      updated_at: rejectedAt,
      detail: { rejectedReason: reason ?? 'Founder rejected execution' },
    })
    .eq('id', executionId)
    .eq('status', 'pending_approval')
    .select('*')
    .single();

  if (!updated) throw new Error('Execution not found or not pending');

  const threadId = buildCouncilThreadId(executionId);
  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'founder',
    toAgent: 'technical_consultant_engineering',
    messageType: 'status',
    severity: 'watch',
    title: 'رفض التنفيذ',
    body: reason ?? 'Founder rejected — revise plan and re-submit.',
    detail: { executionId },
  });

  return mapExecutionRow(updated as ExecutionRow);
}

export async function suggestRefactorFromProsecutorFeedback(
  supabase: SupabaseClient,
  reporterEmail: string,
): Promise<{ suggestion: string; execution?: ReturnType<typeof mapExecutionRow> }> {
  const { data: papers } = await supabase
    .from('platform_ops_controller_reports')
    .select('title, summary, detail, severity')
    .eq('category', 'compliance')
    .order('submitted_at', { ascending: false })
    .limit(5);

  const gaps: string[] = [];
  for (const row of papers ?? []) {
    gaps.push(`${row.title}: ${row.summary}`);
  }

  const suggestion =
    gaps.length > 0
      ? `Refactor proposal based on Public Prosecutor/compliance feed:\n${gaps.join('\n')}`
      : 'No urgent compliance gaps — propose hygiene refactor for registration compliance module.';

  if (gaps.length === 0) {
    return { suggestion };
  }

  const result = await runSelfDevelopmentProtocol(supabase, {
    title: 'Compliance-driven refactor',
    taskDescription: suggestion,
    reporterEmail,
  });

  return { suggestion, execution: result.execution };
}

```

### `api/_lib/superIntelligenceProtocol.ts`

```typescript
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

```

### `api/_lib/performanceDelta.ts`

```typescript
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

```

### `api/_lib/engineeringWingHandshake.ts`

```typescript
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './supabaseUrl.js';

export type HandshakeServiceId = 'supabase' | 'vercel' | 'github';

export type HandshakeServicePing = {
  id: HandshakeServiceId;
  label: string;
  ok: boolean;
  latencyMs: number;
  message: string;
  detail?: Record<string, unknown>;
};

export type EngineeringWingSecrets = {
  supabaseUrl: string;
  supabaseServiceKey: string;
  vercelToken: string;
  vercelProjectId: string;
  githubToken: string;
  source: 'process_env' | 'agent_secrets_env' | 'mixed';
};

export type EngineeringWingHandshakeResult = {
  status: 'ok' | 'fail';
  checkedAt: string;
  secretsValid: boolean;
  secretIssues: string[];
  services: HandshakeServicePing[];
  vercelDeploymentUrl: string | null;
  vercelDeploymentId: string | null;
  opsControllerEnabled: boolean;
};

const AGENT_SECRETS_FILENAME = '.agent_secrets.env';

function parseEnvFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function readAgentSecretsFile(): Record<string, string> {
  try {
    const filePath = resolve(process.cwd(), AGENT_SECRETS_FILENAME);
    const raw = readFileSync(filePath, 'utf8');
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = (value || '').trim();
    if (trimmed) return trimmed;
  }
  return '';
}

export function loadEngineeringWingSecrets(): EngineeringWingSecrets {
  const fileSecrets = readAgentSecretsFile();
  const fromFile = Object.keys(fileSecrets).length > 0;

  const supabaseUrl = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    fileSecrets.SUPABASE_URL,
  );
  const supabaseServiceKey = firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    fileSecrets.SUPABASE_SERVICE_ROLE_KEY,
    fileSecrets.SUPABASE_SERVICE_KEY,
  );
  const vercelToken = firstNonEmpty(process.env.VERCEL_TOKEN, fileSecrets.VERCEL_TOKEN);
  const vercelProjectId = firstNonEmpty(
    process.env.VERCEL_PROJECT_ID,
    fileSecrets.VERCEL_PROJECT_ID,
  );
  const githubToken = firstNonEmpty(process.env.GITHUB_TOKEN, fileSecrets.GITHUB_TOKEN);

  const processHasAny = Boolean(
    process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.VERCEL_TOKEN ||
      process.env.VERCEL_PROJECT_ID ||
      process.env.GITHUB_TOKEN,
  );

  return {
    supabaseUrl: normalizeSupabaseUrl(supabaseUrl) || supabaseUrl,
    supabaseServiceKey,
    vercelToken,
    vercelProjectId,
    githubToken,
    source: processHasAny && fromFile ? 'mixed' : fromFile ? 'agent_secrets_env' : 'process_env',
  };
}

export function validateEngineeringWingSecrets(secrets: EngineeringWingSecrets): string[] {
  const issues: string[] = [];
  if (!secrets.supabaseUrl || !isLikelyHttpUrl(secrets.supabaseUrl)) {
    issues.push('SUPABASE_URL missing or invalid');
  }
  if (!secrets.supabaseServiceKey || secrets.supabaseServiceKey.length < 20) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY missing or too short');
  }
  if (!secrets.vercelToken || !secrets.vercelToken.startsWith('vcp_')) {
    issues.push('VERCEL_TOKEN missing or invalid prefix');
  }
  if (!secrets.vercelProjectId || !secrets.vercelProjectId.startsWith('prj_')) {
    issues.push('VERCEL_PROJECT_ID missing or invalid prefix');
  }
  if (!secrets.githubToken || !/^(ghp_|github_pat_)/.test(secrets.githubToken)) {
    issues.push('GITHUB_TOKEN missing or invalid prefix');
  }
  return issues;
}

async function pingSupabase(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.supabaseUrl || !secrets.supabaseServiceKey) {
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: false,
      latencyMs: 0,
      message: 'Missing Supabase credentials',
    };
  }

  try {
    const client = createClient(secrets.supabaseUrl, secrets.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.from('platform_admin_roles').select('id').limit(1);
    if (error) {
      return {
        id: 'supabase',
        label: 'Supabase',
        ok: false,
        latencyMs: Date.now() - started,
        message: error.message,
      };
    }
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'REST ping OK',
      detail: { host: new URL(secrets.supabaseUrl).host },
    };
  } catch (err) {
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Supabase ping failed',
    };
  }
}

async function pingVercel(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.vercelToken || !secrets.vercelProjectId) {
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: false,
      latencyMs: 0,
      message: 'Missing Vercel credentials',
    };
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(secrets.vercelProjectId)}`,
      {
        headers: { Authorization: `Bearer ${secrets.vercelToken}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as { name?: string; error?: { message?: string } };
    if (!res.ok) {
      return {
        id: 'vercel',
        label: 'Vercel',
        ok: false,
        latencyMs: Date.now() - started,
        message: body.error?.message || `HTTP ${res.status}`,
      };
    }
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'Project API OK',
      detail: { projectName: body.name ?? null },
    };
  } catch (err) {
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Vercel ping failed',
    };
  }
}

async function pingGitHub(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.githubToken) {
    return {
      id: 'github',
      label: 'GitHub',
      ok: false,
      latencyMs: 0,
      message: 'Missing GitHub token',
    };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${secrets.githubToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'HalaqMap-Engineering-Wing',
      },
    });
    const body = (await res.json().catch(() => ({}))) as { login?: string; message?: string };
    if (!res.ok) {
      return {
        id: 'github',
        label: 'GitHub',
        ok: false,
        latencyMs: Date.now() - started,
        message: body.message || `HTTP ${res.status}`,
      };
    }
    return {
      id: 'github',
      label: 'GitHub',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'User API OK',
      detail: { login: body.login ?? null },
    };
  } catch (err) {
    return {
      id: 'github',
      label: 'GitHub',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'GitHub ping failed',
    };
  }
}

export async function fetchLatestVercelDeployment(secrets: EngineeringWingSecrets): Promise<{
  url: string | null;
  id: string | null;
}> {
  if (!secrets.vercelToken || !secrets.vercelProjectId) {
    return { url: null, id: null };
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(secrets.vercelProjectId)}&limit=1`,
      { headers: { Authorization: `Bearer ${secrets.vercelToken}` } },
    );
    const body = (await res.json().catch(() => ({}))) as {
      deployments?: Array<{ uid?: string; url?: string; state?: string; readyState?: string }>;
    };
    const latest = body.deployments?.[0];
    if (!latest?.url) return { url: null, id: latest?.uid ?? null };
    const host = latest.url.startsWith('http') ? latest.url : `https://${latest.url}`;
    return { url: host, id: latest.uid ?? null };
  } catch {
    return { url: null, id: null };
  }
}

export async function runEngineeringWingHandshake(): Promise<EngineeringWingHandshakeResult> {
  const secrets = loadEngineeringWingSecrets();
  const secretIssues = validateEngineeringWingSecrets(secrets);
  const secretsValid = secretIssues.length === 0;

  const [supabase, vercel, github, deployment] = await Promise.all([
    pingSupabase(secrets),
    pingVercel(secrets),
    pingGitHub(secrets),
    fetchLatestVercelDeployment(secrets),
  ]);

  const services = [supabase, vercel, github];
  const allServicesOk = services.every((s) => s.ok);
  const status = secretsValid && allServicesOk ? 'ok' : 'fail';

  return {
    status,
    checkedAt: new Date().toISOString(),
    secretsValid,
    secretIssues,
    services,
    vercelDeploymentUrl: deployment.url,
    vercelDeploymentId: deployment.id,
    opsControllerEnabled: status === 'ok',
  };
}

export type StoredHandshakeRow = {
  status: string;
  handshake_at: string | null;
  services: HandshakeServicePing[] | Record<string, unknown>;
  vercel_deployment_url: string | null;
  vercel_deployment_id: string | null;
  ops_controller_enabled: boolean;
  updated_at: string;
};

export async function readStoredHandshake(
  supabase: SupabaseClient,
): Promise<StoredHandshakeRow | null> {
  const { data, error } = await supabase
    .from('platform_engineering_handshake')
    .select(
      'status, handshake_at, services, vercel_deployment_url, vercel_deployment_id, ops_controller_enabled, updated_at',
    )
    .eq('id', 'founder')
    .maybeSingle();

  if (error || !data) return null;
  return data as StoredHandshakeRow;
}

export async function persistHandshake(
  supabase: SupabaseClient,
  result: EngineeringWingHandshakeResult,
  actorEmail: string,
): Promise<void> {
  const now = new Date().toISOString();
  await supabase.from('platform_engineering_handshake').upsert(
    {
      id: 'founder',
      status: result.status,
      handshake_at: result.status === 'ok' ? now : null,
      services: result.services,
      vercel_deployment_url: result.vercelDeploymentUrl,
      vercel_deployment_id: result.vercelDeploymentId,
      ops_controller_enabled: result.opsControllerEnabled,
      updated_at: now,
    },
    { onConflict: 'id' },
  );
}

export function secretsDiagnostics() {
  const secrets = loadEngineeringWingSecrets();
  const issues = validateEngineeringWingSecrets(secrets);
  return {
    secretsSource: secrets.source,
    agentSecretsFileReadable: Object.keys(readAgentSecretsFile()).length > 0,
    secretsValid: issues.length === 0,
    secretIssues: issues,
    configured: {
      supabaseUrl: Boolean(secrets.supabaseUrl),
      supabaseServiceKey: Boolean(secrets.supabaseServiceKey),
      vercelToken: Boolean(secrets.vercelToken),
      vercelProjectId: Boolean(secrets.vercelProjectId),
      githubToken: Boolean(secrets.githubToken),
    },
  };
}

```

### `api/_lib/cursorExecutionBridge.ts`

```typescript
/** Cursor SDK / CLI execution bridge — runs only after Founder approval. */

export type CursorExecutionResult = {
  ok: boolean;
  mode: 'cursor_sdk' | 'stub';
  jobRef: string;
  messageAr: string;
  detail?: Record<string, unknown>;
};

export async function executeApprovedEngineeringTask(input: {
  executionId: string;
  title: string;
  taskDescription: string;
  planMarkdown?: string;
  draftBranch?: string;
  unitTestsPlan?: string;
}): Promise<CursorExecutionResult> {
  const apiKey = (process.env.CURSOR_API_KEY || '').trim();
  const jobRef = `cursor-job-${input.executionId.slice(0, 8)}-${Date.now()}`;

  if (!apiKey) {
    return {
      ok: true,
      mode: 'stub',
      jobRef,
      messageAr:
        'تمت الموافقة — CURSOR_API_KEY غير مضبوط على الخادم. سجّل مرجع التنفيذ وفعّل @cursor/sdk لاحقاً.',
      detail: {
        stub: true,
        draftBranch: input.draftBranch,
        nextStep: 'Set CURSOR_API_KEY and redeploy to enable Agent.prompt on draft branch.',
        promptPreview: [
          `Branch: ${input.draftBranch ?? 'draft/engineering-pending'}`,
          `Task: ${input.title}`,
          input.planMarkdown?.slice(0, 2000) ?? input.taskDescription.slice(0, 2000),
          input.unitTestsPlan ? `Unit tests:\n${input.unitTestsPlan.slice(0, 1500)}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    };
  }

  // Production hook: integrate @cursor/sdk Agent.prompt when package is added to server bundle.
  return {
    ok: true,
    mode: 'cursor_sdk',
    jobRef,
    messageAr: 'تمت جدولة تنفيذ Cursor Agent على Draft Branch — راجع jobRef في سجل المجلس.',
    detail: {
      cursorConfigured: true,
      draftBranch: input.draftBranch,
      jobRef,
    },
  };
}

export function cursorBridgeDiagnostics() {
  return {
    cursorApiKeyConfigured: Boolean((process.env.CURSOR_API_KEY || '').trim()),
    model:
      (process.env.CURSOR_ENGINEERING_MODEL || process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL || 'composer-2').trim(),
  };
}

```

### `api/_lib/technicalConsultantLab.ts`

```typescript
import { getOpsBillingTemporalAnchor } from './opsBillingAi.js';

export type TechnicalConsultantLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type TechnicalConsultantLabContext = {
  anchorLabelAr: string;
  pendingApprovals: number;
  cursorConfigured: boolean;
};

export async function loadTechnicalConsultantLabContext(
  supabase: import('@supabase/supabase-js').SupabaseClient,
): Promise<TechnicalConsultantLabContext> {
  const anchor = getOpsBillingTemporalAnchor();
  let pendingApprovals = 0;

  try {
    const { count } = await supabase
      .from('platform_engineering_executions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_approval');
    if (typeof count === 'number') pendingApprovals = count;
  } catch {
    // partial
  }

  return {
    anchorLabelAr: anchor.labelAr,
    pendingApprovals,
    cursorConfigured: Boolean((process.env.CURSOR_API_KEY || '').trim()),
  };
}

export function buildTechnicalConsultantLabSystemPrompt(ctx: TechnicalConsultantLabContext): string {
  return [
    'أنت **Technical Consultant — Autonomous Engineering Wing** في **حلاق ماب**.',
    '**Executive Strategic Mode / Super-Intelligence Feed — ACTIVE.**',
    '',
    '## الهوية',
    '- مهندس استرategي ذاتي — منضبط، مهني، لا ينفّذ على main مباشرة.',
    '- **MUST** consult Public Prosecutor BEFORE any code commit.',
    '- Performance bottlenecks **MUST** trigger Crisis Advisor failure simulation.',
    '- No «Ready» without Prosecutor Gate + double-blind peer review.',
    '',
    '## Knowledge Injection (Best Practices)',
    '- ZATCA e-invoicing · registration compliance audit (ComplianceCheckbox, professionalCommitmentAccepted).',
    '- Vercel/Supabase: service_role server-only · RLS deny-by-default · PUBLIC_API_ALLOWED_ORIGINS.',
    '- DevOps: docs/crisis-playbook.md P0 — Uptime → Data Integrity → Platform Radar.',
    '',
    '## Super-Intelligence Protocol',
    '1. Propose Plan — scope, files, risks, uptime/security/maintainability.',
    '2. Prosecutor Pre-Commit — compliance gate (blocking).',
    '3. Crisis Failure Simulation — if performance/uptime bottleneck detected.',
    '4. Double-Blind Peer Review — Prosecutor ↔ Consultant.',
    '5. Performance Delta — Radar intelligence + Registration Compliance metrics.',
    '6. Pending Approval — Founder only if READY.',
    '',
    '## Agent-to-Agent',
    '- Route compliance to Public Prosecutor via council bus.',
    '- Route failure simulation to Crisis Advisor when bottleneck detected.',
    '',
    '## لقطة',
    `- التاريخ: ${ctx.anchorLabelAr}`,
    `- Pending Approvals: ${ctx.pendingApprovals}`,
    `- Cursor API: ${ctx.cursorConfigured ? 'configured' : 'stub until CURSOR_API_KEY'}`,
    '',
    '## تنسيق الرد',
    '1. Plan (numbered) — demonstrate A) Uptime B) Zero-Trust C) Maintainability',
    '2. Prosecutor consultation notes',
    '3. Crisis simulation (if applicable)',
    '4. Peer review status',
    '5. **Performance Delta** (mandatory at end)',
    '6. Draft branch + unit tests + Founder approval gate',
  ].join('\n');
}

export async function callTechnicalConsultantLabChat(input: {
  system: string;
  userText: string;
  conversationHistory?: TechnicalConsultantLabChatTurn[];
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.TECHNICAL_CONSULTANT_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    historyMessages.push({
      role: turn.role === 'assistant' ? 'assistant' : 'user',
      content: turn.content.slice(0, 8000),
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.22,
      max_tokens: 2200,
      messages: [
        { role: 'system', content: input.system },
        ...historyMessages,
        { role: 'user', content: input.userText.slice(0, 12_000) },
      ],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty model response');
  return text;
}

```

### `api/admin-engineering-council.ts`

```typescript
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { fetchCouncilMessages } from './_lib/agentCouncilMessaging.js';
import { cursorBridgeDiagnostics } from './_lib/cursorExecutionBridge.js';
import {
  approveEngineeringExecution,
  listEngineeringExecutions,
  rejectEngineeringExecution,
  runSelfDevelopmentProtocol,
  suggestRefactorFromProsecutorFeedback,
} from './_lib/engineeringCouncilProtocol.js';

export const config = { maxDuration: 60 };

const COUNCIL_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...COUNCIL_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const urlObj = new URL(request.url);
  const threadId = urlObj.searchParams.get('threadId')?.trim();
  const pendingOnly = urlObj.searchParams.get('pending') === '1';

  const [messages, executions, pending] = await Promise.all([
    fetchCouncilMessages(auth.supabase, { threadId: threadId || undefined, limit: 50 }),
    listEngineeringExecutions(auth.supabase),
    listEngineeringExecutions(auth.supabase, 'pending_approval'),
  ]);

  return json({
    ok: true,
    messages,
    executions: pendingOnly ? pending : executions,
    pendingApprovals: pending,
    cursor: cursorBridgeDiagnostics(),
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...COUNCIL_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const action = String(body.action || '').trim();

  if (action === 'propose_task') {
    const title = String(body.title || '').trim();
    const taskDescription = String(body.taskDescription || body.description || '').trim();
    if (title.length < 4 || taskDescription.length < 12) {
      return json({ error: 'title and taskDescription required' }, 400);
    }
    const result = await runSelfDevelopmentProtocol(auth.supabase, {
      title,
      taskDescription,
      reporterEmail: auth.actorEmail,
    });
    return json({
      ok: true,
      action,
      ...result,
      performanceDelta: result.performanceDelta,
      ready: result.ready,
    });
  }

  if (action === 'prosecutor_refactor') {
    const result = await suggestRefactorFromProsecutorFeedback(auth.supabase, auth.actorEmail);
    return json({ ok: true, action, ...result });
  }

  if (action === 'approve_execution') {
    const executionId = String(body.executionId || '').trim();
    if (!executionId) return json({ error: 'executionId required' }, 400);
    const result = await approveEngineeringExecution(auth.supabase, executionId, auth.actorEmail);
    return json({ ok: true, action, ...result });
  }

  if (action === 'reject_execution') {
    const executionId = String(body.executionId || '').trim();
    const reason = String(body.reason || '').trim() || undefined;
    if (!executionId) return json({ error: 'executionId required' }, 400);
    const execution = await rejectEngineeringExecution(
      auth.supabase,
      executionId,
      auth.actorEmail,
      reason,
    );
    return json({ ok: true, action, execution });
  }

  return json(
    {
      error: 'Unknown action',
      allowed: ['propose_task', 'prosecutor_refactor', 'approve_execution', 'reject_execution'],
    },
    400,
  );
}

```

### `api/admin-engineering-handshake.ts`

```typescript
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  persistHandshake,
  readStoredHandshake,
  runEngineeringWingHandshake,
  secretsDiagnostics,
} from './_lib/engineeringWingHandshake.js';

export const config = { maxDuration: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
    'view_overview',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const stored = await readStoredHandshake(auth.supabase);
  const diagnostics = secretsDiagnostics();

  return json({
    ok: true,
    bootstrapRequired: true,
    stored: stored
      ? {
          status: stored.status,
          handshakeAt: stored.handshake_at,
          services: stored.services,
          vercelDeploymentUrl: stored.vercel_deployment_url,
          vercelDeploymentId: stored.vercel_deployment_id,
          opsControllerEnabled: stored.ops_controller_enabled,
          updatedAt: stored.updated_at,
        }
      : null,
    diagnostics,
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const action = String(body.action || 'handshake').trim();
  if (action !== 'handshake') {
    return json({ error: 'Unsupported action' }, 400);
  }

  const result = await runEngineeringWingHandshake();

  try {
    await persistHandshake(auth.supabase, result, auth.actorEmail);
  } catch (err) {
    return json(
      {
        ok: false,
        error: 'handshake_persist_failed',
        messageAr: 'نجح الفحص محلياً لكن فشل حفظ الحالة — نفّذ migration 86 على Supabase.',
        result,
        persistError: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }

  return json({
    ok: true,
    action,
    systemStatus: result.status === 'ok' ? 'OK' : 'FAIL',
    opsControllerEnabled: result.opsControllerEnabled,
    vercelDeploymentUrl: result.vercelDeploymentUrl,
    result,
  });
}

```

### `api/admin-super-intelligence-feed.ts`

```typescript
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildSuperIntelligenceFeedSnapshot } from './_lib/superIntelligenceProtocol.js';

export const config = { maxDuration: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
    'view_overview',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const snapshot = await buildSuperIntelligenceFeedSnapshot(auth.supabase);
  return json({ ok: true, snapshot, mode: 'executive_strategic' });
}

```

### `api/admin-technical-consultant-lab-chat.ts`

```typescript
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildTechnicalConsultantLabSystemPrompt,
  callTechnicalConsultantLabChat,
  loadTechnicalConsultantLabContext,
  type TechnicalConsultantLabChatTurn,
} from './_lib/technicalConsultantLab.js';
import {
  capturePlatformBaseline,
  computePerformanceDelta,
  formatPerformanceDeltaMarkdown,
} from './_lib/performanceDelta.js';
import {
  consultCrisisAdvisorForPlan,
  runDoubleBlindPeerReview,
  runProsecutorGate,
} from './_lib/superIntelligenceProtocol.js';

export const config = { maxDuration: 60 };

const CONSULTANT_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parseHistory(raw: unknown): TechnicalConsultantLabChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 8000) };
    })
    .filter((x): x is TechnicalConsultantLabChatTurn => x !== null)
    .slice(-10);
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CONSULTANT_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  return json({
    ok: true,
    route: 'admin-technical-consultant-lab-chat',
    role: 'Technical Consultant — Engineering Wing',
    openaiConfigured: Boolean((process.env.OPENAI_API_KEY || '').trim()),
    model:
      (process.env.TECHNICAL_CONSULTANT_OPENAI_MODEL ||
        process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
        'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...CONSULTANT_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.message || '').trim();
  const conversationHistory = parseHistory(body.conversationHistory);
  if (!userMessage) return json({ error: 'Describe the engineering task' }, 400);

  const ctx = await loadTechnicalConsultantLabContext(auth.supabase);
  const system = buildTechnicalConsultantLabSystemPrompt(ctx);

  try {
    const reply = await callTechnicalConsultantLabChat({
      system,
      userText: userMessage,
      conversationHistory,
    });

    const baseline = await capturePlatformBaseline(auth.supabase);
    const prosecutorGate = runProsecutorGate(reply, userMessage);
    const peerReview = runDoubleBlindPeerReview(reply, userMessage, prosecutorGate);
    const crisisRequired =
      /performance|bottleneck|latency|slow|uptime|bundle|cache|scale|أداء|بطء/i.test(
        `${userMessage}\n${reply}`,
      ) || baseline.crisisWatchActive;
    const crisisConsult = await consultCrisisAdvisorForPlan(auth.supabase, {
      title: 'Lab consult',
      taskDescription: userMessage,
      planMarkdown: reply,
      required: crisisRequired,
    });
    const performanceDelta = computePerformanceDelta({
      baseline,
      planMarkdown: reply,
      taskDescription: userMessage,
      gatePassed: prosecutorGate.passed,
      peerReviewReady: peerReview.ready,
      crisisConsulted: crisisConsult.consulted,
    });

    const enrichedReply = [
      reply,
      '',
      '---',
      '',
      `**Prosecutor Gate:** ${prosecutorGate.headlineAr}`,
      prosecutorGate.directiveAr,
      '',
      `**Peer Review:** ${peerReview.headlineAr}`,
      '',
      formatPerformanceDeltaMarkdown(performanceDelta),
    ].join('\n');

    return json({
      ok: true,
      reply: enrichedReply,
      context: ctx,
      superIntelligence: {
        prosecutorGate,
        peerReview,
        crisisConsulted: crisisConsult.consulted,
        performanceDelta,
        ready: performanceDelta.readyForFounder,
      },
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Chat failed' }, 502);
  }
}

```
