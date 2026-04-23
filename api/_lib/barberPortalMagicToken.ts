import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const DEFAULT_TTL_MS = 72 * 60 * 60 * 1000;

export function getBarberPortalMagicSecret(): string | null {
  const primary = (process.env.BARBER_PORTAL_MAGIC_SECRET || '').trim();
  if (primary) return primary;
  const fallback = (process.env.REGISTRATION_INTENT_SECRET || '').trim();
  return fallback.length > 0 ? fallback : null;
}

function magicTtlMs(): number {
  const raw = (process.env.BARBER_PORTAL_MAGIC_TTL_MS || '').trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 60_000 && n <= 30 * 24 * 60 * 60 * 1000) return n;
  return DEFAULT_TTL_MS;
}

type MagicPayloadV1 = {
  v: 1;
  bid: string;
  email: string;
  jti: string;
  exp: number;
};

export function mintBarberPortalMagicToken(barberId: string, email: string, secret: string, now = Date.now()): string {
  const jti = randomUUID();
  const payload: MagicPayloadV1 = {
    v: 1,
    bid: String(barberId).trim(),
    email: String(email).trim().toLowerCase(),
    jti,
    exp: now + magicTtlMs(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export type VerifiedBarberPortalMagic =
  | { ok: true; barberId: string; email: string; jti: string }
  | { ok: false; reason: string };

export function verifyBarberPortalMagicToken(token: string | null | undefined, secret: string): VerifiedBarberPortalMagic {
  if (!token?.trim()) return { ok: false, reason: 'missing_token' };
  const parts = token.trim().split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'malformed' };

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };

  let parsed: MagicPayloadV1;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as MagicPayloadV1;
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (parsed.v !== 1 || typeof parsed.bid !== 'string' || !parsed.bid.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.email !== 'string' || !parsed.email.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.jti !== 'string' || !parsed.jti.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, barberId: parsed.bid.trim(), email: parsed.email.trim().toLowerCase(), jti: parsed.jti.trim() };
}
