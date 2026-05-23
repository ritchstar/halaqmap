const DEFAULT_ENDPOINT = '/api/diamond-chat-translate';

function endpoint(): string {
  return String(import.meta.env.VITE_DIAMOND_CHAT_TRANSLATE_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

/** يختار لغة الهدف بحيث يُترجم النص «للطرف الآخر» في واجهة عربية أساساً. */
export function guessTranslateTarget(text: string): 'ar' | 'en' {
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabic >= latin) return 'en';
  return 'ar';
}

export async function translateChatLineRemote(input: {
  text: string;
  target: 'ar' | 'en';
}): Promise<{ ok: true; text: string; configured: boolean } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار الترجمة غير مضبوط.' };
  const t = input.text.trim();
  if (!t) return { ok: true, text: '', configured: false };

  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ text: t, target: input.target }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      translated?: string | null;
      configured?: boolean;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    const out = json.translated?.trim() || t;
    return { ok: true, text: out, configured: Boolean(json.configured) };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة الترجمة.' };
  }
}
