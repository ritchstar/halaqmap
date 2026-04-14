import { getSupabaseClient } from '@/integrations/supabase/client';

export interface PrivateConversationRow {
  id: string;
  customer_id: string;
  barber_user_id: string;
  barber_id: string | null;
  status: 'active' | 'closed' | 'expired';
  started_at: string;
  expires_at: string;
  closed_at: string | null;
  last_message_at: string | null;
}

export interface PrivateMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

function normalizeErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('not authenticated')) {
    return 'يتطلب الشات تسجيل دخول المستخدم (عميل/حلاق) قبل بدء المحادثة الخاصة.';
  }
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('403')) {
    return 'تم رفض العملية بسبب صلاحيات الأمان. تأكد أن الحساب هو أحد طرفي المحادثة.';
  }
  return message;
}

export async function startOrGetPrivateConversation(
  barberUserId: string,
  barberId?: string
): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const { data, error } = await client.rpc('start_private_conversation', {
    p_barber_user_id: barberUserId,
    p_barber_id: barberId ?? null,
  });

  if (error || !data) {
    return {
      ok: false,
      error: normalizeErrorMessage(error?.message || 'تعذّر بدء المحادثة الخاصة.'),
    };
  }
  return { ok: true, conversationId: String(data) };
}

export async function getPrivateConversation(
  conversationId: string
): Promise<{ ok: true; conversation: PrivateConversationRow } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const { data, error } = await client
    .from('private_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error || !data) {
    return { ok: false, error: normalizeErrorMessage(error?.message || 'تعذّر قراءة بيانات المحادثة.') };
  }
  return { ok: true, conversation: data as PrivateConversationRow };
}

export async function listPrivateMessages(
  conversationId: string
): Promise<{ ok: true; messages: PrivateMessageRow[] } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const { data, error } = await client
    .from('private_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    return { ok: false, error: normalizeErrorMessage(error.message) };
  }
  return { ok: true, messages: (data ?? []) as PrivateMessageRow[] };
}

export async function sendPrivateMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<{ ok: true; message: PrivateMessageRow } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const text = body.trim();
  if (!text) return { ok: false, error: 'نص الرسالة فارغ.' };

  const { data, error } = await client
    .from('private_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: text,
    })
    .select('*')
    .single();

  if (error || !data) {
    return { ok: false, error: normalizeErrorMessage(error?.message || 'تعذّر إرسال الرسالة.') };
  }
  return { ok: true, message: data as PrivateMessageRow };
}

export async function markPrivateMessageRead(
  messageId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const { error } = await client
    .from('private_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .is('read_at', null);

  if (error) return { ok: false, error: normalizeErrorMessage(error.message) };
  return { ok: true };
}

export async function closePrivateConversation(
  conversationId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const { error } = await client.rpc('close_private_conversation', {
    p_conversation_id: conversationId,
  });
  if (error) return { ok: false, error: normalizeErrorMessage(error.message) };
  return { ok: true };
}

