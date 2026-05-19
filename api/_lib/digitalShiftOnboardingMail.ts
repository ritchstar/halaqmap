/**
 * بريد تفعيل «المناوب الرقمي الذكي» بعد شراء الباقة الماسية الذكية.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBarberPortalMagicSecret, mintBarberPortalMagicToken } from './barberPortalMagicToken.js';

export function isDigitalShiftAddonInMetadata(metadata?: Record<string, unknown>): boolean {
  if (!metadata) return false;
  const raw = metadata.digital_shift_addon ?? metadata.digitalShiftAddon;
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
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
      return `${base}/#/barber/enter?m=${encodeURIComponent(token)}`;
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
    'تم تفعيل باقتك «الماسية الذكية» وتشمل المناوب الرقمي الذكي 🌙 من حلاق ماب.',
    '',
    'خطوات التشغيل السريعة:',
    '1) افتح لوحة التحكم من الرابط أدناه.',
    '2) انتقل إلى تبويب «المناوب الذكي».',
    '3) فعّل المناوبة، واختر اسم المناوب أمام العملاء، وحدّد مهلة الرد (افتراضي 3 دقائق).',
    '4) راقب رصيد محفظة المناوب — كل رد آلي يستهلك رصيداً بسيطاً؛ اشحن عند الحاجة من اللوحة.',
    '5) راجع «طاولة التوصيات» لتحسين البنرات والمعرض والشحن.',
    '',
    `لوحة التحكم (المناوب الذكي): ${dash}`,
    ratingLine,
    '',
    'ملاحظة: رمز QR للتقييمات يصلك أيضاً في رسالة الترحيب العامة إن كانت مفعّلة.',
    '',
    '— فريق حلاق ماب',
  ]
    .filter(Boolean)
    .join('\n');

  const nameSafe = escapeHtml(name);
  const dashSafe = escapeHtml(dash);
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
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0d9488">المناوب الرقمي الذكي 🌙</p>
  <h1 style="margin:0 0 14px;font-size:22px;color:#0f172a">أهلًا ${nameSafe} — باقتك الماسية الذكية جاهزة</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#334155">تم تفعيل <strong>المناوب الرقمي الذكي</strong> على صالونك. يتولى الرد على العملاء عند الإغلاق أو بعد مهلة قصيرة أثناء الدوام — بأسلوب سعودي مهني يعكس صالونك.</p>
  <table role="presentation" width="100%" style="margin:0 0 18px;border-radius:12px;border:1px solid #a5f3fc;background:#ecfeff">
  <tr><td style="padding:16px;font-size:14px;line-height:1.9;color:#115e59">
    <ol style="margin:0;padding:0 20px 0 0">
      <li>افتح <strong>لوحة التحكم</strong> من الزر أدناه.</li>
      <li>انتقل إلى تبويب <strong>«المناوب الذكي»</strong>.</li>
      <li>فعّل المناوبة، وسمِّ المناوب، واضبط مهلة الرد (3 دقائق افتراضياً).</li>
      <li>تابع <strong>رصيد المحفظة</strong> واشحن عند انخفاض الرصيد.</li>
      <li>نفّذ توصيات البنر والمعرض من طاولة التوصيات.</li>
    </ol>
  </td></tr></table>
  <p style="margin:0 0 18px;text-align:center">
    <a href="${dashSafe}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#fff;font-weight:700;text-decoration:none">فتح لوحة المناوب الذكي</a>
  </p>
  ${ratingHtml}
  <p style="margin:16px 0 0;font-size:12px;color:#64748b;line-height:1.7">إن وُجدت رسالة ترحيب منفصلة لحلاق ماب، ستجد فيها أيضاً رمز <strong>QR</strong> لتقييم الزبائن بعد الزيارة.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return {
    subject: '🌙 حلاق ماب | تفعيل المناوب الرقمي الذكي — دليل التشغيل السريع',
    text,
    html,
  };
}

/** مقطع يُدمج داخل رسالة الترحيب العامة (webhook) */
export function digitalShiftOnboardingSectionHtml(dashboardUrl: string): string {
  const dashSafe = escapeHtml(dashboardUrl);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #67e8f9;background:linear-gradient(135deg,#ecfeff 0%,#f5f3ff 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#115e59;line-height:1.9"><p style="margin:0 0 8px;font-weight:800;color:#0e7490">🌙 الماسية الذكية — المناوب الرقمي مفعّل</p><ol style="margin:0;padding:0 20px 0 0"><li style="margin:0 0 6px">من لوحة التحكم ← تبويب <strong>المناوب الذكي</strong>.</li><li style="margin:0 0 6px">فعّل المناوبة، وسمِّ المناوب، واضبط مهلة الرد.</li><li style="margin:0">راقب رصيد المحفظة وطاولة التوصيات.</li></ol><p style="margin:12px 0 0"><a href="${dashSafe}" style="color:#0d9488;font-weight:700">فتح لوحة المناوب الذكي</a></p></td></tr></table>`;
}

export function digitalShiftOnboardingSectionPlain(dashboardUrl: string): string {
  return [
    '',
    '—— المناوب الرقمي الذكي (الماسية الذكية) ——',
    '1) لوحة التحكم ← تبويب «المناوب الذكي».',
    '2) فعّل المناوبة واضبط الاسم ومهلة الرد.',
    '3) راقب رصيد المحفظة وطاولة التوصيات.',
    `رابط مباشر: ${dashboardUrl}`,
    '',
  ].join('\n');
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return { ok: false, error: 'resend_not_configured' };

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
