/**
 * يستدعي مسار الخادم لمحاكاة تعارض حجز (للتطوير أو الإنتاج مع ALLOW + سرّ).
 * يتطلب وصولاً إلى /api (مثلاً vercel dev، أو VITE_PROXY_API_TO أثناء vite).
 */
export async function runSimulateBookingOverlapRemote(): Promise<
  { ok: true; summary: string; detail?: Record<string, unknown> } | { ok: false; error: string }
> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const secret = (import.meta.env.VITE_SIMULATE_BOOKING_OVERLAP_SECRET as string | undefined)?.trim();
  if (secret) headers['x-simulate-booking-secret'] = secret;

  let res: Response;
  try {
    res = await fetch('/api/simulate-booking-overlap', { method: 'POST', headers });
  } catch {
    return {
      ok: false,
      error:
        'تعذر الاتصال بمسار المحاكاة. للتطوير: شغّل `vercel dev` وافتح الموقع منه، أو عيّن VITE_PROXY_API_TO في البيئة ليشير إلى منفذ vercel dev.',
    };
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const err =
      (typeof data.error === 'string' && data.error) ||
      (typeof data.hint === 'string' && data.hint) ||
      res.statusText;
    return { ok: false, error: err || `HTTP ${res.status}` };
  }

  const summary = typeof data.summary === 'string' ? data.summary : 'اكتملت المحاكاة.';
  return { ok: true, summary, detail: data };
}
