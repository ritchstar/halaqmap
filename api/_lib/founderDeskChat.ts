/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FOUNDER_DESK_TTL_MS = 60 * 60 * 1000;
export const FOUNDER_DESK_MAX_BODY = 800;
export const FOUNDER_DESK_MAX_MESSAGES = 20;
export const FOUNDER_DESK_CONVERSATIONS_TABLE = 'founder_desk_conversations';
export const FOUNDER_DESK_MESSAGES_TABLE = 'founder_desk_messages';

export type FounderDeskSender = 'visitor' | 'founder';
export const FOUNDER_DESK_ORIGINS = ['partners', 'store'] as const;
export type FounderDeskOrigin = (typeof FOUNDER_DESK_ORIGINS)[number];
export const FOUNDER_DESK_ORIGIN_DEFAULT: FounderDeskOrigin = 'partners';

export type FounderDeskConversationRow = {
  id: string;
  guest_client_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  closed_at: string | null;
  last_message_at: string | null;
  last_visitor_at: string | null;
  last_founder_at: string | null;
  visitor_preview: string | null;
  origin?: FounderDeskOrigin;
  unread_visitor?: number;
};

export type FounderDeskMessageRow = {
  id: string;
  conversation_id: string;
  sender: FounderDeskSender;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function isValidFounderDeskGuestId(raw: string): boolean {
  return UUID_RE.test(raw.trim());
}

export function sanitizeFounderDeskBody(raw: string): string {
  return String(raw ?? '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, FOUNDER_DESK_MAX_BODY);
}

export function sanitizeFounderDeskOrigin(raw: unknown): FounderDeskOrigin {
  return String(raw ?? '').trim().toLowerCase() === 'store' ? 'store' : FOUNDER_DESK_ORIGIN_DEFAULT;
}

export function isFounderDeskOriginColumnMissing(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const code = String(error.code || '').trim();
  const message = String(error.message || '').toLowerCase();
  if (!message.includes('origin')) return false;
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find') ||
    message.includes('column')
  );
}

export function isFounderDeskTableMissing(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const code = String(error.code || '').trim();
  if (code === '42P01' || code === 'PGRST205') return true;
  const message = String(error.message || '').toLowerCase();
  return (
    message.includes('founder_desk_') &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('could not find the table'))
  );
}

function conversationOpen(row: {
  status: string;
  closed_at: string | null;
  expires_at: string;
}): boolean {
  if (row.status !== 'active' || row.closed_at) return false;
  return new Date(row.expires_at).getTime() > Date.now();
}

async function expireStaleForGuest(
  supabase: SupabaseClient,
  guestClientId: string,
): Promise<void> {
  const nowIso = new Date().toISOString();
  await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .update({ status: 'expired', closed_at: nowIso })
    .eq('guest_client_id', guestClientId)
    .eq('status', 'active')
    .lte('expires_at', nowIso);
}

async function expireStaleInbox(supabase: SupabaseClient): Promise<void> {
  const nowIso = new Date().toISOString();
  await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .update({ status: 'expired', closed_at: nowIso })
    .eq('status', 'active')
    .lte('expires_at', nowIso);
}

