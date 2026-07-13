/**
 * رمز تأكيد بريد طلب تجربة برونزي — HMAC قصير العمر.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function resolveSecret(): string | null {
  const s = (
    process.env.BRONZE_TRIAL_EMAIL_CONFIRM_SECRET ||
    process.env.REGISTRATION_INTENT_SECRET ||
    process.env.LISTING_LICENSE_VOUCHER_PEPPER ||
    ''
  ).trim();
  return s.length >= 16 ? s : null;
}

export function mintBronzeTrialEmailConfirmToken(input: {
  applicationId: string;
  email: string;
  ttlSeconds?: number;
}): { ok: true; token: string } | { ok: false; error: string } {
  const secret = resolveSecret();
  if (!secret) return { ok: false, error: 'confirm_secret_missing' };
  const ttl = Math.min(72 * 3600, Math.max(3600, input.ttlSeconds ?? 48 * 3600));
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = JSON.stringify({
    aid: input.applicationId,
    em: String(input.email).trim().toLowerCase(),
    exp,
  });
  const payloadB64 = b64url(Buffer.from(payload, 'utf8'));
  const sig = createHmac('sha256', secret).update(payloadB64).digest();
  return { ok: true, token: `${payloadB64}.${b64url(sig)}` };
}

export function verifyBronzeTrialEmailConfirmToken(
  token: string,
):
  | { ok: true; applicationId: string; email: string }
  | { ok: false; error: string } {
  const secret = resolveSecret();
  if (!secret) return { ok: false, error: 'confirm_secret_missing' };
  const raw = String(token ?? '').trim();
  const parts = raw.split('.');
  if (parts.length !== 2) return { ok: false, error: 'invalid_token' };
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return { ok: false, error: 'invalid_token' };
  const expected = createHmac('sha256', secret).update(payloadB64).digest();
  let got: Buffer;
  try {
    got = Buffer.from(sigB64, 'base64url');
  } catch {
    return { ok: false, error: 'invalid_token' };
  }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, error: 'invalid_token' };
  }
  let parsed: { aid?: string; em?: string; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as typeof parsed;
  } catch {
    return { ok: false, error: 'invalid_token' };
  }
  if (!parsed.aid || !parsed.em || !parsed.exp) return { ok: false, error: 'invalid_token' };
  if (parsed.exp * 1000 < Date.now()) return { ok: false, error: 'token_expired' };
  return { ok: true, applicationId: parsed.aid, email: parsed.em };
}
