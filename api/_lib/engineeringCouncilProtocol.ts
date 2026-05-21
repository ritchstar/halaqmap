import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildCouncilThreadId,
  fetchCouncilMessages,
  mapCouncilMessage,
  postCouncilMessage,
} from './agentCouncilMessaging.js';
import { executeApprovedEngineeringTask } from './cursorExecutionBridge.js';
import { evaluateProsecutorInterject } from './publicProsecutorLab.js';

export type EngineeringExecutionStatus =
  | 'planning'
  | 'prosecutor_review'
  | 'draft_branch'
  | 'testing'
  | 'pending_approval'
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
            'You are Technical Consultant of HalaqMap Engineering Council. Output a concise markdown plan: Scope, Files, Refactor steps, Risks, Unit test targets. Arabic headings OK. No code execution.',
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

function buildProsecutorVerdict(planMarkdown: string, taskDescription: string) {
  const interject = evaluateProsecutorInterject({
    userMessage: `${taskDescription}\n${planMarkdown}`,
    watchAgent: 'technical_consultant_engineering',
  });

  const approved = !interject || interject.severity !== 'urgent';
  return {
    approved,
    severity: interject?.severity ?? 'info',
    headlineAr: interject?.headlineAr ?? 'لا انحراف حرج — المضي في Draft Branch',
    directiveAr:
      interject?.directiveAr ??
      'الخطة متوافقة مع Professional Sovereignty — يُسمح بالمتابعة إلى فرع Draft واختبارات الوحدة.',
    interject,
  };
}

export async function runSelfDevelopmentProtocol(
  supabase: SupabaseClient,
  input: { title: string; taskDescription: string; reporterEmail: string },
): Promise<{ execution: ReturnType<typeof mapExecutionRow>; messages: ReturnType<typeof mapCouncilMessage>[] }> {
  const now = new Date().toISOString();

  const { data: created, error } = await supabase
    .from('platform_engineering_executions')
    .insert({
      status: 'planning',
      initiator_agent: 'technical_consultant_engineering',
      title: input.title.slice(0, 200),
      task_description: input.taskDescription.slice(0, 8000),
      reporter_email: input.reporterEmail,
      detail: { protocol: 'self_development', step: 'propose_plan', startedAt: now },
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
      detail: { ...(created.detail as object), step: 'consult_prosecutor' },
    })
    .eq('id', executionId);

  const prosecutorVerdict = buildProsecutorVerdict(planMarkdown, input.taskDescription);

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'technical_consultant_engineering',
    toAgent: 'public_prosecutor',
    messageType: 'consultation',
    severity: prosecutorVerdict.approved ? 'info' : 'urgent',
    title: 'استشارة امتثال — خطة Refactor',
    body: planMarkdown.slice(0, 4000),
    detail: { executionId, request: 'compliance_review' },
  });

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'public_prosecutor',
    toAgent: 'technical_consultant_engineering',
    messageType: 'compliance_verdict',
    severity: prosecutorVerdict.approved ? 'info' : 'urgent',
    title: prosecutorVerdict.headlineAr,
    body: prosecutorVerdict.directiveAr,
    detail: { executionId, verdict: prosecutorVerdict },
  });

  const draftBranch = slugifyBranch(input.title);
  const unitTestsPlan = buildUnitTestsPlan(planMarkdown, input.title);

  const { data: updated } = await supabase
    .from('platform_engineering_executions')
    .update({
      prosecutor_verdict: prosecutorVerdict,
      draft_branch: draftBranch,
      unit_tests_plan: unitTestsPlan,
      status: 'pending_approval',
      updated_at: new Date().toISOString(),
      detail: {
        protocol: 'self_development',
        step: 'pending_approval',
        draftBranch,
        prosecutorApproved: prosecutorVerdict.approved,
      },
    })
    .eq('id', executionId)
    .select('*')
    .single();

  await postCouncilMessage(supabase, {
    threadId,
    fromAgent: 'technical_consultant_engineering',
    toAgent: 'founder',
    messageType: 'refactor_proposal',
    severity: prosecutorVerdict.approved ? 'watch' : 'urgent',
    title: `Pending Approval — ${input.title}`,
    body: `Draft branch: ${draftBranch}\n\nAwaiting Founder «Approve Execution».`,
    detail: { executionId, draftBranch, requiresApproval: true },
  });

  const messages = await fetchCouncilMessages(supabase, { threadId, limit: 20 });
  return {
    execution: mapExecutionRow((updated ?? created) as ExecutionRow),
    messages,
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
