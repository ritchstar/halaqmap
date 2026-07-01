/**
 * أقسام لوحة التحكم والتقييم والمناوب — تُدمَج في بريد التفعيل الموحّد (ذهبي/ماسي).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildBarberMagicEnterUrl } from './barberPortalMagicUrl.js';
import { siteBaseUrlFromEnv } from './barberProvisionService.js';
import {
  digitalShiftOnboardingSectionHtml,
  digitalShiftOnboardingSectionPlain,
  isDigitalShiftAddonInMetadata,
} from './digitalShiftOnboardingMail.js';
import { normalizePartnerTier, tierLabelAr } from './partnerTierMail.js';

export const RATING_QR_CONTENT_ID = 'halaqmap-rating-qr';

export type OnboardingMailLinks = {
  siteBase: string;
  loginUrl: string;
  dashboardUrl: string;
  ownerWatchMagicUrl: string | null;
  ownerWatchBookmarkUrl: string;
  ownerWatchLoginUrl: string;
  policyUrl: string;
};

export type RatingMailContext = {
  ratingPageUrl: string;
  hasToken: boolean;
  qrPngBase64: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function padBarberMember(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(Number(n))) return null;
  const v = Math.floor(Number(n));
  if (v < 1 || v > 999999) return String(v);
  return String(v).padStart(6, '0');
}

function buildRatingInviteUrl(siteOrigin: string, barberId: string, token: string): string {
  const base = siteOrigin.replace(/\/+$/, '');
  return `${base}/#/rate/${encodeURIComponent(barberId)}?t=${encodeURIComponent(token)}`;
}

export async function buildRatingMailContext(
  siteBase: string,
  barberId: string | null,
  token: string | null,
): Promise<RatingMailContext> {
  const tid = barberId?.trim() || '';
  const tok = token?.trim() || '';
  if (!tid || !tok) {
    return { ratingPageUrl: '', hasToken: false, qrPngBase64: null };
  }
  const ratingPageUrl = buildRatingInviteUrl(siteBase, tid, tok);
  let qrPngBase64: string | null = null;
  try {
    const { default: QRCode } = await import('qrcode');
    const buf = await QRCode.toBuffer(ratingPageUrl, {
      type: 'png',
      width: 768,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    qrPngBase64 = buf.toString('base64');
  } catch {
    qrPngBase64 = null;
  }
  return { ratingPageUrl, hasToken: true, qrPngBase64 };
}

export function buildOnboardingMailLinks(siteBase: string): OnboardingMailLinks {
  const b = siteBase.replace(/\/+$/, '');
  return {
    siteBase: b,
    loginUrl: `${b}/#/partners/login?next=${encodeURIComponent('/barber/dashboard')}`,
    dashboardUrl: `${b}/#/barber/dashboard`,
    ownerWatchMagicUrl: null,
    ownerWatchBookmarkUrl: `${b}/#/barber/dashboard?view=watch`,
    ownerWatchLoginUrl: `${b}/#/partners/login?next=${encodeURIComponent('/barber/dashboard?view=watch')}`,
    policyUrl: `${b}/#/partners/subscription-policy`,
  };
}

export function linksWithMagicDashboard(
  links: OnboardingMailLinks,
  barberId: string,
  barberEmail: string,
  tier: string,
): OnboardingMailLinks {
  const dashboardUrl = buildBarberMagicEnterUrl(links.siteBase, barberId, barberEmail, tier);
  if (!dashboardUrl) return links;
  const watchUrl = buildBarberMagicEnterUrl(links.siteBase, barberId, barberEmail, tier, 'watch');
  const loginFallback = `${links.siteBase}/#/partners/login?next=${encodeURIComponent('/barber/dashboard')}`;
  const watchLoginFallback = `${links.siteBase}/#/partners/login?next=${encodeURIComponent('/barber/dashboard?view=watch')}`;
  return {
    ...links,
    dashboardUrl,
    loginUrl: dashboardUrl,
    ownerWatchMagicUrl: watchUrl,
    ownerWatchLoginUrl: watchUrl ?? watchLoginFallback,
    ownerWatchBookmarkUrl: watchUrl ?? watchLoginFallback,
  };
}

export async function loadBarberOnboardingRow(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{
  id: string;
  email: string;
  name: string;
  tier: string;
  rating_invite_token: string | null;
  member_number: number | null;
  open_status_token: string | null;
} | null> {
  const { data, error } = await supabase
    .from('barbers')
    .select('id, email, name, tier, rating_invite_token, member_number, open_status_token')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !data?.id) return null;
  const mn = (data as { member_number?: number | null }).member_number;
  return {
    id: String(data.id),
    email: String(data.email ?? '').trim(),
    name: String(data.name ?? '').trim(),
    tier: String(data.tier ?? 'bronze'),
    rating_invite_token: data.rating_invite_token ? String(data.rating_invite_token) : null,
    member_number: mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null,
    open_status_token: data.open_status_token ? String(data.open_status_token).trim() || null : null,
  };
}

function emailCard(title: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-radius:14px;border:1px solid #e2e8f0;background:#ffffff"><tr><td style="padding:16px 18px"><p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#0d9488;letter-spacing:0.02em">${title}</p><div style="font-size:14px;color:#334155;line-height:1.9">${body}</div></td></tr></table>`;
}

function tierBoxHtml(tier: 'gold' | 'diamond'): string {
  const h = escapeHtml;
  const tierSafe = h(tierLabelAr(tier));
  if (tier === 'gold') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #fcd34d;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#78350f;line-height:1.85"><p style="margin:0;font-weight:800;color:#92400e">باقتك الذهبية</p><ul style="margin:10px 0 0;padding:0 20px 0 0"><li style="margin:0 0 6px"><strong>الإعدادات:</strong> جدول أوقات العمل الأسبوعي.</li><li style="margin:0"><strong>QR والتقييمات:</strong> رابط ورمز التقييم بعد الزيارة.</li></ul></td></tr></table>`;
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #5eead4;background:linear-gradient(135deg,#ecfeff 0%,#ccfbf1 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#115e59;line-height:1.85"><p style="margin:0;font-weight:800;color:#0f766e">باقتك الماسية</p><p style="margin:6px 0 10px;font-size:13px;color:#0d9488">تشمل مزايا الذهبي + إضافات ماسية</p><ul style="margin:0;padding:0 20px 0 0"><li style="margin:0 0 6px"><strong>الإعدادات:</strong> جدول أوقات العمل الأسبوعي.</li><li style="margin:0 0 6px"><strong>QR والتقييمات:</strong> رابط ورمز التقييم.</li><li style="margin:0"><strong>جدولة المواعيد (ماسي):</strong> إظهار أو إخفاء الحجز عبر نظام الاستجابة الذكية.</li></ul></td></tr></table>`;
}

function ownerWatchSectionHtml(links: OnboardingMailLinks): string {
  const h = (u: string) => escapeHtml(u);
  const magicBlock = links.ownerWatchMagicUrl
    ? `<p style="margin:0 0 12px"><a href="${h(links.ownerWatchMagicUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;border-radius:10px;background:linear-gradient(180deg,#f59e0b,#d97706);color:#fff;font-weight:800;text-decoration:none;font-size:14px">دخول سريع — غرفة المراقبة</a></p>`
    : '';
  return emailCard(
    'غرفة المراقبة — للمالك',
    `${magicBlock}<p style="margin:0 0 10px;font-size:14px;color:#475569;line-height:1.85">تابع تشغيل صالونك <strong>قراءة فقط</strong>: حالة «مفتوح/مغلق»، محادثات نشطة، وتنبيهات — <strong>بدون</strong> نصوص زبائن.</p><p style="margin:0;font-size:13px;color:#64748b"><strong>رابط الدخول:</strong> <a href="${h(links.ownerWatchLoginUrl)}" style="color:#d97706;font-weight:700;word-break:break-all" dir="ltr">${h(links.ownerWatchLoginUrl)}</a></p>`,
  );
}

function ratingSectionHtml(rating: RatingMailContext): string {
  if (!rating.hasToken) {
    return emailCard(
      'رمز التقييم لعملائك',
      '<p style="margin:0;font-size:14px;color:#475569;line-height:1.85">من لوحة التحكم ← <strong>QR والتقييمات</strong> اعرض الرمز أو انسخ الرابط للعميل.</p>',
    );
  }
  const urlEsc = escapeHtml(rating.ratingPageUrl);
  const imgBlock = rating.qrPngBase64
    ? `<div style="text-align:center;margin:0 0 14px;padding:16px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0"><img src="cid:${RATING_QR_CONTENT_ID}" width="400" alt="رمز QR لتقييم الصالون" style="max-width:min(92vw,520px);width:100%;height:auto;display:inline-block;border-radius:8px" /></div>`
    : '';
  return emailCard(
    'رمز QR لتقييم صالونك',
    `<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.9">صفحة تقييم خاصة بصالونك — يُرفق PNG للطباعة أو العرض على آيباد.</p>${imgBlock}<p style="margin:0"><a href="${urlEsc}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#0d9488;color:#fff;font-weight:700;text-decoration:none;font-size:14px">فتح رابط التقييم</a></p>`,
  );
}

export type DashboardSupplementInput = {
  tier: string;
  links: OnboardingMailLinks;
  rating: RatingMailContext;
  registrationOrderId: string | null;
  memberPadded: string | null;
  digitalShiftAddon: boolean;
  buyerEmail?: string;
  /** كلمة مرور احتياطية للدخول اليدوي من /partners/login */
  portalPassword?: string | null;
};

