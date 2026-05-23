import { getSupabaseClient } from '@/integrations/supabase/client';

/** يطابق `api/_lib/adminSentinelClientHeader.ts` — يُسمح لمسارات Sentinel بهذا الرأس فقط (مع JWT). */
const SENTINEL_UI_HEADER = 'x-halaqmap-admin-sentinel';
const SENTINEL_UI_VALUE = '1';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token?.trim()) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.trim()}`,
    [SENTINEL_UI_HEADER]: SENTINEL_UI_VALUE,
  };
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export type SentinelPreflight = {
  ok: boolean;
  clientIp?: string;
  ipOk?: boolean;
  mfaOk?: boolean;
  hint?: string | null;
};

export async function fetchAdminSentinelPreflight(): Promise<
  { ok: true; body: SentinelPreflight } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/admin-sentinel-preflight', { method: 'GET', headers });
    const body = (await res.json().catch(() => ({}))) as SentinelPreflight & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || body.hint || `HTTP ${res.status}`, status: res.status };
    return { ok: true, body: body as SentinelPreflight };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function fetchAdminSentinelBrief(): Promise<
  { ok: true; json: Record<string, unknown> } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/admin-sentinel-brief', { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
    if (!res.ok) return { ok: false, error: String(json.error || `HTTP ${res.status}`), status: res.status };
    return { ok: true, json };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function postAdminSentinelChat(
  messages: ChatTurn[],
  sentinelBrief: Record<string, unknown> | null
): Promise<{ ok: true; reply: string } | { ok: false; error: string; status?: number }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/admin-sentinel-chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages, sentinelBrief }),
    });
    const json = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, reply: String(json.reply || '') };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export type SentinelOpenAiDiagnostics = {
  ok?: boolean;
  openaiConfigured?: boolean;
  model?: string;
};

/** يتحقق من ضبط OPENAI_API_KEY على الخادم (لا يُنفَّذ استدعاء OpenAI). */
export async function fetchAdminSentinelOpenAiDiagnostics(): Promise<
  { ok: true; body: SentinelOpenAiDiagnostics } | { ok: false; error: string }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/admin-sentinel-chat', { method: 'GET', headers });
    const body = (await res.json().catch(() => ({}))) as SentinelOpenAiDiagnostics & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || `HTTP ${res.status}` };
    return { ok: true, body };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function postAdminSentinelSovereignAction(input: {
  actionType: string;
  detail: Record<string, unknown>;
  opsPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  headers['x-ops-password'] = input.opsPassword.trim();
  try {
    const res = await fetch('/api/admin-sentinel-action', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        actionType: input.actionType,
        detail: input.detail,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
