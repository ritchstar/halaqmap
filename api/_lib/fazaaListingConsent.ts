/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveResendFromAddress } from './resendFrom.js';
import {
  FAZAA_LISTING_CONSENT_COPY,
  FAZAA_LISTING_CONSENT_VERSION,
} from './fazaaListingConsentCopy.js';

export const FAZAA_LISTING_CONSENT_TABLE = 'fazaa_seo_listing_consents';
export const FAZAA_LISTING_CONSENT_TTL_DAYS = 21;
const TOKEN_BYTES = 32;

export type FazaaListingConsentStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'revoked'
  | 'expired';

export type FazaaListingConsentRow = {
  id: string;
  barber_id: string;
  token_hash: string;
  status: FazaaListingConsentStatus;
  consent_version: string;
  city_slug: string;
  city_name_ar: string;
  neighborhood_slugs: string[];
  area_label_ar: string;
  specialty_hint_ar: string | null;
  banner_url: string | null;
  name_snapshot: string;
  email_to: string;
  email_sent_at: string | null;
  expires_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  revoked_at: string | null;
  created_by_email: string | null;
  created_at: string;
};

export function hashFazaaListingConsentToken(raw: string): string {
  return createHash('sha256').update(raw.trim(), 'utf8').digest('hex');
}

export function mintFazaaListingConsentToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  return { token, tokenHash: hashFazaaListingConsentToken(token) };
}

export function isSafeHttpsBannerUrl(raw: string | null | undefined): boolean {
  const value = String(raw || '').trim();
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildFazaaListingConsentUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/#/partners/fazaa-listing-consent?c=${encodeURIComponent(token)}`;
}

export function publicConsentPreview(row: FazaaListingConsentRow, now = new Date()) {
  const expired = new Date(row.expires_at).getTime() <= now.getTime();
  const status = row.status === 'pending' && expired ? 'expired' : row.status;
  return {
    status,
    consentVersion: row.consent_version,
    salonName: row.name_snapshot,
    cityNameAr: row.city_name_ar,
    areaLabelAr: row.area_label_ar,
    neighborhoodSlugs: row.neighborhood_slugs,
    specialtyHintAr: row.specialty_hint_ar || '',
    bannerPreviewUrl: isSafeHttpsBannerUrl(row.banner_url) ? row.banner_url : null,
    expiresAt: row.expires_at,
    clauses: [...FAZAA_LISTING_CONSENT_COPY.clauses],
    version: FAZAA_LISTING_CONSENT_VERSION,
  };
}

function normalizeSlugList(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw
    : String(raw || '')
        .split(/[,\s]+/);
  return [...new Set(list.map((s) => String(s || '').trim().toLowerCase()).filter((s) => /^[a-z0-9-]{2,64}$/.test(s)))];
}

export function normalizeInviteInput(body: Record<string, unknown>) {
  const barberId = String(body.barberId || '').trim();
  const citySlug = String(body.citySlug || '').trim().toLowerCase();
  const cityNameAr = String(body.cityNameAr || '').trim();
  const areaLabelAr = String(body.areaLabelAr || '').trim();
  const specialtyHintAr = String(body.specialtyHintAr || '').trim();
  const neighborhoodSlugs = normalizeSlugList(body.neighborhoodSlugs);
  if (!/^[0-9a-f-]{36}$/i.test(barberId)) return { ok: false as const, error: 'invalid_barber' };
  if (!/^[a-z0-9-]{2,64}$/.test(citySlug)) return { ok: false as const, error: 'invalid_city' };
  if (cityNameAr.length < 2 || cityNameAr.length > 80) return { ok: false as const, error: 'invalid_city_name' };
  if (areaLabelAr.length < 2 || areaLabelAr.length > 80) return { ok: false as const, error: 'invalid_area' };
  if (neighborhoodSlugs.length === 0) return { ok: false as const, error: 'invalid_neighborhoods' };
  return {
    ok: true as const,
    barberId,
    citySlug,
    cityNameAr,
    areaLabelAr,
    specialtyHintAr: specialtyHintAr.slice(0, 120) || 'حلاقة رجالي',
    neighborhoodSlugs,
  };
}

export async function expireStalePending(
  supabase: SupabaseClient,
  barberId?: string,
): Promise<void> {
  let q = supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());
  if (barberId) q = q.eq('barber_id', barberId);
  await q;
}

