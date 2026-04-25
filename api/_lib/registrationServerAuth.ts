import { getRegistrationIntentSecret, verifyRegistrationIntentToken } from './registrationIntentCrypto.js';

export type RegistrationServerAuthResult =
  | { ok: true }
  | { ok: false; status: number; json: Record<string, unknown> };

/**
 * إما وضع صارم: REGISTRATION_INTENT_SECRET + رأس x-registration-intent موقّع لنفس orderId
 * أو الوضع القديم: مطابقة anon فقط.
 */
export function assertRegistrationServerAuth(
  request: Request,
  orderId: string,
  expectedAnon: string
): RegistrationServerAuthResult {
  const secret = getRegistrationIntentSecret();
  if (secret) {
    const token = request.headers.get('x-registration-intent')?.trim();
    const v = verifyRegistrationIntentToken(orderId, token, secret);
    if (v.ok === false) {
      return {
        ok: false,
        status: 401,
        json: {
          error: 'Unauthorized',
          code: 'registration_intent_required',
          hint: 'POST /api/register-mint-intent with { orderId }, then send header x-registration-intent on this request.',
          reason: v.reason,
        },
      };
    }
    return { ok: true };
  }

  if (!expectedAnon) {
    return {
      ok: false,
      status: 503,
      json: {
        error: 'Server not configured',
        hint: 'Set REGISTRATION_INTENT_SECRET (recommended) or configure SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY for legacy anon verification.',
      },
    };
  }

  const providedAnon =
    request.headers.get('x-supabase-anon')?.trim() ||
    (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization')!.slice(7).trim()
      : '');

  if (providedAnon !== expectedAnon) {
    return {
      ok: false,
      status: 401,
      json: {
        error: 'Unauthorized',
        hint: 'Anon key mismatch, or enable REGISTRATION_INTENT_SECRET + x-registration-intent for stricter registration.',
      },
    };
  }

  return { ok: true };
}
