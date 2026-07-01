/**
 * بريد تفعيل موحّد واحد: شهادة + (برونزي: روابط التشغيل) + ملحق العقد + مرفق PDF.
 */
import type { DigitalActivationCertificatePayload } from './geospatialLicenseDoctrine.js';
import {
  GEOSPATIAL_LICENSE_ASSET_CLASS,
  ISIC_ACTIVITY_CODE,
  SOFTWARE_LICENSE_MANAGER_LABEL_AR,
} from './geospatialLicenseDoctrine.js';
import { siteBaseUrlFromEnv } from './barberProvisionService.js';
import { buildContractAnnexHtml, buildContractAnnexText } from './partnerContractNotify.js';
import { isBronzeTier, tierLabelAr } from './partnerTierMail.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type UnifiedPartnerActivationMailInput = {
  barberName: string;
  buyerEmail: string;
  tier: string;
  certificate: DigitalActivationCertificatePayload;
  establishmentName: string;
  commercialRegistration: string | null;
  packageTypeAr: string;
  contractDateDisplay: string;
  registrationOrderId: string | null;
  shopOpenToggleUrl: string | null;
  shopOpenRotateUrl: string | null;
  /** ذهبي/ماسي: لوحة التحكم + QR + مناوب */
  dashboardSectionHtml?: string;
  dashboardSectionText?: string;
};

function buildCertificateSectionHtml(
  cert: DigitalActivationCertificatePayload,
  mapLine: string,
): string {
  const h = escapeHtml;
  return `<div style="border:2px solid #0ea5e9;border-radius:12px;padding:16px;background:#fff;margin:16px 0">
<p style="margin:0;font-size:12px;color:#64748b">شهادة التفعيل الرقمية · Digital Activation Certificate</p>
<p style="margin:8px 0;font-size:18px;font-weight:bold;letter-spacing:1px" dir="ltr">${h(cert.certificateNumber)}</p>
<p style="margin:0"><strong>${GEOSPATIAL_LICENSE_ASSET_CLASS}</strong> · ISIC4 ${ISIC_ACTIVITY_CODE}</p>
<p style="margin:8px 0 0">الباقة: <strong>${h(cert.tierLabelAr)}</strong> — حتى <strong>${h(cert.validUntil.slice(0, 10))}</strong></p>
<p style="margin:12px 0 0;font-size:13px;color:#0369a1">${h(mapLine)}</p>
</div>`;
}

function buildBronzeOpsSectionHtml(input: {
  shopOpenToggleUrl: string | null;
  shopOpenRotateUrl: string;
  policyUrl: string;
  orderId: string | null;
}): string {
  const h = escapeHtml;
  const toggleBlock = input.shopOpenToggleUrl
    ? `<p style="margin:0 0 10px"><a href="${h(input.shopOpenToggleUrl)}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#0d9488;color:#fff;font-weight:800;text-decoration:none">فتح صفحة مفتوح/مغلق</a></p>`
    : `<p style="margin:0 0 10px;font-size:13px;color:#64748b">يُكمَّل رابط التبديل تلقائياً بعد التفعيل.</p>`;
  return `<div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#ecfdf5;border:1px solid #99f6e4">
<p style="margin:0 0 10px;font-weight:800;color:#0f766e">روابط التشغيل — باقة برونزية</p>
<p style="padding:10px 12px;border-radius:8px;background:#fffbeb;border:1px solid #fde68a;font-size:13px;color:#92400e;margin:0 0 12px">
<strong>بدون لوحة تحكم كاملة.</strong> التشغيل اليومي عبر الروابط أدناه — احفظها للمالك أو المفوّض فقط.
</p>
${toggleBlock}
<p style="margin:0 0 10px"><a href="${h(input.shopOpenRotateUrl)}" style="display:inline-block;padding:10px 18px;border-radius:10px;border:2px solid #0d9488;background:#fff;color:#0f766e;font-weight:800;text-decoration:none">تجديد رابط مفتوح/مغلق</a></p>
${input.orderId ? `<p style="font-size:13px;color:#64748b;margin:8px 0 0">مرجع الطلب: <span dir="ltr">${h(input.orderId)}</span></p>` : ''}
<p style="font-size:13px;margin:8px 0 0"><a href="${h(input.policyUrl)}">سياسة رخصة النفاذ الرقمية</a></p>
</div>`;
}

