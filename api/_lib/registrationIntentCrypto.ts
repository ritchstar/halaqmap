import { createHmac, timingSafeEqual } from 'node:crypto';

export const REGISTRATION_ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

/** صلاحية التوقيع — يجب أن يغطي رفع الملفات وإكمال النموذج */
const INTENT_TTL_MS = 4 * 60 * 60 * 1000;

export function getRegistrationIntentSecret(): string | null {
  const s = (process.env.REGISTRATION_INTENT_SECRET || '').trim();
  return s.length > 0 ? s : null;
}

export function isRegistrationIntentMode(): boolean {
  return getRegistrationIntentSecret() != null;
}

export function mintRegistrationIntentToken(orderId: string, secret: string, now = Date.now()): string {
  const exp = now + INTENT_TTL_MS;
  const payload = JSON.stringify({ orderId, exp });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyRegistrationIntentToken(
  orderId: string,
  token: string | null | undefined,
  secret: string
): { ok: true } | { ok: false; reason: string } {
  if (!token?.trim()) return { ok: false, reason: 'missing_intent' };
  if (!REGISTRATION_ORDER_ID_RE.test(orderId)) return { ok: false, reason: 'invalid_order_id' };

  const parts = token.trim().split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed_intent' };
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'malformed_intent' };

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };

  let parsed: { orderId?: unknown; exp?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      orderId?: unknown;
      exp?: unknown;
    };
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (typeof parsed.orderId !== 'string' || parsed.orderId !== orderId) {
    return { ok: false, reason: 'order_mismatch' };
  }
  if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true };
}
