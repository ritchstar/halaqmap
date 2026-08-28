/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type StoreGiftRosterMailState = 'pending' | 'active' | 'expired_link';
export type StoreGiftRosterCampaign = 'occasion' | 'kitchen';

export type StoreGiftRosterRow = {
  id: string;
  campaign: StoreGiftRosterCampaign;
  campaignLabelAr: string;
  productLabelAr: string;
  givenName: string;
  email: string;
  city: string;
  source: string;
  occasionDate: string;
  slotNo: number;
  mailState: StoreGiftRosterMailState;
  emailVerifiedAt: string | null;
  createdAt: string;
  linkDeadlineAt: string;
};

export type StoreGiftRosterPayload =
  | { ok: true; rows: StoreGiftRosterRow[]; counts: { total: number; pending: number; active: number; expiredLink: number } }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-store-gifts`;
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

export async function fetchAdminStoreGiftRoster(): Promise<StoreGiftRosterPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(endpoint(), { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as StoreGiftRosterPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'load_failed' };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function resendAdminStoreGiftConfirm(input: {
  campaign: StoreGiftRosterCampaign;
  entryId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'انتهت الجلسة.' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'resend', campaign: input.campaign, entryId: input.entryId }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || json.ok !== true) return { ok: false, error: json.error || 'تعذر الإرسال.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال.' };
  }
}
