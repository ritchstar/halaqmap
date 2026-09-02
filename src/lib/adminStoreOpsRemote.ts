/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { StoreProductTrialKey } from '@/config/storeProductTrial';

export type StoreOpsTrialLink = {
  titleAr: string;
  href: string;
};

export type StoreOpsTrialRow = {
  id: string;
  product_key: StoreProductTrialKey | string;
  beneficiary_email: string;
  status: string;
  issuer_kind: string;
  issued_by_label: string;
  marketer_id: string | null;
  shop_name?: string;
  city?: string;
  neighborhood?: string;
  whatsapp?: string;
  order_id?: string | null;
  review_note: string;
  reviewed_by: string;
  first_opened_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  links?: StoreOpsTrialLink[];
};

function adminEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-store-ops`;
  return '/api/admin-store-ops';
}

async function adminBearer(accessToken = ''): Promise<string | null> {
  const trimmed = String(accessToken ?? '').trim();
  if (trimmed) return trimmed;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}

async function parseJson(resp: Response): Promise<Record<string, unknown>> {
  return (await resp.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function adminListStoreTrialsRemote(input: {
  accessToken?: string;
  status?: string;
}): Promise<{ ok: true; rows: StoreOpsTrialRow[] } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  const url = input.status
    ? `${adminEndpoint()}?status=${encodeURIComponent(input.status)}`
    : adminEndpoint();
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = await parseJson(resp);
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: String(json.error || `http_${resp.status}`) };
    }
    return { ok: true, rows: Array.isArray(json.rows) ? (json.rows as StoreOpsTrialRow[]) : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminStoreOpsActionRemote(input: {
  accessToken?: string;
  action: 'issue' | 'approve' | 'decline';
  productKey?: StoreProductTrialKey;
  email?: string;
  trialId?: string;
  reason?: string;
}): Promise<{ ok: true; trialId?: string } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  try {
    const resp = await fetch(adminEndpoint(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: input.action,
        productKey: input.productKey,
        email: input.email,
        trialId: input.trialId,
        reason: input.reason,
      }),
    });
    const json = await parseJson(resp);
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: String(json.error || `http_${resp.status}`) };
    }
    return { ok: true, trialId: typeof json.trialId === 'string' ? json.trialId : undefined };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
