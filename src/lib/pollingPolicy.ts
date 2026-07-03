/** Shared polling intervals — keep DB/API load predictable across dashboards. */
export const POLL_MS = {
  RADAR_PULSES: 30_000,
  BARBER_SUPPORT_CHAT: 60_000,
  /** قائمة محادثات الشات — لا تُخفَّض دون مراجعة حمل Edge */
  PRIVATE_CHAT_LIST: 90_000,
  /** رسائل شات العملاء في لوحة الحلاق */
  PRIVATE_CHAT_MESSAGES: 5_000,
  /** اعتراض المناوب من لوحة الحلاق */
  PRIVATE_CHAT_INTERCEPT: 3_000,
  /** شات العميل — رسائل جديدة */
  CUSTOMER_CHAT_MESSAGES: 2_000,
  /** شات العميل — طلب رد المناوب */
  CUSTOMER_CHAT_INTERCEPT: 2_000,
  /** بعد إرسال العميل — أول محاولة اعتراض */
  CUSTOMER_CHAT_INTERCEPT_AFTER_SEND: 500,
  MAP_COMMUNITY_FEED: 30_000,
  MAP_COMMUNITY_BADGE: 60_000,
  OWNER_SALON_WATCH: 45_000,
  /** طلبات حجز المواعيد (ماسي) في لوحة الحلاق */
  DIAMOND_APPOINTMENT_BOOKINGS: 30_000,
  /** مضاعف التباطؤ عند نجاح Supabase Realtime */
  REALTIME_CONNECTED_MULTIPLIER: 6,
} as const;

/** Skip background-tab polling (mirrors React Query refetchIntervalInBackground: false). */
export function isPollingTabActive(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}
