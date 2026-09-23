/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أنواع "صفحة المسارات" — تجربة معملية معزولة (/store/paths-lab) تُعيد تقديم
 * منتجات كتالوج الحلول (storeSolutionCatalog.ts) كمسارات مهنية بدل فهرس عام.
 *
 * لا نسخ لبيانات الكتالوج هنا — هذه أنواع الناتج النهائي الذي يبنيه
 * storeProductPathAdapter.ts من الكتالوج + الثيمات الحقيقية الموجودة أصلاً.
 */
import type { StoreProductId } from '@/config/storeProductThemes';

/** نموذج التشغيل الذي يفهمه الزائر — من فئة الكتالوج، لا حقل مخترع منفصل. */
export type ProductPathOperatingModel =
  | 'neighbor-fixed' // نشاط ثابت يبيع لسكان الحي (خضار/تموينات)
  | 'home-scheduled' // تجهيز منزلي بطلب مجدول (طبخ/حلا)
  | 'food-service' // مطعم/مقهى بخدمة طلب وتشغيل مطبخ أو بار
  | 'event-hosting' // مناسبة أو فعالية بلوحة مضيف وشاشات
  | 'digital-card' // بطاقة رقمية مدفوعة خفيفة
  | 'trade-discovery'; // حرفي/صالون يُكتشف على الخريطة (خارجي)

export type ProductPathDeliverable = {
  titleAr: string;
  /** موجودة فقط حين يكون هناك شرح حقيقي إضافي أبعد من عنوان pathItems نفسه. */
  descriptionAr?: string;
};

export type ProductPathFaqItem = {
  questionAr: string;
  answerAr: string;
};

/**
 * محتوى تحريري إضافي لكل مسار — مصدره وصف/عناصر الكتالوج الحقيقية ممتدة
 * نصياً لصياغة مقنعة، وليس بيانات أو أرقاماً مخترعة. يُضبط في
 * storeProductPathContent.ts ولا يحل محل storeSolutionCatalog.ts.
 */
export type ProductPathEditorialContent = {
  /** عنوان الفائدة على صفحة المسار، إن وُجد؛ وإلا يبقى «مسار {اسم المنتج}». */
  headlineAr?: string;
  /** نص زر الدعوة حين يختلف عن قالب «اطلب {الاسم}». الوجهة تبقى href الكتالوج. */
  ctaLabelAr?: string;
  fitForAr: readonly string[];
  notFitForAr: readonly string[];
  problemsAr: readonly string[];
  outcomesAr: readonly string[];
  marketingStepsAr: readonly string[];
  faq: readonly ProductPathFaqItem[];
};

/** حقائق تشغيلية حقيقية — تُملأ فقط للمنتجات الستة الحيّة من بياناتها الفعلية. */
export type ProductPathOperatingFacts = {
  hasScheduledOrders: boolean;
  hasDeliveryFeeOption: boolean;
  hasShopHours: boolean;
  hasDeskTicketBoard: boolean;
  hasQrShare: boolean;
};

export type ProductPathDefinition = {
  slug: string;
  code: string;
  productId?: StoreProductId;
  titleAr: string;
  shortTitleAr: string;
  nameEn: string;
  categoryAr: string;
  operatingModel: ProductPathOperatingModel;
  summaryAr: string;
  descriptionAr: string;
  tags: readonly string[];
  deliverables: readonly ProductPathDeliverable[];
  href: string;
  external: boolean;
  logoSrc: string | null;
  cardImageSrc: string;
  accent: string;
  ctaLabelAr: string;
  editorial: ProductPathEditorialContent;
  operatingFacts?: ProductPathOperatingFacts;
};

export type ProductPathOperatingModelOption = {
  id: ProductPathOperatingModel;
  labelAr: string;
};
