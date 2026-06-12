const DEFAULT_ENDPOINT = '/api/barber-children-services-update';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_CHILDREN_SERVICES_URL || DEFAULT_ENDPOINT).trim();
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

export type BarberPortalChildrenServicesSnapshot = {
  acceptsChildren: boolean;
  childrenSpecialist: boolean;
};

export async function updateBarberChildrenServicesRemote(input: {
  barberId: string;
  email: string;
  acceptsChildren: boolean;
  childrenSpecialist: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تحديث خدمات الأطفال غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(input),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };
    if (!response.ok || payload.ok !== true) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' };
  }
}
