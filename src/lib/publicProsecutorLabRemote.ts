import { getSupabaseClient } from '@/integrations/supabase/client';
import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';

const LAB_CHAT_API = '/api/admin-public-prosecutor-lab-chat';
const DASHBOARD_API = '/api/admin-public-prosecutor-dashboard';
export const PUBLIC_PROSECUTOR_LAB_TIMEOUT_MS = 62_000;

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

export async function fetchPublicProsecutorLabDiagnostics(): Promise<
  | { ok: true; openaiConfigured: boolean; model?: string }
  | { ok: false; error: string }
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

export async function chatWithPublicProsecutorLab(
  input: {
    userMessage: string;
    watchAgent?: string;
    crisisMode?: boolean;
    assistantSnippet?: string;
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  },
  options?: { signal?: AbortSignal },
): Promise<
  | {
      ok: true;
      reply: string;
      interject?: PublicProsecutorGovernanceAction | null;
      governanceActions?: PublicProsecutorGovernanceAction[];
    }
  | { ok: false; error: string; timedOut?: boolean }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PUBLIC_PROSECUTOR_LAB_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  options?.signal?.addEventListener('abort', onExternalAbort);

  try {
    const res = await fetch(LAB_CHAT_API, {
      method: 'POST',
      headers: h,
      signal: controller.signal,
      body: JSON.stringify({
        userMessage: input.userMessage,
        watchAgent: input.watchAgent,
        crisisMode: input.crisisMode,
        assistantSnippet: input.assistantSnippet,
        conversationHistory: input.conversationHistory,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: formatError(json, res.status) };
    }
    const reply = String(json.reply || '').trim();
    if (!reply) return { ok: false, error: 'رد فارغ من الخادم' };
    return {
      ok: true,
      reply,
      interject: (json.interject as PublicProsecutorGovernanceAction | null | undefined) ?? null,
      governanceActions: Array.isArray(json.governanceActions)
        ? (json.governanceActions as PublicProsecutorGovernanceAction[])
        : [],
    };
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

export async function evaluatePublicProsecutorInterject(input: {
  userMessage: string;
  assistantSnippet?: string;
  watchAgent?: string;
  crisisMode?: boolean;
}): Promise<
  | { ok: true; interject: PublicProsecutorGovernanceAction | null }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(DASHBOARD_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      action: 'evaluate_interject',
      userMessage: input.userMessage,
      assistantSnippet: input.assistantSnippet,
      watchAgent: input.watchAgent,
      crisisMode: input.crisisMode,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }
  return {
    ok: true,
    interject: (json.interject as PublicProsecutorGovernanceAction | null | undefined) ?? null,
  };
}
