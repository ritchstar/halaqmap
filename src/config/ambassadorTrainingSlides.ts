/**
 * شرائح تدريب سفراء التسويق الميداني — HTML ثابت في
 * public/docs/ambassadors/training-slides/page_N.html
 * العرض الأساسي داخل المنصة؛ PDF اختياري لاحقاً.
 */

export const AMBASSADOR_TRAINING_SLIDE_WIDTH = 1280;
export const AMBASSADOR_TRAINING_SLIDE_HEIGHT = 720;

export const AMBASSADOR_TRAINING_SLIDES_BASE =
  '/docs/ambassadors/training-slides' as const;

export type AmbassadorTrainingSlide = {
  id: string;
  index: number;
  titleAr: string;
  src: string;
};

const TITLES_AR = [
  'نظام سفراء التسويق الميداني',
  'لماذا يوجد برنامج السفراء؟',
  'هوية حلاق ماب — دليل السفراء',
  'ماذا تبيع كسفير؟',
  'رحلة السفير من الميدان إلى العمولة',
  'قبل الخروج للميدان',
  'إثبات الموقع والصور',
  'قاعدة 50 متر ونافذة 30 يوم',
  'كيف تساعد الصالون على التسجيل؟',
  'لوحة السفير والمسار التشغيلي',
  'مسار الفنادق والشقق المخدومة',
  'المحفظة وصرف الأرباح',
  'نص الزيارة وردود الاعتراضات',
  'المحظورات والخاتمة العملية',
] as const;

export const AMBASSADOR_TRAINING_SLIDES: readonly AmbassadorTrainingSlide[] =
  TITLES_AR.map((titleAr, i) => {
    const n = i + 1;
    return {
      id: `amb-train-${n}`,
      index: n,
      titleAr,
      src: `${AMBASSADOR_TRAINING_SLIDES_BASE}/page_${n}.html`,
    };
  });

export const AMBASSADOR_TRAINING_SLIDE_COUNT = AMBASSADOR_TRAINING_SLIDES.length;
