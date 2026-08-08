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
  /** صفحة تسكين التجار — إقفال اشتراكات الصالونات */
  merchantSettlement: 'https://www.halaqmap.com/partners/merchant-settlement',
  /** مركز نسك الحج — الحلق والتقصير (HTML ثابت) */
  hajjNusuk: 'https://www.halaqmap.com/nusuk',
  /** صفحات مساعدة حسب الحاجة — نية الاستعلام */
  needHub: 'https://www.halaqmap.com/need',
  needHomeVisit: 'https://www.halaqmap.com/need/home-visit',
  needOpenNow: 'https://www.halaqmap.com/need/open-now',
  needNearMe: 'https://www.halaqmap.com/need/near-me',
  /** صفحة مساعدة عيد الأضحى — حلاقة النسك بعد الأضحية */
  eidAdhaShaving: 'https://www.halaqmap.com/occasions/eid-adha-shaving',
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
