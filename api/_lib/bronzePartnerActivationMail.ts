import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import { UNIFIED_DIGITAL_LICENSE_LABEL_AR } from './geospatialLicenseDoctrine.js';
import { siteBaseUrlFromEnv } from './barberProvisionService.js';
import { resolveResendFromAddress } from './resendFrom.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildShopOpenMailUrls(openStatusToken: string | null | undefined): {
  shopOpenToggleUrl: string | null;
  shopOpenRotateUrl: string;
} {
  const base = siteBaseUrlFromEnv().replace(/\/+$/, '');
  const token = String(openStatusToken ?? '').trim();
  return {
    shopOpenToggleUrl: token ? `${base}/#/partners/shop-open?t=${encodeURIComponent(token)}` : null,
    shopOpenRotateUrl: `${base}/#/partners/shop-open/rotate`,
  };
}

export function buildBronzePartnerActivationEmailBodies(input: {
  barberName: string;
  certificate: DigitalActivationCertificatePayload | null;
  shopOpenToggleUrl: string | null;
  shopOpenRotateUrl: string;
  registrationOrderId: string | null;
  policyUrl: string;
}): { subject: string; html: string; text: string } {
  const name = input.barberName.trim() || 'شريك حلاق ماب';
  const cert = input.certificate;
  const certNumber = cert?.certificateNumber?.trim() || null;
  const validUntil = cert?.validUntil?.trim() || null;
  const mapLive = cert?.mapIntegrationStatus === 'map_live';
  const orderId = input.registrationOrderId?.trim() || null;

  const subject = certNumber
    ? `حلاق ماب | تفعيل باقة برونزية — ${certNumber}`
    : 'حلاق ماب | تفعيل باقة برونزية — روابط التشغيل';

  const certLines = certNumber
    ? [
        `${UNIFIED_DIGITAL_LICENSE_LABEL_AR}: ${certNumber}`,
        validUntil ? `صالحة حتى: ${validUntil.slice(0, 10)}` : '',
        mapLive
          ? 'بروتوكول الربط الآلي نشط — الإدراج الجغرافي على الخريطة مُفعَّل.'
          : 'بروتوكول الربط الآلي جاهز — يُكمَّل الإدراج على الخريطة فور ربط الإحداثيات.',
      ].filter(Boolean)
    : ['جاري إصدار شهادة التفعيل الرقمية — ستصلك رسالة منفصلة برقم رخصة النفاذ.'];

  const text = [
    `أهلًا ${name}،`,
    '',
    'تم تفعيل باقتك البرونزية على حلاق ماب.',
    '',
    'ملاحظة مهمة: الباقة البرونزية لا تتضمن لوحة تحكم كاملة — التشغيل اليومي يتم عبر الروابط أدناه (مفتوح/مغلق وتجديد الرابط).',
    '',
    'شهادة التفعيل / رخصة النفاذ:',
    ...certLines.map((line) => `- ${line}`),
    '',
    'روابط التشغيل (احفظها للمالك أو المفوّض فقط):',
    input.shopOpenToggleUrl
      ? `- مفتوح/مغلق: ${input.shopOpenToggleUrl}`
      : '- مفتوح/مغلق: يُكمَّل الرابط تلقائياً — راجع شهادة التفعيل أو تواصل مع الدعم.',
    `- تجديد الرابط: ${input.shopOpenRotateUrl}`,
    '',
    orderId ? `رقم طلب التسجيل (مرجع الدعم): ${orderId}` : '',
    `سياسة رخصة النفاذ الرقمية: ${input.policyUrl}`,
    '',
    '— فريق حلاق ماب',
  ]
    .filter(Boolean)
    .join('\n');

  const h = escapeHtml;
  const toggleBlock = input.shopOpenToggleUrl
    ? `<p style="margin:0 0 10px"><a href="${h(input.shopOpenToggleUrl)}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#0d9488;color:#fff;font-weight:800;text-decoration:none">فتح صفحة مفتوح/مغلق</a></p>`
    : `<p style="margin:0 0 10px;font-size:13px;color:#64748b">يُكمَّل رابط التبديل تلقائياً بعد التفعيل.</p>`;

  const certHtml = certNumber
    ? `<div style="border:2px solid #0ea5e9;border-radius:12px;padding:16px;background:#fff;margin:16px 0">
<p style="margin:0;font-size:12px;color:#64748b">شهادة التفعيل الرقمية</p>
<p style="margin:8px 0;font-size:18px;font-weight:bold;letter-spacing:1px" dir="ltr">${h(certNumber)}</p>
${validUntil ? `<p style="margin:0">صالحة حتى: <strong>${h(validUntil.slice(0, 10))}</strong></p>` : ''}
<p style="margin:12px 0 0;font-size:13px;color:#0369a1">${mapLive ? 'الإدراج الجغرافي نشط على الخريطة.' : 'يُكمَّل الربط الجغرافي فور تأكيد الإحداثيات.'}</p>
</div>`
    : `<p style="font-size:14px;color:#475569">جاري إصدار شهادة التفعيل — ستصلك رسالة منفصلة برقم رخصة النفاذ.</p>`;

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc">
<p>أهلًا <strong>${h(name)}</strong>،</p>
<p>تم تفعيل <strong>باقتك البرونزية</strong> على حلاق ماب.</p>
<p style="padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;font-size:14px;color:#92400e">
<strong>الباقة البرونزية بدون لوحة تحكم.</strong> التشغيل اليومي عبر روابط مفتوح/مغلق وتجديد الرابط أدناه — لا تبحث عن بيانات دخول للوحة.
</p>
${certHtml}
<p style="margin:20px 0 8px;font-weight:800">روابط التشغيل</p>
${toggleBlock}
<p style="margin:0 0 10px"><a href="${h(input.shopOpenRotateUrl)}" style="display:inline-block;padding:10px 18px;border-radius:10px;border:2px solid #0d9488;background:#ecfdf5;color:#0f766e;font-weight:800;text-decoration:none">تجديد رابط مفتوح/مغلق</a></p>
${orderId ? `<p style="font-size:13px;color:#64748b">مرجع الطلب: <span dir="ltr">${h(orderId)}</span></p>` : ''}
<p style="font-size:13px"><a href="${h(input.policyUrl)}">سياسة رخصة النفاذ الرقمية</a></p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  return { subject, html, text };
}

