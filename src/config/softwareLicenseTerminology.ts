import { ISIC_ACTIVITY_CODE } from '@/config/geospatialLicenseDoctrine';
import {
  INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR,
  INVOICE_DIAMOND_LICENSE_LABEL_AR,
  INVOICE_DIAMOND_WITH_ADDON_LABEL_AR,
} from '@/config/subscriptionPricing';

/** UI/UX — بديل «اشتراك» في واجهة الشركاء */
export const TERM_PACKAGE_ACTIVATION_AR = 'تفعيل حزمة رخصة النفاذ' as const;

/** أزرار الشراء — بيع فوري للمنتج الرقمي */
export const TERM_BUY_LICENSE_AR = 'شراء رخصة نفاذ' as const;
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

/** بطاقة التسعير — زر «شراء رخصة» مع السعر */
export function listingLicensePurchaseCtaAr(qty: number, totalSar: number): string {
  const q = Math.max(1, Math.min(12, Math.trunc(qty)));
  const price = totalSar.toLocaleString('en-US');
  if (q === 1) return `${TERM_BUY_LICENSE_AR} — ${price} ر.س`;
  return `${TERM_BUY_LICENSE_AR} (${q}) — ${price} ر.س`;
}

/** صفحة الدفع / إتمام الشراء — زر «تفعيل الآن» */
export function paymentActivateNowCtaAr(totalSar?: number): string {
  if (totalSar == null || !Number.isFinite(totalSar)) return TERM_ACTIVATE_NOW_AR;
  return `${TERM_ACTIVATE_NOW_AR} — ${totalSar.toLocaleString('en-US')} ر.س`;
}
