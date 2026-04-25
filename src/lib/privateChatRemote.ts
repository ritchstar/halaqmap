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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('not authenticated')) {
    return 'يتطلب الشات تسجيل دخول المستخدم (عميل/حلاق) قبل بدء المحادثة الخاصة.';
  }
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('403')) {
    return 'تم رفض العملية بسبب صلاحيات الأمان. تأكد أن الحساب هو أحد طرفي المحادثة.';
  }
  if (m.includes('barber account not linked')) {
    return 'تعذّر بدء الشات: صف الحلاق غير مربوط بحساب تسجيل الدخول. من لوحة الإدارة اربط الحلاق بمستخدم (barbers.user_id) ثم أعد المحاولة.';
  }
  if (m.includes('barber inactive')) {
    return 'هذا الصالون غير مفعّل حالياً، لذلك لا يمكن بدء محادثة مباشرة.';
  }
  if (m.includes('barber not found')) {
    return 'لم يُعثر على الصالون أو لا يُسمح بالشات. تحقق أن الواجهة تستخدم نفس مشروع Supabase، وأن السجل موجود ومفعّل، وأن حساب الحلاق مربوطاً (barbers.user_id).';
  }
  if (m.includes('invalid input syntax for type uuid')) {
    return 'معرّف الصالون غير صالح تقنياً. أعد تحميل الصفحة بعد تحديث التطبيق.';
  }
  if (m.includes('private chat is available for gold and diamond')) {
    return 'الشات المباشر متاح لباقات ذهبي وماسي فقط لهذا الصالون.';
  }
  if (m.includes('invalid barber id')) {
    return 'لا يمكن بدء محادثة مع حسابك نفسه كصالون.';
  }
  return message;
}

/** يبدأ جلسة خاصة كعميل مُصدَّق عبر `barbers.id` (ذهبي/ماسي فقط) — لا يحتاج معرف `user_id` للحلاق في الواجهة. */
export async function startPrivateConversationByBarberId(
  barberId: string
): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ في البيئة.' };

  const id = barberId.trim();
  if (!UUID_RE.test(id)) {
    return {
      ok: false,
      error:
        'معرّف الصالون ليس UUID صالحاً (غالباً بيانات عرض أو بيئة خاطئة). تأكد من جلب الحلاقين من نفس مشروع Supabase.',
    };
  }

  const { data, error } = await client.rpc('start_private_conversation_by_barber_id', {
    p_barber_id: id,
  });

  if (error || !data) {
    return {
      ok: false,
      error: normalizeErrorMessage(error?.message || 'تعذّر بدء المحادثة الخاصة.'),
    };
  }
  return { ok: true, conversationId: String(data) };
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

