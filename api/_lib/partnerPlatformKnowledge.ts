/**
 * مصدر معرفة التحديثات لمساعد الشركاء — **حدّث هذا الملف عند كل إطلاق ميزة**.
 * الحقائق التسعيرية/المنتج تُستورد تلقائياً من subscriptionPricingCopy و geospatialLicenseDoctrine.
 */
import {
  BARBER_NAME_LABEL_AR,
  GEOSPATIAL_LICENSE_ASSET_CLASS,
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  MAP_INTEGRATION_PROTOCOL,
  PLATFORM_NAME_AR,
  UNIFIED_DIGITAL_LICENSE_LABEL_AR,
} from './geospatialLicenseDoctrine.js';
import {
  DIAMOND_PRODUCT_SMART_LABEL_AR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
  DIGITAL_SHIFT_ADDON_VALUE_AR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
} from './subscriptionPricingCopy.js';
import {
  INVOICE_PRODUCT_DESCRIPTION_AR,
  TERM_ACTIVATE_NOW_AR,
  TERM_BUY_LICENSE_AR,
  TERM_GEOSPATIAL_DIGITAL_ASSET_AR,
  TERM_PACKAGE_ACTIVATION_AR,
} from './softwareLicenseTerminology.js';

/** زِد هذا الرقم/التاريخ عند إضافة release note جديد — يظهر في GET /api/partner-assistant-chat */
export const PARTNER_ASSISTANT_KNOWLEDGE_VERSION = '2026-05-19.3' as const;

export type PartnerReleaseNote = {
  id: string;
  date: string;
  titleAr: string;
  summaryAr: string;
  bulletsAr: readonly string[];
  topics?: readonly string[];
};

/**
 * سجل التحديثات — أضف عنصراً جديداً في الأعلى عند كل إطلاق.
 * المساعد **ملزم** بالإجابة من هذا القسم عند السؤال عن التحديثات أو الميزات المذكورة.
 */
export const PARTNER_PLATFORM_RELEASE_NOTES: readonly PartnerReleaseNote[] = [
  {
    id: 'partner-agent-council-orchestration',
    date: '2026-05-19',
    titleAr: 'مجلس استشارة مساعد الشركاء — المناوب + التشغيل المركزي',
    summaryAr:
      'مساعد الشركاء يستشير داخلياً ملخصات المناوب الذكي والتشغيل المركزي (وقابل للتوسع لكل الوكلاء) ويجيب للشريك دون كشف العمل الداخلي.',
    topics: ['مساعد', 'مجلس', 'وكيل', 'أسطول', 'مناوب', 'استشارة'],
    bulletsAr: [
      'أسئلة المناوب والعملاء: إجابة من معرفة المناوب + معايير التشغيل المركزية للجودة.',
      'لا يُذكر للشريك: قائد أسطول، labs، migrations، أو مسارات API.',
      'للأسئلة المعقدة: استشارة مجلس داخلية ثم رد واحد بلغة منتج واضحة.',
    ],
  },
  {
    id: 'digital-shift-software-addon',
    date: '2026-05-19',
    titleAr: 'المناوب الرقمي الذكي — إضافة برمجية متقدمة (Software Add-on)',
    summaryAr:
      '«المناوب الرقمي الذكي 🌙» لم يعد مدمجاً ضمن الماسية؛ هو Add-on اختياري +25 ر.س/حزمة رخصة يعزّز الرخصة التقنية للماسية.',
    topics: ['المناوب', 'المناوب الرقمي', 'ماسي', 'Add-on', '225', '25'],
    bulletsAr: [
      `${DIAMOND_PRODUCT_STANDARD_LABEL_AR}: 200 ر.س/حزمة رخصة (30 يوم إدراج).`,
      `${DIAMOND_PRODUCT_SMART_LABEL_AR}: 225 ر.س/حزمة (= 200 + ${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} Add-on).`,
      `${DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR} — ${DIGITAL_SHIFT_ADDON_VALUE_AR}`,
      'كيف يتعامل المناوب مع العملاء: يعترض الشات الخاص عند إغلاق المحل أو بعد مهلة تأخر الرد (افتراضي 3 دقائق)، يرد بأسلوب سعودي مهني، يكتشف لغة العميل ويرد بنفس اللغة (عربي · English · اردو · Türkçe · Français · Español · Tagalog).',
      'لا يغيّر أسعار الخدمة ولا يتعامل مع محفظة العميل — آداب وضيافة وجدولة فقط؛ رصيد محفظة المناوب (هللات) على صالون الحلاق.',
      'يُفعَّل من لوحة الحلاق ← تبويب «المناوب الذكي» بعد شراء Add-on مع رخصة ماسية.',
    ],
  },
  {
    id: 'payment-success-digital-certificate',
    date: '2026-05-19',
    titleAr: 'صفحة نجاح الدفع — شهادة تفعيل رقمية',
    summaryAr:
      'بعد تأكيد الدفع تُعرض لوحة نجاح تعرض اسم المنصة، رقم الرخصة الرقمية الموحد، كود النشاط 474151، واسم الحلاق/الصالون.',
    topics: ['نجاح الدفع', 'شهادة', 'رخصة', '474151', 'HM-CERT'],
    bulletsAr: [
      `اسم المنصة: ${PLATFORM_NAME_AR}.`,
      `${UNIFIED_DIGITAL_LICENSE_LABEL_AR}: صيغة HM-CERT-YYYYMMDD-XXXX.`,
      `${ISIC_ACTIVITY_CODE_LABEL_AR}: ${ISIC_ACTIVITY_CODE}.`,
      `${BARBER_NAME_LABEL_AR}: من الطلب أو من لقطة الجغرافيا في الشهادة.`,
      'بروتوكول الربط الآلي للخريطة (api_driven_v1) يُفعَّل بعد ربط الإحداثيات.',
    ],
  },
  {
    id: 'geospatial-license-manager',
    date: '2026-05-19',
    titleAr: 'نظام إدارة تراخيص برمجية — Geospatial License Asset',
    summaryAr:
      'المنتج B2B هو حزم رخصة تواجد رقمي جغرافي (ISIC 474151) وليس وساطة حجز أو عمولة حلاقة.',
    topics: ['رخصة', '474151', 'ISIC', 'Geospatial', 'اشتراك', 'إعلان'],
    bulletsAr: [
      `التسمية: ${TERM_PACKAGE_ACTIVATION_AR} بدلاً من «اشتراك».`,
      `الأصل على الخريطة: ${TERM_GEOSPATIAL_DIGITAL_ASSET_AR} بدلاً من «إعلان».`,
      `أزرار الشراء: «${TERM_BUY_LICENSE_AR}» و«${TERM_ACTIVATE_NOW_AR}».`,
      `الفئة التقنية: ${GEOSPATIAL_LICENSE_ASSET_CLASS} · ${MAP_INTEGRATION_PROTOCOL}.`,
      INVOICE_PRODUCT_DESCRIPTION_AR,
    ],
  },
] as const;

