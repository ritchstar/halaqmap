/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نصوص خاصة بمعاينة /store/pitch-preview — المصدر المعتمد للإنتاج: storeFront.
 */
import { STORE_DEDICATED_PAGE_COPY } from '@/config/storeDedicatedPageCopy';
import { STORE_LANDING_COPY } from '@/config/storeFront';

export const STORE_LANDING_PITCH_COPY = {
  shopNameAr: STORE_LANDING_COPY.shopNameAr,
  pitchH1Ar: STORE_LANDING_COPY.pitchH1Ar,
  pitchDedicatedLineAr: STORE_LANDING_COPY.pitchDedicatedLineAr,
  pitchNotMarketplaceAr: STORE_LANDING_COPY.pitchNotMarketplaceAr,
  pitchTransformAr: STORE_LANDING_COPY.pitchTransformAr,
  pitchExploreCtaAr: STORE_LANDING_COPY.pitchExploreCtaAr,
  philosophyTitleAr: STORE_LANDING_COPY.philosophyTitleAr,
  philosophyBodyAr: STORE_LANDING_COPY.philosophyBodyAr,
  philosophyClosingAr: STORE_LANDING_COPY.philosophyClosingAr,
  dedicatedPageDefinitionAr: STORE_DEDICATED_PAGE_COPY.leadAr,
  neighborGuestDefinitionAr: STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr,
  neighborGuestShortAr: 'واجهة خاصة لنشاطك، يصل إليها زبائنك مباشرة.',
  previewBannerAr: 'معاينة تحريرية — لم تُنشر على صفحة المتجر الرئيسية بعد.',
  previewBridgeAr:
    'في الإنتاج يوجّه زر «اكتشف المنتج المناسب لشغلك» إلى تصفّح المنتجات في المتجر، لا إلى سوق يجمع عدة أنشطة.',
  previewBridgeCtaAr: 'افتح التصفح الحالي للمقارنة',
} as const;
