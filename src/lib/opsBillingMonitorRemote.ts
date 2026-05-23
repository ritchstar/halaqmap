import { getSupabaseClient } from '@/integrations/supabase/client';

const API = '/api/ops-billing-monitor';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

/**
 * رؤوس طلبات /api/ops-billing-monitor:
 * - جلسة المشرف في Authorization إن وُجدت (للتدقيق/المزامن).
 * - نفس سرّ الجدولة في X-Ops-Billing-Cron-Authorization عند VITE_OPS_BILLING_CRON_SECRET — يكفي لمصادقة Cron حتى لو انتهت جلسة Supabase.
 * - بدون جلسة: Authorization يحمل السرّ فقط (نفس سلوك الجدولة).
 */
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

const OPS_BILLING_AUTH_HINT =
  'سجّل دخول كمشرف أو أضف في Vercel (وبناء جديد) VITE_OPS_BILLING_CRON_SECRET بنفس قيمة OPS_BILLING_CRON_SECRET.';

function formatOpsBillingApiError(json: Record<string, unknown>, status: number): string {
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  const hint = typeof json.hint === 'string' ? json.hint : '';
  return hint ? `${err} — ${hint}` : err;
}

export type OpsBillingCommitmentRow = Record<string, unknown>;

export type OpsBillingSummary = {
  nearestRenewalAt: string | null;
  monthlyEstimateSarTotal: number;
  countdownMs: number | null;
};

export async function fetchOpsBillingMonitor(): Promise<
  | {
      ok: true;
      commitments: OpsBillingCommitmentRow[];
      poll: Record<string, unknown> | null;
      gaps: OpsBillingCommitmentRow[];
      summary: OpsBillingSummary;
    }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: OPS_BILLING_AUTH_HINT };
  const res = await fetch(API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatOpsBillingApiError(json, res.status) };
  }
  const commitments = (json.commitments as OpsBillingCommitmentRow[]) || [];
  const gaps = (json.gaps as OpsBillingCommitmentRow[]) || [];
  const poll = (json.poll as Record<string, unknown> | null) ?? null;
  const summary = json.summary as OpsBillingSummary | undefined;
  if (!summary) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, commitments, poll, gaps, summary };
}

export async function triggerOpsBillingSync(): Promise<
  { ok: true; detail: unknown } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: OPS_BILLING_AUTH_HINT };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'sync' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatOpsBillingApiError(json, res.status) };
  }
  return { ok: true, detail: json.detail };
}

export async function createManualOpsBillingCommitment(input: {
  display_label: string;
  monthly_estimate_sar?: number;
  next_renewal_at?: string | null;
  amount_expected?: number;
  amount_currency?: string;
  billing_cycle?: string;
  manual_notes?: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: OPS_BILLING_AUTH_HINT };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'manual_commitment', ...input }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatOpsBillingApiError(json, res.status) };
  }
  return { ok: true, id: typeof json.id === 'string' ? json.id : undefined };
}

export async function updateOpsBillingCommitment(input: {
  id: string;
  display_label?: string;
  next_renewal_at?: string | null;
  monthly_estimate_sar?: number | null;
  amount_expected?: number | null;
  amount_currency?: string;
  manual_notes?: string;
  clear_gap?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: OPS_BILLING_AUTH_HINT };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'update_commitment', ...input }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatOpsBillingApiError(json, res.status) };
  }
  return { ok: true };
}
