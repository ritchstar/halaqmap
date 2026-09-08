/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة النشاط الحيّة — نصوص ومستكشفات حسب منتج المتجر.
 */
import { STORE_CAFE_LIVE_ACCENT } from '@/config/storeCafeLive';
import { STORE_GROCERS_LIVE_ACCENT } from '@/config/storeGrocersLive';
import { STORE_HALANA_LIVE_ACCENT } from '@/config/storeHalanaLive';
import { STORE_KITCHEN_LIVE_ACCENT } from '@/config/storeKitchenLive';
import { STORE_PRODUCE_LIVE_ACCENT } from '@/config/storeProduceLive';
import { STORE_RESTAURANT_LIVE_ACCENT } from '@/config/storeRestaurantLive';
import type { StoreLiveShopKind } from '@/lib/storeHostRedirect';

export type LiveActivityKind = StoreLiveShopKind | 'halana';

export type LiveActivityOccasion = {
  id: string;
  labelAr: string;
  keywords: string[];
};

export type LiveActivityProductCopy = {
  accent: string;
  statusOpenAr: string;
  statusClosedAr: string;
  statusPausedAr: string;
  browseAr: string;
  startOrderAr: string;
  stickyOrderAr: string;
  explorerTitleAr: string;
  occasions: readonly LiveActivityOccasion[];
  tabs: { home: string; order: string; about: string };
  homeFeaturedTitleAr: string;
  homeFeaturedLeadAr: string;
  orderTabTitleAr: string;
  aboutTitleAr: string;
  trustStrip: readonly string[];
  policySummary: readonly string[];
  policyFullAr: string;
  liveBannerFlashAr: (line: string) => string;
  liveBannerTodayAr: (line: string) => string;
  checkoutId: string;
};

const ALL_OCCASION: LiveActivityOccasion = { id: 'all', labelAr: 'عرض الكل', keywords: [] };

