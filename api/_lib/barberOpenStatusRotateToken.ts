import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export function getBarberOpenStatusRotateSecret(): string | null {
  const primary = (process.env.BARBER_OPEN_STATUS_ROTATE_SECRET || '').trim();
  if (primary) return primary;
  const magic = (process.env.BARBER_PORTAL_MAGIC_SECRET || '').trim();
  if (magic) return magic;
  const fallback = (process.env.REGISTRATION_INTENT_SECRET || '').trim();
  return fallback.length > 0 ? fallback : null;
}

function rotateTtlMs(): number {
  const raw = (process.env.BARBER_OPEN_STATUS_ROTATE_TTL_MS || '').trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 5 * 60_000 && n <= 24 * 60 * 60 * 1000) return n;
  return DEFAULT_TTL_MS;
}

type RotateConfirmPayloadV1 = {
  v: 1;
  bid: string;
  email: string;
  lic: string;
  jti: string;
  exp: number;
};

export function mintBarberOpenStatusRotateConfirmToken(
  barberId: string,
  email: string,
  licenseFingerprint: string,
  secret: string,
  now = Date.now(),
): string {
  const payload: RotateConfirmPayloadV1 = {
    v: 1,
    bid: String(barberId).trim(),
    email: String(email).trim().toLowerCase(),
    lic: String(licenseFingerprint).trim(),
    jti: randomUUID(),
    exp: now + rotateTtlMs(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export type VerifiedBarberOpenStatusRotateConfirm =
  | { ok: true; barberId: string; email: string; licenseFingerprint: string; jti: string }
  | { ok: false; reason: string };

export function verifyBarberOpenStatusRotateConfirmToken(
  token: string | null | undefined,
  secret: string,
): VerifiedBarberOpenStatusRotateConfirm {
  if (!token?.trim()) return { ok: false, reason: 'missing_token' };
  const parts = token.trim().split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'malformed' };

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };

  let parsed: RotateConfirmPayloadV1;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as RotateConfirmPayloadV1;
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (parsed.v !== 1 || typeof parsed.bid !== 'string' || !parsed.bid.trim()) {
    return { ok: false, reason: 'bad_payload' };
  }
  if (typeof parsed.email !== 'string' || !parsed.email.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.lic !== 'string' || !parsed.lic.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.jti !== 'string' || !parsed.jti.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
    return { ok: false, reason: 'expired' };
  }
  return {
    ok: true,
    barberId: parsed.bid.trim(),
    email: parsed.email.trim().toLowerCase(),
    licenseFingerprint: parsed.lic.trim(),
    jti: parsed.jti.trim(),
  };
}
