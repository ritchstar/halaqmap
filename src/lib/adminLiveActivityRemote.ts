export type LiveActivityWindow = {
  minutes: number;
  bookings: number;
  paymentsCompleted: number;
  paymentsFailed: number;
  conversationsStarted: number;
  newProfiles: number;
  registrationSubmissions: number;
  interestSignups: number;
  securityEvents: number;
};

export type LiveActivityOnline = {
  total: number;
  anon: number;
  barber: number;
  admin: number;
  ambassador: number;
  presenceTableReady: boolean;
};

export type LiveActivityPayload = {
  ok: true;
  generatedAt: string;
  onlineWindowSeconds: number;
  online: LiveActivityOnline;
  windows: {
    m15: LiveActivityWindow;
    h1: LiveActivityWindow;
    h24: LiveActivityWindow;
  };
  notes: { ar: string; searchGeoLogging: string };
  integrations: { posthogClientConfigured: boolean };
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const { getSupabaseClient } = await import('@/integrations/supabase/client');
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

export async function fetchAdminLiveActivity(): Promise<
  { ok: true; body: LiveActivityPayload } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/admin-live-activity', { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as LiveActivityPayload & {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: String(json.error || `HTTP ${res.status}`), status: res.status };
    }
    return { ok: true, body: json };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال بنشاط المنصة الحي.' };
  }
}
