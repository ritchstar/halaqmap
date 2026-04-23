/** استخراج أول رابط http(s) صالح من نص الرمز/الـ QR دون تنفيذ أي شيء على الخادم. */

export function extractHttpUrlFromQrPayload(text: string): string | null {
  const raw = (text || '').trim();
  if (!raw) return null;
  const firstToken = raw.split(/\s+/)[0]?.trim();
  if (firstToken && /^https?:\/\//i.test(firstToken)) {
    try {
      return sanitizePreviewUrl(firstToken);
    } catch {
      /* fall through */
    }
  }
  const m = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (!m?.[0]) return null;
  return sanitizePreviewUrl(m[0]);
}

export function sanitizePreviewUrl(candidate: string): string | null {
  try {
    const u = new URL(candidate.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}
