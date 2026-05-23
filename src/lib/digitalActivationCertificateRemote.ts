import type { DigitalActivationCertificateView } from '@/config/geospatialLicenseDoctrine';

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function certificateEndpoint(): string {
  const explicit = String(import.meta.env.VITE_DIGITAL_ACTIVATION_CERTIFICATE_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/digital-activation-certificate`;
  return '/api/digital-activation-certificate';
}

export type FetchActivationCertificateResult =
  | { ok: true; certificate: DigitalActivationCertificateView }
  | { ok: false; error: string; pending?: boolean };

export async function fetchActivationCertificateByMoyasarPaymentId(
  moyasarPaymentId: string,
  opts?: { retries?: number; retryDelayMs?: number },
): Promise<FetchActivationCertificateResult> {
  const base = certificateEndpoint();
  const retries = opts?.retries ?? 8;
  const delayMs = opts?.retryDelayMs ?? 1200;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const q = new URLSearchParams({ moyasarPaymentId: moyasarPaymentId.trim() });
    try {
      const res = await fetch(`${base}?${q.toString()}`, { method: 'GET', credentials: 'omit' });
      const data = (await res.json()) as Record<string, unknown>;
      if (res.ok && data.ok === true && data.certificate) {
        return { ok: true, certificate: data.certificate as DigitalActivationCertificateView };
      }
      if (res.status === 404 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return {
        ok: false,
        error: String(data.error || 'certificate_not_found'),
        pending: res.status === 404,
      };
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return { ok: false, error: 'network' };
    }
  }

  return { ok: false, error: 'certificate_not_found', pending: true };
}
