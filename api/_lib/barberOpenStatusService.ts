import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fingerprintListingLicenseCode,
  getListingLicenseVoucherPepper,
  normalizeVoucherCodeInput,
} from './listingLicenseCrypto.js';

function normalizeEmail(raw: string): string {
  return String(raw || '').trim().toLowerCase();
}

export function generateOpenStatusTokenHex(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function buildShopOpenHashPath(token: string): string {
  return `/#/partners/shop-open?t=${encodeURIComponent(token.trim())}`;
}

export function resolvePublicSiteOrigin(): string {
  const raw = (
    process.env.VITE_SITE_ORIGIN ||
    process.env.VITE_PUBLIC_APP_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
    'https://halaqmap.com'
  ).trim();
  return raw.replace(/\/+$/, '');
}

export function buildShopOpenManageUrl(token: string): string {
  return `${resolvePublicSiteOrigin()}${buildShopOpenHashPath(token)}`;
}

export function buildShopOpenRotateConfirmUrl(confirmToken: string): string {
  const base = resolvePublicSiteOrigin();
  return `${base}/#/partners/shop-open/rotate-confirm?c=${encodeURIComponent(confirmToken.trim())}`;
}

export type BronzeLicenseLookup =
  | {
      ok: true;
      barberId: string;
      barberName: string;
      email: string;
      licenseFingerprint: string;
    }
  | { ok: false; reason: 'invalid_license_format' | 'server_not_configured' | 'not_found' | 'not_bronze' | 'email_mismatch' | 'inactive' };

export async function resolveBronzeBarberByLicenseAndEmail(
  supabase: SupabaseClient,
  licenseCodeRaw: string,
  emailRaw: string,
): Promise<BronzeLicenseLookup> {
  const licenseCode = normalizeVoucherCodeInput(licenseCodeRaw);
  const email = normalizeEmail(emailRaw);
  if (!licenseCode.startsWith('HM-LIC-') || licenseCode.length < 16) {
    return { ok: false, reason: 'invalid_license_format' };
  }
  if (!email || !email.includes('@')) {
    return { ok: false, reason: 'email_mismatch' };
  }

  const pepper = getListingLicenseVoucherPepper();
  if (!pepper) return { ok: false, reason: 'server_not_configured' };

  const licenseFingerprint = fingerprintListingLicenseCode(licenseCode, pepper);

  const { data: voucher, error: vErr } = await supabase
    .from('listing_license_vouchers')
    .select('redeemed_barber_id, status')
    .eq('code_fingerprint', licenseFingerprint)
    .maybeSingle();

  if (vErr || !voucher?.redeemed_barber_id) {
    return { ok: false, reason: 'not_found' };
  }

  const barberId = String(voucher.redeemed_barber_id).trim();
  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, name, email, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (bErr || !barber) return { ok: false, reason: 'not_found' };

  const row = barber as {
    id: string;
    name: string | null;
    email: string | null;
    tier: string | null;
    is_active: boolean | null;
  };

  if (row.is_active === false) return { ok: false, reason: 'inactive' };
  if (String(row.tier || '').toLowerCase() !== 'bronze') return { ok: false, reason: 'not_bronze' };
  if (normalizeEmail(String(row.email ?? '')) !== email) return { ok: false, reason: 'email_mismatch' };

  return {
    ok: true,
    barberId: row.id,
    barberName: String(row.name ?? '').trim() || 'صالونك',
    email,
    licenseFingerprint,
  };
}

export async function rotateBarberOpenStatusToken(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const id = String(barberId || '').trim();
  if (!id) return { ok: false, error: 'missing_barber_id' };

  const token = generateOpenStatusTokenHex();
  const { data, error } = await supabase
    .from('barbers')
    .update({ open_status_token: token })
    .eq('id', id)
    .select('id, open_status_token')
    .maybeSingle();

  if (error) return { ok: false, error: error.message || 'update_failed' };
  const saved = String((data as { open_status_token?: string | null } | null)?.open_status_token ?? '').trim();
  if (!saved || saved !== token) return { ok: false, error: 'token_not_persisted' };
  return { ok: true, token };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendOpenStatusRotateEmail(input: {
  to: string;
  barberName: string;
  subject: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
  resendApiKey: string;
  fromEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const text = [
    `أهلًا ${input.barberName}،`,
    '',
    input.intro,
    '',
    `${input.ctaLabel}: ${input.ctaUrl}`,
    '',
    input.footerNote,
    '',
    '— فريق حلاق ماب',
  ].join('\n');

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc"><p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p><p>${escapeHtml(input.intro)}</p><p style="margin:24px 0"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:12px 22px;background:#0d9488;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">${escapeHtml(input.ctaLabel)}</a></p><p style="font-size:13px;color:#64748b">${escapeHtml(input.footerNote)}</p></body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.resendApiKey}`,
    },
    body: JSON.stringify({
      from: input.fromEmail,
      to: [input.to.trim()],
      subject: input.subject,
      text,
      html,
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    let msg = raw.slice(0, 400);
    try {
      const j = JSON.parse(raw) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export const BRONZE_ROTATE_REQUEST_ACK_AR =
  'إذا تطابقت رقم الرخصة والبريد المسجّل، ستصلك رسالة تأكيد خلال دقائق. تحقّق من البريد الوارد والرسائل غير المرغوبة.';

export const BRONZE_ROTATE_GENERIC_ERROR_AR = 'تعذّر إكمال الطلب. حاول لاحقاً.';

export async function assertBronzeBarberForRotateConfirm(
  supabase: SupabaseClient,
  barberId: string,
  email: string,
  licenseFingerprint: string,
): Promise<
  | { ok: true; barberName: string; email: string }
  | { ok: false; reason: 'not_found' | 'not_bronze' | 'email_mismatch' | 'inactive' | 'license_mismatch' }
> {
  const id = String(barberId || '').trim();
  const emailNorm = normalizeEmail(email);
  const fp = String(licenseFingerprint || '').trim();
  if (!id || !emailNorm || !fp) return { ok: false, reason: 'not_found' };

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, name, email, tier, is_active')
    .eq('id', id)
    .maybeSingle();
  if (bErr || !barber) return { ok: false, reason: 'not_found' };

  const row = barber as {
    name: string | null;
    email: string | null;
    tier: string | null;
    is_active: boolean | null;
  };
  if (row.is_active === false) return { ok: false, reason: 'inactive' };
  if (String(row.tier || '').toLowerCase() !== 'bronze') return { ok: false, reason: 'not_bronze' };
  if (normalizeEmail(String(row.email ?? '')) !== emailNorm) return { ok: false, reason: 'email_mismatch' };

  const { data: voucher } = await supabase
    .from('listing_license_vouchers')
    .select('id')
    .eq('code_fingerprint', fp)
    .eq('redeemed_barber_id', id)
    .maybeSingle();
  if (!voucher) return { ok: false, reason: 'license_mismatch' };

  return {
    ok: true,
    barberName: String(row.name ?? '').trim() || 'صالونك',
    email: emailNorm,
  };
}
