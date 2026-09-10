/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشاركة صفحات الحي على القنوات — من لوحة التحكم فقط.
 */
import type { StoreLiveShopShareKind } from '@/lib/storeHostRedirect';

export const STORE_LIVE_SHOP_SHARE_COPY = {
  shareTitleAr: 'الرمز والقنوات',
  shareLeadAr: 'اطبع الملصق أو افتح كرت الجوال أو انشر رابط الصفحة. الإرسال من جهازك.',
  shareCopyAr: 'انسخ النص الجاهز',
  shareCopiedAr: 'نُسخ النص.',
  shareCopyFailAr: 'تعذر النسخ. انسخ النص يدوياً.',
  shareWhatsappAr: 'واتساب',
  shareInstagramAr: 'إنستغرام',
  shareSnapAr: 'سناب',
  shareTiktokAr: 'تيك توك',
  shareTelegramAr: 'تلجرام',
  shareXAr: 'إكس',
  instagramHintAr: 'لإنستغرام وسناب وتيك توك: انسخ النص ثم الصقه في المنشور أو البايو.',
} as const;

const CAPTION_LINES: Record<StoreLiveShopShareKind, (shop: string) => string> = {
  halana: (shop) => `أعمال ${shop}. اطّلعي على المعرض ثم اطلبي حلوى خاصة مسبقاً.`,
  grocers: (shop) => `اطلب من ${shop} — تموينات الحي على الجوال.`,
  produce: (shop) => `اطلب من ${shop} — خضار وفواكه الحي على الجوال.`,
  restaurant: (shop) => `اطلب من ${shop} — قائمة المطعم وطلب ضيف الحي.`,
  cafe: (shop) => `اطلب من ${shop} — مقهى الحي على الجوال.`,
  kitchen: (shop) => `اطلب من ${shop} — أكل منزلي للحي.`,
  dates: (shop) => `اطلب من ${shop} — تمر الحي على الجوال.`,
};

export function storeLiveShopShareCaption(kind: StoreLiveShopShareKind, shopName: string, url: string): string {
  const shop = shopName.trim() || kind;
  return [CAPTION_LINES[kind](shop), url].join('\n');
}