export async function startFounderDeskConversation(
  supabase: SupabaseClient,
  guestClientId: string,
  originRaw: unknown = FOUNDER_DESK_ORIGIN_DEFAULT,
): Promise<
  | { ok: true; conversation: FounderDeskConversationRow }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  if (!isValidFounderDeskGuestId(guestClientId)) {
    return { ok: false, error: 'Invalid guestClientId', status: 400 };
  }

  await expireStaleForGuest(supabase, guestClientId);

  const nowIso = new Date().toISOString();
  const { data: existing, error: existingErr } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .select('*')
    .eq('guest_client_id', guestClientId)
    .eq('status', 'active')
    .gt('expires_at', nowIso)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingErr) {
    if (isFounderDeskTableMissing(existingErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: existingErr.message || 'lookup_failed', status: 500 };
  }

  if (existing?.id) {
    return { ok: true, conversation: existing as FounderDeskConversationRow };
  }

  const expiresAt = new Date(Date.now() + FOUNDER_DESK_TTL_MS).toISOString();
  const origin = sanitizeFounderDeskOrigin(originRaw);
  const baseInsert = {
    guest_client_id: guestClientId,
    status: 'active',
    expires_at: expiresAt,
  };
  let { data: inserted, error: insertErr } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .insert({ ...baseInsert, origin })
    .select('*')
    .single();

  if (insertErr && isFounderDeskOriginColumnMissing(insertErr)) {
    const retry = await supabase
      .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
      .insert(baseInsert)
      .select('*')
      .single();
    inserted = retry.data;
    insertErr = retry.error;
  }

  if (insertErr || !inserted?.id) {
    if (isFounderDeskTableMissing(insertErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: insertErr?.message || 'start_failed', status: 500 };
  }

  return { ok: true, conversation: inserted as FounderDeskConversationRow };
}

async function loadVisitorConversation(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string },
): Promise<
  | { ok: true; conversation: FounderDeskConversationRow }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  if (!isValidFounderDeskGuestId(input.guestClientId) || !UUID_RE.test(input.conversationId)) {
    return { ok: false, error: 'Invalid conversation', status: 400 };
  }

  const { data, error } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .select('*')
    .eq('id', input.conversationId)
    .eq('guest_client_id', input.guestClientId)
    .maybeSingle();

  if (error) {
    if (isFounderDeskTableMissing(error)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: error.message || 'lookup_failed', status: 500 };
  }
  if (!data?.id) return { ok: false, error: 'Conversation not found', status: 404 };
  return { ok: true, conversation: data as FounderDeskConversationRow };
}

export async function listFounderDeskMessagesForVisitor(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string },
): Promise<
  | { ok: true; messages: FounderDeskMessageRow[]; expired: boolean; conversation: FounderDeskConversationRow }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  const conv = await loadVisitorConversation(supabase, input);
  if (!conv.ok) return conv;

  const { data, error } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .select('*')
    .eq('conversation_id', conv.conversation.id)
    .order('created_at', { ascending: true })
    .limit(FOUNDER_DESK_MAX_MESSAGES + 4);

  if (error) {
    if (isFounderDeskTableMissing(error)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: error.message || 'list_failed', status: 500 };
  }

  return {
    ok: true,
    messages: (data ?? []) as FounderDeskMessageRow[],
    expired: !conversationOpen(conv.conversation),
    conversation: conv.conversation,
  };
}

export async function sendFounderDeskVisitorMessage(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string; body: string },
): Promise<
  | { ok: true; message: FounderDeskMessageRow; conversation: FounderDeskConversationRow }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  const body = sanitizeFounderDeskBody(input.body);
  if (!body) return { ok: false, error: 'Empty message', status: 400 };

  const conv = await loadVisitorConversation(supabase, input);
  if (!conv.ok) return conv;
  if (!conversationOpen(conv.conversation)) {
    return { ok: false, error: 'Conversation expired', status: 409 };
  }

  const { count, error: countErr } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conv.conversation.id);

  if (countErr) {
    if (isFounderDeskTableMissing(countErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: countErr.message || 'count_failed', status: 500 };
  }
  if ((count ?? 0) >= FOUNDER_DESK_MAX_MESSAGES) {
    return { ok: false, error: 'Message limit reached', status: 429 };
  }

  const nowIso = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .insert({
      conversation_id: conv.conversation.id,
      sender: 'visitor',
      body,
    })
    .select('*')
    .single();

  if (insertErr || !inserted?.id) {
    if (isFounderDeskTableMissing(insertErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: insertErr?.message || 'send_failed', status: 500 };
  }

  const preview = body.slice(0, 120);
  await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .update({
      last_message_at: nowIso,
      last_visitor_at: nowIso,
      visitor_preview: preview,
    })
    .eq('id', conv.conversation.id);

  return {
    ok: true,
    message: inserted as FounderDeskMessageRow,
    conversation: {
      ...conv.conversation,
      last_message_at: nowIso,
      last_visitor_at: nowIso,
      visitor_preview: preview,
    },
  };
}

export async function listFounderDeskInbox(
  supabase: SupabaseClient,
): Promise<
  | { ok: true; conversations: FounderDeskConversationRow[]; tableMissing: false }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  await expireStaleInbox(supabase);

  const { data, error } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('started_at', { ascending: false })
    .limit(80);

  if (error) {
    if (isFounderDeskTableMissing(error)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: error.message || 'inbox_failed', status: 500 };
  }

  const rows = (data ?? []) as FounderDeskConversationRow[];
  const ids = rows.map((row) => row.id);
  const unreadByConv = new Map<string, number>();

  if (ids.length) {
    const { data: unreadRows } = await supabase
      .from(FOUNDER_DESK_MESSAGES_TABLE)
      .select('conversation_id')
      .in('conversation_id', ids)
      .eq('sender', 'visitor')
      .is('read_at', null);

    for (const row of unreadRows ?? []) {
      const id = String((row as { conversation_id?: string }).conversation_id ?? '');
      if (!id) continue;
      unreadByConv.set(id, (unreadByConv.get(id) ?? 0) + 1);
    }
  }

  return {
    ok: true,
    tableMissing: false,
    conversations: rows.map((row) => ({
      ...row,
      unread_visitor: unreadByConv.get(row.id) ?? 0,
    })),
  };
}

