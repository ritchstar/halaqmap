/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز بطاقة كوافير ماب للمشاركة — بلا تخزين على الخادم.
 */
export const COIFFEUR_CARD_TOKEN_MAX = 240;
const NAME_MAX = 40;
const ROLE_MAX = 36;

export function sanitizeCoiffeurCardText(raw: string, max: number): string {
  const stripped = Array.from(String(raw || ''))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && code !== 127;
    })
    .join('');
  return stripped
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .replace(/%/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function sanitizeCoiffeurCardName(raw: string): string {
  return sanitizeCoiffeurCardText(raw, NAME_MAX);
}

export function sanitizeCoiffeurCardRole(raw: string): string {
  return sanitizeCoiffeurCardText(raw, ROLE_MAX);
}

export function encodeCoiffeurCardToken(name: string, role: string): string | null {
  const n = sanitizeCoiffeurCardName(name);
  const r = sanitizeCoiffeurCardRole(role);
  if (n.length < 2 || r.length < 2) return null;
  const token = Buffer.from(`${n}\n${r}`, 'utf8').toString('base64url');
  if (token.length < 8 || token.length > COIFFEUR_CARD_TOKEN_MAX) return null;
  return token;
}

export function decodeCoiffeurCardToken(
  token: string,
): { name: string; role: string } | null {
  const trimmed = String(token || '').trim();
  if (!/^[A-Za-z0-9_-]{8,240}$/.test(trimmed)) return null;
  try {
    const raw = Buffer.from(trimmed, 'base64url').toString('utf8');
    const nl = raw.indexOf('\n');
    if (nl < 1) return null;
    const name = sanitizeCoiffeurCardName(raw.slice(0, nl));
    const role = sanitizeCoiffeurCardRole(raw.slice(nl + 1));
    if (name.length < 2 || role.length < 2) return null;
    return { name, role };
  } catch {
    return null;
  }
}
