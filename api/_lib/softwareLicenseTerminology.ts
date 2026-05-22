import { ISIC_ACTIVITY_CODE } from './geospatialLicenseDoctrine.js';
import {
  INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR,
  INVOICE_DIAMOND_LICENSE_LABEL_AR,
  INVOICE_DIAMOND_WITH_ADDON_LABEL_AR,
} from './subscriptionPricingCopy.js';

/** UI/UX — بديل «اشتراك» في واجهة الشركاء */
export const TERM_PACKAGE_ACTIVATION_AR = 'تفعيل الحزمة البرمجية' as const;

/** أزرار الشراء — بيع فوري للمنتج الرقمي */
export const TERM_BUY_LICENSE_AR = 'شراء رخصة' as const;
export const TERM_ACTIVATE_NOW_AR = 'تفعيل الآن' as const;

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

export function invoiceDigitalShiftAddonLineAr(): string {
  return INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR;
}

export function invoiceDiamondWithAddonLabelAr(): string {
  return INVOICE_DIAMOND_WITH_ADDON_LABEL_AR;
}

export function invoiceDiamondLicenseLabelAr(): string {
  return INVOICE_DIAMOND_LICENSE_LABEL_AR;
}

/** Doctrine activation status (API responses / logs) */
export const ACTIVATION_STATUS_TECHNICAL_LINK = 'Technical Link Established' as const;
