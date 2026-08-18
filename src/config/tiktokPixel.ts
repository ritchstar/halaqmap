/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * معرّف بكسل تيك توك — يُضبط بعد إنشاء البكسل في Business Center
 * عبر `VITE_TIKTOK_PIXEL_ID` ثم إعادة نشر الواجهة.
 */
export const TIKTOK_PIXEL_ID = String(import.meta.env.VITE_TIKTOK_PIXEL_ID || '').trim();

export const TIKTOK_PIXEL_CURRENCY = 'SAR';

export const TIKTOK_PIXEL_SCRIPT_SRC = 'https://analytics.tiktok.com/i18n/pixel/events.js';

/**
 * روابط هبوط لحملات تيك توك — بدون `#` (الجسر في index.html يحوّلها إلى HashRouter).
 * أضف `utm_source=tiktok` و`utm_medium=paid`؛ تيك توك يضيف `ttclid` تلقائياً.
 */
export const TIKTOK_ADS_CLEAN_LANDING_URLS = {
  partners: 'https://www.halaqmap.com/partners',
  register: 'https://www.halaqmap.com/partners/register',
  bronzeTrial: 'https://www.halaqmap.com/partners/bronze-trial',
  why: 'https://www.halaqmap.com/partners/why',
  paymentSuccess: 'https://www.halaqmap.com/partners/payment/success',
} as const;

export const TIKTOK_ADS_CAMPAIGN_LINKS = {
  businessCenter: 'https://ads.tiktok.com/marketing_api/auth',
  eventsManager: 'https://ads.tiktok.com/i18n/events_manager',
  assetsPixels: 'https://ads.tiktok.com/i18n/events_manager/pixel/list',
} as const;

export const TIKTOK_PIXEL_LABEL_AR = 'تتبع حملة TikTok — حلاق ماب';
