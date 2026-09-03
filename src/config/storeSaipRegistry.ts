/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شهادات تسجيل المصنفات البرمجية الصادرة من الهيئة السعودية للملكية الفكرية.
 * خمسة منتجات فقط. لا يُستورد من App. لا تُنسب الشهادة لمنتج آخر.
 * حلانا1 وافراحي1 واجواء1 وكاردي8 ومطعمنا1 ليست في هذه القائمة العلنية.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export type StoreSaipProductId = 'cafe' | 'grocers' | 'produce' | 'kitchen' | 'lounge';

export type StoreSaipWork = {
  id: StoreSaipProductId;
  titleAr: string;
  latin: string;
  certificateNo: string;
  buyPath: string;
};

export const STORE_SAIP_COPY = {
  phraseAr: 'مصنف برمجي مسجّل رسمياً لدى الهيئة السعودية للملكية الفكرية',
  certLabelAr: 'رقم الشهادة',
  issuerAr: 'الهيئة السعودية للملكية الفكرية',
  footerLeadAr: 'مصنفات برمجية مسجّلة لدى الهيئة السعودية للملكية الفكرية.',
  trustTitleAr: 'تسجيل المصنفات البرمجية',
  trustLeadAr:
    'خمسة منتجات من متجر خريطة الحل مسجّلة مصنفات برمجية لدى الهيئة السعودية للملكية الفكرية. الأرقام أدناه لشهادات التسجيل الصادرة. ليست علامة تجارية ولا براءة اختراع.',
} as const;

export const STORE_SAIP_PUBLIC_WORKS: readonly StoreSaipWork[] = [
  {
    id: 'cafe',
    titleAr: 'كافينا1',
    latin: 'Kaffina1',
    certificateNo: '26-12-103276935',
    buyPath: ROUTE_PATHS.STORE_CAFE,
  },
  {
    id: 'grocers',
    titleAr: 'تمويناتا1',
    latin: 'Tamwinata1',
    certificateNo: '26-12-103276933',
    buyPath: ROUTE_PATHS.STORE_GROCERS,
  },
  {
    id: 'produce',
    titleAr: 'خضارنا1',
    latin: 'Khodarna1',
    certificateNo: '26-12-103276978',
    buyPath: ROUTE_PATHS.STORE_PRODUCE,
  },
  {
    id: 'kitchen',
    titleAr: 'طبختنا1',
    latin: 'Tabkhatna1',
    certificateNo: '26-12-103276936',
    buyPath: ROUTE_PATHS.STORE_KITCHEN,
  },
  {
    id: 'lounge',
    titleAr: 'لاونجا1',
    latin: 'Launja1',
    certificateNo: '26-12-103276926',
    buyPath: ROUTE_PATHS.STORE_LOUNGE,
  },
] as const;

const SAIP_BY_ID = Object.fromEntries(
  STORE_SAIP_PUBLIC_WORKS.map((work) => [work.id, work]),
) as Record<StoreSaipProductId, StoreSaipWork>;

export function storeSaipWorkById(id: string): StoreSaipWork | null {
  return SAIP_BY_ID[id as StoreSaipProductId] ?? null;
}

export function storeSaipLineAr(id: StoreSaipProductId): string {
  const work = SAIP_BY_ID[id];
  return `${work.titleAr} ${STORE_SAIP_COPY.phraseAr}. ${STORE_SAIP_COPY.certLabelAr} ${work.certificateNo}.`;
}
