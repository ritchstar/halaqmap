/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تسويق بالعمولة لمنتجات المتجر — لا يُستورد من App.
 * العمولة مبلغ ثابت يُقتطع من حصة المنصة بعد سداد ميسر، لا من سلة جار الحي.
 * كاردي8 خارج هذا المسار.
 */
export const STORE_AFFILIATE_PUBLIC_ENABLED = true;

export const STORE_AFFILIATE_HUB_TITLE_AR = 'بوابة مسوّقي منتجات المتجر — خريطة الحل';

export const STORE_AFFILIATE_GROUP_NAME_AR = 'المجموعة التسويقية للمتجر الإلكتروني';

export type StoreAffiliateLane = 'halaq' | 'coiffeur' | 'store';

/** بوابات مستقلة — ليست تبويبات داخل صفحة واحدة */
export const STORE_AFFILIATE_LANES = [
  { id: 'halaq' as const, titleAr: 'مسوّقو حلاق ماب', pathAr: '/ambassadors' },
  { id: 'coiffeur' as const, titleAr: 'مسوّقات كوافير ماب', pathAr: '/coiffeur/ambassadors' },
  { id: 'store' as const, titleAr: 'مسوّقو منتجات المتجر', pathAr: '/store/affiliates' },
] as const;

export const STORE_AFFILIATE_COPY = {
  documentTitle: 'بوابة مسوّقي منتجات المتجر — خريطة الحل',
  kickerAr: 'المجموعة التسويقية للمتجر الإلكتروني',
  titleAr: STORE_AFFILIATE_HUB_TITLE_AR,
  leadAr:
    'هذه البوابة لمسوّقي ومسوّقات منتجات المتجر فقط. لا استهداف صالونات، ولا فنادق وشقق مخدومة، ولا رخصة نفاذ. سفراء حلاق ماب ومسوّقات كوافير ماب لهما بوابتان مستقلتان.',
  tableTitleAr: 'طاولة التعليمات',
  homeApplyCtaAr: 'قدّم طلب الانضمام',
  homeDeskCtaAr: 'دخول اللوحة',
  homeRulesCtaAr: 'وثيقة القواعد',
  nameLabelAr: 'الاسم الظاهر',
  emailLabelAr: 'الإيميل',
  phoneLabelAr: 'الجوال',
  cityLabelAr: 'المدينة أو النطاق الذي ستسوّق فيه',
  channelLabelAr: 'كيف ستسوّق منتجات المتجر؟',
  experienceLabelAr: 'خبرتك أو استعدادك',
  rulesAcceptAr: 'قرأت وأوافق على وثيقة قواعد مسوّقي المتجر',
  alreadyApprovedAr: 'هذا الإيميل معتمد مسبقاً. اطلب رابط الدخول من اللوحة.',
  outboundHalaqAr: 'سفراء حلاق ماب',
  outboundCoiffeurAr: 'مسوّقات كوافير ماب',
  storeLeadAr:
    'عمولة ثابتة تُقتطع من حصة المنصة بعد كل عملية دفع ناجحة تصل من رابط المسوّق أو المسوّقة. كل عملية شراء جديدة تُقيَّد بعمولة المنتج المشترى، ولا يتوقف المسار بعد أول بيع. الزبون يدفع السعر كاملاً. لا كاردي8، ولا علاقة بطلب جار الحي نقداً أو شبكة عند الباب.',
  storeOngoingAr:
    'كل فاتورة جديدة من رابطك لها عمولة ذلك المنتج. إعادة شراء لاونجا1 أو تمويناتا1 أو مطعمنا1 أو كافينا1 أو طبختنا1 من الرابط تُحسب أيضاً.',
  isolationAr:
    'لا تخلط هذا المسار بطلب استهداف حلاق أو شقق مخدومة. تلك أدوات سفراء حلاق ماب ومسوّقات كوافير ماب فقط.',
  reviewLeadAr:
    'لا تفعيل فوري. تُجمع بيانات أساسية، ثم تقيّم الإدارة الطلب: موافقة أو اعتذار. بعد الموافقة يُفتح الدخول برابط سري على الإيميل.',
  applyTitleAr: 'طلب الانضمام والمراجعة المبدئية',
  applyCtaAr: 'إرسال الطلب لمراجعة الإدارة',
  applySentAr: 'وصل الطلب. حالتك قيد المراجعة. لا لوحة ولا روابط شراء قبل الموافقة.',
  deskGateAr: 'الدخول للوحة بعد موافقة الإدارة فقط.',
  storeLoginTitleAr: 'دخول اللوحة',
  storeLoginLeadAr: 'الإيميل مرتكز التحقق. اطلب رابطاً سرياً يصل إلى صندوقك ثم افتح اللوحة منه.',
  storeLoginPlaceholderAr: 'name@example.com',
  storeLoginCtaAr: 'أرسل رابط دخول جديد',
  storeLoginHintAr: 'يصل الرابط السري إلى إيميلك ويبقى صالحاً أربعاً وعشرين ساعة. افتحه من جهازك. كل شراء جديد من روابطك يُقيَّد بعمولة ذلك المنتج.',
  storeLoginSentAr: 'إن كان الإيميل صالحاً سيصل الرابط السري الآن.',
  deskTitleAr: 'لوحة المسوّق أو المسوّقة',
  deskLinksTitleAr: 'روابط الشراء باسمك',
  deskLinksHintAr: 'اضغط أيقونة المنتج لنسخ رابط الشراء باسمك. المتجر يصدر المسارات أيقونات تشغيل جاهزة.',
  deskLinkCopiedAr: 'نُسخ رابط المنتج.',
  deskLedgerTitleAr: 'قيد العمولة',
  deskEmptyAr: 'لا قيد بعد. كل عملية دفع ناجحة من رابطك تُسجَّل هنا.',
  deskLogoutAr: 'خروج',
  lineLabelAr: {
    wedding: 'افراحي1',
    event: 'اجواء1',
    lounge: 'لاونجا1 ثلاثة أشهر',
    lounge_6: 'لاونجا1 ستة أشهر',
    lounge_12: 'لاونجا1 اثنا عشر شهراً',
    grocers_6: 'تمويناتا1 ستة أشهر',
    grocers_12: 'تمويناتا1 اثنا عشر شهراً',
    grocers_chat_6: 'تمويناتا1 ستة أشهر مع صندوق المحادثة',
    grocers_chat_12: 'تمويناتا1 اثنا عشر شهراً مع صندوق المحادثة',
    grocers_mobile_6: 'تمويناتا1 متحرك مئة وثمانون يوماً',
    grocers_mobile_12: 'تمويناتا1 متحرك ثلاثمئة وخمسة وستون يوماً',
    restaurant_6: 'مطعمنا1 ستة أشهر',
    restaurant_12: 'مطعمنا1 اثنا عشر شهراً',
    restaurant_mobile_6: 'مطعمنا1 متحرك مئة وثمانون يوماً',
    restaurant_mobile_12: 'مطعمنا1 متحرك ثلاثمئة وخمسة وستون يوماً',
    cafe_6: 'كافينا1 ستة أشهر',
    cafe_12: 'كافينا1 اثنا عشر شهراً',
    cafe_mobile_6: 'كافينا1 متحرك مئة وثمانون يوماً',
    cafe_mobile_12: 'كافينا1 متحرك ثلاثمئة وخمسة وستون يوماً',
    kitchen_6: 'طبختنا1 مئة وثمانون يوماً',
    kitchen_12: 'طبختنا1 ثلاثمئة وستون يوماً',
  },
  deskLinkAr: {
    wedding: 'افراحي1',
    event: 'اجواء1',
    lounge: 'لاونجا1',
    grocers: 'تمويناتا1',
    restaurant: 'مطعمنا1',
    cafe: 'كافينا1',
    kitchen: 'طبختنا1',
  },
  netLabelAr: 'صافي المنصة',
  commissionLabelAr: 'عمولة المسوّق أو المسوّقة',
  priceLabelAr: 'سعر المنتج',
} as const;

