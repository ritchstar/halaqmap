import { ISIC_ACTIVITY_CODE } from '@/config/geospatialLicenseDoctrine';

/** UI/UX — بديل «اشتراك» في واجهة الشركاء */
export const TERM_PACKAGE_ACTIVATION_AR = 'تفعيل الحزمة البرمجية' as const;

/** UI/UX — بديل «إعلان» في سياق الإدراج الجغرافي */
export const TERM_GEOSPATIAL_DIGITAL_ASSET_AR = 'الأصل الرقمي الجغرافي' as const;

/** Invoicing — وصف المنتج البرمجي الرسمي (EN) */
export const INVOICE_PRODUCT_DESCRIPTION_EN =
  'Software Solution for Geospatial Presence - Code 474151' as const;

export const INVOICE_PRODUCT_DESCRIPTION_AR =
  `حل برمجي للتواجد الجغرافي — رمز النشاط ${ISIC_ACTIVITY_CODE}` as const;

export function invoiceLineDescriptionEn(tierLabel?: string): string {
  if (!tierLabel) return INVOICE_PRODUCT_DESCRIPTION_EN;
  return `${INVOICE_PRODUCT_DESCRIPTION_EN} (${tierLabel})`;
}

export function invoiceLineDescriptionAr(tierLabelAr?: string): string {
  if (!tierLabelAr) return INVOICE_PRODUCT_DESCRIPTION_AR;
  return `${INVOICE_PRODUCT_DESCRIPTION_AR} — ${tierLabelAr}`;
}
