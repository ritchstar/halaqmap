export type VerifyVercelCronResult =
  | { ok: true }
  | { ok: false; status: number; json: Record<string, unknown> };

/**
 * Verifies that the request comes from Vercel Cron.
 * - Preferred: CRON_SECRET with Authorization: Bearer <CRON_SECRET>
 * - Fallback: x-vercel-cron header presence when no secret is configured
 */
export function verifyVercelCronRequest(request: Request): VerifyVercelCronResult {
  const expectedSecret = (process.env.CRON_SECRET || '').trim();
  const authHeader = request.headers.get('authorization')?.trim() || '';
  const hasVercelCronHeader = Boolean(request.headers.get('x-vercel-cron'));

  if (expectedSecret) {
    const expected = `Bearer ${expectedSecret}`;
    if (authHeader !== expected) {
      return {
        ok: false,
        status: 401,
        json: {
          error: 'Unauthorized cron request',
          hint: 'Configure CRON_SECRET in Vercel so cron requests include Authorization: Bearer <CRON_SECRET>.',
        },
      };
    }
    return { ok: true };
  }

  if (!hasVercelCronHeader) {
    return {
      ok: false,
      status: 401,
      json: {
        error: 'Unauthorized cron request',
        hint: 'Missing x-vercel-cron header and CRON_SECRET is not configured.',
      },
    };
  }

  return { ok: true };
}
