import { getSupabaseClient } from '@/integrations/supabase/client';

const DEFAULT_ENDPOINT = '/api/admin-support-chat';

function endpoint(): string {
  return String(import.meta.env.VITE_ADMIN_SUPPORT_CHAT_URL || DEFAULT_ENDPOINT).trim();
}

export type AdminSupportThread = {
  barberId: string;
  barberName: string;
  barberEmail: string;
  lastMessageAt: string | null;
};

export type AdminSupportMessageRow = {
  id: string;
  barber_id: string;
  from_admin: boolean;
  body: string;
  admin_sender_email: string | null;
  created_at: string;
};

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

export async function fetchAdminSupportThreadsRemote(): Promise<
  { ok: true; threads: AdminSupportThread[] } | { ok: false; error: string }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا يوجد جلسة إدارة نشطة.' };
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار دردشة الإدارة غير مضبوط.' };
  try {
    const res = await fetch(`${ep}?action=threads`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      threads?: AdminSupportThread[];
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, threads: Array.isArray(json.threads) ? json.threads : [] };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function fetchAdminSupportMessagesRemote(
  barberId: string
): Promise<{ ok: true; messages: AdminSupportMessageRow[] } | { ok: false; error: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا يوجد جلسة إدارة نشطة.' };
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار دردشة الإدارة غير مضبوط.' };
  const q = new URLSearchParams({ action: 'messages', barberId: barberId.trim() });
  try {
    const res = await fetch(`${ep}?${q.toString()}`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      messages?: AdminSupportMessageRow[];
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, messages: Array.isArray(json.messages) ? json.messages : [] };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function sendAdminSupportMessageRemote(input: {
  barberId: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا يوجد جلسة إدارة نشطة.' };
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار دردشة الإدارة غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers,
      body: JSON.stringify({ barberId: input.barberId.trim(), body: input.body.trim() }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
