import { getSupabaseClient } from '@/integrations/supabase/client';
import type {
  OpsControllerFeedResponse,
  OpsControllerReportInput,
  OpsControllerSubmitResponse,
} from '@/modules/ops-controller/types';

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

export async function fetchOpsControllerFeed(limit = 40): Promise<
  { ok: true; body: OpsControllerFeedResponse } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch(`/api/ops-controller?limit=${encodeURIComponent(String(limit))}`, {
      method: 'GET',
      headers,
    });
    const body = (await res.json().catch(() => ({}))) as OpsControllerFeedResponse & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, body: { reports: Array.isArray(body.reports) ? body.reports : [] } };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function submitOpsControllerReport(
  input: OpsControllerReportInput,
): Promise<{ ok: true; body: OpsControllerSubmitResponse } | { ok: false; error: string; status?: number }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/ops-controller', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => ({}))) as OpsControllerSubmitResponse & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || `HTTP ${res.status}`, status: res.status };
    if (!body.report?.id) return { ok: false, error: 'استجابة غير متوقعة من الخادم.' };
    return { ok: true, body: body as OpsControllerSubmitResponse };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
