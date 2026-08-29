/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة كيو آر للجوال: اسم ومنصب داخل المنتج، وإبراز رمز الصفحة كثقة تعامل.
 * لا تُستورد من App.
 */
export const STORE_PRODUCT_PASS_KINDS = ['lounge', 'grocers', 'restaurant', 'cafe', 'kitchen', 'produce'] as const;
export type StoreProductPassKind = (typeof STORE_PRODUCT_PASS_KINDS)[number];

export const STORE_PRODUCT_PASS_ROLES = [
  { id: 'owner', labelAr: 'المالك' },
  { id: 'owner_f', labelAr: 'المالكة' },
  { id: 'supervisor', labelAr: 'مشرف' },
  { id: 'supervisor_f', labelAr: 'مشرفة' },
  { id: 'assistant', labelAr: 'مساعد' },
  { id: 'assistant_f', labelAr: 'مساعدة' },
  { id: 'courier', labelAr: 'عامل التوصيل' },
] as const;
export type StoreProductPassRoleId = (typeof STORE_PRODUCT_PASS_ROLES)[number]['id'];

export const STORE_PRODUCT_PASS_META: Record<
  StoreProductPassKind,
  { skuAr: string; accent: string; ink: string; shopPath: string }
> = {
  lounge: { skuAr: 'لاونجا1', accent: '#d4a574', ink: '#12090c', shopPath: '/l/:token' },
  grocers: { skuAr: 'تمويناتا1', accent: '#8fbf7a', ink: '#061018', shopPath: '/g/:token' },
  restaurant: { skuAr: 'مطعمنا1', accent: '#e08a3c', ink: '#061018', shopPath: '/r/:token' },
  cafe: { skuAr: 'كافينا1', accent: '#c48a4a', ink: '#061018', shopPath: '/c/:token' },
  kitchen: { skuAr: 'طبختنا1', accent: '#b45a3c', ink: '#061018', shopPath: '/k/:token' },
  produce: { skuAr: 'خضارنا1', accent: '#3d8b4a', ink: '#061018', shopPath: '/v/:token' },
};

export const STORE_PRODUCT_PASS_COPY = {
  documentTitle: 'اصنع كيو ار منتجك | متجر خريطة الحل',
  kickerAr: 'ثقة تعامل',
  titleAr: 'اصنع كيو ار منتجك',
  leadAr: 'ضع اسمك ومنصبك في المنتج، ثم افتح البطاقة أو انسخ رابطها لعرض رمز الصفحة من شاشة الجوال.',
  nameLabelAr: 'الاسم',
  roleLabelAr: 'المنصب في المنتج',
  roleHintAr: 'اختر صفتك كما تظهر للمتعامل.',
  openAr: 'افتح',
  copyAr: 'انسخ الرابط',
  copiedAr: 'نُسخ الرابط',
  copyFailAr: 'تعذر النسخ. انسخ الرابط يدوياً.',
  needNameAr: 'اكتب اسماً واضحاً.',
  needRoleAr: 'اختر المنصب.',
  scanHintAr: 'امسح الرمز لدخول صفحة المنتج.',
  saveHintAr: 'إن رغبت بتخزين الرمز في جهازك فاحفظ صورة الشاشة.',
  shareHintAr: 'للمشاركة الصق الرابط في منشورك. لا أزرار تحميل ولا مشاركة عبر المنصات من هنا.',
  deskCtaAr: 'إبراز من الجوال',
  deskLeadAr: 'بطاقة اسم ومنصب تعرض رمز المنتج من شاشة الجوال.',
  missingAr: 'هذا الرابط لا يفتح بطاقة منتج معتمدة.',
  presentBadgeAr: 'ثقة تعامل',
} as const;
