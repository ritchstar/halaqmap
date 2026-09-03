/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

function adminEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-store-halana`;
  return '/api/admin-store-halana';
}

async function adminBearer(accessToken = ''): Promise<string | null> {
  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  }
  return String(accessToken || '').trim() || null;
}

export type StoreHalanaCopyRow = {
  id: string;
  specialist_name: string;
  beneficiary_email: string;
  status: string;
  shopHref?: string;
  orderHref?: string;
  deskHref?: string;
  created_at: string;
};

export async function adminListHalanaCopies(accessToken: string) {
  const token = await adminBearer(accessToken);
  if (!token) return { ok: false as const, error: 'not_authenticated' };
  try {
    const res = await fetch(adminEndpoint(), { headers: { Authorization: `Bearer ${token}` } });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; rows?: StoreHalanaCopyRow[] };
    if (!res.ok || json.ok === false) return { ok: false as const, error: String(json.error || `http_${res.status}`) };
    return { ok: true as const, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false as const, error: 'network_error' };
  }
}

export async function adminIssueHalanaCopy(input: { accessToken: string; name: string; email: string }) {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false as const, error: 'not_authenticated' };
  try {
    const res = await fetch(adminEndpoint(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: input.name, email: input.email }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || json.ok === false) return { ok: false as const, error: String(json.error || `http_${res.status}`) };
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: 'network_error' };
  }
}
