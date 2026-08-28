/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type StoreReviewAdmin = {
  id: string;
  stars: number;
  comment: string;
  displayName: string;
  createdAt: string;
  status: 'published' | 'hidden';
  unseen: boolean;
};

export type StoreReviewsAdminPayload =
  | { ok: true; rows: StoreReviewAdmin[]; counts: { total: number; unseen: number } }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-store-reviews`;
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token?.trim()) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.trim()}`,
  };
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export async function fetchAdminStoreReviews(countsOnly = false): Promise<StoreReviewsAdminPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const q = countsOnly ? '?counts=1' : '';
    const res = await fetch(`${endpoint()}${q}`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as StoreReviewsAdminPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'load_failed' };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function setAdminStoreReviewHidden(id: string, hidden: boolean): Promise<{ ok: boolean; error?: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'انتهت الجلسة.' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: hidden ? 'hide' : 'show', id }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || json.ok !== true) return { ok: false, error: json.error || 'تعذر التحديث.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال.' };
  }
}
