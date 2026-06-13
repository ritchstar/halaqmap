const DEFAULT_ENDPOINT = '/api/barber-home-service-update';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_HOME_SERVICE_URL || DEFAULT_ENDPOINT).trim();
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

export type BarberPortalHomeServiceSnapshot = {
  offered: boolean;
  priceSar: number | null;
  radiusKm: number | null;
  publicVisible: boolean;
  customerNote: string | null;
};

export type BarberHomeServiceUpdatePayload = {
  offered: boolean;
  priceSar: number | null;
  radiusKm: number | null;
  publicVisible: boolean;
  customerNote: string;
};

export function homeServiceSnapshotFromBarberRow(row: {
  home_service_offered?: boolean | null;
  home_service_price_sar?: unknown;
  home_service_radius_km?: unknown;
  home_service_public_visible?: boolean | null;
  home_service_customer_note?: string | null;
}): BarberPortalHomeServiceSnapshot {
  const rawPrice = row.home_service_price_sar;
  const p = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
  const rawRadius = row.home_service_radius_km;
  const r = rawRadius != null && rawRadius !== '' ? Number(rawRadius) : NaN;
  return {
    offered: row.home_service_offered === true,
    priceSar: Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null,
    radiusKm: Number.isFinite(r) && r > 0 ? Math.floor(r) : null,
    publicVisible: row.home_service_public_visible !== false,
    customerNote:
      row.home_service_customer_note != null ? String(row.home_service_customer_note) : null,
  };
}

export async function updateBarberHomeServiceRemote(input: {
  barberId: string;
  email: string;
  payload: BarberHomeServiceUpdatePayload;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تحديث الزيارة المنزلية غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        offered: input.payload.offered,
        priceSar: input.payload.priceSar,
        radiusKm: input.payload.radiusKm,
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
