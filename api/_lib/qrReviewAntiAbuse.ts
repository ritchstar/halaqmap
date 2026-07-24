import { createHmac, createHash, randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

const CLIENT_KEY_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** حد إرسال تقييمات QR من نفس IP لنفس الصالون خلال 24 ساعة */
export const QR_REVIEW_IP_BARBER_DAILY_MAX = 12;
/** حد إرسال تقييمات QR من نفس IP عبر كل الصالونات خلال ساعة */
export const QR_REVIEW_IP_GLOBAL_HOURLY_MAX = 20;

function fingerprintPepper(): string {
  const explicit = (process.env.QR_REVIEW_FINGERPRINT_PEPPER || '').trim();
  if (explicit.length >= 16) return explicit;
  const sr = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (sr.length >= 16) return `qr-fp:${sr.slice(0, 48)}`;
  return 'qr-fp:dev-only-insecure-pepper';
}

export function isValidQrClientInstanceId(raw: string): boolean {
  return CLIENT_KEY_RE.test(String(raw ?? '').trim());
}

export function hashQrClientKey(barberId: string, clientInstanceId: string): string {
  return createHmac('sha256', fingerprintPepper())
    .update(`qr-client\0${barberId}\0${clientInstanceId.trim().toLowerCase()}`, 'utf8')
    .digest('hex');
}

export function hashQrSubmitterIp(ip: string): string {
  const normalized = String(ip || 'unknown').trim().toLowerCase() || 'unknown';
  return createHash('sha256')
    .update(`qr-ip\0${fingerprintPepper()}\0${normalized}`, 'utf8')
    .digest('hex')
    .slice(0, 40);
}

export function clientIpFromRequest(request: Request): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;
  return 'unknown';
}

export async function hasExistingQrReviewForClient(
  supabase: SupabaseClient,
  barberId: string,
  clientKeyHash: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('barber_id', barberId)
    .eq('via_qr_invite', true)
    .eq('qr_client_key_hash', clientKeyHash)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function checkQrReviewIpRateLimits(
  supabase: SupabaseClient,
  input: { barberId: string; ipHash: string },
): Promise<{ ok: true } | { ok: false; error: 'rate_limited_ip' }> {
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sinceHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count: barberDayCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('barber_id', input.barberId)
    .eq('via_qr_invite', true)
    .eq('qr_submitter_ip_hash', input.ipHash)
    .gte('created_at', sinceDay);

  if ((barberDayCount ?? 0) >= QR_REVIEW_IP_BARBER_DAILY_MAX) {
    return { ok: false, error: 'rate_limited_ip' };
  }

  const { count: globalHourCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('via_qr_invite', true)
    .eq('qr_submitter_ip_hash', input.ipHash)
    .gte('created_at', sinceHour);

  if ((globalHourCount ?? 0) >= QR_REVIEW_IP_GLOBAL_HOURLY_MAX) {
    return { ok: false, error: 'rate_limited_ip' };
  }

  return { ok: true };
}

/** للاختبارات فقط */
export function newQrClientInstanceIdForTests(): string {
  return randomUUID();
}
