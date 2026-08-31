/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** Shared polling intervals — keep DB/API load predictable across dashboards. */
export const POLL_MS = {
  RADAR_PULSES: 30_000,
  BARBER_SUPPORT_CHAT: 60_000,
  /** قائمة محادثات الشات — سريع كفاية لشارة حمراء عند غياب Realtime */
  PRIVATE_CHAT_LIST: 12_000,
  /** شات العميل — رسائل جديدة */
  CUSTOMER_CHAT_MESSAGES: 1_000,
  /** شات العميل — طلب رد المناوب عند الحاجة فقط */
  CUSTOMER_CHAT_INTERCEPT: 4_000,
  /** لوحة الحلاق — طلب رد المناوب (عند فتح الشات ورسالة عميل معلّقة) */
  BARBER_SHIFT_INTERCEPT: 6_000,
  /** بعد إرسال العميل — أول محاولة اعتراض احتياطية */
  CUSTOMER_CHAT_INTERCEPT_AFTER_SEND: 800,
  /** رسائل شات العملاء في لوحة الحلاق — عند غياب Realtime */
  PRIVATE_CHAT_MESSAGES: 6_000,
  MAP_COMMUNITY_FEED: 30_000,
  MAP_COMMUNITY_BADGE: 60_000,
  OWNER_SALON_WATCH: 45_000,
  /** طلبات حجز المواعيد (ماسي) في لوحة الحلاق — تنبيه سريع */
  DIAMOND_APPOINTMENT_BOOKINGS: 10_000,
  /** مضاعف التباطؤ عند نجاح Supabase Realtime */
  REALTIME_CONNECTED_MULTIPLIER: 6,
  /** صفحة جار الحي — رفّ الأصناف لا يحتاج أربع ثوانٍ */
  STORE_LIVE_SHOP: 8_000,
  /** لوحة الكاشير — تذاكر الطلب أسرع */
  STORE_LIVE_DESK: 4_000,
  /** المختبر المحلي عبر storage — بلا شبكة */
  STORE_LIVE_LAB: 1_500,
  /** تغذية الإدارة والرادار — دقيقة واحدة تكفي */
  ADMIN_HIVE: 60_000,
} as const;

/** Skip background-tab polling (mirrors React Query refetchIntervalInBackground: false). */
export function isPollingTabActive(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

/** Interval that pauses while the tab is hidden and catches up on return. */
export function scheduleVisiblePoll(tick: () => void, ms: number): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const run = () => {
    if (!isPollingTabActive()) return;
    tick();
  };
  const id = window.setInterval(run, ms);
  const onVis = () => {
    if (isPollingTabActive()) tick();
  };
  document.addEventListener('visibilitychange', onVis);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', onVis);
  };
}
