/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * نصوص صفحة الدفع — تعهد موحّد + مسار توقف الدفع (منحة الإدارة 90 يوماً).
 * الأعلام الخلفية تبقى: softwareProductAcknowledged + شروط البوابة.
 * تنبيه صارم: لا تُذكر كلمة «المؤسس» في أي نص ظاهر للعميل — الصياغة العامة = الإدارة فقط.
 */
import { SOFTWARE_PRODUCT_PURCHASE_ACK_AR } from '@/config/legalActivityScope';

/** التأشيرة الظاهرة الوحيدة قبل فتح نموذج الدفع */
export const PAYMENT_CHECKOUT_ACK_SHORT_AR = 'أوافق على شروط الدفع والشراء';

/** جملة تمهيد قصيرة فوق التأشيرة */
export const PAYMENT_CHECKOUT_ACK_LEAD_AR =
  'خطوة أخيرة قبل نموذج الدفع الآمن: وافق على شروط الدفع والشراء ليظهر النموذج. التفاصيل القانونية قابلة للفتح أدناه.';

/** عنوان قسم التفاصيل القابلة للفتح */
export const PAYMENT_CHECKOUT_ACK_DETAILS_TRIGGER_AR = 'عرض تفاصيل الشروط والإقرار';

/** نص إقرار المنتج البرمجي داخل التفاصيل (بدون ** للعرض) */
export const PAYMENT_CHECKOUT_SOFTWARE_ACK_PLAIN_AR =
  SOFTWARE_PRODUCT_PURCHASE_ACK_AR.replace(/\*\*/g, '');

/** تنويه عند فشل/توقف الدفع — القرار للإدارة كمنحة تشغيل 90 يوماً */
export const PAYMENT_INCOMPLETE_ADMIN_GRANT_TITLE_AR =
  'توقّف الدفع؟ القرار يعود للإدارة';

export const PAYMENT_INCOMPLETE_ADMIN_GRANT_BODY_AR =
  'إن توقّف الدفع أو لم يكتمل، لا تُصدر الرخصة ولا يُفعَّل الحساب تلقائياً من هذه الصفحة. ' +
  'يعود قرار تفعيل «عرض التشغيل» لمدة 90 يوماً كمنحة تقديرية من الإدارة — وليست طلباً ذاتياً هنا. ' +
  'يمكنك إعادة المحاولة أدناه، أو انتظار مراجعة الإدارة إن وُجد مسار تواصل سابق.';

/** تنويه هادئ قبل الدفع (رخصة فقط — ليس شحن محفظة) */
export const PAYMENT_PRE_CHECKOUT_ADMIN_GRANT_HINT_AR =
  'بعد إتمام الدفع تُصدر الرخصة ويُفعَّل النفاذ. إن توقّف الدفع دون إتمامه، يبقى التفعيل كمنحة تشغيل 90 يوماً قراراً للإدارة فقط.';