export const STORE_LIVE_ACTIVITY: Record<LiveActivityKind, LiveActivityProductCopy> = {
  halana: {
    accent: STORE_HALANA_LIVE_ACCENT,
    statusOpenAr: 'تستقبل الطلبات',
    statusClosedAr: 'متوقفة مؤقتاً',
    statusPausedAr: 'مواعيد محدودة',
    browseAr: 'استعرضي الأعمال',
    startOrderAr: 'ابدئي طلباً',
    stickyOrderAr: 'ابدئي طلباً',
    explorerTitleAr: 'وش المناسبة؟ نقرّب لك الاختيار',
    occasions: [
      ALL_OCCASION,
      { id: 'hospitality', labelAr: 'ضيافة', keywords: ['ضياف', 'قهو', 'ضيوف'] },
      { id: 'gift', labelAr: 'هدية', keywords: ['هد', 'إهد', 'تغليف'] },
      { id: 'occasion', labelAr: 'مناسبة', keywords: ['مناسب', 'عرس', 'عيد'] },
      { id: 'daily', labelAr: 'طلب يومي', keywords: ['يوم', 'سريع', 'جاهز'] },
      { id: 'custom', labelAr: 'تصميم خاص', keywords: ['خاص', 'مخص', 'تصميم'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن المتخصصة' },
    homeFeaturedTitleAr: 'مختارات اليوم',
    homeFeaturedLeadAr: 'أعمال مختارة للإلهام.',
    orderTabTitleAr: 'طلب مخصص',
    aboutTitleAr: 'عن المتخصصة',
    trustStrip: ['تنفيذ حسب الطلب', 'مراجعة قبل تثبيت الموعد', 'التواصل والدفع مع المتخصصة', 'لا عمولة على قيمة الطلب'],
    policySummary: [
      'أرسلي تفاصيل طلبك من صفحة الطلب.',
      'تراجع المتخصصة الموعد والتنفيذ.',
      'يصلك عرض السعر وطريقة التأكيد.',
      'يُثبت الموعد بعد الإجراء المعتمد لدى المتخصصة.',
    ],
    policyFullAr: 'قراءة سياسة الطلب كاملة',
    liveBannerFlashAr: (line) => `تنبيه المحل · ${line}`,
    liveBannerTodayAr: (line) => `متاح الآن · ${line}`,
    checkoutId: 'halana-checkout',
  },
  kitchen: {
    accent: STORE_KITCHEN_LIVE_ACCENT,
    statusOpenAr: 'يستقبل الطلبات',
    statusClosedAr: 'مغلق الآن — طلب مسبق',
    statusPausedAr: 'الطلبات متوقفة مؤقتاً',
    browseAr: 'تصفح القائمة',
    startOrderAr: 'ابدأ الطلب',
    stickyOrderAr: 'أكمل طلبك',
    explorerTitleAr: 'ماذا تحتاج اليوم؟',
    occasions: [
      ALL_OCCASION,
      { id: 'today', labelAr: 'وجبة اليوم', keywords: ['اليوم', 'طبق', 'وجبة'] },
      { id: 'family', labelAr: 'عشاء عائلي', keywords: ['عائ', 'عشاء', 'عائلة'] },
      { id: 'quick', labelAr: 'طلب سريع', keywords: ['سريع', 'عاجل'] },
      { id: 'prep', labelAr: 'تجهيز مسبق', keywords: ['مسبق', 'جدول', 'موعد'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن النشاط' },
    homeFeaturedTitleAr: 'الأكثر طلباً',
    homeFeaturedLeadAr: 'اختر من المختارات ثم أكمل طلبك في تبويب الطلب.',
    orderTabTitleAr: 'سلة الطلب',
    aboutTitleAr: 'عن النشاط',
    trustStrip: ['طلب من الجوال', 'توصيل أو استلام', 'الدفع مباشرة مع النشاط', 'لا عمولة على قيمة الطلب'],
    policySummary: [
      'اختر الأصناف وحدد الكمية.',
      'أدخل بيانات التواصل والاستلام.',
      'يراجع النشاط الطلب ويؤكده.',
      'الدفع حسب ما يفعّله صاحب النشاط.',
    ],
    policyFullAr: 'تفاصيل أكثر عن المحل',
    liveBannerFlashAr: (line) => `تنبيه اليوم · ${line}`,
    liveBannerTodayAr: (line) => `طبق اليوم · ${line}`,
    checkoutId: 'kitchen-checkout',
  },
  grocers: {
    accent: STORE_GROCERS_LIVE_ACCENT,
    statusOpenAr: 'مفتوح للطلب',
    statusClosedAr: 'مغلق — طلب مسبق',
    statusPausedAr: 'الطلبات متوقفة',
    browseAr: 'تصفح الأصناف',
    startOrderAr: 'ابدأ الطلب',
    stickyOrderAr: 'أكمل طلبك',
    explorerTitleAr: 'وش تحتاج للبيت؟',
    occasions: [
      ALL_OCCASION,
      { id: 'week', labelAr: 'سلة الأسبوع', keywords: ['أسبو', 'بقالة', 'منزل'] },
      { id: 'cook', labelAr: 'طبخة اليوم', keywords: ['طبخ', 'وجبة', 'عشاء'] },
      { id: 'hospitality', labelAr: 'ضيافة', keywords: ['ضياف', 'قهو', 'ضيوف'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن التموينات' },
    homeFeaturedTitleAr: 'الأكثر طلباً',
    homeFeaturedLeadAr: 'مختارات جاهزة — أكمل طلبك من تبويب الطلب.',
    orderTabTitleAr: 'سلة الطلب',
    aboutTitleAr: 'عن التموينات',
    trustStrip: ['طلب من الجوال', 'توصيل أو استلام', 'الدفع مع الكاشير', 'لا عمولة على السلة'],
    policySummary: [
      'اختر الأصناف والكميات.',
      'حدد التوصيل أو الاستلام.',
      'يراجع الكاشير الطلب.',
      'الدفع عند التسليم أو حسب تعليمات المحل.',
    ],
    policyFullAr: 'تفاصيل أكثر عن المحل',
    liveBannerFlashAr: (line) => `عرض اليوم · ${line}`,
    liveBannerTodayAr: (line) => `متوفر · ${line}`,
    checkoutId: 'grocers-checkout',
  },
  cafe: {
    accent: STORE_CAFE_LIVE_ACCENT,
    statusOpenAr: 'يستقبل الطلبات',
    statusClosedAr: 'مغلق — طلب مسبق',
    statusPausedAr: 'الطلبات متوقفة',
    browseAr: 'تصفح القائمة',
    startOrderAr: 'ابدأ الطلب',
    stickyOrderAr: 'أكمل طلبك',
    explorerTitleAr: 'وش يناسبك الآن؟',
    occasions: [
      ALL_OCCASION,
      { id: 'coffee', labelAr: 'مع القهوة', keywords: ['قهو', 'لاتيه', 'كاب'] },
      { id: 'gather', labelAr: 'جمعة', keywords: ['جمعة', 'عائ', 'ضيوف'] },
      { id: 'quick', labelAr: 'استلام سريع', keywords: ['سريع', 'استلام', 'جاهز'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن المقهى' },
    homeFeaturedTitleAr: 'صور العرض',
    homeFeaturedLeadAr: 'مشروبات وعروض مختارة — أكمل طلبك من تبويب الطلب.',
    orderTabTitleAr: 'سلة الطلب',
    aboutTitleAr: 'عن المقهى',
    trustStrip: ['طلب من الجوال', 'توصيل في الحي أو استلام', 'الدفع مع المقهى', 'لا عمولة على الطلب'],
    policySummary: [
      'اختر مشروباتك أو عروضك.',
      'حدد الاستلام أو التوصيل.',
      'يراجع الكاشير الطلب.',
      'الدفع مباشرة مع المقهى.',
    ],
    policyFullAr: 'تفاصيل أكثر عن المقهى',
    liveBannerFlashAr: (line) => `عرض اليوم · ${line}`,
    liveBannerTodayAr: (line) => `عرض اليوم · ${line}`,
    checkoutId: 'cafe-checkout',
  },
  restaurant: {
    accent: STORE_RESTAURANT_LIVE_ACCENT,
    statusOpenAr: 'يستقبل الطلبات',
    statusClosedAr: 'مغلق — طلب مسبق',
    statusPausedAr: 'الطلبات متوقفة',
    browseAr: 'تصفح القائمة',
    startOrderAr: 'ابدأ الطلب',
    stickyOrderAr: 'أكمل طلبك',
    explorerTitleAr: 'وش نوع وجبتك؟',
    occasions: [
      ALL_OCCASION,
      { id: 'solo', labelAr: 'وجبة فردية', keywords: ['فرد', 'شخص', 'غداء'] },
      { id: 'family', labelAr: 'وجبة عائلية', keywords: ['عائ', 'عائلة', 'صينية'] },
      { id: 'delivery', labelAr: 'توصيل', keywords: ['توصيل', 'delivery'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن المطعم' },
    homeFeaturedTitleAr: 'الأكثر طلباً',
    homeFeaturedLeadAr: 'أطباق مختارة — أكمل طلبك من تبويب الطلب.',
    orderTabTitleAr: 'سلة الطلب',
    aboutTitleAr: 'عن المطعم',
    trustStrip: ['طلب ضيف الحي', 'توصيل أو استلام', 'الدفع مع المطعم', 'لا عمولة على الطلب'],
    policySummary: [
      'اختر الأطباق والكميات.',
      'حدد التوصيل أو الاستلام.',
      'يراجع المطبخ الطلب.',
      'الدفع حسب تعليمات المطعم.',
    ],
    policyFullAr: 'تفاصيل أكثر عن المطعم',
    liveBannerFlashAr: (line) => `تنبيه اليوم · ${line}`,
    liveBannerTodayAr: (line) => `طبق اليوم · ${line}`,
    checkoutId: 'restaurant-checkout',
  },
  produce: {
    accent: STORE_PRODUCE_LIVE_ACCENT,
    statusOpenAr: 'مفتوح للطلب',
    statusClosedAr: 'مغلق — طلب مسبق',
    statusPausedAr: 'الطلبات متوقفة',
    browseAr: 'تصفح الأصناف',
    startOrderAr: 'ابدأ الطلب',
    stickyOrderAr: 'أكمل طلبك',
    explorerTitleAr: 'وش تحتاج للمطبخ؟',
    occasions: [
      ALL_OCCASION,
      { id: 'week', labelAr: 'سلة الأسبوع', keywords: ['أسبو', 'بيت', 'منزل'] },
      { id: 'cook', labelAr: 'طبخة اليوم', keywords: ['طبخ', 'وجبة'] },
      { id: 'fresh', labelAr: 'طازج اليوم', keywords: ['طاز', 'وصل', 'اليوم'] },
    ],
    tabs: { home: 'الرئيسية', order: 'الطلب', about: 'عن الصندوق' },
    homeFeaturedTitleAr: 'الأكثر طلباً',
    homeFeaturedLeadAr: 'خضار وفواكه مختارة — أكمل طلبك من تبويب الطلب.',
    orderTabTitleAr: 'سلة الطلب',
    aboutTitleAr: 'عن الصندوق',
    trustStrip: ['طلب من الجوال', 'توصيل أو استلام', 'الدفع مع الصندوق', 'لا عمولة على السلة'],
    policySummary: [
      'اختر الأصناف والوزن أو العدد.',
      'حدد التوصيل أو الاستلام.',
      'يراجع الصندوق الطلب.',
      'الدفع عند التسليم أو حسب تعليمات المحل.',
    ],
    policyFullAr: 'تفاصيل أكثر عن المحل',
    liveBannerFlashAr: (line) => `وصل اليوم · ${line}`,
    liveBannerTodayAr: (line) => `طازج · ${line}`,
    checkoutId: 'produce-checkout',
  },
};

export function liveActivityCopy(kind: LiveActivityKind): LiveActivityProductCopy {
  return STORE_LIVE_ACTIVITY[kind];
}
