import { getSupabaseClient } from '@/integrations/supabase/client';
import type {
  OpsBillingAiAnalyzeResponse,
  OpsBillingAiPatch,
  OpsBillingAiProposal,
} from '@/types/opsBillingAi';

const ANALYZE_API = '/api/admin-resources-ai-analyze';
const APPLY_API = '/api/admin/resources/update-from-ai';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const dashboardCron = String(import.meta.env.VITE_OPS_BILLING_CRON_SECRET || '').trim();
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();

  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-supabase-url': getClientSupabaseUrl(),
  };

  if (dashboardCron) {
    base['X-Ops-Billing-Cron-Authorization'] = `Bearer ${dashboardCron}`;
  }
  if (token) {
    return { ...base, Authorization: `Bearer ${token}` };
  }
  if (dashboardCron) {
    return { ...base, Authorization: `Bearer ${dashboardCron}` };
  }
  return null;
}

function formatError(json: Record<string, unknown>, status: number): string {
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  const hint = typeof json.hint === 'string' ? json.hint : '';
  return hint ? `${err} — ${hint}` : err;
}

export async function fetchOpsBillingAiDiagnostics(): Promise<
  { ok: true; openaiConfigured: boolean; model?: string } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };
  const res = await fetch(ANALYZE_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }
  return {
    ok: true,
    openaiConfigured: Boolean(json.openaiConfigured),
    model: typeof json.model === 'string' ? json.model : undefined,
  };
}

export async function analyzeOpsBillingWithAi(input: {
  userMessage?: string;
  imageBase64?: string;
  imageMime?: string;
}): Promise<{ ok: true; body: OpsBillingAiAnalyzeResponse } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };
  const res = await fetch(ANALYZE_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      userMessage: input.userMessage?.trim() || '',
      imageBase64: input.imageBase64,
      imageMime: input.imageMime,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }
  return {
    ok: true,
    body: {
      assistant_message: String(json.assistant_message || ''),
      needs_clarification: Boolean(json.needs_clarification),
      proposals: (json.proposals as OpsBillingAiProposal[]) || [],
    },
  };
}

export async function applyOpsBillingAiUpdate(input: {
  proposal_token: string;
  commitment_id: string;
  patch: OpsBillingAiPatch;
}): Promise<
  | { ok: true; before: Record<string, unknown>; after: Record<string, unknown> }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف بصلاحية مزامنة الفوترة' };
  const res = await fetch(APPLY_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      confirm: true,
      proposal_token: input.proposal_token,
      commitment_id: input.commitment_id,
      patch: input.patch,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }
  return {
    ok: true,
    before: (json.before as Record<string, unknown>) || {},
    after: (json.after as Record<string, unknown>) || {},
  };
}
