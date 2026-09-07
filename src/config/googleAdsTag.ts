/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** معرّف Google Ads (Google Tag) لحملة حلاق ماب */
export const GOOGLE_ADS_CONVERSION_ID = 'AW-18240041811';

/** معرّف Google Analytics 4 (قياس الزيارات لكل صفحات الموقع) */
export const GOOGLE_ANALYTICS_MEASUREMENT_ID = 'G-NVQ8BJDN30';

/**
 * تسمية تحويل «مشاهدة صفحة» من Google Ads.
 * الافتراضي من مقتطف الحدث الرسمي؛ يمكن تجاوزه بـ `VITE_GOOGLE_ADS_PAGE_VIEW_SEND_TO`.
 */
export const GOOGLE_ADS_PAGE_VIEW_CONVERSION_SEND_TO = String(
  import.meta.env.VITE_GOOGLE_ADS_PAGE_VIEW_SEND_TO ||
    'AW-18240041811/0ftrCIGbkL8cENPmw_lD',
).trim();

/**
 * تسمية تحويل «عملية شراء» المعتمدة — Google Ads 185-429-5982.
 * `VITE_GOOGLE_ADS_PURCHASE_SEND_TO` على Vercel يجب أن تطابق هذه القيمة أو تُحذف.
 */
export const GOOGLE_ADS_PURCHASE_SEND_TO_CANONICAL = 'AW-18240041811/lozMCN-MgPAcENPmw_lD' as const;

/** تسمية قديمة/خاطئة — تُرفض حتى لو بقيت في متغيرات Vercel */
export const GOOGLE_ADS_PURCHASE_SEND_TO_DEPRECATED = 'AW-18240041811/bTi4CLfOk-ECENPmw_1D' as const;

function resolveGoogleAdsPurchaseSendTo(): string {
  const fromEnv = String(import.meta.env.VITE_GOOGLE_ADS_PURCHASE_SEND_TO || '').trim();
  if (!fromEnv || fromEnv === GOOGLE_ADS_PURCHASE_SEND_TO_DEPRECATED) {
    return GOOGLE_ADS_PURCHASE_SEND_TO_CANONICAL;
  }
  if (fromEnv.startsWith('AW-') && fromEnv.includes('/')) return fromEnv;
  return GOOGLE_ADS_PURCHASE_SEND_TO_CANONICAL;
}

/**
 * تسمية تحويل «شراء/اشتراك» من Google Ads بالشكل `AW-…/LABEL`.
 * يُدفع `dataLayer` + حدث `purchase` لـ GA4 من صفحة النجاح/بعد ميسر.
 */
export const GOOGLE_ADS_PURCHASE_SEND_TO = resolveGoogleAdsPurchaseSendTo();

export const GOOGLE_ADS_PURCHASE_CURRENCY = 'SAR';

/** صفحة تحقق ثابتة (بدون HashRouter) لتمرير فحص العلامة في Ads */
export const GOOGLE_ADS_TAG_CHECK_URL = 'https://www.halaqmap.com/ads-tag-check.html';

/**
 * روابط هبوط للحملات — بدون `#` (Google Ads يرفض الروابط ذات الهاش).
 * تُحوَّل داخلياً إلى HashRouter عبر جسر خفيف في index.html.
 */
export const GOOGLE_ADS_CLEAN_LANDING_URLS = {
  partners: 'https://www.halaqmap.com/partners',
  register: 'https://www.halaqmap.com/partners/register',
  bronzeTrial: 'https://www.halaqmap.com/partners/bronze-trial',
  why: 'https://www.halaqmap.com/partners/why',
  /** صفحات SEO جغرافية (HTML ثابت — ليس HashRouter) */
  nearHub: 'https://www.halaqmap.com/near',
  nearRiyadh: 'https://www.halaqmap.com/near/riyadh',
  /** صفحة تأكيد الاشتراك بعد نجاح الدفع فقط — لتحويلات Google Ads */
  paymentSuccess: 'https://www.halaqmap.com/partners/payment/success',
  /** مركز نسك الحج — الحلق والتقصير (HTML ثابت) */
  hajjNusuk: 'https://www.halaqmap.com/nusuk',
  /** فزعات حسب الحاجة — نية الاستعلام */
  needHub: 'https://www.halaqmap.com/need',
  needHomeVisit: 'https://www.halaqmap.com/need/home-visit',
  needOpenNow: 'https://www.halaqmap.com/need/open-now',
  needNearMe: 'https://www.halaqmap.com/need/near-me',
  /** فزعة عيد الأضحى — حلاقة النسك بعد الأضحية */
  eidAdhaShaving: 'https://www.halaqmap.com/occasions/eid-adha-shaving',
  ramadanBarber: 'https://www.halaqmap.com/occasions/ramadan',
  fridayPrep: 'https://www.halaqmap.com/occasions/friday-prep',
  classicBarber: 'https://www.halaqmap.com/need/classic-barber',
} as const;

export const GOOGLE_ADS_TAG_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_CONVERSION_ID}`;

export const GOOGLE_ADS_CAMPAIGN_LINKS = {
  adsHome: 'https://ads.google.com/aw/overview',
  campaigns: 'https://ads.google.com/aw/campaigns',
  conversions: 'https://ads.google.com/aw/conversions',
  reports: 'https://ads.google.com/aw/reporteditor',
  tagAssistant: 'https://tagassistant.google.com/',
} as const;

export const GOOGLE_ADS_TAG_LABEL_AR = 'تتبع حملة Google Ads — حلاق ماب';
