/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد مبيعات المتجر الإلكتروني — خريطة الحل.
 * لا يُستورد من App. لا كاردي8 ولا رخصة النفاذ.
 */
export const STORE_SALES_LEDGER_PRODUCTS = [
  'wedding',
  'wedding-women',
  'event',
  'grocers',
  'restaurant',
  'cafe',
  'kitchen',
  'produce',
  'lounge',
] as const;

export type StoreSalesLedgerProduct = (typeof STORE_SALES_LEDGER_PRODUCTS)[number];

export const STORE_SALES_LEDGER_COPY = {
  documentTitle: 'قيد مبيعات المتجر الإلكتروني — خريطة الحل',
  kickerAr: 'إدارة مبيعات واجهة المتجر الإلكتروني',
  titleAr: 'قيد مبيعات المتجر',
  leadAr:
    'سجل السداد لمنتجات المتجر المعروضة: افراحي1 رجالي ونسائي، اجواء1، تمويناتا1، مطعمنا1، كافينا1، طبختنا1، خضارنا1، ولاونجا1. لا تُخلط برخصة النفاذ ولا بعمولة القص ولا بكاردي8.',
  deniedAr: 'يلزم دخول الإدارة لفتح قيد المبيعات.',
  emptyAr: 'لا قيود في هذا الفرع بعد.',
  backAr: 'مركز المبيعات',
  dashAr: 'لوحة التحكم',
  refreshAr: 'تحديث',
  buyerAr: 'المشتري',
  subjectAr: 'الموضوع',
  packAr: 'الباقة',
  amountAr: 'المبلغ',
  statusAr: 'الحالة',
  voiceAr: 'الشق',
  paidAtAr: 'تاريخ القيد',
  paymentAr: 'معرّف الدفع',
  liveCountAr: 'ساري',
  totalAr: 'مجموع السداد',
} as const;

export const STORE_SALES_LEDGER_STATUS_AR: Record<string, string> = {
  pending_payment: 'بانتظار الدفع',
  live: 'ساري',
  expired: 'منتهٍ',
  pending_renewal: 'بانتظار التجديد',
  revoked: 'مسحوب',
};

export const STORE_SALES_LEDGER_BRANCHES: readonly {
  id: StoreSalesLedgerProduct;
  titleAr: string;
  packAr: string;
  tag:
    | 'store_wedding_live'
    | 'store_event_live'
    | 'store_grocers_live'
    | 'store_restaurant_live'
    | 'store_cafe_live'
    | 'store_kitchen_live'
    | 'store_produce_live'
    | 'store_lounge_live';
}[] = [
  { id: 'wedding', titleAr: 'افراحي1 رجالي', packAr: '899 ر.س مرة واحدة', tag: 'store_wedding_live' },
  { id: 'wedding-women', titleAr: 'افراحي1 نسائي', packAr: '899 ر.س مرة واحدة', tag: 'store_wedding_live' },
  { id: 'event', titleAr: 'اجواء1', packAr: '899 ر.س مرة واحدة', tag: 'store_event_live' },
  { id: 'grocers', titleAr: 'تمويناتا1', packAr: '599 أو 899 ر.س، وصندوق محادثة اختياري', tag: 'store_grocers_live' },
  { id: 'restaurant', titleAr: 'مطعمنا1', packAr: '699 أو 999 ر.س، وصندوق المحادثة مدرج', tag: 'store_restaurant_live' },
  { id: 'cafe', titleAr: 'كافينا1', packAr: '1199 أو 2099 ر.س، وصندوق المحادثة مدرج', tag: 'store_cafe_live' },
  { id: 'kitchen', titleAr: 'طبختنا1', packAr: '300 ر.س لمئة وثمانين يوماً أو 600 ر.س لثلاثمئة وستين يوماً', tag: 'store_kitchen_live' },
  { id: 'produce', titleAr: 'خضارنا1', packAr: '1350 ر.س لمئة وثمانين يوماً أو 2500 ر.س لثلاثمئة وستين يوماً', tag: 'store_produce_live' },
  { id: 'lounge', titleAr: 'لاونجا1', packAr: '600 أو 1200 أو 2400 ر.س', tag: 'store_lounge_live' },
];

export function isStoreSalesLedgerProduct(raw: string): raw is StoreSalesLedgerProduct {
  return (STORE_SALES_LEDGER_PRODUCTS as readonly string[]).includes(raw);
}

export function storeSalesLedgerBranch(id: StoreSalesLedgerProduct) {
  return STORE_SALES_LEDGER_BRANCHES.find((item) => item.id === id) || STORE_SALES_LEDGER_BRANCHES[0];
}

export function storeSalesSarFromHalalas(halalas: number): number {
  return Math.round(Number(halalas || 0) / 100);
}

export function storeSalesVoiceAr(voice: string): string {
  return voice === 'women' ? 'نسائي' : voice === 'men' ? 'رجالي' : '—';
}