function portalPasswordBlockHtml(email: string, password: string, loginUrl: string): string {
  const h = escapeHtml;
  return `<div style="margin:14px 0 0;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1px dashed #cbd5e1">
<p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#334155">دخول يدوي احتياطي (إن تعذّر الرابط السريع)</p>
<p style="margin:0 0 6px;font-size:13px;color:#475569">من <a href="${h(loginUrl)}" style="color:#0d9488;font-weight:700">صفحة تسجيل الدخول</a> — البريد + كلمة المرور:</p>
<p style="margin:0;font-size:13px;color:#475569" dir="ltr">email: ${h(email)} · password: <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px">${h(password)}</code></p>
</div>`;
}

export function buildDashboardSupplementForUnifiedMail(input: DashboardSupplementInput): {
  html: string;
  text: string;
} {
  const tier = normalizePartnerTier(input.tier);
  if (tier === 'bronze') return { html: '', text: '' };

  const h = escapeHtml;
  const btn = (href: string, label: string) =>
    `<a href="${h(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:6px 6px 6px 0;padding:12px 22px;border-radius:12px;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none">${label}</a>`;
  const ownerWatchHref = input.links.ownerWatchMagicUrl || input.links.ownerWatchLoginUrl;
  const ownerWatchBtn = ownerWatchHref
    ? `<a href="${h(ownerWatchHref)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:6px 6px 6px 0;padding:12px 22px;border-radius:12px;background:linear-gradient(180deg,#f59e0b,#d97706);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none">غرفة المراقبة</a>`
    : '';

  const orderRef = input.registrationOrderId?.trim()
    ? `<p style="margin:0 0 12px;font-size:13px;color:#64748b">مرجع الطلب: <span dir="ltr">${h(input.registrationOrderId.trim())}</span></p>`
    : '';
  const memberRef = input.memberPadded
    ? `<p style="margin:0 0 12px;font-size:13px;color:#64748b">رقم العضوية: <span dir="ltr">${h(input.memberPadded)}</span></p>`
    : '';

  const dsHtml =
    input.digitalShiftAddon && tier === 'diamond'
      ? digitalShiftOnboardingSectionHtml(input.links.dashboardUrl)
      : '';

  const manualLoginUrl = `${input.links.siteBase}/#/partners/login?next=${encodeURIComponent('/barber/dashboard')}`;
  const passwordHtml =
    input.portalPassword?.trim() && input.buyerEmail?.trim()
      ? portalPasswordBlockHtml(input.buyerEmail.trim(), input.portalPassword.trim(), manualLoginUrl)
      : '';

  const html = `<div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0">
<p style="margin:0 0 10px;font-weight:800;color:#0f766e">لوحة التحكم وروابط التشغيل — باقة ${h(tierLabelAr(tier))}</p>
<p style="margin:0 0 12px;font-size:13px;color:#475569">استخدم الرابط السريع أدناه للدخول دون انتظار بريد منفصل لبيانات الدخول.</p>
${orderRef}${memberRef}
<p style="margin:0 0 12px;text-align:center">${btn(input.links.dashboardUrl, 'فتح لوحة التحكم (دخول سريع)')}${ownerWatchBtn}</p>
${tierBoxHtml(tier)}
${ownerWatchSectionHtml(input.links)}
${dsHtml}
${ratingSectionHtml(input.rating)}
${passwordHtml}
</div>`;

  const textParts = [
    '',
    `══ لوحة التحكم — باقة ${tierLabelAr(tier)} ══`,
    `لوحة التحكم (رابط سريع — دخول مباشر): ${input.links.dashboardUrl}`,
    `غرفة المراقبة: ${input.links.ownerWatchBookmarkUrl}`,
  ];
  if (input.registrationOrderId?.trim()) {
    textParts.push(`مرجع الطلب: ${input.registrationOrderId.trim()}`);
  }
  if (input.memberPadded) {
    textParts.push(`رقم العضوية: ${input.memberPadded}`);
  }
  if (input.digitalShiftAddon && tier === 'diamond') {
    textParts.push(digitalShiftOnboardingSectionPlain(input.links.dashboardUrl));
  }
  if (input.rating.hasToken) {
    textParts.push('رابط التقييم:', input.rating.ratingPageUrl, 'يُرفق PNG لرمز QR مع هذه الرسالة.');
  }
  if (input.portalPassword?.trim() && input.buyerEmail?.trim()) {
    textParts.push(
      '',
      '══ دخول يدوي احتياطي ══',
      `صفحة الدخول: ${manualLoginUrl}`,
      `البريد: ${input.buyerEmail.trim()}`,
      `كلمة المرور: ${input.portalPassword.trim()}`,
    );
  }
  textParts.push('');

  return { html, text: textParts.join('\n') };
}

