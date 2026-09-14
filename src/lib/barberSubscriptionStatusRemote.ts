/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تحقّق بديل من حالة اشتراك الحلاق بعد فشل ودجت ميسر جانب المتصفح (on_failure)
 * — راجع الشرح الكامل في api/check-barber-subscription-status.ts.
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function statusEndpoint(): string {
  const explicit = String(import.meta.env.VITE_CHECK_BARBER_SUBSCRIPTION_STATUS_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/check-barber-subscription-status`;
  return '/api/check-barber-subscription-status';
}

export type CheckBarberSubscriptionStatusResult =
  | {
      ok: true;
      found: boolean;
      status?: string;
      tier?: string | null;
      amountHalalas?: number | null;
      currency?: string | null;
      updatedAt?: string | null;
    }
  | { ok: false; error: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkBarberSubscriptionStatusOnce(params: {
  linkedBarberId?: string;
  requestId?: string;
  timeoutMs?: number;
}): Promise<CheckBarberSubscriptionStatusResult> {
  const q = new URLSearchParams();
  if (params.linkedBarberId?.trim()) q.set('linkedBarberId', params.linkedBarberId.trim());
  if (params.requestId?.trim()) q.set('requestId', params.requestId.trim());
  if (!q.toString()) return { ok: false, error: 'missing_identifier' };

  const url = `${statusEndpoint()}?${q.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), params.timeoutMs ?? 12_000);
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit', signal: controller.signal });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: String(data.error || 'check_failed') };
    }
    return {
      ok: true,
      found: data.found === true,
      status: data.status != null ? String(data.status) : undefined,
      tier: data.tier != null ? String(data.tier) : null,
      amountHalalas: typeof data.amountHalalas === 'number' ? data.amountHalalas : null,
      currency: data.currency != null ? String(data.currency) : null,
      updatedAt: data.updatedAt != null ? String(data.updatedAt) : null,
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return { ok: false, error: 'timeout' };
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * يستطلع الحالة عدة مرات (لإفساح مهلة قصيرة لوصول webhook ميسر) ثم يتوقف.
 * يُعيد أول استجابة «مدفوعة» تظهر بعد `sinceMs`، أو آخر استجابة معروفة إن لم
 * تظهر — الاستدعاء يقرر عندها أن يعرض رسالة عدم تأكد بدل جزم بالفشل.
 */
export async function pollBarberSubscriptionStatusRemote(
  params: { linkedBarberId?: string; requestId?: string; sinceMs: number },
  opts?: { maxAttempts?: number },
): Promise<CheckBarberSubscriptionStatusResult> {
  const maxAttempts = opts?.maxAttempts ?? 7;
  let last: CheckBarberSubscriptionStatusResult = { ok: false, error: 'not_checked' };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) await sleep(3000);
    const result = await checkBarberSubscriptionStatusOnce(params);
    last = result;
    if (!result.ok || !result.found) continue;

    const updatedAtMs = result.updatedAt ? Date.parse(result.updatedAt) : NaN;
    const isFresh = Number.isFinite(updatedAtMs) && updatedAtMs >= params.sinceMs - 60_000;
    if (result.status === 'paid' && isFresh) return result;
  }

  return last;
}
