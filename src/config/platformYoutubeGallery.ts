/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معرض يوتيوب: صفحتان متصلتان، صناديق بلا سقف ظاهر.
 * لا إعلانات من المنصة. لا يُستورد من App.
 */
export const PLATFORM_YOUTUBE_PAGE_IDS = ['halaq', 'store'] as const;

export type PlatformYoutubePageId = (typeof PLATFORM_YOUTUBE_PAGE_IDS)[number];

export const PLATFORM_YOUTUBE_BOX_SAFETY_CAP = 400;

export const PLATFORM_YOUTUBE_GALLERY_COPY = {
  halaq: {
    documentTitle: 'مشاهدة حلاق ماب',
    kickerAr: 'حلاق ماب',
    titleAr: 'مشاهدة حلاق ماب',
    leadAr: 'شغّل المقطع هنا داخل الصندوق، دون مغادرة الصفحة ودون إعلانات من المنصة.',
  },
  store: {
    documentTitle: 'مشاهدة خريطة الحل',
    kickerAr: 'خريطة الحل',
    titleAr: 'مشاهدة خريطة الحل',
    leadAr: 'شغّل مقاطع منتجات المتجر هنا داخل الصندوق، دون مغادرة الصفحة ودون إعلانات من المنصة.',
  },
  switchHalaqAr: 'حلاق ماب',
  switchStoreAr: 'خريطة الحل',
  emptyAr: 'لا مقاطع منشورة بعد.',
  loadingAr: 'جاري فتح الصناديق…',
  deskTitleAr: 'صناديق مشاهدة اليوتيوب',
  deskLeadAr: 'ضع الرابط والعنوان، استعرض التشغيل داخل الصندوق، ثم انشر لتظهر على الصفحة العامة.',
  deskDocumentTitle: 'صناديق مشاهدة اليوتيوب',
  addBoxAr: 'صندوق جديد',
  titleFieldAr: 'عنوان الصندوق',
  urlFieldAr: 'رابط اليوتيوب',
  saveDraftAr: 'حفظ المسودة',
  previewAr: 'استعراض التشغيل',
  hidePreviewAr: 'إخفاء الاستعراض',
  publishAr: 'نشر على الصفحة',
  publishedAr: 'منشور',
  unpublishedAr: 'مسودة لم تُنشر',
  removeAr: 'حذف الصندوق',
  invalidUrlAr: 'الرابط ليس مقطع يوتيوب صالحاً.',
  savedAr: 'حُفظت المسودة.',
  publishedOkAr: 'نُشرت الصناديق على الصفحة.',
} as const;
