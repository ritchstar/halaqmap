import { getSupabaseClient } from '@/integrations/supabase/client';

const LAB_API = '/api/admin-technical-consultant-lab-chat';
export const TECHNICAL_CONSULTANT_LAB_TIMEOUT_MS = 62_000;

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function chatWithTechnicalConsultantLab(
  input: {
    userMessage: string;
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  },
  options?: { signal?: AbortSignal },
): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TECHNICAL_CONSULTANT_LAB_TIMEOUT_MS);
  options?.signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(LAB_API, {
      method: 'POST',
      headers: h,
      signal: controller.signal,
      body: JSON.stringify(input),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok !== true) {
      return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
    }
    const reply = String(json.reply || '').trim();
    if (!reply) return { ok: false, error: 'رد فارغ' };
    return { ok: true, reply };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, error: 'انتهت مهلة الاتصال' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'خطأ شبكة' };
  } finally {
    clearTimeout(timeoutId);
  }
}
