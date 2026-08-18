/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { ISIC_ACTIVITY_CODE } from './geospatialLicenseDoctrine.js';
import {
  INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR,
  INVOICE_DIAMOND_LICENSE_LABEL_AR,
  INVOICE_DIAMOND_WITH_ADDON_LABEL_AR,
} from './subscriptionPricingCopy.js';

/**
 * التسمية التجارية على نماذج الاشتراك فقط.
 * التعريف القانوني في السياسات والفواتير يبقى رخصة نفاذ حلاق ماب الرقمية.
 */
export type SoftwareLicenseFormSurface = 'halaqmap' | 'coiffeur';

export const SOFTWARE_LICENSE_FORM_NAME_HALAQMAP_AR = 'رخصة برمجية حلاق ماب' as const;
export const SOFTWARE_LICENSE_FORM_NAME_COIFFEUR_AR = 'رخصة برمجية كوافير ماب' as const;

export function softwareLicenseFormNameAr(
  surface: SoftwareLicenseFormSurface = 'halaqmap',
): string {
  return surface === 'coiffeur'
    ? SOFTWARE_LICENSE_FORM_NAME_COIFFEUR_AR
    : SOFTWARE_LICENSE_FORM_NAME_HALAQMAP_AR;
}

/** تسمية المنتج الرسمية في واجهة الشركاء */
export const TERM_PACKAGE_ACTIVATION_AR = 'تفعيل حزمة الرخصة البرمجية' as const;
export const TERM_LICENSE_ACTIVATION_AR = 'تفعيل الرخصة' as const;
export const TERM_DIGITAL_RIGHT_RENEWAL_AR = 'تجديد الحق الرقمي' as const;
export const TERM_LICENSE_POLICY_AR = 'سياسة رخصة النفاذ الرقمية' as const;
export const TERM_LICENSE_REQUEST_AR = 'طلب تفعيل الرخصة' as const;
export const TERM_ACTIVE_LICENSE_AR = 'رخصة نشطة' as const;

/** أزرار الشراء على نماذج الاشتراك */
export const TERM_BUY_LICENSE_AR = 'شراء رخصة برمجية' as const;
export const TERM_ACTIVATE_NOW_AR = 'تفعيل الآن' as const;

/** UI/UX — بديل «إعلان» في سياق الإدراج الجغرافي */
export const TERM_GEOSPATIAL_DIGITAL_ASSET_AR = 'الأصل الرقمي الجغرافي' as const;

/** Invoicing — وصف المنتج البرمجي الرسمي (EN) */
export const INVOICE_PRODUCT_DESCRIPTION_EN =
  'Halaq Map Digital Access Licence (Smart Response System · On-Demand Visibility) - ISIC 474151' as const;

export const INVOICE_PRODUCT_DESCRIPTION_AR =
  `رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية) — رمز النشاط ${ISIC_ACTIVITY_CODE}` as const;

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
