import { addMonths, format, subDays } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { SubscriptionTier } from '@/lib/index';
import {
  INVOICE_PRODUCT_DESCRIPTION_EN,
  invoiceDiamondLicenseLabelAr,
  invoiceLineDescriptionAr,
  invoiceLineDescriptionEn,
} from '@/config/softwareLicenseTerminology';
import { TIER_MONTHLY_SAR } from '@/config/subscriptionPricing';

export type InvoicePreviewLine = {
  descriptionAr: string;
  descriptionEn: string;
  quantity: number;
  unitSar: number;
  lineTotalSar: number;
};

export type SubscriptionInvoicePreviewPayload = {
  variant: 'monthly_subscription';
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
  servicePeriodStartIso?: string;
  servicePeriodEndIso?: string;
  coverageNoteAr?: string;
  coverageNoteEn?: string;
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

export function buildMonthlySubscriptionPreview(issueDate: Date = new Date()): SubscriptionInvoicePreviewPayload {
  const tier = SubscriptionTier.DIAMOND;
  const monthly = TIER_MONTHLY_SAR[tier];
  const periodEnd = subDays(addMonths(issueDate, 1), 1);
  const nextRenewal = addMonths(issueDate, 1);

  const lines: InvoicePreviewLine[] = [
    {
      descriptionAr: invoiceLineDescriptionAr(invoiceDiamondLicenseLabelAr()),
      descriptionEn: invoiceLineDescriptionEn('Diamond — 30 days'),
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
    invoiceTypeAr: 'تفعيل الحزمة البرمجية — 30 يوم',
    invoiceTypeEn: INVOICE_PRODUCT_DESCRIPTION_EN,
    lines,
    subtotalSar: monthly,
    totalSar: monthly,
    servicePeriodStartIso: formatIsoDate(issueDate),
    servicePeriodEndIso: formatIsoDate(periodEnd),
    coverageNoteAr: 'فترة الخدمة المعتمدة للحزمة الحالية موضحة أدناه.',
    coverageNoteEn: 'The active service period for the current package is shown below.',
    nextRenewalIso: formatIsoDate(nextRenewal),
    nextRenewalNoteAr: `تاريخ التجديد المتوقع للدورة التالية: ${formatGregorianAr(nextRenewal)} (${formatIsoDate(nextRenewal)}).`,
    nextRenewalNoteEn: `Next cycle renewal date: ${formatIsoDate(nextRenewal)}.`,
    notesAr: [
      'هذه فاتورة معاينة فقط — لا تُستخدم للسداد الضريبي أو كإثبات رسمي.',
      'يُستكمل شراء حزمة الرخصة عبر بوابة الدفع المعتمدة؛ تُحدَّث الفواتير الفعلية تلقائياً عند تفعيل النظام.',
    ],
    notesEn: [
      'Preview sample only — not for tax filing or formal evidence.',
      'Software package purchase continues via the authorized payment gateway; live invoices will be generated when billing is enabled.',
    ],
    watermarkAr: 'معاينة',
    watermarkEn: 'PREVIEW',
  };
}
