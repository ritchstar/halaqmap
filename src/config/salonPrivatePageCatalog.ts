/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * كتالوج صفحة العرض الخاصة — إضافة برمجية تُشترى من لوحة الذهبي/الماسي فقط.
 * يطابق `api/_lib/salonPrivatePageCatalog.ts`. لا يُباع بلا رخصة نشطة، ولا للبرونزي.
 *
 * الضريبة فوق السعر (VAT exclusive) بنفس قاعدة شحن المناوب:
 * القيمة الأساسية ثابتة؛ عند تفعيل ض.ق.م يدفع الصالون الأساسي + النسبة.
 */

/** مفتاح منتج ميسر — نفس التاجر على www.halaqmap.com */
export const SALON_PRIVATE_PAGE_PRODUCT = 'salon_private_page' as const;

export const SALON_PRIVATE_PAGE_PRODUCT_TYPE_AR =
  'صفحة عرض خاصة — إضافة برمجية للرخصة المفعّلة' as const;

export const SALON_PRIVATE_PAGE_PURPOSE = 'salon_private_page' as const;

export const SALON_PRIVATE_PAGE_VAT_PERCENT = 15;

export const SALON_PRIVATE_PAGE_MAX_PAGES = 7;

export const SALON_PRIVATE_PAGE_ELIGIBLE_TIERS = ['gold', 'diamond'] as const;

export type SalonPrivatePageEligibleTier = (typeof SALON_PRIVATE_PAGE_ELIGIBLE_TIERS)[number];

export type SalonPrivatePageSku =
  | 'salon_page_1'
  | 'salon_page_2'
  | 'salon_page_3'
  | 'salon_page_4'
  | 'salon_page_5'
  | 'salon_page_6'
  | 'salon_page_7';

export type SalonPrivatePagePackage = {
  sku: SalonPrivatePageSku;
  pageCount: number;
  /** سعر الصفحة الواحدة بالريال (قبل الضريبة). */
  unitSar: number;
  /** إجمالي الأساسي بالريال (قبل الضريبة). */
  baseSar: number;
  baseHalalas: number;
  /** المبلغ عند تفعيل ض.ق.م = الأساسي + 15%. */
  chargedHalalas: number;
  labelAr: string;
  /** اسم الصنف كما يُدرج في لوحة ميسر. */
  moyasarNameAr: string;
};

function pack(
  sku: SalonPrivatePageSku,
  pageCount: number,
  unitSar: number,
  labelAr: string,
): SalonPrivatePagePackage {
  const baseSar = unitSar * pageCount;
  const baseHalalas = baseSar * 100;
  return {
    sku,
    pageCount,
    unitSar,
    baseSar,
    baseHalalas,
    chargedHalalas: Math.round(baseHalalas * (1 + SALON_PRIVATE_PAGE_VAT_PERCENT / 100)),
    labelAr,
    moyasarNameAr: `حلاق ماب — ${labelAr}`,
  };
}

export const SALON_PRIVATE_PAGE_PACKAGES: readonly SalonPrivatePagePackage[] = [
  pack('salon_page_1', 1, 1199, 'صفحة عرض خاصة واحدة'),
  pack('salon_page_2', 2, 1099, 'صفحتا عرض خاصّتان'),
  pack('salon_page_3', 3, 900, 'ثلاث صفحات عرض خاصة'),
  pack('salon_page_4', 4, 900, 'أربع صفحات عرض خاصة'),
  pack('salon_page_5', 5, 900, 'خمس صفحات عرض خاصة'),
  pack('salon_page_6', 6, 900, 'ست صفحات عرض خاصة'),
  pack('salon_page_7', 7, 900, 'سبع صفحات عرض خاصة'),
];

export function salonPrivatePagePackageBySku(sku: string): SalonPrivatePagePackage | null {
  const s = String(sku ?? '').trim().toLowerCase();
  return SALON_PRIVATE_PAGE_PACKAGES.find((p) => p.sku === s) ?? null;
}

export function salonPrivatePagePackageByPageCount(pageCount: number): SalonPrivatePagePackage | null {
  const n = Math.trunc(pageCount);
  if (!Number.isFinite(n) || n < 1 || n > SALON_PRIVATE_PAGE_MAX_PAGES) return null;
  return SALON_PRIVATE_PAGE_PACKAGES.find((p) => p.pageCount === n) ?? null;
}

export function isSalonPrivatePageEligibleTier(tier: string | null | undefined): boolean {
  const t = String(tier ?? '').trim().toLowerCase();
  return (SALON_PRIVATE_PAGE_ELIGIBLE_TIERS as readonly string[]).includes(t);
}

export function chargedHalalasForSalonPrivatePageVat(
  baseHalalas: number,
  vat: { enabled: boolean; percent: number } | null | undefined,
): number {
  const base = Math.trunc(baseHalalas);
  if (!Number.isFinite(base) || base <= 0) return 0;
  if (!vat || !vat.enabled || vat.percent <= 0) return base;
  return Math.round(base * (1 + vat.percent / 100));
}
