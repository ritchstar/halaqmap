/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تسويق بالعمولة لمنتجات المتجر — لا يُستورد من App.
 * العمولة مبلغ ثابت يُقتطع من حصة المنصة بعد سداد ميسر، لا من سلة جار الحي.
 * كاردي8 خارج هذا المسار.
 */
export const STORE_AFFILIATE_PUBLIC_ENABLED = true;

export const STORE_AFFILIATE_HUB_TITLE_AR = 'واجهة التسويق بالعمولة لمنتجات خريطة الحل';

export const STORE_AFFILIATE_GROUP_NAME_AR = 'المجموعة التسويقية لخريطة الحل';

export type StoreAffiliateLane = 'halaq' | 'coiffeur' | 'store';

export const STORE_AFFILIATE_LANES = [
  { id: 'halaq' as const, titleAr: 'مسوّقو حلاق ماب' },
  { id: 'coiffeur' as const, titleAr: 'مسوّقات كوافير ماب' },
  { id: 'store' as const, titleAr: 'مسوّقو منتجات المتجر' },
] as const;

export const STORE_AFFILIATE_COPY = {
  documentTitle: 'واجهة التسويق بالعمولة — خريطة الحل',
  kickerAr: 'تسويق بالعمولة',
  titleAr: STORE_AFFILIATE_HUB_TITLE_AR,
  leadAr:
    'للمسوّق والمسوّقة. ثلاثة مسارات في صفحة واحدة: حلاق ماب، كوافير ماب، ومنتجات المتجر الإلكتروني. المجموعة واحدة: المجموعة التسويقية لخريطة الحل.',
  storeLeadAr:
    'عمولة ثابتة تُقتطع من حصة المنصة بعد سداد فاتورة ميسر عبر رابط المسوّق أو المسوّقة. ما يصل المنصة هو سعر المنتج مخصوماً منه العمولة، ثم تُقيَّد في اللوحة آلياً. لا كاردي8، ولا علاقة بطلب جار الحي نقداً أو شبكة عند الباب.',
  storeLoginTitleAr: 'دخول اللوحة',
  storeLoginLeadAr: 'الإيميل مرتكز التحقق. اطلب رابطاً سرياً يصل إلى صندوقك ثم افتح اللوحة منه.',
  storeLoginPlaceholderAr: 'name@example.com',
  storeLoginCtaAr: 'أرسل رابط دخول جديد',
  storeLoginHintAr: 'إرسال الرابط السري وربط فاتورة ميسر باللوحة يُفعَّلان بعد اعتماد طبقة الحسابات. لا تفعيل فوري قبل ذلك.',
  netLabelAr: 'صافي المنصة',
  commissionLabelAr: 'عمولة المسوّق أو المسوّقة',
  priceLabelAr: 'سعر المنتج',
} as const;

export type StoreAffiliateLineId =
  | 'wedding'
  | 'event'
  | 'lounge'
  | 'grocers_6'
  | 'grocers_12'
  | 'grocers_chat_6'
  | 'grocers_chat_12';

export type StoreAffiliateLine = {
  id: StoreAffiliateLineId;
  productTag: 'store_wedding_live' | 'store_event_live' | 'store_lounge_live' | 'store_grocers_live';
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
] as const;

export function affiliateNetSar(priceSar: number, commissionSar: number): number {
  return Math.max(0, priceSar - commissionSar);
}

export function grocersAffiliateCommissionSar(packId: 'm6' | 'm12', chatAddon: boolean): number {
  const pack = packId === 'm12' ? 199 : 99;
  const chat = chatAddon ? (packId === 'm12' ? 199 : 98) : 0;
  return pack + chat;
}

export function parseAffiliateLane(raw: string | null | undefined): StoreAffiliateLane {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'coiffeur' || value === 'store') return value;
  return 'halaq';
}