/** بريد تشغيل برونزي (تعليمات + مفتوح/مغلق) — احتياطي إن تعذّر البريد الموحّد. */
export async function sendBronzeOpsActivationEmail(input: {
  to: string;
  barberName: string;
  shopOpenToggleUrl: string | null;
  shopOpenRotateUrl: string;
  registrationOrderId: string | null;
  certificate?: DigitalActivationCertificatePayload | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY ?? '').trim();
  const fromRaw = (process.env.RESEND_FROM_EMAIL ?? '').trim();
  if (!apiKey || !fromRaw) {
    return { ok: false, error: 'resend_not_configured' };
  }
  const to = String(input.to ?? '').trim().toLowerCase();
  if (!to.includes('@')) return { ok: false, error: 'invalid_buyer_email' };

  const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
  const policyUrl = `${siteBase}/#/partners/subscription-policy`;
  const mail = buildBronzePartnerActivationEmailBodies({
    barberName: input.barberName,
    certificate: input.certificate ?? null,
    shopOpenToggleUrl: input.shopOpenToggleUrl,
    shopOpenRotateUrl: input.shopOpenRotateUrl,
    registrationOrderId: input.registrationOrderId,
    policyUrl,
  });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: resolveResendFromAddress(fromRaw),
      to: [to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });
  if (!resp.ok) {
    const raw = await resp.text().catch(() => '');
    return { ok: false, error: raw.slice(0, 400) || `http_${resp.status}` };
  }
  return { ok: true };
}
