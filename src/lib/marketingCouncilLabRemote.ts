import { getSupabaseClient } from '@/integrations/supabase/client';

export const MARKETING_LAB_TIMEOUT_MS = 55_000;

export type MarketingLabChannel = 'b2c' | 'b2b';

const ROUTE_BY_CHANNEL: Record<MarketingLabChannel, string> = {
  b2c: '/api/admin-b2c-marketing-lab-chat',
  b2b: '/api/admin-b2b-marketing-lab-chat',
};

export type MarketingLabCityHint = {
  city: string;
  searches7d: number;
  searches24h: number;
  zeroResultRatio: number;
  avgResultCount: number;
};

export type MarketingLabTierHint = {
  tier: string;
  ordersLast30d: number;
  ordersLast90d: number;
  paidRatio: number;
};

export type MarketingLabReplyContext = {
  totalSearches7d?: number;
  totalSearches24h?: number;
  zeroResultRatioOverall?: number;
  topCities?: MarketingLabCityHint[];
  totalPartnerOrders30d?: number;
  paidPartnerOrders30d?: number;
  conversionRatio30d?: number;
  tierBreakdown?: MarketingLabTierHint[];
};

export type MarketingLabChatTurn = { role: 'user' | 'assistant'; content: string };

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

export async function fetchMarketingLabDiagnostics(
  channel: MarketingLabChannel,
): Promise<
  { ok: true; openaiConfigured: boolean; model?: string } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };
  const res = await fetch(ROUTE_BY_CHANNEL[channel], { method: 'GET', headers: h });
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

export async function chatWithMarketingLab(
  channel: MarketingLabChannel,
  input: {
    userMessage: string;
    conversationHistory?: MarketingLabChatTurn[];
  },
  options?: { signal?: AbortSignal },
): Promise<
  | { ok: true; reply: string; context?: MarketingLabReplyContext }
  | { ok: false; error: string; timedOut?: boolean }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MARKETING_LAB_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  options?.signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(ROUTE_BY_CHANNEL[channel], {
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
        ? (json.context as MarketingLabReplyContext)
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
