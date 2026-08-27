/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إحالة منصة من نحن إلى شرح السحابة في صفحة مزايا المنتجات.
 * النصوص المفصّلة في storeProductBenefitsCopy — لا تُستورد من App.
 */
import {
  LEGAL_ECOMMERCE_STORE_NAME,
  LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR,
  LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
} from '@/config/partnerLegal';

/** مرساة قديمة على من نحن للمتجر — تُبقي الرابط السابق صالحاً. */
export const STORE_CLOUD_SECTION_ID = 'cloud' as const;

export const PLATFORM_ABOUT_CLOUD_COPY = {
  kickerAr: 'البرمجية التي تستخدمها سحابية',
  titleAr: 'ماهي الخدمات السحابية',
  latinMark: LEGAL_ECOMMERCE_STORE_NAME,
  bodyBeforeMarkAr: `${LEGAL_FIRST_SOFTWARE_PRODUCT_AR} منتج برمجي ضمن متجر `,
  bodyAfterMarkAr: ` الظاهر باسم ${LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR}. الاستعلام والرخصة يعملان عبر الإنترنت على بنية المتجر: لا خادم في الصالون، ولا عمولة على الحلاقة، ولا حجز نيابة عن المنشأة. مزايا المنتجات الجاهزة والفرق بين عائلاتها في صفحة مزايا المنتجات.`,
  ctaAr: 'مزايا المنتجات',
} as const;
