import { getSupabaseClient } from '@/integrations/supabase/client';
import type { AgentCouncilMessage, EngineeringExecution } from '@/modules/ai-staff/types';

const COUNCIL_API = '/api/admin-engineering-council';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function formatError(json: Record<string, unknown>, status: number): string {
  return typeof json.error === 'string' ? json.error : `HTTP ${status}`;
}

export async function fetchEngineeringCouncil(threadId?: string): Promise<
  | {
      ok: true;
      messages: AgentCouncilMessage[];
      executions: EngineeringExecution[];
      pendingApprovals: EngineeringExecution[];
      cursorConfigured: boolean;
    }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const qs = threadId ? `?threadId=${encodeURIComponent(threadId)}` : '';
  const res = await fetch(`${COUNCIL_API}${qs}`, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    messages: Array.isArray(json.messages) ? (json.messages as AgentCouncilMessage[]) : [],
    executions: Array.isArray(json.executions) ? (json.executions as EngineeringExecution[]) : [],
    pendingApprovals: Array.isArray(json.pendingApprovals)
      ? (json.pendingApprovals as EngineeringExecution[])
      : [],
    cursorConfigured: Boolean((json.cursor as { cursorApiKeyConfigured?: boolean })?.cursorApiKeyConfigured),
  };
}

export async function proposeEngineeringTask(input: {
  title: string;
  taskDescription: string;
}): Promise<
  | { ok: true; execution: EngineeringExecution; messages: AgentCouncilMessage[] }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'propose_task', ...input }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    execution: json.execution as EngineeringExecution,
    messages: Array.isArray(json.messages) ? (json.messages as AgentCouncilMessage[]) : [],
  };
}

export async function proposeProsecutorDrivenRefactor(): Promise<
  | { ok: true; suggestion: string; execution?: EngineeringExecution }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'prosecutor_refactor' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    suggestion: String(json.suggestion ?? ''),
    execution: json.execution as EngineeringExecution | undefined,
  };
}

export async function approveEngineeringExecutionRemote(executionId: string): Promise<
  | { ok: true; execution: EngineeringExecution; messageAr: string }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'approve_execution', executionId }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  const cursorResult = json.cursorResult as { messageAr?: string } | undefined;
  return {
    ok: true,
    execution: json.execution as EngineeringExecution,
    messageAr: cursorResult?.messageAr ?? 'تمت الموافقة على التنفيذ.',
  };
}

export async function rejectEngineeringExecutionRemote(
  executionId: string,
  reason?: string,
): Promise<{ ok: true; execution: EngineeringExecution } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'reject_execution', executionId, reason }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return { ok: true, execution: json.execution as EngineeringExecution };
}

export async function fetchPendingEngineeringApprovals(): Promise<
  | { ok: true; pendingApprovals: EngineeringExecution[] }
  | { ok: false; error: string }
> {
  const result = await fetchEngineeringCouncil();
  if (!result.ok) return result;
  return { ok: true, pendingApprovals: result.pendingApprovals };
}
