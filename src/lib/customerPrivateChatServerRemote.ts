import type { PrivateConversationRow, PrivateMessageRow } from '@/lib/privateChatRemote';

const DEFAULT_ENDPOINT = '/api/customer-private-chat';
const GUEST_CLIENT_ID_KEY = 'halaqmap-customer-chat-guest-id';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function endpoint(): string {
  return String(import.meta.env.VITE_CUSTOMER_PRIVATE_CHAT_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export function getOrCreateGuestClientId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(GUEST_CLIENT_ID_KEY)?.trim() ?? '';
    if (UUID_RE.test(existing)) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(GUEST_CLIENT_ID_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function normalizeErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('barber account not linked')) {
    return 'الشات المباشر غير متاح لهذا الصالون حالياً — الحساب غير مربوط بمستخدم.';
  }
  if (m.includes('barber inactive')) {
    return 'هذا الصالون غير مفعّل حالياً، لذلك لا يمكن بدء محادثة مباشرة.';
  }
  if (m.includes('barber not found')) {
    return 'تعذّر بدء الشات لهذا الصالون حالياً.';
  }
  if (m.includes('private chat is available for gold and diamond')) {
    return 'الشات المباشر متاح لباقات ذهبي وماسي فقط لهذا الصالون.';
  }
  if (m.includes('conversation expired') || m.includes('expired or closed')) {
    return 'انتهت الجلسة. ابدأ جلسة جديدة.';
  }
  return message;
}

async function postJson<T>(payload: Record<string, unknown>): Promise<
  | { ok: true; json: T }
  | { ok: false; error: string }
> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار شات العملاء غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      return { ok: false, error: normalizeErrorMessage(json.error || `HTTP ${res.status}`) };
    }
    return { ok: true, json };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function startCustomerPrivateChatServer(
  barberId: string,
): Promise<
  | { ok: true; conversationId: string; customerUserId: string; conversation: PrivateConversationRow }
  | { ok: false; error: string }
> {
  const guestClientId = getOrCreateGuestClientId();
  const res = await postJson<{
    conversationId?: string;
    customerUserId?: string;
    conversation?: PrivateConversationRow;
  }>({
    action: 'start',
    guestClientId,
    barberId: barberId.trim(),
  });
  if (!res.ok) return { ok: false, error: res.error };
  const conversationId = String(res.json.conversationId ?? '').trim();
  const customerUserId = String(res.json.customerUserId ?? '').trim();
  if (!conversationId || !customerUserId || !res.json.conversation) {
    return { ok: false, error: 'تعذّر بدء المحادثة الخاصة.' };
  }
  return {
    ok: true,
    conversationId,
    customerUserId,
    conversation: res.json.conversation,
  };
}

export async function getCustomerPrivateChatServer(
  conversationId: string,
): Promise<{ ok: true; conversation: PrivateConversationRow } | { ok: false; error: string }> {
  const res = await postJson<{ conversation?: PrivateConversationRow }>({
    action: 'get_conversation',
    guestClientId: getOrCreateGuestClientId(),
    conversationId: conversationId.trim(),
  });
  if (!res.ok) return { ok: false, error: res.error };
  if (!res.json.conversation) return { ok: false, error: 'تعذّر قراءة بيانات المحادثة.' };
  return { ok: true, conversation: res.json.conversation };
}

export async function listCustomerPrivateMessagesServer(
  conversationId: string,
): Promise<{ ok: true; messages: PrivateMessageRow[]; expired: boolean } | { ok: false; error: string }> {
  const res = await postJson<{ messages?: PrivateMessageRow[]; expired?: boolean }>({
    action: 'list_messages',
    guestClientId: getOrCreateGuestClientId(),
    conversationId: conversationId.trim(),
  });
  if (!res.ok) return { ok: false, error: res.error };
  return {
    ok: true,
    messages: Array.isArray(res.json.messages) ? res.json.messages : [],
    expired: Boolean(res.json.expired),
  };
}

export async function sendCustomerPrivateMessageServer(
  conversationId: string,
  body: string,
): Promise<
  | { ok: true; message: PrivateMessageRow; shiftReplied: boolean }
  | { ok: false; error: string }
> {
  const res = await postJson<{
    message?: PrivateMessageRow;
    shiftIntercept?: { replied?: boolean; reason?: string };
  }>({
    action: 'send',
    guestClientId: getOrCreateGuestClientId(),
    conversationId: conversationId.trim(),
    body: body.trim(),
  });
  if (!res.ok) return { ok: false, error: res.error };
  if (!res.json.message) return { ok: false, error: 'تعذّر إرسال الرسالة.' };
  return {
    ok: true,
    message: res.json.message,
    shiftReplied: res.json.shiftIntercept?.replied === true,
  };
}
