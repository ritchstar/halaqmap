/** جلب سياق صفحة التقييم عبر QR — يتحقق من الرمز على الخادم ولا يكشف rating_invite_token للعميل. */

import { getOrCreateQrRaterInstanceId } from '@/lib/qrRaterIdentity';

const API_PATH = '/api/public-rate-barber-context';

export type PublicRateBarberOutcome =
  | { ok: true; barberId: string; name: string; alreadySubmitted: boolean }
  | {
      ok: false;
      reason:
        | 'missing_params'
        | 'not_found'
        | 'invalid_token'
        | 'rate_limited'
        | 'server'
        | 'network';
    };

export async function fetchPublicRateBarberContext(
  barberId: string | undefined,
  token: string | null | undefined,
): Promise<PublicRateBarberOutcome> {
  const id = String(barberId ?? '').trim();
  const tok = String(token ?? '').trim();
  if (!id || !tok) return { ok: false, reason: 'missing_params' };

  try {
    const r = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: id,
        token: tok,
        clientInstanceId: getOrCreateQrRaterInstanceId(),
      }),
    });
    const j = (await r.json().catch(() => ({}))) as {
      ok?: boolean;
      name?: string;
      error?: string;
      alreadySubmitted?: boolean;
    };

    if (r.status === 429) return { ok: false, reason: 'rate_limited' };
    if (r.ok && j.ok === true && typeof j.name === 'string') {
      return {
        ok: true,
        barberId: id,
        name: j.name,
        alreadySubmitted: j.alreadySubmitted === true,
      };
    }
    if (r.status === 403 || j.error === 'invalid_token') return { ok: false, reason: 'invalid_token' };
    if (r.status === 404 || j.error === 'not_found') return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