export type StoreAffiliateLineId =
  | 'wedding'
  | 'event'
  | 'lounge'
  | 'lounge_6'
  | 'lounge_12'
  | 'grocers_6'
  | 'grocers_12'
  | 'grocers_chat_6'
  | 'grocers_chat_12'
  | 'grocers_mobile_6'
  | 'grocers_mobile_12'
  | 'restaurant_6'
  | 'restaurant_12'
  | 'restaurant_mobile_6'
  | 'restaurant_mobile_12'
  | 'cafe_6'
  | 'cafe_12'
  | 'cafe_mobile_6'
  | 'cafe_mobile_12'
  | 'kitchen_6'
  | 'kitchen_12';

export type StoreAffiliateLine = {
  id: StoreAffiliateLineId;
  productTag: 'store_wedding_live' | 'store_event_live' | 'store_lounge_live' | 'store_grocers_live' | 'store_restaurant_live' | 'store_cafe_live' | 'store_kitchen_live';
  titleAr: string;
  packAr: string;
  priceSar: number;
  commissionSar: number;
};

export const STORE_AFFILIATE_LINES: readonly StoreAffiliateLine[] = [
  {
    id: 'wedding',
    productTag: 'store_wedding_live',
    titleAr: 'افراحي1',
    packAr: 'شراء مرة واحدة',
    priceSar: 899,
    commissionSar: 99,
  },
  {
    id: 'event',
    productTag: 'store_event_live',
    titleAr: 'اجواء1',
    packAr: 'شراء مرة واحدة',
    priceSar: 899,
    commissionSar: 99,
  },
  {
    id: 'lounge',
    productTag: 'store_lounge_live',
    titleAr: 'لاونجا1',
    packAr: 'ثلاثة أشهر',
    priceSar: 600,
    commissionSar: 100,
  },
  {
    id: 'lounge_6',
    productTag: 'store_lounge_live',
    titleAr: 'لاونجا1',
    packAr: 'ستة أشهر',
    priceSar: 1200,
    commissionSar: 200,
  },
  {
    id: 'lounge_12',
    productTag: 'store_lounge_live',
    titleAr: 'لاونجا1',
    packAr: 'اثنا عشر شهراً',
    priceSar: 2400,
    commissionSar: 400,
  },
  {
    id: 'grocers_6',
    productTag: 'store_grocers_live',
    titleAr: 'تمويناتا1',
    packAr: 'ستة أشهر',
    priceSar: 599,
    commissionSar: 99,
  },
  {
    id: 'grocers_12',
    productTag: 'store_grocers_live',
    titleAr: 'تمويناتا1',
    packAr: 'اثنا عشر شهراً',
    priceSar: 899,
    commissionSar: 199,
  },
  {
    id: 'grocers_chat_6',
    productTag: 'store_grocers_live',
    titleAr: 'إضافة تمويناتا1',
    packAr: 'صندوق محادثة جار الحي لستة أشهر',
    priceSar: 299,
    commissionSar: 98,
  },
  {
    id: 'grocers_chat_12',
    productTag: 'store_grocers_live',
    titleAr: 'إضافة تمويناتا1',
    packAr: 'صندوق محادثة جار الحي لاثني عشر شهراً',
    priceSar: 499,
    commissionSar: 199,
  },
  {
    id: 'grocers_mobile_6',
    productTag: 'store_grocers_live',
    titleAr: 'تمويناتا1',
    packAr: 'متحرك، مئة وثمانون يوماً',
    priceSar: 799,
    commissionSar: 99,
  },
  {
    id: 'grocers_mobile_12',
    productTag: 'store_grocers_live',
    titleAr: 'تمويناتا1',
    packAr: 'متحرك، ثلاثمئة وخمسة وستون يوماً',
    priceSar: 1250,
    commissionSar: 250,
  },
  {
    id: 'restaurant_6',
    productTag: 'store_restaurant_live',
    titleAr: 'مطعمنا1',
    packAr: 'ستة أشهر، صندوق المحادثة مدرج',
    priceSar: 699,
    commissionSar: 99,
  },
  {
    id: 'restaurant_12',
    productTag: 'store_restaurant_live',
    titleAr: 'مطعمنا1',
    packAr: 'اثنا عشر شهراً، صندوق المحادثة مدرج',
    priceSar: 999,
    commissionSar: 199,
  },
  {
    id: 'restaurant_mobile_6',
    productTag: 'store_restaurant_live',
    titleAr: 'مطعمنا1',
    packAr: 'متحرك، مئة وثمانون يوماً، صندوق المحادثة مدرج',
    priceSar: 799,
    commissionSar: 99,
  },
  {
    id: 'restaurant_mobile_12',
    productTag: 'store_restaurant_live',
    titleAr: 'مطعمنا1',
    packAr: 'متحرك، ثلاثمئة وخمسة وستون يوماً، صندوق المحادثة مدرج',
    priceSar: 1250,
    commissionSar: 250,
  },
  {
    id: 'cafe_6',
    productTag: 'store_cafe_live',
    titleAr: 'كافينا1',
    packAr: 'ستة أشهر، صندوق المحادثة مدرج',
    priceSar: 1199,
    commissionSar: 199,
  },
  {
    id: 'cafe_12',
    productTag: 'store_cafe_live',
    titleAr: 'كافينا1',
    packAr: 'اثنا عشر شهراً، صندوق المحادثة مدرج',
    priceSar: 2099,
    commissionSar: 499,
  },
  {
    id: 'cafe_mobile_6',
    productTag: 'store_cafe_live',
    titleAr: 'كافينا1',
    packAr: 'متحرك، مئة وثمانون يوماً، صندوق المحادثة مدرج',
    priceSar: 799,
    commissionSar: 99,
  },
  {
    id: 'cafe_mobile_12',
    productTag: 'store_cafe_live',
    titleAr: 'كافينا1',
    packAr: 'متحرك، ثلاثمئة وخمسة وستون يوماً، صندوق المحادثة مدرج',
    priceSar: 1250,
    commissionSar: 250,
  },
  {
    id: 'kitchen_6',
    productTag: 'store_kitchen_live',
    titleAr: 'طبختنا1',
    packAr: 'مئة وثمانون يوماً',
    priceSar: 300,
    commissionSar: 100,
  },
  {
    id: 'kitchen_12',
    productTag: 'store_kitchen_live',
    titleAr: 'طبختنا1',
    packAr: 'ثلاثمئة وستون يوماً',
    priceSar: 600,
    commissionSar: 200,
  },
] as const;

