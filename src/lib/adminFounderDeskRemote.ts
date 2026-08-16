/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { FounderDeskConversation, FounderDeskMessage } from '@/lib/founderDeskChatRemote';

export type FounderDeskInboxPayload =
  | { ok: true; tableMissing: boolean; conversations: FounderDeskConversation[]; hint?: string }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-founder-desk-chat`;
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

export async function fetchFounderDeskInbox(): Promise<FounderDeskInboxPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), { headers });
    const json = (await res.json()) as FounderDeskInboxPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || `http_${res.status}` };
    return json;
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function listFounderDeskInboxMessages(conversationId: string): Promise<
  | { ok: true; messages: FounderDeskMessage[]; expired: boolean }
  | { ok: false; error: string }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'list_messages', conversationId }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      messages?: FounderDeskMessage[];
      expired?: boolean;
    };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || `http_${res.status}` };
    return {
      ok: true,
      messages: Array.isArray(json.messages) ? json.messages : [],
      expired: Boolean(json.expired),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function sendFounderDeskInboxReply(
  conversationId: string,
  body: string,
): Promise<{ ok: true; message: FounderDeskMessage } | { ok: false; error: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'not_signed_in' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'send', conversationId, body }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string; message?: FounderDeskMessage };
    if (!res.ok || json.ok === false || !json.message) {
      return { ok: false, error: json.error || `http_${res.status}` };
    }
    return { ok: true, message: json.message };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
