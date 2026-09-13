/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قياس "صفحة المسارات" — طبقة أحداث خفيفة فوق البنية التحليلية الحالية
 * (analytics/productAnalytics.ts)، بلا بيانات شخصية: trackProductEvent
 * أصلاً يستبعد أي مفتاح فيه email/phone/token/lat/lng قبل الإرسال.
 */
import { trackProductEvent } from '@/lib/analytics/productAnalytics';

export const StorePathEvents = {
  /** ضغط زر "اختر مسارك" من الشاشة الأولى للمتجر (StoreLandingPitchHero) — مدخل تجريبي، لقياس الاهتمام قبل أي دمج. */
  homeEntryClick: () => trackProductEvent('store_paths_home_entry_click'),
  labView: () => trackProductEvent('store_paths_lab_view'),
  search: (queryLen: number) => trackProductEvent('store_paths_search', { query_len: queryLen }),
  filterApply: (model: string) => trackProductEvent('store_paths_filter_apply', { model }),
  cardOpen: (code: string) => trackProductEvent('store_paths_card_open', { code }),
  detailView: (code: string) => trackProductEvent('store_paths_detail_view', { code }),
  detailCtaClick: (code: string, external: boolean) =>
    trackProductEvent('store_paths_detail_cta_click', { code, external }),
  helpClick: (code?: string) => trackProductEvent('store_paths_help_click', { code }),
  faqExpand: (code: string, question: string) =>
    trackProductEvent('store_paths_faq_expand', { code, question: question.slice(0, 60) }),
} as const;
