import { MAP_FEATURE_PARTNER_SUBTITLE } from '@/config/platformSmartTracking';

/** الميزة الأساسية المشتركة لجميع الباقات — نظام الرصد الذكي على المنصة */
export const MAP_FEATURE_HERO = {
  title: 'نظام الرصد الذكي في حلاق ماب',
  subtitle: MAP_FEATURE_PARTNER_SUBTITLE,
} as const;

/** أيقونة مفتوح/مغلق للعملاء — تُذكر في سياسة الباقات */
export const SHOP_OPEN_STATUS_FEATURE_BRONZE =
  'حالة «مفتوح الآن / مغلق» تظهر للعميل بوضوح، ويمكن تحديثها برابط سريع من الجوال دون الحاجة للوحة تحكم.';
export const SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND =
  'تحكم كامل بحالة «مفتوح الآن / مغلق» من لوحة الإدارة، مع رابط سريع للطوارئ أو التحديث من الجوال.';

/** نص زر فتح الموقع من نافذة تفاصيل الصالون (للعميل) */
export const CUSTOMER_MAP_CTA = 'عرض الموقع على نظام الرصد الذكي لحلاق ماب';

/** ذهبي: لوحة التحكم للمحتوى والصور (من دون تسليط جدولة المواعيد كميزة ماسية) */
export const BARBER_DASHBOARD_GOLD_LINE =
  'لوحة تحكم سهلة لتحديث المنيو والأسعار وصور المحل متى احتجت، بدون انتظار تعديلات يدوية.';

/** ماسي — اللوحة (منيو، أسعار، صور) */
export const BARBER_DASHBOARD_DIAMOND_PORTAL_LINE =
  'لوحة تحكم كاملة لمحلك: المنيو، الأسعار، معرض الصور، حالة التوفر، وتجربة الملف الماسي من رابط خاص.';

/** ماسي — جدولة المواعيد من اللوحة */
export const BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE =
  'جدولة المواعيد ومتابعة الحجوزات من نفس اللوحة — تنظيم أوضح لوقت الصالون وتجربة أكثر راحة للعميل.';
