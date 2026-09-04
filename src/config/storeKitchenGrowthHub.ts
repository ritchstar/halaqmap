/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مركز نمو وتسويق طبختنا1. لا يُستورد من App.tsx.
 * بلا أسعار اشتراك وبلا تجربة وبلا إرسال جماعي.
 * ذكر ميسّر هنا لنفي التحصيل عن سلة الزبون فقط.
 */

export const STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID = 'kitchen' as const;

export const STORE_KITCHEN_GROWTH_HUB_REVISION = 2 as const;

export const STORE_KITCHEN_GROWTH_HUB_PUBLISHED_AT = '2026-09-04T13:13:00+03:00' as const;

export type StoreKitchenGrowthCategory = 'whatsapp' | 'basket' | 'intake' | 'qr';

export type StoreKitchenGrowthItem = {
  id: string;
  category: StoreKitchenGrowthCategory;
  titleAr: string;
  bodyAr: string;
  copyable: boolean;
};

export const STORE_KITCHEN_GROWTH_CATEGORIES: readonly {
  id: StoreKitchenGrowthCategory;
  titleAr: string;
}[] = [
  { id: 'whatsapp', titleAr: 'نصوص الواتساب والمنصات' },
  { id: 'basket', titleAr: 'تكتيكات رفع متوسط قيمة السلة' },
  { id: 'intake', titleAr: 'تنظيم استقبال الطلبات والحد من الهدر' },
  { id: 'qr', titleAr: 'عبارات ملصقات الرمز على التغليف' },
] as const;

export const STORE_KITCHEN_GROWTH_ITEMS: readonly StoreKitchenGrowthItem[] = [
  {
    id: 'wa-weekend-preorder',
    category: 'whatsapp',
    titleAr: 'نهاية الأسبوع وحجز مسبق',
    bodyAr:
      'أهلاً بك 🌸\nلتصنع نهاية أسبوع مميزة مع العائلة، باب الحجز المسبق لأطباقنا المنزلية الطازجة متاح الآن لميعاد [أدخل اليوم، مثلاً: الجمعة]! 🍲✨\nخفف زحمة التفكير، واطلب طبقك المفضل مباشرة وتأكد من وصوله في موعدك المحدد عبر مقرنا الرقمي المباشر:\n[رابط المتجر]',
    copyable: true,
  },
  {
    id: 'wa-home-cooking',
    category: 'whatsapp',
    titleAr: 'طبخ بيت وحجز بضغطة',
    bodyAr:
      'طبخ بيت حقيقي بكل حب واحترافية 👩‍🍳🔥\nاختصر عناء التفاوض ورسائل الواتساب الطويلة! الآن يمكنك تخصيص طبقك وحجز وجبتك العائلية أو ولائمتك بضغطة زر واحدة عبر موقعنا الرسمي المباشر 👇\n[رابط المتجر]\n📍 نستقبل طلبات الموعد المسبق لضمان أعلى جودة وطزاجة!',
    copyable: true,
  },
  {
    id: 'basket-family-combo',
    category: 'basket',
    titleAr: 'باقة اللمة',
    bodyAr:
      'تقديم خيار مجمّع يدمج الطبق الرئيسي مع أطباق جانبية (كالمنزلية أو الحلويات)، مما يشجع العميل على زيادة قيمة طلبه بناءً على تسعيرك الخاص.',
    copyable: true,
  },
  {
    id: 'basket-upsell-size',
    category: 'basket',
    titleAr: 'ترقية الحجم',
    bodyAr:
      'إتاحة خيارات أحجام متدرجة للطلب داخل الواجهة (مثل: حجم عادي / حجم عائلي)، لمنح العميل حرية الترقية بحسب احتياجه.',
    copyable: true,
  },
  {
    id: 'intake-capacity',
    category: 'intake',
    titleAr: 'التحكم بالسعة التشغيلية',
    bodyAr:
      'ضبط حدود الاستقبال اليومي وفق طاقتك الإنتاجية الفردية عبر إعدادات اللوحة، لتجنب تكدس الطلبات وحماية جودة الطهي.',
    copyable: true,
  },
  {
    id: 'intake-schedule',
    category: 'intake',
    titleAr: 'جدولة الطلب المسبق',
    bodyAr:
      'تفعيل اختيار تاريخ ووقت التسليم المسبق، لتأمين المكونات الطازجة على قدر الاحتياج الفعلي فقط وتفادي تلف المواد.',
    copyable: true,
  },
  {
    id: 'intake-direct-pay',
    category: 'intake',
    titleAr: 'المعاملات المالية المباشرة',
    bodyAr:
      'تتم كافة عمليات التحصيل والدفع بشكل مباشر ومستقل تماماً بينك وبين عملائك، دون أي تدخل أو ميسّر مالي على سلة العميل من طرف المنصة.',
    copyable: true,
  },
  {
    id: 'qr-pack-ensure',
    category: 'qr',
    titleAr: 'اضمن طبقك المفضل',
    bodyAr: 'عجبك الطبق؟ اضمن طبقك المفضل المرة القادمة قبل نفاذ الكمية بطلبك المباشر عبر كود الـ QR 📲',
    copyable: true,
  },
  {
    id: 'qr-pack-love',
    category: 'qr',
    titleAr: 'مسح الكود للطلب القادم',
    bodyAr: 'طبخنا لكم بكل حب ❤️.. لا تحتاج لحفظ رقمنا، امسح الكود واطلب مستقبلاً بضغطة زر واحدة.',
    copyable: true,
  },
] as const;

export const STORE_KITCHEN_GROWTH_HUB_COPY = {
  buttonAr: 'مركز النمو والتسويق',
  titleAr: 'مركز النمو والتسويق',
  kickerAr: 'طبختنا1',
  leadAr: 'النصوص الأربعة المعتمدة لصاحب النشاط. انسخ وأرسل من جهازك. الزبون يبقى على صفحة الطلب.',
  copiedAr: 'نُسخ النص.',
  copyAr: 'انسخ',
  backAr: 'عودة إلى لوحة النشاط',
  badgeLabelAr: 'تحديث جديد',
} as const;

export function kitchenGrowthHubPath(token: string): string {
  const safe = String(token || '').trim();
  return `/k/${encodeURIComponent(safe)}/desk/growth`;
}

export function kitchenGrowthItemsByCategory(category: StoreKitchenGrowthCategory): StoreKitchenGrowthItem[] {
  return STORE_KITCHEN_GROWTH_ITEMS.filter((item) => item.category === category);
}
