import { getSupabaseClient } from '@/integrations/supabase/client';
import type { PublicProsecutorDashboardSnapshot, ProsecutorWorkingPaper } from '@/modules/ai-staff/types';

const DASHBOARD_API = '/api/admin-public-prosecutor-dashboard';

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
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  return err;
}

export async function fetchPublicProsecutorDashboard(): Promise<
  | { ok: true; snapshot: PublicProsecutorDashboardSnapshot }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(DASHBOARD_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  return {
    ok: true,
    snapshot: {
      anchorLabelAr: String(json.anchorLabelAr ?? ''),
      workingPapers: Array.isArray(json.workingPapers)
        ? (json.workingPapers as ProsecutorWorkingPaper[])
        : [],
      sovereigntyAlerts: Number(json.sovereigntyAlerts ?? 0),
      inspectorPulseCount24h: Number(json.inspectorPulseCount24h ?? 0),
      complianceGaps: Number(json.complianceGaps ?? 0),
      crisisWatchActive: Boolean(json.crisisWatchActive),
      lastSyncedAt: typeof json.lastSyncedAt === 'string' ? json.lastSyncedAt : null,
    },
  };
}

export async function syncPublicProsecutorRadar(): Promise<
  | { ok: true; drafted: boolean; reportId?: string; reason?: string; workingPapers: ProsecutorWorkingPaper[] }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(DASHBOARD_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'sync_radar' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  return {
    ok: true,
    drafted: Boolean(json.drafted),
    reportId: typeof json.reportId === 'string' ? json.reportId : undefined,
    reason: typeof json.reason === 'string' ? json.reason : undefined,
    workingPapers: Array.isArray(json.workingPapers)
      ? (json.workingPapers as ProsecutorWorkingPaper[])
      : [],
  };
}

export async function auditPublicProsecutorCompliance(): Promise<
  | { ok: true; complianceGaps: number; workingPapers: ProsecutorWorkingPaper[] }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(DASHBOARD_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'audit_compliance' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  return {
    ok: true,
    complianceGaps: Number(json.complianceGaps ?? 0),
    workingPapers: Array.isArray(json.workingPapers)
      ? (json.workingPapers as ProsecutorWorkingPaper[])
      : [],
  };
}
