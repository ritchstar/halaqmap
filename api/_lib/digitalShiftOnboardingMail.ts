/**
 * بريد تفعيل «المناوب الرقمي الذكي» — إضافة برمجية متقدمة (Software Add-on) بعد شراء Add-on مع رخصة ماسية.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBarberPortalMagicSecret, mintBarberPortalMagicToken } from './barberPortalMagicToken.js';
import {
  DIGITAL_SHIFT_ONBOARDING_ACTIVATED_AR,
  DIGITAL_SHIFT_ONBOARDING_HEADLINE_AR,
  DIGITAL_SHIFT_ONBOARDING_SECTION_PLAIN_HEADER_AR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
} from './subscriptionPricingCopy.js';
import {
  buildDigitalShiftUsageGuideHtml,
  buildDigitalShiftUsageGuidePlain,
  DIGITAL_SHIFT_USAGE_GUIDE_INTRO_AR,
} from './digitalShiftUsageGuideAr.js';
import { resolveResendFromAddress, readResendFromEmailEnv } from './resendFrom.js';

export function isDigitalShiftAddonInMetadata(metadata?: Record<string, unknown>): boolean {
  if (!metadata) return false;
  const raw = metadata.digital_shift_addon ?? metadata.digitalShiftAddon;
  if (raw === true || raw === 'true' || raw === 1 || raw === '1') return true;
  const halalasRaw = metadata.digital_shift_addon_halalas ?? metadata.digitalShiftAddonHalalas;
  const halalas =
    typeof halalasRaw === 'number'
      ? halalasRaw
      : typeof halalasRaw === 'string'
        ? Number.parseInt(halalasRaw, 10)
        : 0;
  return Number.isFinite(halalas) && halalas > 0;
}

function siteBaseUrl(): string {
  const fromEnv = (
    process.env.VITE_SITE_ORIGIN ||
    process.env.VITE_PUBLIC_APP_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
  ''
  ).trim();
  return (fromEnv || 'https://www.halaqmap.com').replace(/\/+$/, '');
}

function dashboardUrlForBarber(barberId: string, email: string, tier: string): string {
  const base = siteBaseUrl();
  const secret = getBarberPortalMagicSecret();
  const t = tier.trim().toLowerCase();
  if (secret && (t === 'gold' || t === 'diamond')) {
    try {
      const token = mintBarberPortalMagicToken(barberId, email, secret);
      return `${base}/api/barber-portal-magic-enter?m=${encodeURIComponent(token)}`;
    } catch {
      /* fall through */
    }
  }
  return `${base}/#/barber/dashboard`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildDigitalShiftOnboardingEmail(input: {
  barberName: string;
  dashboardUrl: string;
  ratingPageUrl?: string;
}): { subject: string; text: string; html: string } {
  const name = input.barberName.trim() || 'شريك حلاق ماب';
  const dash = input.dashboardUrl;
  const ratingLine = input.ratingPageUrl
    ? `\n- رابط تقييم العملاء (للطباعة أو الآيباد): ${input.ratingPageUrl}`
    : '';

  const text = [
    `أهلًا ${name}،`,
    '',
    DIGITAL_SHIFT_ONBOARDING_ACTIVATED_AR,
    '',
    DIGITAL_SHIFT_USAGE_GUIDE_INTRO_AR,
    buildDigitalShiftUsageGuidePlain(dash),
    ratingLine ? ratingLine.replace(/^\n/, '') : '',
    '',
    'ملاحظة: رمز QR للتقييمات يصلك أيضاً في رسالة التفعيل الموحّدة إن كانت مفعّلة.',
    '',
    '— فريق حلاق ماب',
  ]
    .filter(Boolean)
    .join('\n');

  const nameSafe = escapeHtml(name);
  const ratingHtml = input.ratingPageUrl
    ? `<p style="margin:12px 0 0;font-size:13px;color:#475569">رابط تقييم العملاء: <a href="${escapeHtml(input.ratingPageUrl)}" style="color:#0d9488;font-weight:600">${escapeHtml(input.ratingPageUrl)}</a></p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #99f6e4;overflow:hidden">
<tr><td style="height:4px;background:linear-gradient(90deg,#0d9488,#22d3ee,#a855f7)"></td></tr>
<tr><td style="padding:24px 22px">
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0d9488">${DIGITAL_SHIFT_PRODUCT_NAME_AR}</p>
  <h1 style="margin:0 0 14px;font-size:22px;color:#0f172a">${DIGITAL_SHIFT_ONBOARDING_HEADLINE_AR} ${nameSafe}</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#334155">تم تفعيل <strong>إضافة المناوب الرقمي الذكي</strong> (Software Add-on) على صالونك. يتولى الرد على العملاء خلال ثوانٍ قليلة — بلغة الزبون — ويتوقف تلقائياً عندما تتدخل أنت يدوياً.</p>
  ${buildDigitalShiftUsageGuideHtml(dash)}
  ${ratingHtml}
  <p style="margin:16px 0 0;font-size:12px;color:#64748b;line-height:1.7">إن وُجدت رسالة ترحيب منفصلة لحلاق ماب، ستجد فيها أيضاً رمز <strong>QR</strong> لتقييم الزبائن بعد الزيارة.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return {
    subject: '🌙 حلاق ماب | تفعيل Add-on المناوب الرقمي الذكي — دليل التشغيل',
    text,
    html,
  };
}

/** مقطع يُدمج داخل رسالة التفعيل الموحّدة */
export function digitalShiftOnboardingSectionHtml(dashboardUrl: string): string {
  return buildDigitalShiftUsageGuideHtml(dashboardUrl);
}

export function digitalShiftOnboardingSectionPlain(dashboardUrl: string): string {
  return [
    '',
    DIGITAL_SHIFT_ONBOARDING_SECTION_PLAIN_HEADER_AR,
    buildDigitalShiftUsageGuidePlain(dashboardUrl),
  ].join('\n');
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromRaw = readResendFromEmailEnv();
  const from = resolveResendFromAddress(fromRaw);
  if (!apiKey || !fromRaw) return { ok: false, error: 'resend_not_configured' };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) return { ok: false, error: raw.slice(0, 400) || `resend_${resp.status}` };
  try {
    const j = JSON.parse(raw) as { id?: string };
    return { ok: true, id: String(j.id ?? '') };
  } catch {
    return { ok: true, id: '' };
  }
}

/**
 * يُرسل دليل المناوب بعد التفعيل — يتخطى إن كان المصدر webhook (يُدمج هناك في رسالة الترحيب).
 */
export async function dispatchDigitalShiftOnboardingEmail(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    buyerEmail?: string | null;
    barberName?: string | null;
    metadata?: Record<string, unknown>;
    /** عند true لا يُرسل (الـ webhook يدمج المحتوى في send-barber-onboarding) */
    skipWhenWebhookMerged?: boolean;
  },
): Promise<{ ok: true; sent: boolean; messageId?: string } | { ok: false; error: string }> {
  if (!isDigitalShiftAddonInMetadata(input.metadata)) {
    return { ok: true, sent: false };
  }
  if (input.skipWhenWebhookMerged && input.metadata?.source === 'moyasar_webhook') {
    return { ok: true, sent: false };
  }

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id, email, name, tier, rating_invite_token')
    .eq('id', input.barberId)
    .maybeSingle();
  if (bErr || !barber?.id) return { ok: false, error: bErr?.message || 'barber_not_found' };

  const email = String(input.buyerEmail ?? barber.email ?? '')
    .trim()
    .toLowerCase();
  if (!email.includes('@')) return { ok: true, sent: false };

  const name = String(input.barberName ?? barber.name ?? '').trim() || 'شريك حلاق ماب';
  const tier = String(barber.tier ?? 'diamond');
  const dash = dashboardUrlForBarber(barber.id, email, tier);

  let ratingPageUrl = '';
  const tok = String(barber.rating_invite_token ?? '').trim();
  if (tok) {
    const base = siteBaseUrl();
    ratingPageUrl = `${base}/#/rate/${encodeURIComponent(barber.id)}?t=${encodeURIComponent(tok)}`;
  }

  const mail = buildDigitalShiftOnboardingEmail({ barberName: name, dashboardUrl: dash, ratingPageUrl });
  const sent = await sendResendEmail({ to: email, ...mail });
  if (!sent.ok) return sent;
  return { ok: true, sent: true, messageId: sent.id };
}
