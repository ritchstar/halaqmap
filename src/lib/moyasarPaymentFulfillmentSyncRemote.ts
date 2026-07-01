import type { DigitalActivationCertificateView } from '@/config/geospatialLicenseDoctrine';

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function syncEndpoint(): string {
  const explicit = String(import.meta.env.VITE_SYNC_MOYSAR_PAYMENT_FULFILLMENT_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/sync-moyasar-payment-fulfillment`;
  return '/api/sync-moyasar-payment-fulfillment';
}

export type SyncMoyasarPaymentFulfillmentResult =
  | {
      ok: true;
      alreadyFulfilled: boolean;
      orderId?: string;
      certificate?: DigitalActivationCertificateView;
    }
  | { ok: false; error: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncMoyasarPaymentFulfillmentRemote(
  paymentId: string,
  opts?: { timeoutMs?: number },
): Promise<SyncMoyasarPaymentFulfillmentResult> {
  const q = new URLSearchParams({ paymentId: paymentId.trim() });
  const url = `${syncEndpoint()}?${q.toString()}`;
  const timeoutMs = opts?.timeoutMs ?? 45_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit', signal: controller.signal });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: String(data.error || 'sync_failed') };
    }
    const certificate =
      data.certificate && typeof data.certificate === 'object'
        ? (data.certificate as DigitalActivationCertificateView)
        : undefined;
    return {
      ok: true,
      alreadyFulfilled: data.alreadyFulfilled === true,
      orderId: data.orderId != null ? String(data.orderId) : undefined,
      certificate,
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, error: 'sync_timeout' };
    }
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** فترات انتظار متدرجة: محاولات سريعة أولاً ثم أبطأ. */
function pollIntervalMs(attempt: number): number {
  if (attempt <= 0) return 0;
  if (attempt === 1) return 500;
  if (attempt === 2) return 800;
  if (attempt === 3) return 1200;
  if (attempt < 10) return 1800;
  return 2500;
}

/** يستدعي sync ثم يعيد المحاولة حتى تظهر الشهادة (فوري من صفحة الدفع — لا ينتظر webhook). */
export async function pollMoyasarPaymentFulfillmentRemote(
  paymentId: string,
  opts?: { maxAttempts?: number },
): Promise<SyncMoyasarPaymentFulfillmentResult> {
  const maxAttempts = opts?.maxAttempts ?? 22;
  const normalized = paymentId.trim();
  let lastError = 'certificate_pending';

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const waitMs = pollIntervalMs(attempt);
    if (waitMs > 0) await sleep(waitMs);

    const sync = await syncMoyasarPaymentFulfillmentRemote(normalized, { timeoutMs: 25_000 });
    if (sync.ok && sync.certificate) return sync;
    if (sync.ok) lastError = 'certificate_missing_after_sync';
    else lastError = sync.error;

    if (lastError === 'payment_not_paid' && attempt < 8) continue;
  }

  return { ok: false, error: lastError };
}
