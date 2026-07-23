/** معرّف Google Ads (Google Tag) لحملة حلاق ماب */
export const GOOGLE_ADS_CONVERSION_ID = 'AW-18240041811';

/** معرّف Google Analytics 4 (قياس الزيارات لكل صفحات الموقع) */
export const GOOGLE_ANALYTICS_MEASUREMENT_ID = 'G-NVQ8BJDN30';

/**
 * تسمية تحويل «مشاهدة صفحة» من Google Ads — الشكل الكامل:
 * `AW-18240041811/XXXXXXXX`
 * تُؤخذ من: الإحالات الناجحة → مشاهدة صفحة → تثبيت العلامة بنفسك → send_to
 * أو من متغير البيئة `VITE_GOOGLE_ADS_PAGE_VIEW_SEND_TO`.
 */
export const GOOGLE_ADS_PAGE_VIEW_CONVERSION_SEND_TO = String(
  import.meta.env.VITE_GOOGLE_ADS_PAGE_VIEW_SEND_TO || '',
).trim();

/** صفحة تحقق ثابتة (بدون HashRouter) لتمرير فحص العلامة في Ads */
export const GOOGLE_ADS_TAG_CHECK_URL = 'https://www.halaqmap.com/ads-tag-check.html';

export const GOOGLE_ADS_TAG_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_CONVERSION_ID}`;

export const GOOGLE_ADS_CAMPAIGN_LINKS = {
  adsHome: 'https://ads.google.com/aw/overview',
  campaigns: 'https://ads.google.com/aw/campaigns',
  conversions: 'https://ads.google.com/aw/conversions',
  reports: 'https://ads.google.com/aw/reporteditor',
  tagAssistant: 'https://tagassistant.google.com/',
} as const;

export const GOOGLE_ADS_TAG_LABEL_AR = 'تتبع حملة Google Ads — حلاق ماب';
