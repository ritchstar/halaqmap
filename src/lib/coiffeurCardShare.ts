/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز بطاقة كوافير ماب للمشاركة — بلا تخزين على الخادم.
 * الرابط: /c/{token} حتى لا يظهر الاسم العربي مرمّزاً في واتساب.
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

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(token: string): Uint8Array | null {
  const trimmed = String(token || '').trim();
  if (!/^[A-Za-z0-9_-]{8,240}$/.test(trimmed)) return null;
  try {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(trimmed, 'base64url'));
    }
    const pad = trimmed.length % 4 === 0 ? '' : '='.repeat(4 - (trimmed.length % 4));
    const b64 = trimmed.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function encodeCoiffeurCardToken(name: string, role: string): string | null {
  const n = sanitizeCoiffeurCardName(name);
  const r = sanitizeCoiffeurCardRole(role);
  if (n.length < 2 || r.length < 2) return null;
  const bytes = new TextEncoder().encode(`${n}\n${r}`);
  const token = toBase64Url(bytes);
  if (token.length < 8 || token.length > COIFFEUR_CARD_TOKEN_MAX) return null;
  return token;
}

export function decodeCoiffeurCardToken(
  token: string,
): { name: string; role: string } | null {
  const bytes = fromBase64Url(token);
  if (!bytes || bytes.length < 3) return null;
  try {
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
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
