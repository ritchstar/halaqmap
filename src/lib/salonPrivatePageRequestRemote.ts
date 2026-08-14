/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const DEFAULT_ENDPOINT = '/api/barber-salon-private-page-request';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_SALON_PRIVATE_PAGE_URL || DEFAULT_ENDPOINT).trim();
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

export type SalonPrivatePageRequestRow = {
  id: string;
  sku: string;
  page_count: number;
  unit_sar: number;
  base_sar: number;
  status: string;
  salon_display_name: string;
  created_at: string;
};

export type SalonPrivatePageIntakePayload = {
  pageCount: number;
  salonDisplayName: string;
  city: string;
  district: string;
  aboutText: string;
  servicesText: string;
  productsText: string;
  brandNotes: string;
  contactWhatsapp: string;
};

async function post<T>(body: Record<string, unknown>): Promise<T | { ok: false; error: string }> {
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return json;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function listSalonPrivatePageRequestsRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; requests: SalonPrivatePageRequestRow[] } | { ok: false; error: string }> {
  const r = await post<{ ok: true; requests?: SalonPrivatePageRequestRow[] }>({
    action: 'list',
    barberId: input.barberId,
    email: input.email,
  });
  if ('error' in r && !('ok' in r && r.ok)) return { ok: false, error: r.error || 'Failed' };
  const ok = r as { ok: true; requests?: SalonPrivatePageRequestRow[] };
  return { ok: true, requests: ok.requests ?? [] };
}

export async function submitSalonPrivatePageRequestRemote(input: {
  barberId: string;
  email: string;
  payload: SalonPrivatePageIntakePayload;
}): Promise<{ ok: true; request: SalonPrivatePageRequestRow | null } | { ok: false; error: string }> {
  const r = await post<{ ok: true; request?: SalonPrivatePageRequestRow }>({
    action: 'submit',
    barberId: input.barberId,
    email: input.email,
    ...input.payload,
  });
  if ('error' in r && !('ok' in r && r.ok)) return { ok: false, error: r.error || 'Failed' };
  const ok = r as { ok: true; request?: SalonPrivatePageRequestRow };
  return { ok: true, request: ok.request ?? null };
}
