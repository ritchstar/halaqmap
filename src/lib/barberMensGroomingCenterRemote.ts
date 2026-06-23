export type BarberPortalMensGroomingCenterSnapshot = {
  mensGroomingCenter: boolean;
  groomingCenterBannerLines: string[];
};

const DEFAULT_ENDPOINT = '/api/barber-mens-grooming-center-update';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_MENS_GROOMING_CENTER_UPDATE_URL || DEFAULT_ENDPOINT).trim();
}

function readStoredBarberSessionToken(): string {
  try {
    const raw = localStorage.getItem('barberAuth');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
    return String(parsed.barberSessionToken ?? '').trim();
  } catch {
    return '';
  }
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  const token = readStoredBarberSessionToken();
  if (token) headers['x-barber-portal-session'] = token;
  return headers;
}

export async function updateBarberMensGroomingCenterRemote(input: {
  barberId: string;
  email: string;
  groomingCenterBannerLines: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار التحديث غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId,
        email: input.email.trim(),
        groomingCenterBannerLines: input.groomingCenterBannerLines,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'تعذر الاتصال بالخادم.',
    };
  }
}