export function affiliateNetSar(priceSar: number, commissionSar: number): number {
  return Math.max(0, priceSar - commissionSar);
}

export function grocersAffiliateCommissionSar(
  packId: 'm6' | 'm12',
  chatAddon: boolean,
  vendorMode: 'fixed' | 'mobile' = 'fixed',
): number {
  if (vendorMode === 'mobile') return packId === 'm12' ? 250 : 99;
  const pack = packId === 'm12' ? 199 : 99;
  const chat = chatAddon ? (packId === 'm12' ? 199 : 98) : 0;
  return pack + chat;
}

export function restaurantAffiliateCommissionSar(
  packId: 'm6' | 'm12',
  vendorMode: 'fixed' | 'mobile' = 'fixed',
): number {
  if (vendorMode === 'mobile') return packId === 'm12' ? 250 : 99;
  return packId === 'm12' ? 199 : 99;
}

export function cafeAffiliateCommissionSar(
  packId: 'm6' | 'm12',
  vendorMode: 'fixed' | 'mobile' = 'fixed',
): number {
  if (vendorMode === 'mobile') return packId === 'm12' ? 250 : 99;
  return packId === 'm12' ? 499 : 199;
}

export function kitchenAffiliateCommissionSar(packId: 'm6' | 'm12'): number {
  return packId === 'm12' ? 200 : 100;
}