export async function listFounderDeskMessagesForAdmin(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<
  | { ok: true; messages: FounderDeskMessageRow[]; conversation: FounderDeskConversationRow; expired: boolean }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  if (!UUID_RE.test(conversationId)) {
    return { ok: false, error: 'Invalid conversation', status: 400 };
  }

  const { data: conv, error: convErr } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();

  if (convErr) {
    if (isFounderDeskTableMissing(convErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: convErr.message || 'lookup_failed', status: 500 };
  }
  if (!conv?.id) return { ok: false, error: 'Conversation not found', status: 404 };

  const { data, error } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(FOUNDER_DESK_MAX_MESSAGES + 8);

  if (error) {
    if (isFounderDeskTableMissing(error)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: error.message || 'list_failed', status: 500 };
  }

  return {
    ok: true,
    messages: (data ?? []) as FounderDeskMessageRow[],
    conversation: conv as FounderDeskConversationRow,
    expired: !conversationOpen(conv as FounderDeskConversationRow),
  };
}

export async function sendFounderDeskAdminMessage(
  supabase: SupabaseClient,
  input: { conversationId: string; body: string },
): Promise<
  | { ok: true; message: FounderDeskMessageRow }
  | { ok: false; error: string; status: number; tableMissing?: boolean }
> {
  const body = sanitizeFounderDeskBody(input.body);
  if (!body) return { ok: false, error: 'Empty message', status: 400 };
  if (!UUID_RE.test(input.conversationId)) {
    return { ok: false, error: 'Invalid conversation', status: 400 };
  }

  const { data: conv, error: convErr } = await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .select('*')
    .eq('id', input.conversationId)
    .maybeSingle();

  if (convErr) {
    if (isFounderDeskTableMissing(convErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: convErr.message || 'lookup_failed', status: 500 };
  }
  if (!conv?.id) return { ok: false, error: 'Conversation not found', status: 404 };
  if (!conversationOpen(conv as FounderDeskConversationRow)) {
    return { ok: false, error: 'Conversation expired', status: 409 };
  }

  const nowIso = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .insert({
      conversation_id: input.conversationId,
      sender: 'founder',
      body,
    })
    .select('*')
    .single();

  if (insertErr || !inserted?.id) {
    if (isFounderDeskTableMissing(insertErr)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: insertErr?.message || 'send_failed', status: 500 };
  }

  await supabase
    .from(FOUNDER_DESK_CONVERSATIONS_TABLE)
    .update({
      last_message_at: nowIso,
      last_founder_at: nowIso,
    })
    .eq('id', input.conversationId);

  return { ok: true, message: inserted as FounderDeskMessageRow };
}

export async function markFounderDeskConversationRead(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number; tableMissing?: boolean }> {
  if (!UUID_RE.test(conversationId)) {
    return { ok: false, error: 'Invalid conversation', status: 400 };
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from(FOUNDER_DESK_MESSAGES_TABLE)
    .update({ read_at: nowIso })
    .eq('conversation_id', conversationId)
    .eq('sender', 'visitor')
    .is('read_at', null);

  if (error) {
    if (isFounderDeskTableMissing(error)) {
      return { ok: false, error: 'desk_unavailable', status: 503, tableMissing: true };
    }
    return { ok: false, error: error.message || 'mark_read_failed', status: 500 };
  }
  return { ok: true };
}