export async function resolveDashboardSupplementForBarber(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    buyerEmail: string;
    tier: string;
    registrationOrderId: string | null;
    paymentMetadata?: Record<string, unknown>;
    portalPassword?: string | null;
  },
): Promise<{
  supplement: { html: string; text: string };
  rating: RatingMailContext;
} | null> {
  const tier = normalizePartnerTier(input.tier);
  if (tier === 'bronze') return null;

  const row = await loadBarberOnboardingRow(supabase, input.barberId);
  const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
  const barberEmail = input.buyerEmail.trim() || row?.email?.trim() || '';
  const links = linksWithMagicDashboard(
    buildOnboardingMailLinks(siteBase),
    input.barberId,
    barberEmail,
    tier,
  );
  const rating = await buildRatingMailContext(
    siteBase,
    input.barberId,
    row?.rating_invite_token ?? null,
  );
  const digitalShiftAddon = isDigitalShiftAddonInMetadata(input.paymentMetadata);

  const supplement = buildDashboardSupplementForUnifiedMail({
    tier,
    links,
    rating,
    registrationOrderId: input.registrationOrderId,
    memberPadded: padBarberMember(row?.member_number ?? null),
    digitalShiftAddon,
    buyerEmail: barberEmail,
    portalPassword: input.portalPassword ?? null,
  });

  return { supplement, rating };
}
