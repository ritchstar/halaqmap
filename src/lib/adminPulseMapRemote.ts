import { getSupabaseClient } from '@/integrations/supabase/client';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

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

export async function fetchAdminPulseMap(minutes = 120): Promise<
  { ok: true; body: PulseMapPayload } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch(`/api/admin-pulse-map?minutes=${minutes}`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as PulseMapPayload & { ok?: boolean; error?: string };
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: String(json.error || `HTTP ${res.status}`), status: res.status };
    }
    return { ok: true, body: json };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال بخريطة النبض الإدارية.' };
  }
}
