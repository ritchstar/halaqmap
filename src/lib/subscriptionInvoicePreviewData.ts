import { addMonths, format, subDays } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { SubscriptionTier } from '@/lib/index';
import {
  BANK_TRANSFER_PREPAID_MONTHS,
  BANK_TRANSFER_PROMO_BONUS_MONTHS,
  getBankTransferCoveredMonths,
  getBankTransferPayableAmountSar,
  getBankTransferPeriodGrossSar,
  isBankTransferPromoActive,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';

export type InvoicePreviewLine = {
  descriptionAr: string;
  descriptionEn: string;
  quantity: number;
  unitSar: number;
  lineTotalSar: number;
};

export type SubscriptionInvoicePreviewPayload = {
  variant: 'bank_transfer_six_month' | 'monthly_subscription';
  invoiceNo: string;
  issueDate: Date;
  issueIso: string;
  issueArLong: string;
  billTo: {
    nameAr: string;
    nameEn: string;
    districtAr: string;
    cityCountryAr: string;
    cityCountryEn: string;
    email: string;
  };
  invoiceTypeAr: string;
  invoiceTypeEn: string;
  lines: InvoicePreviewLine[];
  subtotalSar: number;
  totalSar: number;
  coverageStartIso?: string;
  coverageEndIso?: string;
  coverageNoteAr?: string;
  coverageNoteEn?: string;
  servicePeriodStartIso?: string;
  servicePeriodEndIso?: string;
  nextRenewalIso?: string;
  nextRenewalNoteAr?: string;
  nextRenewalNoteEn?: string;
  notesAr: string[];
  notesEn: string[];
  watermarkAr: string;
  watermarkEn: string;
};

const SAMPLE_EMAIL = 'ritchstar4@gmail.com';

function formatGregorianAr(d: Date): string {
  return format(d, 'd MMMM yyyy', { locale: arSA });
}

function formatIsoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** نماذج معاينة — تاريخ الإصدار = اليوم (أو المُمرَّر) لحساب المدد بدقة */
export function buildBankTransferSixMonthPreview(issueDate: Date = new Date()): SubscriptionInvoicePreviewPayload {
  const tier = SubscriptionTier.DIAMOND;
  const ts = issueDate.getTime();
  const gross = getBankTransferPeriodGrossSar(tier);
  const total = getBankTransferPayableAmountSar(tier, ts);
  const covered = getBankTransferCoveredMonths(ts);
  const promo = isBankTransferPromoActive(ts);
  const coverageEnd = subDays(addMonths(issueDate, covered), 1);

  const descAr = promo
    ? `ترخيص إدراج رقمي — باقة ماسي، تحويل بنكي (${BANK_TRANSFER_PREPAID_MONTHS} أشهر مقدماً). العرض التشغيلي: خصم 10% على إجمالي ${gross.toLocaleString('en-US')} ر.س + ${BANK_TRANSFER_PROMO_BONUS_MONTHS} أشهر صلاحية إضافية (إجمالي ${covered} أشهر).`
    : `ترخيص إدراج رقمي — باقة ماسي، تحويل بنكي (${BANK_TRANSFER_PREPAID_MONTHS} أشهر مقدماً).`;

  const descEn = promo
    ? `Diamond plan — Bank transfer (${BANK_TRANSFER_PREPAID_MONTHS} months prepaid). Promo: 10% off SAR ${gross.toLocaleString('en-US')} gross + ${BANK_TRANSFER_PROMO_BONUS_MONTHS} complimentary months (${covered} months total access).`
    : `Diamond plan — Bank transfer (${BANK_TRANSFER_PREPAID_MONTHS} months prepaid).`;

  const lines: InvoicePreviewLine[] = [
    {
      descriptionAr: descAr,
      descriptionEn: descEn,
      quantity: 1,
      unitSar: total,
      lineTotalSar: total,
    },
  ];

  const invSuffix = format(issueDate, 'yyyyMMdd');
  return {
    variant: 'bank_transfer_six_month',
    invoiceNo: `HM-INV-PREVIEW-BT-${invSuffix}-001`,
    issueDate,
    issueIso: formatIsoDate(issueDate),
    issueArLong: formatGregorianAr(issueDate),
    billTo: {
      nameAr: 'صالون الوشام',
      nameEn: 'Salon Al-Washam',
      districtAr: 'حي الوشام',
      cityCountryAr: 'الرياض، المملكة العربية السعودية',
      cityCountryEn: 'Riyadh, Kingdom of Saudi Arabia',
      email: SAMPLE_EMAIL,
    },
    invoiceTypeAr: 'تحويل بنكي — ترخيص إدراج 6 أشهر',
    invoiceTypeEn: 'Bank transfer — 6-month listing license',
    lines,
    subtotalSar: total,
    totalSar: total,
    coverageStartIso: formatIsoDate(issueDate),
    coverageEndIso: formatIsoDate(coverageEnd),
    coverageNoteAr: `فترة الصلاحية المعروضة على الفاتورة: من ${formatGregorianAr(issueDate)} إلى ${formatGregorianAr(coverageEnd)} (${covered} شهراً).`,
    coverageNoteEn: `Access period shown: ${formatIsoDate(issueDate)} through ${formatIsoDate(coverageEnd)} (${covered} months).`,
    notesAr: [
      'هذه فاتورة معاينة فقط — لا تُستخدم للسداد الضريبي أو كإثبات رسمي.',
      promo
        ? `العرض التشغيلي مفعّل وفق إعدادات المنصة الحالية (ينتهي تلقائياً بعد تاريخ نهاية العرض).`
        : 'لا يوجد عرض تشغيلي على هذا النموذج (تاريخ الإصدار خارج نافذة العرض).',
    ],
    notesEn: [
      'Preview sample only — not for tax filing or formal evidence.',
      promo
        ? 'Operational promo is active per current platform settings (ends per configured promo end date).'
        : 'No operational promo on this sample (issue date outside promo window).',
    ],
    watermarkAr: 'معاينة',
    watermarkEn: 'PREVIEW',
  };
}

export function buildMonthlySubscriptionPreview(issueDate: Date = new Date()): SubscriptionInvoicePreviewPayload {
  const tier = SubscriptionTier.DIAMOND;
  const monthly = TIER_MONTHLY_SAR[tier];
  const periodEnd = subDays(addMonths(issueDate, 1), 1);
  const nextRenewal = addMonths(issueDate, 1);

  const lines: InvoicePreviewLine[] = [
    {
      descriptionAr: `ترخيص إدراج رقمي — باقة ماسي (30 يوم صلاحية). السعر المعتمد حالياً على المنصة.`,
      descriptionEn: `Digital listing license — Diamond plan (30-day validity). Current rate per platform.`,
      quantity: 1,
      unitSar: monthly,
      lineTotalSar: monthly,
    },
  ];

  const invSuffix = format(issueDate, 'yyyyMMdd');
  return {
    variant: 'monthly_subscription',
    invoiceNo: `HM-INV-PREVIEW-MO-${invSuffix}-001`,
    issueDate,
    issueIso: formatIsoDate(issueDate),
    issueArLong: formatGregorianAr(issueDate),
    billTo: {
      nameAr: 'صالون الوشام',
      nameEn: 'Salon Al-Washam',
      districtAr: 'حي الوشام',
      cityCountryAr: 'الرياض، المملكة العربية السعودية',
      cityCountryEn: 'Riyadh, Kingdom of Saudi Arabia',
      email: SAMPLE_EMAIL,
    },
    invoiceTypeAr: 'ترخيص رقمي 30 يوم — بطاقة / بوابة دفع',
    invoiceTypeEn: '30-day digital license — Card / payment gateway',
    lines,
    subtotalSar: monthly,
    totalSar: monthly,
    servicePeriodStartIso: formatIsoDate(issueDate),
    servicePeriodEndIso: formatIsoDate(periodEnd),
    nextRenewalIso: formatIsoDate(nextRenewal),
    nextRenewalNoteAr: `تاريخ التجديد المتوقع للدورة التالية: ${formatGregorianAr(nextRenewal)} (${formatIsoDate(nextRenewal)}).`,
    nextRenewalNoteEn: `Next cycle renewal date: ${formatIsoDate(nextRenewal)}.`,
    notesAr: [
      'هذه فاتورة معاينة فقط — لا تُستخدم للسداد الضريبي أو كإثبات رسمي.',
      'يُستكمل شراء الترخيص عبر بوابة الدفع المعتمدة؛ تُحدَّث الفواتير الفعلية تلقائياً عند تفعيل النظام.',
    ],
    notesEn: [
      'Preview sample only — not for tax filing or formal evidence.',
      'Recurring monthly billing continues via the authorized payment gateway; live invoices will be generated when billing is enabled.',
    ],
    watermarkAr: 'معاينة',
    watermarkEn: 'PREVIEW',
  };
}
