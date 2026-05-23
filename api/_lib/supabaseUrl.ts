function stripWrappingQuotes(raw: string): string {
  const s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

/**
 * يطبيع قيمة Supabase URL القادمة من env (غالبًا Vercel) لتفادي أخطاء مثل:
 * "Invalid SupabaseUrl: Must be a valid HTTP or HTTPS URL."
 */
export function normalizeSupabaseUrl(raw: string | undefined | null): string {
  const cleaned = stripWrappingQuotes(String(raw ?? '').trim());
  if (!cleaned) return '';

  // لو نُسيت البادئة لكنه يبدو host صالح
  if (!/^https?:\/\//i.test(cleaned) && /^[a-z0-9.-]+\.supabase\.co\b/i.test(cleaned)) {
    return `https://${cleaned}`;
  }

  return cleaned;
}

export function isLikelyHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
