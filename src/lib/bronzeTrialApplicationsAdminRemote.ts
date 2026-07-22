import { getSupabaseClient } from '@/integrations/supabase/client';

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-bronze-trial-applications`;
  return '/api/admin-bronze-trial-applications';
}

async function bearer(accessToken: string): Promise<string | null> {
  const t = String(accessToken ?? '').trim();
  if (t) return t;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}

export type BronzeTrialApplicationRow = {
  id: string;
  status: string;
  salon_name: string;
  establishment_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city_ar: string;
  district_ar: string;
  region_ar: string | null;
  latitude: number;
  longitude: number;
  notes: string | null;
  photo_exterior_sign_url: string;
  photo_exterior_2_url: string;
  photo_interior_1_url: string;
  photo_interior_2_url: string;
  email_confirmed_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_email: string | null;
  reject_reason: string | null;
  code_emailed_at: string | null;
  code_email_count: number;
  created_at: string;
};

export async function adminListBronzeTrialApplicationsRemote(input: {
  accessToken: string;
  status?: string;
}): Promise<{ ok: true; rows: BronzeTrialApplicationRow[] } | { ok: false; error: string }> {
  const token = await bearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  const url = input.status ? `${endpoint()}?status=${encodeURIComponent(input.status)}` : endpoint();
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      rows?: BronzeTrialApplicationRow[];
    };
    if (!resp.ok || json.ok === false) return { ok: false, error: json.error || `http_${resp.status}` };
    return { ok: true, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminBronzeTrialApplicationActionRemote(input: {
  accessToken: string;
  action: 'approve' | 'reject' | 'resend_code' | 'resend_confirm' | 'mark_email_confirmed';
  applicationId: string;
  reason?: string;
}): Promise<{ ok: true; plaintextCode?: string; emailSent?: boolean } | { ok: false; error: string }> {
  const token = await bearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  try {
    const resp = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action: input.action,
        applicationId: input.applicationId,
        reason: input.reason,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      plaintextCode?: string;
      emailSent?: boolean;
    };
    if (!resp.ok || json.ok === false) return { ok: false, error: json.error || `http_${resp.status}` };
    return { ok: true, plaintextCode: json.plaintextCode, emailSent: json.emailSent };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
