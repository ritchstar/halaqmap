/**
 * توقيع نية التسجيل من السيرفر — يُفعَّل عند ضبط REGISTRATION_INTENT_SECRET على Vercel.
 * انظر: GET /api/register-mint-intent
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function mintIntentEndpoint(): string {
  const explicit = String(import.meta.env.VITE_REGISTRATION_MINT_INTENT_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/register-mint-intent`;
  return '/api/register-mint-intent';
}

function anonHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export type MintRegistrationIntentResult =
  | { ok: true; intentToken: string | null }
  | { ok: false; error: string };

/**
 * يطلب من السيرفر توقيعاً لـ orderId. إن كان السيرفر بدون سرّ نية، يعيد intentToken: null (الوضع القديم بـ anon).
 */
export async function mintRegistrationIntentTokenRemote(orderId: string): Promise<MintRegistrationIntentResult> {
  const ep = mintIntentEndpoint();
  try {
    const resp = await fetch(ep, {
      method: 'POST',
      headers: anonHeaders(),
      body: JSON.stringify({ orderId }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      intentToken?: string;
      intentDisabled?: boolean;
      error?: string;
      hint?: string;
    };
    if (!resp.ok) {
      if (import.meta.env.DEV && (resp.status === 404 || resp.status === 503)) {
        return { ok: true, intentToken: null };
      }
      const parts = [json.error, json.hint].filter(Boolean);
      return { ok: false, error: parts.join('\n') || `HTTP ${resp.status}` };
    }
    if (json.intentDisabled === true) {
      return { ok: true, intentToken: null };
    }
    const tok = String(json.intentToken ?? '').trim();
    if (!tok) {
      return { ok: false, error: 'استجابة غير صالحة من سيرفر توقيع الطلب (لا يوجد intentToken).' };
    }
    return { ok: true, intentToken: tok };
  } catch (e) {
    if (import.meta.env.DEV) {
      return { ok: true, intentToken: null };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'تعذر الاتصال بخدمة توقيع الطلب.',
    };
  }
}
