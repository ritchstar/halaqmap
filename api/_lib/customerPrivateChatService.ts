import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const GUEST_EMAIL_DOMAIN = 'customer.halaqmap.local';

export type CustomerPrivateMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  is_digital_shift_reply?: boolean;
};

export type CustomerPrivateConversationRow = {
  id: string;
  customer_id: string;
  barber_user_id: string;
  barber_id: string | null;
  status: string;
  started_at: string;
  expires_at: string;
  closed_at: string | null;
  last_message_at: string | null;
};

function guestEmail(guestClientId: string): string {
  return `guest.${guestClientId}@${GUEST_EMAIL_DOMAIN}`;
}

export function isValidGuestClientId(raw: string): boolean {
  return UUID_RE.test(raw.trim());
}

export async function ensureGuestCustomerProfile(
  supabase: SupabaseClient,
  guestClientId: string,
): Promise<{ ok: true; customerUserId: string } | { ok: false; error: string }> {
  const id = guestClientId.trim();
  const email = guestEmail(id);

  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
  if (profile?.id) {
    return { ok: true, customerUserId: String(profile.id) };
  }

  const password = randomBytes(24).toString('base64url');
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { guest_chat: true, guest_client_id: id },
  });

  if (error) {
    const { data: retry } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
    if (retry?.id) return { ok: true, customerUserId: String(retry.id) };
    return { ok: false, error: error.message || 'guest_create_failed' };
  }

  const userId = created.user?.id;
  if (!userId) return { ok: false, error: 'guest_create_no_user' };
  return { ok: true, customerUserId: userId };
}

export async function resolveBarberForCustomerChat(
  supabase: SupabaseClient,
  barberId: string,
): Promise<
  | { ok: true; barberUserId: string; barberRowId: string }
  | { ok: false; error: string; status: number }
> {
  const id = barberId.trim();
  if (!UUID_RE.test(id)) {
    return { ok: false, error: 'Invalid barber id', status: 400 };
  }

  const { data: barber, error } = await supabase
    .from('barbers')
    .select('id, user_id, tier, is_active')
    .eq('id', id)
    .maybeSingle();

  if (error || !barber) {
    return { ok: false, error: 'Barber not found', status: 404 };
  }

  if (barber.is_active === false) {
    return { ok: false, error: 'Barber inactive', status: 409 };
  }

  const userId = barber.user_id ? String(barber.user_id) : '';
  if (!UUID_RE.test(userId)) {
    return { ok: false, error: 'Barber account not linked', status: 409 };
  }

  const tier = String(barber.tier ?? '').toLowerCase();
  if (tier !== 'gold' && tier !== 'diamond') {
    return { ok: false, error: 'Private chat is available for gold and diamond salons only', status: 403 };
  }

  return { ok: true, barberUserId: userId, barberRowId: String(barber.id) };
}

function conversationOpen(row: {
  status: string;
  closed_at: string | null;
  expires_at: string;
}): boolean {
  if (row.status !== 'active' || row.closed_at) return false;
  return new Date(row.expires_at).getTime() > Date.now();
}

export async function startCustomerPrivateConversation(
  supabase: SupabaseClient,
  input: { guestClientId: string; barberId: string },
): Promise<
  | { ok: true; conversationId: string; customerUserId: string; conversation: CustomerPrivateConversationRow }
  | { ok: false; error: string; status: number }
