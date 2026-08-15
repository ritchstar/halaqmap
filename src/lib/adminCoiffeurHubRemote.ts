/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type CoiffeurInterestSignupRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  intentId: string;
  source: string;
  phone: string;
  createdAt: string;
  consent: boolean;
};

export type CoiffeurHubPayload =
  | { ok: true; tableMissing: boolean; total: number; rows: CoiffeurInterestSignupRow[]; hint?: string }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-coiffeur-hub`;
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

export async function fetchAdminCoiffeurHub(): Promise<CoiffeurHubPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), { headers });
    const json = (await res.json()) as CoiffeurHubPayload & { error?: string };
    if (!res.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${res.status}` };
    }
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
