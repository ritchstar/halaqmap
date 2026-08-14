/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * كتالوج صفحة العرض الخاصة — مصدر الحقيقة على الخادم.
 * يجب أن يطابق `src/config/salonPrivatePageCatalog.ts`.
 *
 * يُباع لأصحاب رخصة ذهبية أو ماسية مفعّلة فقط (نفس تاجر ميسر على www.halaqmap.com).
 * الضريبة فوق السعر؛ قبول المبلغ يشمل الأساسي أو الأساسي + 15%.
 */

export const SALON_PRIVATE_PAGE_PRODUCT = 'salon_private_page' as const;

export const SALON_PRIVATE_PAGE_PRODUCT_TYPE_AR =
  'صفحة عرض خاصة — إضافة برمجية للرخصة المفعّلة' as const;

export const SALON_PRIVATE_PAGE_PURPOSE = 'salon_private_page' as const;

export const SALON_PRIVATE_PAGE_VAT_PERCENT = 15;

export const SALON_PRIVATE_PAGE_MAX_PAGES = 7;

export const SALON_PRIVATE_PAGE_ELIGIBLE_TIERS = ['gold', 'diamond'] as const;

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
  unitSar: number;
  baseSar: number;
  baseHalalas: number;
  chargedHalalas: number;
  labelAr: string;
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

export function chargedWithCanonicalVat(baseHalalas: number): number {
  return Math.round(Math.trunc(baseHalalas) * (1 + SALON_PRIVATE_PAGE_VAT_PERCENT / 100));
}

export function salonPrivatePagePackageBySku(sku: string): SalonPrivatePagePackage | null {
  const s = String(sku ?? '').trim().toLowerCase();
  return SALON_PRIVATE_PAGE_PACKAGES.find((p) => p.sku === s) ?? null;
}

export function salonPrivatePagePackageByPageCount(pageCount: number): SalonPrivatePagePackage | null {
  const n = Math.trunc(pageCount);
  if (!Number.isFinite(n) || n < 1 || n > SALON_PRIVATE_PAGE_MAX_PAGES) return null;
  return SALON_PRIVATE_PAGE_PACKAGES.find((p) => p.pageCount === n) ?? null;
}

export function salonPrivatePagePackageAcceptingCharged(chargedHalalas: number): SalonPrivatePagePackage | null {
  const amount = Math.trunc(chargedHalalas);
  return (
    SALON_PRIVATE_PAGE_PACKAGES.find(
      (p) => p.baseHalalas === amount || chargedWithCanonicalVat(p.baseHalalas) === amount,
    ) ?? null
  );
}

export function isSalonPrivatePageEligibleTier(tier: string | null | undefined): boolean {
  const t = String(tier ?? '').trim().toLowerCase();
  return (SALON_PRIVATE_PAGE_ELIGIBLE_TIERS as readonly string[]).includes(t);
}
