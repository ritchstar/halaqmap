/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { FOUNDER_DESK_COPY } from '@/config/founderDeskCopy';

const DEFAULT_ENDPOINT = '/api/founder-desk-chat';
const GUEST_CLIENT_ID_KEY = 'halaqmap-founder-desk-guest-id';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FounderDeskSender = 'visitor' | 'founder';

export type FounderDeskOrigin = 'partners' | 'store';

export type FounderDeskConversation = {
  id: string;
  guest_client_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  closed_at: string | null;
  last_message_at: string | null;
  visitor_preview: string | null;
  origin?: FounderDeskOrigin;
  unread_visitor?: number;
};

export type FounderDeskMessage = {
  id: string;
  conversation_id: string;
  sender: FounderDeskSender;
  body: string;
  created_at: string;
  read_at: string | null;
};

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}${DEFAULT_ENDPOINT}`;
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export function getOrCreateFounderDeskGuestId(origin: FounderDeskOrigin = 'partners'): string {
  if (typeof window === 'undefined') return '';
  const storageKey = origin === 'store' ? `${GUEST_CLIENT_ID_KEY}:store` : GUEST_CLIENT_ID_KEY;
  try {
    const existing = window.localStorage.getItem(storageKey)?.trim() ?? '';
    if (UUID_RE.test(existing)) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function explainError(message: string, tableMissing?: boolean): string {
  if (tableMissing) return FOUNDER_DESK_COPY.unavailableAr;
  const m = message.toLowerCase();
  if (m.includes('expired')) return FOUNDER_DESK_COPY.expiredAr;
  if (m.includes('limit')) return FOUNDER_DESK_COPY.limitAr;
  if (m.includes('desk_unavailable')) return FOUNDER_DESK_COPY.unavailableAr;
  return message || FOUNDER_DESK_COPY.sendFailedAr;
}

async function postJson<T>(payload: Record<string, unknown>): Promise<
  | { ok: true; json: T }
  | { ok: false; error: string; tableMissing?: boolean }
> {
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string; tableMissing?: boolean };
    if (!res.ok) {
      return {
        ok: false,
        error: explainError(json.error || `HTTP ${res.status}`, json.tableMissing === true),
        tableMissing: json.tableMissing === true,
      };
    }
    return { ok: true, json };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال بالخادم.' };
  }
}

function safeOrigin(origin: FounderDeskOrigin | undefined): FounderDeskOrigin {
  return origin === 'store' ? 'store' : 'partners';
}

export async function startFounderDeskChat(
  origin: FounderDeskOrigin = 'partners',
): Promise<
  | { ok: true; conversation: FounderDeskConversation }
  | { ok: false; error: string; tableMissing?: boolean }
> {
  const originId = safeOrigin(origin);
  const res = await postJson<{ conversation?: FounderDeskConversation }>({
    action: 'start',
    guestClientId: getOrCreateFounderDeskGuestId(originId),
    origin: originId,
  });
  if (!res.ok) return res;
  if (!res.json.conversation?.id) return { ok: false, error: FOUNDER_DESK_COPY.startFailedAr };
  return { ok: true, conversation: res.json.conversation };
}

export async function listFounderDeskMessages(
  conversationId: string,
  origin: FounderDeskOrigin = 'partners',
): Promise<
  | { ok: true; messages: FounderDeskMessage[]; expired: boolean; conversation?: FounderDeskConversation }
  | { ok: false; error: string; tableMissing?: boolean }
> {
  const res = await postJson<{
    messages?: FounderDeskMessage[];
    expired?: boolean;
    conversation?: FounderDeskConversation;
  }>({
    action: 'list_messages',
    guestClientId: getOrCreateFounderDeskGuestId(safeOrigin(origin)),
    conversationId: conversationId.trim(),
  });
  if (!res.ok) return res;
  return {
    ok: true,
    messages: Array.isArray(res.json.messages) ? res.json.messages : [],
    expired: Boolean(res.json.expired),
    conversation: res.json.conversation,
  };
}

export async function sendFounderDeskMessage(
  conversationId: string,
  body: string,
  origin: FounderDeskOrigin = 'partners',
): Promise<
  | { ok: true; message: FounderDeskMessage }
  | { ok: false; error: string; tableMissing?: boolean }
> {
  const res = await postJson<{ message?: FounderDeskMessage }>({
    action: 'send',
    guestClientId: getOrCreateFounderDeskGuestId(safeOrigin(origin)),
    conversationId: conversationId.trim(),
    body: body.trim(),
  });
  if (!res.ok) return res;
  if (!res.json.message) return { ok: false, error: FOUNDER_DESK_COPY.sendFailedAr };
  return { ok: true, message: res.json.message };
}
