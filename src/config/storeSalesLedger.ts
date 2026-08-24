/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد مبيعات المتجر الإلكتروني — خريطة الحل.
 * لا يُستورد من App. لا كاردي8 ولا مطعمنا1 حتى تُعتمد.
 */
export const STORE_SALES_LEDGER_PRODUCTS = [
  'wedding',
  'wedding-women',
  'event',
  'grocers',
  'lounge',
] as const;

export type StoreSalesLedgerProduct = (typeof STORE_SALES_LEDGER_PRODUCTS)[number];

export const STORE_SALES_LEDGER_COPY = {
  documentTitle: 'قيد مبيعات المتجر الإلكتروني — خريطة الحل',
  kickerAr: 'إدارة مبيعات واجهة المتجر الإلكتروني',
  titleAr: 'قيد مبيعات المتجر',
  leadAr:
    'سجل السداد لمنتجات المتجر المعروضة: افراحي1 رجالي ونسائي، اجواء1، تمويناتا1، ولاونجا1. لا تُخلط برخصة النفاذ ولا بعمولة القص.',
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
  tag: 'store_wedding_live' | 'store_event_live' | 'store_grocers_live' | 'store_lounge_live';
}[] = [
  { id: 'wedding', titleAr: 'افراحي1 رجالي', packAr: '899 ر.س مرة واحدة', tag: 'store_wedding_live' },
  { id: 'wedding-women', titleAr: 'افراحي1 نسائي', packAr: '899 ر.س مرة واحدة', tag: 'store_wedding_live' },
  { id: 'event', titleAr: 'اجواء1', packAr: '899 ر.س مرة واحدة', tag: 'store_event_live' },
  { id: 'grocers', titleAr: 'تمويناتا1', packAr: '599 أو 899 ر.س، وصندوق محادثة اختياري', tag: 'store_grocers_live' },
  { id: 'lounge', titleAr: 'لاونجا1', packAr: '600 ر.س لثلاثة أشهر', tag: 'store_lounge_live' },
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