export async function findConsentByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<FazaaListingConsentRow | null> {
  const tokenHash = hashFazaaListingConsentToken(token);
  const { data } = await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .select(
      'id, barber_id, token_hash, status, consent_version, city_slug, city_name_ar, neighborhood_slugs, area_label_ar, specialty_hint_ar, banner_url, name_snapshot, email_to, email_sent_at, expires_at, accepted_at, declined_at, revoked_at, created_by_email, created_at',
    )
    .eq('token_hash', tokenHash)
    .maybeSingle();
  return (data as FazaaListingConsentRow | null) ?? null;
}

export function buildFazaaListingConsentEmail(input: {
  salonName: string;
  cityNameAr: string;
  areaLabelAr: string;
  consentUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = FAZAA_LISTING_CONSENT_COPY.mailSubject;
  const clauses = FAZAA_LISTING_CONSENT_COPY.clauses.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const text = [
    `السلام عليكم،`,
    `هذه رسالة رسمية من حلاق ماب إلى ${input.salonName}.`,
    `نطلب موافقتكم الصريحة على إبراز اسم الصالون وبنره على صفحات فزعة العامة لنطاق ${input.areaLabelAr} في ${input.cityNameAr}.`,
    `هذه الصفحات قد يفهرسها محرك البحث جوجل. الإبراز ليس داخل بطاقة المنصة، ولا يضمن ظهور النتيجة.`,
    clauses,
    `للموافقة أو الرفض ادخلوا الرابط التالي قبل انتهاء صلاحيته:`,
    input.consentUrl,
    `إن لم توافقوا فلن يُنشر هذا الإبراز.`,
  ].join('\n\n');
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><body style="font-family:Tahoma,Arial,sans-serif;background:#061223;color:#e8eef7;padding:24px">
  <div style="max-width:560px;margin:auto;background:#0c1a2e;border:1px solid rgba(45,212,191,.35);border-radius:14px;padding:24px">
    <p style="color:#2dd4bf;font-weight:800;margin:0 0 8px">حلاق ماب — رسالة رسمية</p>
    <h1 style="font-size:20px;margin:0 0 12px">طلب موافقة على إبراز في صفحات فزعة</h1>
    <p>إلى إدارة <strong>${escapeHtml(input.salonName)}</strong>.</p>
    <p>نطلب موافقتكم الصريحة على نشر اسم الصالون وبنر الغلاف على صفحات فزعة العامة لنطاق <strong>${escapeHtml(input.areaLabelAr)}</strong> في <strong>${escapeHtml(input.cityNameAr)}</strong>.</p>
    <p>هذه الصفحات عامة وقد يفهرسها محرك البحث جوجل ويعرض الصورة في نتائج البحث. هذا خارج بطاقة الصالون داخل المنصة، ولا يضمن الصدارة.</p>
    <ol>${FAZAA_LISTING_CONSENT_COPY.clauses.map((c) => `<li style="margin:8px 0">${escapeHtml(c)}</li>`).join('')}</ol>
    <p style="text-align:center;margin:28px 0">
      <a href="${escapeHtml(input.consentUrl)}" style="display:inline-block;background:#0d9488;color:#041016;font-weight:800;padding:12px 20px;border-radius:10px;text-decoration:none">فتح صفحة الموافقة</a>
    </p>
    <p style="color:#94a3b8;font-size:13px">إن لم توافقوا فلن يُنشر هذا الإبراز. صلاحية الرابط ${FAZAA_LISTING_CONSENT_TTL_DAYS} يوماً.</p>
  </div>
</body></html>`;
  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendFazaaListingConsentEmail(input: {
  to: string;
  salonName: string;
  cityNameAr: string;
  areaLabelAr: string;
  consentUrl: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return { ok: false, error: 'resend_not_configured' };
  const bodies = buildFazaaListingConsentEmail(input);
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: resolveResendFromAddress(from),
      to: [input.to],
      subject: bodies.subject,
      html: bodies.html,
      text: bodies.text,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) return { ok: false, error: raw.slice(0, 240) };
  try {
    const parsed = JSON.parse(raw) as { id?: string };
    return { ok: true, id: parsed.id };
  } catch {
    return { ok: true };
  }
}

export { FAZAA_LISTING_CONSENT_VERSION };
