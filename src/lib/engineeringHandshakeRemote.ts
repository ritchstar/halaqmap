import { getSupabaseClient } from '@/integrations/supabase/client';

const HANDSHAKE_API = '/api/admin-engineering-handshake';

export type HandshakeServiceClass = 'critical' | 'advisory';

export type HandshakeServicePing = {
  id: 'supabase' | 'vercel' | 'github';
  label: string;
  ok: boolean;
  latencyMs: number;
  message: string;
  serviceClass?: HandshakeServiceClass;
  notConfigured?: boolean;
  detail?: Record<string, unknown>;
};

export type EngineeringHandshakeSnapshot = {
  status: 'ok' | 'fail' | 'pending';
  handshakeAt: string | null;
  services: HandshakeServicePing[];
  vercelDeploymentUrl: string | null;
  vercelDeploymentId: string | null;
  opsControllerEnabled: boolean;
  updatedAt: string | null;
  systemStatus: 'OK' | 'FAIL' | 'PENDING';
  secretIssues: string[];
  advisoryDegradations: string[];
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchEngineeringHandshakeStatus(): Promise<
  | { ok: true; snapshot: EngineeringHandshakeSnapshot; diagnostics: Record<string, unknown> }
  | { ok: false; error: string }
> {
  try {
    const h = await authHeaders();
    if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

    const res = await fetch(HANDSHAKE_API, {
      method: 'GET',
      headers: h,
      credentials: 'include',
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      stored?: {
        status?: string;
        handshakeAt?: string | null;
        services?: HandshakeServicePing[];
        vercelDeploymentUrl?: string | null;
        vercelDeploymentId?: string | null;
        opsControllerEnabled?: boolean;
        updatedAt?: string | null;
      } | null;
      diagnostics?: { secretIssues?: string[] };
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    }

    const stored = json.stored;
    const status = (stored?.status as EngineeringHandshakeSnapshot['status']) || 'pending';
    const systemStatus: EngineeringHandshakeSnapshot['systemStatus'] =
      status === 'ok' ? 'OK' : status === 'fail' ? 'FAIL' : 'PENDING';

    return {
      ok: true,
      diagnostics: (json.diagnostics as Record<string, unknown>) || {},
      snapshot: {
        status,
        handshakeAt: stored?.handshakeAt ?? null,
        services: Array.isArray(stored?.services) ? stored.services : [],
        vercelDeploymentUrl: stored?.vercelDeploymentUrl ?? null,
        vercelDeploymentId: stored?.vercelDeploymentId ?? null,
        opsControllerEnabled: Boolean(stored?.opsControllerEnabled),
        updatedAt: stored?.updatedAt ?? null,
        systemStatus,
        secretIssues: Array.isArray(json.diagnostics?.secretIssues)
          ? (json.diagnostics?.secretIssues as string[])
          : [],
        advisoryDegradations: [],
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Handshake fetch failed' };
  }
}

export async function runEngineeringHandshakeRemote(): Promise<
  | {
      ok: true;
      systemStatus: 'OK' | 'FAIL';
      opsControllerEnabled: boolean;
      vercelDeploymentUrl: string | null;
      snapshot: EngineeringHandshakeSnapshot;
    }
  | { ok: false; error: string }
> {
  try {
    const h = await authHeaders();
    if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

    const res = await fetch(HANDSHAKE_API, {
      method: 'POST',
      headers: h,
      credentials: 'include',
      body: JSON.stringify({ action: 'handshake' }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      messageAr?: string;
      systemStatus?: 'OK' | 'FAIL';
      opsControllerEnabled?: boolean;
      vercelDeploymentUrl?: string | null;
      result?: {
        status?: 'ok' | 'fail';
        checkedAt?: string;
        secretIssues?: string[];
        services?: HandshakeServicePing[];
        advisoryDegradations?: string[];
        vercelDeploymentUrl?: string | null;
        vercelDeploymentId?: string | null;
        opsControllerEnabled?: boolean;
      };
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.messageAr || json.error || `HTTP ${res.status}` };
    }

    const result = json.result;
    const status = result?.status ?? 'fail';
    return {
      ok: true,
      systemStatus: json.systemStatus ?? (status === 'ok' ? 'OK' : 'FAIL'),
      opsControllerEnabled: Boolean(json.opsControllerEnabled),
      vercelDeploymentUrl: json.vercelDeploymentUrl ?? result?.vercelDeploymentUrl ?? null,
      snapshot: {
        status,
        handshakeAt: result?.checkedAt ?? new Date().toISOString(),
        services: result?.services ?? [],
        vercelDeploymentUrl: result?.vercelDeploymentUrl ?? null,
        vercelDeploymentId: result?.vercelDeploymentId ?? null,
        opsControllerEnabled: Boolean(result?.opsControllerEnabled),
        updatedAt: result?.checkedAt ?? null,
        systemStatus: json.systemStatus ?? (status === 'ok' ? 'OK' : 'FAIL'),
        secretIssues: result?.secretIssues ?? [],
        advisoryDegradations: result?.advisoryDegradations ?? [],
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Handshake failed' };
  }
}
