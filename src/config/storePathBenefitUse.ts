/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * «كيف تستفيد» و«ماذا تحصل عليه عند البدء» — خطوة وعنصر فقط إذا ثبتا في الكود.
 * لا قالب موحّد يُلصق على كل المنتجات.
 */
export const PATH_BENEFIT_FIXED_STEPS = [
  'اختر المنتج الأقرب لمهنتك.',
  'فعّل صفحة نشاطك وأدخل بياناتك.',
  'اعرض خدماتك أو منتجاتك بطريقة واضحة.',
] as const;

export const PATH_BENEFIT_CLOSING_STEP = 'قد تشغيل المنتج بطريقتك.';

/** يظهر فقط مع منتج يملك رابط مشاركة أو رمزاً مثبتاً. */
export const PATH_RETURN_FACILITATION_AR =
  'عندما يملك المنتج رابطاً أو رمز مشاركة، نوضح للمشغّل كيف يستخدمهما لتسهيل عودة العميل إلى صفحته. لا نعد بعودة العميل، ولا نصف وسيلة غير موجودة فعلياً.';

const QR_SHARE_STEP = 'شارك الرابط والرمز مع عملائك';
const HALL_INVITE_STEP = 'شارك رابط الدعوة، وستظهر تهاني ضيوفك على شاشة القاعة';
const LOUNGE_STEP = 'فعّل شاشات اللاونج وأدر محتواها لضيوفك';
const CARD_STEP = 'شارك بطاقتك عبر رابط مباشر لمن تريد تهنئته';
const INQUIRY_STEP = 'تظهر لعميلك عند استعلامه القريب، ويصله إليك مباشرة';

/**
 * الخطوة الرابعة.
 * رمز المشاركة: StoreLiveShopShareDesk لطلب الحي، وStoreHalanaShareDesk لحلانا1.
 * أفراحي1 وأجواء1: نموذج ضيف وتهانٍ على شاشة القاعة.
 * لاونجا1: شاشات اللاونج. كاردي8: رابط مشاركة البطاقة.
 * حلاق ماب وكوافير ماب: استعلام قريب.
 */
const STEP_FOUR_BY_CODE: Record<string, string> = {
  'B-01': QR_SHARE_STEP,
  'B-02': QR_SHARE_STEP,
  'B-03': QR_SHARE_STEP,
  'B-04': QR_SHARE_STEP,
  'B-05': QR_SHARE_STEP,
  'B-06': QR_SHARE_STEP,
  'C-01': QR_SHARE_STEP,
  'C-02': QR_SHARE_STEP,
  'D-02': HALL_INVITE_STEP,
  'D-03': HALL_INVITE_STEP,
  'D-01': LOUNGE_STEP,
  'E-01': CARD_STEP,
  'A-01': INQUIRY_STEP,
  'A-02': INQUIRY_STEP,
};

const PAGE = 'صفحة نشاط';
const OFFER = 'عرض أصناف أو خدمات';
const LINK_AND_QR = 'رابط ورمز مشاركة';
const LINK = 'رابط مشاركة';
const DESK = 'لوحة تشغيل';
const SCREEN = 'شاشة أو تجربة مناسبة';

const ORDER_SHOP_GAINS = [PAGE, OFFER, LINK_AND_QR, DESK] as const;
const HALL_GAINS = [SCREEN, LINK, DESK] as const;
const LOUNGE_GAINS = [SCREEN, LINK, DESK] as const;

const START_GAINS_BY_CODE: Record<string, readonly string[]> = {
  'B-01': ORDER_SHOP_GAINS,
  'B-02': ORDER_SHOP_GAINS,
  'B-03': ORDER_SHOP_GAINS,
  'B-04': ORDER_SHOP_GAINS,
  'B-05': ORDER_SHOP_GAINS,
  'B-06': ORDER_SHOP_GAINS,
  'C-01': ORDER_SHOP_GAINS,
  'C-02': ORDER_SHOP_GAINS,
  'D-01': LOUNGE_GAINS,
  'D-02': HALL_GAINS,
  'D-03': HALL_GAINS,
  'E-01': [LINK],
  'A-01': [PAGE],
  'A-02': [PAGE],
};

const RETURN_CODES = new Set([
  'B-01',
  'B-02',
  'B-03',
  'B-04',
  'B-05',
  'B-06',
  'C-01',
  'C-02',
  'D-01',
  'D-02',
  'D-03',
  'E-01',
]);

export function pathBenefitStepFour(code: string): string | undefined {
  return STEP_FOUR_BY_CODE[code];
}

export function pathStartGains(code: string): readonly string[] {
  return START_GAINS_BY_CODE[code] ?? [];
}

export function pathShowsReturnFacilitation(code: string): boolean {
  return RETURN_CODES.has(code);
}
