const DEFAULT_ENDPOINT = '/api/barber-support-chat';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_SUPPORT_CHAT_URL || DEFAULT_ENDPOINT).trim();
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

export type BarberSupportMessageRow = {
  id: string;
  barber_id: string;
  from_admin: boolean;
  body: string;
  admin_sender_email?: string | null;
  created_at: string;
};

export async function fetchBarberSupportMessagesRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; messages: BarberSupportMessageRow[] } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار دردشة الدعم غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'list',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      messages?: BarberSupportMessageRow[];
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, messages: Array.isArray(json.messages) ? json.messages : [] };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function sendBarberSupportMessageRemote(input: {
  barberId: string;
  email: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار دردشة الدعم غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'send',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
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
