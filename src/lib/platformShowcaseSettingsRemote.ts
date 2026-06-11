import { getSupabaseClient } from '@/integrations/supabase/client';

const API = '/api/platform-showcase-settings';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

export type PlatformShowcaseSettingsPayload = {
  barber_id: string | null;
  fallback_when_empty: boolean;
  map_visible: boolean;
  education_intro_ar: string;
  updated_at: string | null;
  updated_by_email: string | null;
};

export type ShowcaseBarberSummary = {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
  tier: string;
  gallery_count?: number;
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-client-supabase-url': getClientSupabaseUrl(),
  };
}

export async function fetchPlatformShowcaseSettingsAdmin(): Promise<
  | { ok: true; settings: PlatformShowcaseSettingsPayload; barber: ShowcaseBarberSummary | null }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  const settings = json.settings as PlatformShowcaseSettingsPayload;
  const barber = (json.barber as ShowcaseBarberSummary | null) ?? null;
  if (!settings) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, settings, barber };
}

export async function savePlatformShowcaseSettingsAdmin(
  patch: Partial<PlatformShowcaseSettingsPayload>,
): Promise<{ ok: true; settings: PlatformShowcaseSettingsPayload } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(patch),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  const settings = json.settings as PlatformShowcaseSettingsPayload;
  if (!settings) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, settings };
}

export async function ensureShowcaseBarberAdmin(): Promise<
  | { ok: true; barberId: string; created: boolean; barber: ShowcaseBarberSummary | null }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'ensure_barber' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  return {
    ok: true,
    barberId: String(json.barber_id ?? ''),
    created: json.created === true,
    barber: (json.barber as ShowcaseBarberSummary | null) ?? null,
  };
}