export function parseAffiliateLane(raw: string | null | undefined): StoreAffiliateLane {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'coiffeur' || value === 'store') return value;
  return 'halaq';
}

export const STORE_AFFILIATE_RULES_VERSION = '2026-08-24';

export const STORE_AFFILIATE_RULES_SECTIONS = [
  {
    id: 'scope',
    titleAr: 'النطاق',
    bodyAr:
      'البوابة تخص بيع منتجات المتجر الإلكتروني عبر رابطك. العمولة من حصة المنصة بعد كل عملية دفع ناجحة. ليست عمولة على خدمة حلاق أو كوافير، وليست مسار استهداف ميداني.',
  },
  {
    id: 'review',
    titleAr: 'المراجعة والانضباط',
    bodyAr:
      'يُنشأ الحساب بعد تقييم مبدئي من الإدارة. الموافقة تفتح اللوحة. الاعتذار يغلق الطلب. الإدارة تعيد التقييم لاحقاً وفق الأداء والانضباط.',
  },
  {
    id: 'forbidden',
    titleAr: 'المحظور',
    bodyAr:
      'ممنوع استهداف صالون أو شقق مخدومة من هذه البوابة. ممنوع كاردي8. ممنوع خلط رخصة النفاذ أو محفظة الحلاق أو سلة جار الحي أو تحصيل طلب ضيف الحي عبر بوابة الدفع.',
  },
  {
    id: 'pay',
    titleAr: 'القيد',
    bodyAr:
      'كل عملية دفع ناجحة من رابطك تُقيَّد مرة واحدة على معرّف الدفع. التجديد من الرابط يُحسب. الدخول بعد الموافقة برابط سري على الإيميل.',
  },
] as const;
