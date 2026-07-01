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

export async function syncMoyasarPaymentFulfillmentRemote(
  paymentId: string,
): Promise<SyncMoyasarPaymentFulfillmentResult> {
  const q = new URLSearchParams({ paymentId: paymentId.trim() });
  const url = `${syncEndpoint()}?${q.toString()}`;
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit' });
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
  } catch {
    return { ok: false, error: 'network' };
  }
}