export function buildUnifiedPartnerActivationEmailBodies(
  input: UnifiedPartnerActivationMailInput,
): { subject: string; html: string; text: string } {
  const name = input.barberName.trim() || 'شريك حلاق ماب';
  const tierAr = tierLabelAr(input.tier);
  const bronze = isBronzeTier(input.tier);
  const cert = input.certificate;
  const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
  const policyUrl = `${siteBase}/#/partners/subscription-policy`;
  const partnersUrl = `${siteBase}/#/partners`;
  const orderId = input.registrationOrderId?.trim() || null;

  const mapLine =
    cert.mapIntegrationStatus === 'map_live'
      ? 'تم تفعيل بروتوكول الربط الآلي (API-Driven Integration) — الإدراج الجغرافي نشط على الخريطة.'
      : 'بروتوكول الربط الآلي جاهز — سيُفعَّل الإدراج على الخريطة فور ربط الإحداثيات الجغرافية.';

  const annexInput = {
    establishmentName: input.establishmentName,
    buyerEmail: input.buyerEmail,
    commercialRegistration: input.commercialRegistration,
    packageTypeAr: input.packageTypeAr,
    contractDateDisplay: input.contractDateDisplay,
    registrationOrderId: orderId,
  };

  const subject = bronze
    ? `حلاق ماب | تفعيلك مكتمل — شهادة ${cert.certificateNumber} + روابط التشغيل + العقد`
    : `حلاق ماب | تفعيلك مكتمل — شهادة ${cert.certificateNumber} + لوحة التحكم + العقد — باقة ${tierAr}`;

  const textParts = [
    `أهلًا ${name}،`,
    '',
    bronze ? `مبروك تفعيل باقتك ${tierAr} على حلاق ماب!` : `تم تفعيل باقتك ${tierAr} على حلاق ماب.`,
    '',
    '══ شهادة التفعيل الرقمية ══',
    SOFTWARE_LICENSE_MANAGER_LABEL_AR,
    `رقم الشهادة: ${cert.certificateNumber}`,
    `الباقة: ${cert.tierLabelAr}`,
    `صالحة حتى: ${cert.validUntil.slice(0, 10)}`,
    mapLine,
    cert.verifyPath ? `التحقق: ${cert.verifyPath}` : '',
    '',
  ];

  if (bronze && input.shopOpenRotateUrl) {
    textParts.push(
      '══ روابط التشغيل (برونزي — بدون لوحة تحكم) ══',
      input.shopOpenToggleUrl ? `مفتوح/مغلق: ${input.shopOpenToggleUrl}` : 'مفتوح/مغلق: يُكمَّل الرابط تلقائياً.',
      `تجديد الرابط: ${input.shopOpenRotateUrl}`,
      `سياسة النفاذ: ${policyUrl}`,
      '',
    );
  } else if (!bronze && input.dashboardSectionText?.trim()) {
    textParts.push(input.dashboardSectionText.trim(), '');
  } else if (!bronze) {
    textParts.push(`مسار الشركاء: ${partnersUrl}`, '');
  }

  textParts.push('══ ملحق العقد + المرفق ══', ...buildContractAnnexText(annexInput), '');
  textParts.push(
    'مرفق PDF: العقد الرقمي الموحّد لمسار الخدمات البرمجية للمنصة.',
    '',
    'إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها.',
    '',
    '— فريق حلاق ماب',
  );

  const text = textParts.filter(Boolean).join('\n');

  const h = escapeHtml;
  const bronzeOpsHtml =
    bronze && input.shopOpenRotateUrl
      ? buildBronzeOpsSectionHtml({
          shopOpenToggleUrl: input.shopOpenToggleUrl,
          shopOpenRotateUrl: input.shopOpenRotateUrl,
          policyUrl,
          orderId,
        })
      : '';

  const dashboardHtml = !bronze && input.dashboardSectionHtml?.trim() ? input.dashboardSectionHtml : '';
  const goldDiamondExtra =
    !bronze && !dashboardHtml
      ? `<p style="font-size:13px"><a href="${h(partnersUrl)}">فتح مسار الشركاء</a></p>`
      : '';

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:22px;background:#f0f9ff;color:#1e293b">
<p>أهلًا <strong>${h(name)}</strong>،</p>
<p style="font-size:16px;color:#0f766e;font-weight:800">${bronze ? `مبروك تفعيل باقتك ${h(tierAr)}!` : `تم تفعيل باقتك ${h(tierAr)} بنجاح.`}</p>
<p style="font-size:14px;color:#475569">هذه الرسالة تجمع <strong>شهادة التفعيل</strong>${bronze ? ' و<strong>روابط التشغيل</strong>' : ' و<strong>لوحة التحكم</strong>'} و<strong>ملحق العقد</strong> — مع مرفق <strong>PDF</strong> للعقد الموحّد.</p>
<p style="margin:12px 0 6px;font-weight:800;color:#0369a1">${h(SOFTWARE_LICENSE_MANAGER_LABEL_AR)}</p>
${buildCertificateSectionHtml(cert, mapLine)}
${bronzeOpsHtml}
${dashboardHtml}
${buildContractAnnexHtml(annexInput)}
<p style="margin:16px 0 8px;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1px dashed #cbd5e1;font-size:13px;color:#475569">
📎 <strong>المرفق:</strong> ملف PDF «العقد الرقمي الموحّد» — احفظه في أرشيف منشأتك.
</p>
${goldDiamondExtra}
<p style="font-size:13px;color:#64748b;margin-top:20px">إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها أو تواصل معنا عبر القنوات الرسمية.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  return { subject, html, text };
}
