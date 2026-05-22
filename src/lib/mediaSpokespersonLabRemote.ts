import { getSupabaseClient } from '@/integrations/supabase/client';

export const MEDIA_LAB_TIMEOUT_MS = 58_000;

const ROUTE = '/api/admin-media-spokesperson-chat';

export type MediaLabCityHint = {
  city: string;
  searches7d: number;
  zeroResultRatio: number;
};

export type MediaLabReplyContext = {
  totalSearches7d?: number;
  totalSearches24h?: number;
  zeroResultRatioOverall?: number;
  topCities?: MediaLabCityHint[];
  totalPartnerOrders30d?: number;
  paidPartnerOrders30d?: number;
  partnerConversionRatio30d?: number;
  activeBarbers?: number;
  citiesCovered?: number;
  engineeringStatus?: 'OK' | 'FAIL' | 'PENDING' | 'UNKNOWN';
  prosecutorWorkingPapers?: number;
};

export type MediaLabChatTurn = { role: 'user' | 'assistant'; content: string };

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

export async function fetchMediaSpokespersonDiagnostics(): Promise<
  { ok: true; openaiConfigured: boolean; model?: string } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };
  const res = await fetch(ROUTE, { method: 'GET', headers: h });
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

export async function chatWithMediaSpokesperson(
  input: { userMessage: string; conversationHistory?: MediaLabChatTurn[] },
  options?: { signal?: AbortSignal },
): Promise<
  | { ok: true; reply: string; context?: MediaLabReplyContext }
  | { ok: false; error: string; timedOut?: boolean }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MEDIA_LAB_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  options?.signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(ROUTE, {
      method: 'POST',
      headers: h,
      signal: controller.signal,
      body: JSON.stringify({
        userMessage: input.userMessage,
        conversationHistory: input.conversationHistory,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: formatError(json, res.status) };
    }
    const reply = String(json.reply || '').trim();
    if (!reply) return { ok: false, error: 'رد فارغ من الخادم' };
    const context =
      json.context && typeof json.context === 'object'
        ? (json.context as MediaLabReplyContext)
        : undefined;
    return { ok: true, reply, context };
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
