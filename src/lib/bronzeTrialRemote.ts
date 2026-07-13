import { getSupabaseClient } from '@/integrations/supabase/client';

function trialCodesEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-bronze-trial-codes`;
  return '/api/admin-bronze-trial-codes';
}

async function adminBearer(accessToken: string): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: sessionData } = await client.auth.getSession();
  return accessToken || sessionData.session?.access_token || null;
}

export async function adminIssueBronzeTrialCodesRemote(input: {
  accessToken: string;
  count: number;
  note?: string;
}): Promise<{ ok: true; codes: string[]; count: number; hint?: string } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(trialCodesEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ count: input.count, note: input.note ?? '' }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      codes?: string[];
      count?: number;
      hint?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      codes: Array.isArray(json.codes) ? json.codes : [],
      count: Number(json.count ?? 0),
      hint: json.hint,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export type BronzeTrialCodeRow = {
  id: string;
  status: string;
  created_at: string;
  created_by_admin_email: string | null;
  note: string | null;
  redeemed_at: string | null;
  redeemed_barber_id: string | null;
  redeemed_registration_request_id: string | null;
};

export async function adminListBronzeTrialCodesRemote(input: {
  accessToken: string;
}): Promise<{ ok: true; rows: BronzeTrialCodeRow[] } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(trialCodesEndpoint(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      rows?: BronzeTrialCodeRow[];
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
