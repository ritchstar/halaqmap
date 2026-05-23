import { getSupabaseClient } from '@/integrations/supabase/client';

const LAB_CHAT_API = '/api/admin-partner-liaison-lab-chat';
export const PARTNER_LIAISON_LAB_TIMEOUT_MS = 55_000;

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function formatError(json: Record<string, unknown>, status: number): string {
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  const hint = typeof json.hint === 'string' ? json.hint : '';
  return hint ? `${err} — ${hint}` : err;
}

export async function fetchPartnerLiaisonLabDiagnostics(): Promise<
  { ok: true; openaiConfigured: boolean; model?: string } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };
  const res = await fetch(LAB_CHAT_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }
  return {
    ok: true,
    openaiConfigured: Boolean(json.openaiConfigured),
    model: typeof json.model === 'string' ? json.model : undefined,
  };
}

export async function chatWithPartnerLiaisonLab(
  input: {
    userMessage?: string;
    imageBase64?: string;
    imageMime?: string;
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  },
  options?: { signal?: AbortSignal },
): Promise<{ ok: true; reply: string } | { ok: false; error: string; timedOut?: boolean }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PARTNER_LIAISON_LAB_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  options?.signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(LAB_CHAT_API, {
      method: 'POST',
      headers: h,
      signal: controller.signal,
      body: JSON.stringify({
        userMessage: input.userMessage,
        imageBase64: input.imageBase64,
        imageMime: input.imageMime,
        conversationHistory: input.conversationHistory,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: formatError(json, res.status) };
    }
    const reply = String(json.reply || '').trim();
    if (!reply) return { ok: false, error: 'رد فارغ من الخادم' };
    return { ok: true, reply };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, error: 'انتهت مهلة الاتصال — أعد المحاولة', timedOut: true };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'خطأ شبكة' };
  } finally {
    clearTimeout(timeoutId);
    options?.signal?.removeEventListener('abort', onExternalAbort);
  }
}
