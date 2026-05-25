import {
  MAP_FEATURE_PARTNER_SUBTITLE,
  PLATFORM_HERO_BADGE,
} from '@/config/platformSmartTracking';

/** الميزة الأساسية المشتركة لجميع الباقات — نظام الاستجابة الذكية على المنصة */
export const MAP_FEATURE_HERO = {
  title: PLATFORM_HERO_BADGE,
  subtitle: MAP_FEATURE_PARTNER_SUBTITLE,
} as const;

/** أيقونة مفتوح/مغلق للعملاء — تُذكر في سياسة الباقات */
export const SHOP_OPEN_STATUS_FEATURE_BRONZE =
  'حالة «مفتوح الآن / مغلق» تظهر للعميل بوضوح، ويمكن تحديثها برابط سريع من الجوال دون الحاجة للوحة تحكم.';
export const SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND =
  'تحكم كامل بحالة «مفتوح الآن / مغلق» من لوحة الإدارة، مع رابط سريع للطوارئ أو التحديث من الجوال.';

/** نص زر فتح الموقع من نافذة تفاصيل الصالون (للعميل) */
export const CUSTOMER_MAP_CTA = 'عرض الموقع بعد الاستجابة الذكية لحلاق ماب';

/** ذهبي: لوحة التحكم للمحتوى والصور (من دون تسليط جدولة المواعيد كميزة ماسية) */
export const BARBER_DASHBOARD_GOLD_LINE =
  'لوحة تحكم سهلة لتحديث المنيو والأسعار وصور المحل متى احتجت — لا تنتظر أحداً ليعدّل ملفك.';

/** ماسي — اللوحة (منيو، أسعار، صور) + المكتب الخاص */
export const BARBER_DASHBOARD_DIAMOND_PORTAL_LINE =
  'لوحة تحكم كاملة: المنيو، الأسعار، معرض الصور، حالة التوفر — وإضافة المكتب الخاص 🏛️ لمن يريد مساعداً داخلياً ومناوباً على الشات مترابطَين.';

/** ماسي — جدولة المواعيد من اللوحة */
export const BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE =
  'جدولة المواعيد ومتابعة الحجوزات من نفس اللوحة — تنظيم أوضح لوقت الصالون وتقليل اتصالات التنسيق المتكررة.';
