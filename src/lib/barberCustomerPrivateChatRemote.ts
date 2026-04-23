const DEFAULT_ENDPOINT = '/api/barber-customer-private-chat';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_CUSTOMER_PRIVATE_CHAT_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  try {
    const raw = localStorage.getItem('barberAuth');
    if (raw) {
      const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
      const token = String(parsed.barberSessionToken ?? '').trim();
      if (token) headers['x-barber-portal-session'] = token;
    }
  } catch {
    /* ignore localStorage parse issues */
  }
  return headers;
}

export type BarberPrivateConversationRow = {
  id: string;
  customer_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  closed_at: string | null;
  last_message_at: string | null;
};

export type BarberPrivateMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export async function barberListPrivateConversationsRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; conversations: BarberPrivateConversationRow[] } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار شات العملاء غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'list_conversations',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      conversations?: BarberPrivateConversationRow[];
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, conversations: Array.isArray(json.conversations) ? json.conversations : [] };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function barberListPrivateMessagesRemote(input: {
  barberId: string;
  email: string;
  conversationId: string;
}): Promise<
  | { ok: true; messages: BarberPrivateMessageRow[]; expired: boolean }
  | { ok: false; error: string }
> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار شات العملاء غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'list_messages',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        conversationId: input.conversationId.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      messages?: BarberPrivateMessageRow[];
      expired?: boolean;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return {
      ok: true,
      messages: Array.isArray(json.messages) ? json.messages : [],
      expired: Boolean(json.expired),
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function barberSendPrivateMessageRemote(input: {
  barberId: string;
  email: string;
  conversationId: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار شات العملاء غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'send',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        conversationId: input.conversationId.trim(),
        body: input.body.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
