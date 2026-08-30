/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنبيه وصول الطلب في لوحات الكاشير. لا يُستورد من App.
 */
export const STORE_DESK_ORDER_ALERT_PRODUCTS = ['grocers', 'restaurant', 'cafe', 'kitchen', 'produce'] as const;

export type StoreDeskOrderAlertProduct = (typeof STORE_DESK_ORDER_ALERT_PRODUCTS)[number];

export const STORE_DESK_ORDER_ALERT_TONES = ['bell', 'chime', 'pulse', 'market'] as const;
export type StoreDeskOrderAlertTone = (typeof STORE_DESK_ORDER_ALERT_TONES)[number];

export const STORE_DESK_ORDER_ALERT_VOLUMES = ['low', 'medium', 'high'] as const;
export type StoreDeskOrderAlertVolume = (typeof STORE_DESK_ORDER_ALERT_VOLUMES)[number];

export const STORE_DESK_ORDER_ALERT_COPY = {
  titleAr: 'تنبيه الطلبات',
  leadAr: 'فعّل التنبيه مرة على هذا الجهاز. يصل الصوت والوميض وإشعار الجوال عند طلب جديد، واللوحة ظاهرة أو في الخلفية.',
  armAr: 'فعّل التنبيه',
  armedAr: 'التنبيه يعمل',
  disarmAr: 'إيقاف',
  previewAr: 'جرّب النغمة',
  toneAr: 'النغمة',
  volumeAr: 'الشدة',
  soundAr: 'الصوت',
  lightAr: 'التنبيه الضوئي',
  phoneAr: 'إشعار الجهاز',
  vibrateAr: 'الاهتزاز',
  awakeAr: 'أبقِ الشاشة مستيقظة',
  repeatAr: 'كرر حتى تُعلَّم مقروءاً',
  noticeTitleAr: 'طلب جديد',
  noticeBodyAr: 'وصلت تذكرة إلى اللوحة.',
  phoneHintAr: 'إشعار الجهاز يظهر على شاشة الجوال إن سمحت للمتصفح، حتى إن أُخفيت اللوحة.',
  lockedHintAr: 'على بعض الجوالات يُفضَّل تثبيت الصفحة على الشاشة الرئيسية ثم السماح بالإشعارات.',
} as const;

export const STORE_DESK_ORDER_ALERT_TONE_AR: Record<StoreDeskOrderAlertTone, string> = {
  bell: 'جرس',
  chime: 'نغمة مزدوجة',
  pulse: 'نبضة',
  market: 'نداء السوق',
};

export const STORE_DESK_ORDER_ALERT_VOLUME_AR: Record<StoreDeskOrderAlertVolume, string> = {
  low: 'خافت',
  medium: 'وسط',
  high: 'عالٍ',
};

export const STORE_DESK_ORDER_ALERT_ACCENT: Record<StoreDeskOrderAlertProduct, string> = {
  grocers: '#8fbf7a',
  restaurant: '#e08a3c',
  cafe: '#c48a4a',
  kitchen: '#b45a3c',
  produce: '#3d8b4a',
};
