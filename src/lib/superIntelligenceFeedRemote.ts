import { getSupabaseClient } from '@/integrations/supabase/client';

const FEED_API = '/api/admin-super-intelligence-feed';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type SuperIntelligenceFeedSnapshot = {
  baseline: {
    complianceGaps: number;
    inspectorPulseCount24h: number;
    urgentOpsReports24h: number;
    pendingEngineeringApprovals: number;
    handshakeOk: boolean;
    crisisWatchActive: boolean;
  };
  councilMessages: Array<{
    id: string;
    created_at: string;
    from_agent: string;
    to_agent: string;
    message_type: string;
    severity: string;
    title: string;
    body: string;
  }>;
  executions: Array<{
    id: string;
    title: string;
    status: string;
    updated_at: string;
    detail?: Record<string, unknown>;
  }>;
  doctrineMode: string;
};

export async function fetchSuperIntelligenceFeed(): Promise<
  { ok: true; snapshot: SuperIntelligenceFeedSnapshot } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(FEED_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    snapshot?: SuperIntelligenceFeedSnapshot;
  };
  if (!res.ok || !json.ok || !json.snapshot) {
    return { ok: false, error: json.error || `HTTP ${res.status}` };
  }
  return { ok: true, snapshot: json.snapshot };
}
