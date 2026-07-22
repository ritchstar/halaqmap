/** معرّف Google Ads (Google Tag) لحملة حلاق ماب */
export const GOOGLE_ADS_CONVERSION_ID = 'AW-18240041811';

/** معرّف Google Analytics 4 (قياس الزيارات لكل صفحات الموقع) */
export const GOOGLE_ANALYTICS_MEASUREMENT_ID = 'G-NVQ8BJDN30';

export const GOOGLE_ADS_TAG_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_MEASUREMENT_ID}`;

export const GOOGLE_ADS_CAMPAIGN_LINKS = {
  adsHome: 'https://ads.google.com/aw/overview',
  campaigns: 'https://ads.google.com/aw/campaigns',
  conversions: 'https://ads.google.com/aw/conversions',
  reports: 'https://ads.google.com/aw/reporteditor',
} as const;

export const GOOGLE_ADS_TAG_LABEL_AR = 'تتبع حملة Google Ads — حلاق ماب';