> {
  if (!isValidGuestClientId(input.guestClientId)) {
    return { ok: false, error: 'Invalid guestClientId', status: 400 };
  }

  const guest = await ensureGuestCustomerProfile(supabase, input.guestClientId);
  if (!guest.ok) return { ok: false, error: guest.error, status: 500 };

  const barber = await resolveBarberForCustomerChat(supabase, input.barberId);
  if (!barber.ok) return { ok: false, error: barber.error, status: barber.status };

  if (barber.barberUserId === guest.customerUserId) {
    return { ok: false, error: 'Invalid barber id', status: 400 };
  }

  await supabase.rpc('expire_private_conversations', {
    p_customer_id: guest.customerUserId,
    p_barber_user_id: barber.barberUserId,
  });

  const nowIso = new Date().toISOString();
  const { data: existing } = await supabase
    .from('private_conversations')
    .select('*')
    .eq('customer_id', guest.customerUserId)
    .eq('barber_user_id', barber.barberUserId)
    .eq('status', 'active')
    .gt('expires_at', nowIso)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return {
      ok: true,
      conversationId: String(existing.id),
      customerUserId: guest.customerUserId,
      conversation: existing as CustomerPrivateConversationRow,
    };
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const { data: inserted, error: insErr } = await supabase
    .from('private_conversations')
    .insert({
      customer_id: guest.customerUserId,
      barber_user_id: barber.barberUserId,
      barber_id: barber.barberRowId,
      status: 'active',
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (insErr || !inserted?.id) {
    return { ok: false, error: insErr?.message || 'conversation_insert_failed', status: 500 };
  }

  return {
    ok: true,
    conversationId: String(inserted.id),
    customerUserId: guest.customerUserId,
    conversation: inserted as CustomerPrivateConversationRow,
  };
}

export async function getCustomerPrivateConversation(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string },
): Promise<
  | { ok: true; conversation: CustomerPrivateConversationRow; customerUserId: string }
  | { ok: false; error: string; status: number }
> {
  if (!isValidGuestClientId(input.guestClientId)) {
    return { ok: false, error: 'Invalid guestClientId', status: 400 };
  }

  const guest = await ensureGuestCustomerProfile(supabase, input.guestClientId);
  if (!guest.ok) return { ok: false, error: guest.error, status: 500 };

  const { data: conv, error } = await supabase
    .from('private_conversations')
    .select('*')
    .eq('id', input.conversationId.trim())
    .maybeSingle();

  if (error || !conv) {
    return { ok: false, error: 'Conversation not found', status: 404 };
  }

  if (String(conv.customer_id) !== guest.customerUserId) {
    return { ok: false, error: 'Forbidden', status: 403 };
  }

  return {
    ok: true,
    conversation: conv as CustomerPrivateConversationRow,
    customerUserId: guest.customerUserId,
  };
}

export async function listCustomerPrivateMessages(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string },
): Promise<
  | { ok: true; messages: CustomerPrivateMessageRow[]; expired: boolean }
  | { ok: false; error: string; status: number }
> {
  const convRes = await getCustomerPrivateConversation(supabase, input);
  if (!convRes.ok) return convRes;

  const open = conversationOpen(convRes.conversation);
  if (!open) {
    return { ok: true, messages: [], expired: true };
  }

  const { data: msgs, error } = await supabase
    .from('private_messages')
    .select('id, conversation_id, sender_id, body, created_at, read_at, is_digital_shift_reply')
    .eq('conversation_id', input.conversationId.trim())
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) {
    return { ok: false, error: error.message || 'messages_load_failed', status: 500 };
  }

  return { ok: true, messages: (msgs ?? []) as CustomerPrivateMessageRow[], expired: false };
}

export async function sendCustomerPrivateMessage(
  supabase: SupabaseClient,
  input: { guestClientId: string; conversationId: string; body: string },
): Promise<
  | { ok: true; message: CustomerPrivateMessageRow }
  | { ok: false; error: string; status: number }
> {
  const text = input.body.trim();
  if (text.length < 1 || text.length > 2000) {
    return { ok: false, error: 'body must be 1–2000 characters', status: 400 };
  }

  const convRes = await getCustomerPrivateConversation(supabase, input);
  if (!convRes.ok) return convRes;

  if (!conversationOpen(convRes.conversation)) {
    return { ok: false, error: 'Conversation expired or closed', status: 409 };
  }

  const { data: inserted, error } = await supabase
    .from('private_messages')
    .insert({
      conversation_id: input.conversationId.trim(),
      sender_id: convRes.customerUserId,
      body: text,
    })
    .select('id, conversation_id, sender_id, body, created_at, read_at, is_digital_shift_reply')
    .maybeSingle();

  if (error || !inserted) {
    return { ok: false, error: error?.message || 'Insert failed', status: 500 };
  }

  return { ok: true, message: inserted as CustomerPrivateMessageRow };
}
