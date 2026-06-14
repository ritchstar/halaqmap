const DEFAULT_ENDPOINT = '/api/barber-groom-prep-update';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_GROOM_PREP_URL || DEFAULT_ENDPOINT).trim();
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
    /* ignore */
  }
  return headers;
}

export type BarberPortalGroomPrepSnapshot = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  customerNote: string | null;
};

export type BarberGroomPrepUpdatePayload = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  customerNote: string;
};

export async function updateBarberGroomPrepRemote(input: {
  barberId: string;
  email: string;
  payload: BarberGroomPrepUpdatePayload;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تحديث تجهيز العريس غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        offered: input.payload.offered,
        priceSar: input.payload.priceSar,
        publicVisible: input.payload.publicVisible,
        customerNote: input.payload.customerNote.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