function composePartnerProductFactsPack(): string {
  return [
    '### حقائق المنتج والتسعير (مُحدَّثة تلقائياً — مصدر تشغيلي)',
    `- ${PLATFORM_NAME_AR} — حزم رخصة التواجد الرقمي الجغرافي B2B.`,
    `- ${ISIC_ACTIVITY_CODE_LABEL_AR}: **${ISIC_ACTIVITY_CODE}** (${GEOSPATIAL_LICENSE_ASSET_CLASS}).`,
    '- أسعار حزمة الرخصة (30 يوم إدراج / بطاقة واحدة):',
    '  · برونزي: 100 ر.س/حزمة',
    '  · ذهبي: 150 ر.س/حزمة',
    '  · ماسي (رخصة تقنية): 200 ر.س/حزمة',
    `  · ${DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR} — للماسية فقط (اختياري).`,
    `  · ${DIAMOND_PRODUCT_SMART_LABEL_AR}: **225 ر.س/حزمة** (= 200 + ${DIGITAL_SHIFT_MONTHLY_ADDON_SAR}).`,
    '',
    '### المناوب الرقمي الذكي — إجابة جاهزة (استخدمها عند السؤال)',
    `- **ما هو؟** ${DIGITAL_SHIFT_PRODUCT_NAME_AR} — ${DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR}.`,
    `- **السعر:** +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س لكل حزمة رخصة ماسية (منفصل عن 200 ر.س).`,
    `- **القيمة:** ${DIGITAL_SHIFT_ADDON_VALUE_AR}`,
    '- **التشغيل مع العملاء:**',
    '  1) يشتغل في الشات الخاص مع العميل (وليس واتساب خارجي).',
    '  2) عند إغلاق المحل: يتولى الردود تلقائياً.',
    '  3) أثناء الدوام: يتدخل بعد مهلة تأخير (افتراضي 3 دقائق) إذا لم يرد الحلاق.',
    '  4) يرد بلغة العميل تلقائياً (7 لغات مدعومة).',
    '  5) يدير الضيافة والآداب — **لا** يعدّل أسعار الخدمات ولا يتحصّل من العميل.',
    '- **التفعيل:** شراء Add-on مع الماسية → لوحة الحلاق → تبويب المناوب الذكي → تفعيل وضبط الاسم ومهلة الرد.',
    '',
    '### صفحة نجاح الدفع',
    `- بعد الدفع الناجح: ${UNIFIED_DIGITAL_LICENSE_LABEL_AR}، ${ISIC_ACTIVITY_CODE_LABEL_AR} ${ISIC_ACTIVITY_CODE}، ${BARBER_NAME_LABEL_AR}، و${PLATFORM_NAME_AR}.`,
  ].join('\n');
}

function composePartnerReleaseNotesPack(): string {
  const lines = [
    `### سجل التحديثات (Knowledge v${PARTNER_ASSISTANT_KNOWLEDGE_VERSION})`,
    'عند سؤال «ما الجديد؟» أو «كيف يعمل المناوب في الماسية؟» أو أي موضوع مذكور أدناه — **أجب بثقة من هذا القسم** ولا تعتذر عن نقص معلومات.',
    '',
  ];
  for (const note of PARTNER_PLATFORM_RELEASE_NOTES) {
    lines.push(`#### [${note.date}] ${note.titleAr}`);
    lines.push(note.summaryAr);
    for (const b of note.bulletsAr) lines.push(`- ${b}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function composePartnerPlatformKnowledgePack(): string {
  return [composePartnerProductFactsPack(), composePartnerReleaseNotesPack()].join('\n\n');
}

export function getPartnerAssistantKnowledgeMeta() {
  return {
    version: PARTNER_ASSISTANT_KNOWLEDGE_VERSION,
    releaseNoteCount: PARTNER_PLATFORM_RELEASE_NOTES.length,
    latestReleaseId: PARTNER_PLATFORM_RELEASE_NOTES[0]?.id ?? null,
    latestReleaseDate: PARTNER_PLATFORM_RELEASE_NOTES[0]?.date ?? null,
  };
}
