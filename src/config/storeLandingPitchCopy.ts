/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نصوص خاصة بمعاينة /store/pitch-preview — المصدر المعتمد للإنتاج: storeFront.
 */
import { STORE_DEDICATED_PAGE_COPY } from '@/config/storeDedicatedPageCopy';
import { STORE_LANDING_COPY } from '@/config/storeFront';

export const STORE_LANDING_PITCH_COPY = {
  shopNameAr: STORE_LANDING_COPY.shopNameAr,
  pitchKickerAr: STORE_LANDING_COPY.pitchKickerAr,
  pitchH1Ar: STORE_LANDING_COPY.pitchH1Ar,
  pitchDedicatedLineAr: STORE_LANDING_COPY.pitchDedicatedLineAr,
  pitchNotMarketplaceAr: STORE_LANDING_COPY.pitchNotMarketplaceAr,
  pitchTransformAr: STORE_LANDING_COPY.pitchTransformAr,
  pitchExploreCtaAr: STORE_LANDING_COPY.pitchExploreCtaAr,
  pitchPathsCtaAr: STORE_LANDING_COPY.pitchPathsCtaAr,
  pitchOperatorsAppCtaAr: STORE_LANDING_COPY.pitchOperatorsAppCtaAr,
  philosophyTitleAr: STORE_LANDING_COPY.philosophyTitleAr,
  philosophyBodyAr: STORE_LANDING_COPY.philosophyBodyAr,
  philosophyClosingAr: STORE_LANDING_COPY.philosophyClosingAr,
  dedicatedPageDefinitionAr: STORE_DEDICATED_PAGE_COPY.leadAr,
  neighborGuestDefinitionAr: STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr,
  neighborGuestShortAr: 'واجهة خاصة لنشاطك، يصل إليها زبائنك مباشرة.',
  previewBannerAr: 'معاينة تحريرية — لم تُنشر على صفحة المتجر الرئيسية بعد.',
  previewBridgeAr:
    'في الإنتاج الزر الأساسي يفتح صفحة المسارات، والزر الثانوي يفتح تطبيق المشغّلين على Google Play. تحميل التطبيق لا ينشئ تشغيلاً دون تفعيل المنتج.',
  previewBridgeCtaAr: 'افتح التصفح الحالي للمقارنة',
} as const;
