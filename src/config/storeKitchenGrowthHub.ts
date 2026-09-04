/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مركز نمو وتسويق طبختنا1. لا يُستورد من App.tsx.
 * بلا أسعار اشتراك وبلا ميسر وبلا تجربة وبلا إرسال جماعي.
 */

export const STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID = 'kitchen' as const;

export const STORE_KITCHEN_GROWTH_HUB_REVISION = 1 as const;

export const STORE_KITCHEN_GROWTH_HUB_PUBLISHED_AT = '2026-09-04T12:00:00+03:00' as const;

export type StoreKitchenGrowthCategory = 'whatsapp' | 'offer_plan' | 'basket' | 'qr';

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
  { id: 'whatsapp', titleAr: 'نصوص واتساب' },
  { id: 'offer_plan', titleAr: 'خطط العروض' },
  { id: 'basket', titleAr: 'أفكار رفع السلة' },
  { id: 'qr', titleAr: 'تصاميم الرمز' },
] as const;

export const STORE_KITCHEN_GROWTH_ITEMS: readonly StoreKitchenGrowthItem[] = [
  {
    id: 'wa-neighbor-open',
    category: 'whatsapp',
    titleAr: 'افتتاح الحي',
    bodyAr:
      'السلام عليكم. فتحنا صفحة طبختنا1 لطلب الأكل البيتي من الجوال: تختار الصنف وتكتب ملاحظاتك ويصلنا الطلب منظماً. الرابط في الرسالة التالية.',
    copyable: true,
  },
  {
    id: 'wa-today-dish',
    category: 'whatsapp',
    titleAr: 'طبق اليوم',
    bodyAr:
      'اليوم جهزنا صنفاً محدود الكمية. اطلب من صفحة النشاط قبل نفاد الكمية، واكتب موعد التسليم إن احتجت.',
    copyable: true,
  },
  {
    id: 'wa-qr-share',
    category: 'whatsapp',
    titleAr: 'مشاركة الملصق',
    bodyAr:
      'هذا رمز صفحة النشاط. امسحه من الجوال واطلب مباشرة. الطلب يصل للوحة النشاط بلا كتابة مطولة في المحادثة.',
    copyable: true,
  },
  {
    id: 'plan-thursday-preorder',
    category: 'offer_plan',
    titleAr: 'طلب الخميس مسبقاً',
    bodyAr:
      'أعلن يوم الثلاثاء صنفاً واحداً ليوم الخميس بكمية محدودة. أغلق الاستقبال عند اكتمال الطاقة. لا تزد الإعلان إذا تأخرت التذاكر.',
    copyable: true,
  },
  {
    id: 'plan-two-person',
    category: 'offer_plan',
    titleAr: 'وجبة لشخصين',
    bodyAr:
      'اجمع صنفاً رئيساً مع طبق جانبي في سطر واحد على الصفحة. السعر النهائي من عندك، ظاهراً في بطاقة الصنف.',
    copyable: true,
  },
  {
    id: 'basket-add-bread',
    category: 'basket',
    titleAr: 'خبز أو سلطة مع الوجبة',
    bodyAr:
      'أضف صنفاً صغيراً بجانب كل وجبة رئيسة: خبز أو سلطة أو مشروب. يظهر في الصفحة كسطر مستقل يُطلب معه.',
    copyable: true,
  },
  {
    id: 'basket-family-tray',
    category: 'basket',
    titleAr: 'صينية أهل البيت',
    bodyAr:
      'سمّ صنفاً يكفي الأسرة واذكر عدد الأشخاص في الاسم. يقلل الأسئلة ويوضح الكمية قبل الطلب.',
    copyable: true,
  },
  {
    id: 'qr-door',
    category: 'qr',
    titleAr: 'ملصق الباب',
    bodyAr:
      'اطبع ملصق الرمز من اللوحة وثبّته على باب الاستلام أو مدخل المطبخ. أبطل الرمز من اللوحة إن تسرب وأعد توليد ملصق جديد.',
    copyable: true,
  },
  {
    id: 'qr-status',
    category: 'qr',
    titleAr: 'حالة واتساب',
    bodyAr:
      'ضع صورة الملصق في حالة واتساب مع جملة واحدة: امسح واطلب. لا ترسل الملصق جماعياً نيابة عنك من المنصة.',
    copyable: true,
  },
] as const;

export const STORE_KITCHEN_GROWTH_HUB_COPY = {
  buttonAr: 'مركز النمو والتسويق',
  titleAr: 'مركز النمو والتسويق',
  kickerAr: 'طبختنا1',
  leadAr: 'نصوص وخطط جاهزة لصاحب النشاط. انسخ وأرسل من جهازك. الزبون يبقى على صفحة الطلب.',
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
