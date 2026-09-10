/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توضيح أن صفحة النشاط الحيّة مخصصة لمشترٍ واحد — لا سوقاً مشتركاً.
 */
export const STORE_DEDICATED_PAGE_COPY = {
  titleAr: 'صفحتك لك وحدك',
  leadAr:
    'ليست متجراً مشتركاً، ولا مساحة تجمعك مع أنشطة أخرى. عند اختيار أحد منتجات خريطة الحل، تُخصّص لك صفحة مستقلة باسم نشاطك، تعرض ما تقدمه وتوجّه زبونك إلى الطلب أو التواصل معك.',
  closingLineAr: 'صفحتك لك وحدك، وزبائنك يتجهون إليك مباشرة.',
  neighborGuestLineAr:
    'جار الحي هو واجهة زبائنك الخاصة، وليس سوقاً مشتركاً. يظهر فيها نشاطك ومنتجاتك ومعلوماتك وطرق الطلب والتواصل الخاصة بك وحدك.',
  districtGuestLineAr:
    'ضيف الحي يصل إلى صفحتك الخاصة، وليس سوقاً مشتركاً. يظهر فيها اسم مطعمك وما تقدمه وطرق الطلب والتواصل معك وحدك.',
  customerGuestLineAr:
    'زبونك يصل إلى صفحتك المخصصة لنشاطك، وليس إلى سوق يجمع عدة أنشطة. يظهر فيها اسم نشاطك وما تقدمه وطرق الطلب والتواصل معك.',
  clientFeminineLineAr:
    'عميلتك تصل إلى صفحتك المخصصة لنشاطك، وليس إلى سوق يجمع عدة متخصصات. يظهر فيها اسم نشاطك وما تقدمينه وطرق الطلب والتواصل معك.',
  storeLandingLeadAr:
    'تنشر منتجاتك في حساباتك، لكن أين يتصفحها العميل ويبدأ طلبه؟ مع منتجات خريطة الحل تحصل على صفحة مستقلة مخصصة لنشاطك، وليست صفحة مشتركة مع أنشطة أخرى.',
  storeBrowseNeighborhoodLeadAr:
    'كل منتج في هذا القسم يمنحك صفحة نشاط مستقلة باسمك — لا سوقاً يجمع عدة محلات.',
  storeBrowseHospitalityLeadAr:
    'صفحة الطلب واللوحة والرمز خاصة بنشاطك فقط — زبونك يتعامل معك مباشرة.',
  reelTitleAr: 'من منشوراتك… إلى صفحتك الخاصة',
  reelOverlayDedicatedAr: 'صفحة مستقلة باسم نشاطك… لك وحدك',
  reelOverlayBrowseAr: 'يتصفح زبونك ما تقدمه، ويبدأ الطلب أو التواصل معك',
} as const;

export type StoreDedicatedGuestAudience = 'neighbor' | 'districtGuest' | 'customer' | 'clientFeminine';

export function storeDedicatedGuestLine(audience: StoreDedicatedGuestAudience): string {
  switch (audience) {
    case 'neighbor':
      return STORE_DEDICATED_PAGE_COPY.neighborGuestLineAr;
    case 'districtGuest':
      return STORE_DEDICATED_PAGE_COPY.districtGuestLineAr;
    case 'customer':
      return STORE_DEDICATED_PAGE_COPY.customerGuestLineAr;
    case 'clientFeminine':
      return STORE_DEDICATED_PAGE_COPY.clientFeminineLineAr;
    default:
      return STORE_DEDICATED_PAGE_COPY.leadAr;
  }
}
