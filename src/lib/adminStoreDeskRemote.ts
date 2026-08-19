/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type StoreDeskStatus = 'new' | 'studying' | 'offered' | 'closed';

export type StoreDeskRequestRow = {
  id: string;
  applicantName: string;
  entityName: string;
  freelanceWorkDoc: string;
  email: string;
  phone: string;
  whatsapp: string;
  requestBody: string;
  source: string;
  createdAt: string;
  status: StoreDeskStatus;
  replyDraft: string;
  councilTranscript: string;
  adminNotes: string;
  updatedAt: string;
};

export type StoreDeskListPayload =
  | {
      ok: true;
      tableMissing: boolean;
      hint?: string;
      total: number;
      rows: StoreDeskRequestRow[];
      openaiConfigured: boolean;
    }
  | { ok: false; error: string; hint?: string };

export type StoreDeskChatTurn = { role: 'user' | 'assistant'; content: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-store-desk`;
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

export async function fetchAdminStoreDesk(): Promise<StoreDeskListPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(endpoint(), { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as StoreDeskListPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'load_failed' };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function postAdminStoreDesk(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return (await res.json().catch(() => ({ ok: false, error: 'bad_json' }))) as Record<string, unknown>;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
