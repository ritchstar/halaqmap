/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شهادات تسجيل المصنفات البرمجية الصادرة من الهيئة السعودية للملكية الفكرية.
 * ستة منتجات فقط. لا يُستورد من App. لا تُنسب الشهادة لمنتج آخر.
 * حلانا1 وافراحي1 وكاردي8 ومطعمنا1 ليست في هذه القائمة العلنية.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export type StoreSaipProductId = 'cafe' | 'grocers' | 'produce' | 'kitchen' | 'lounge' | 'event';

export type StoreSaipWork = {
  id: StoreSaipProductId;
  titleAr: string;
  latin: string;
  certificateNo: string;
  certImage: string;
  buyPath: string;
};

export const STORE_SAIP_COPY = {
  phraseAr: 'مصنف برمجي مسجّل رسمياً لدى الهيئة السعودية للملكية الفكرية',
  certLabelAr: 'رقم الشهادة',
  issuerAr: 'الهيئة السعودية للملكية الفكرية',
  footerLeadAr: 'مصنفات برمجية مسجّلة لدى الهيئة السعودية للملكية الفكرية.',
  trustTitleAr: 'تسجيل المصنفات البرمجية',
  certImageAltAr: 'شهادة تسجيل المصنف لدى الهيئة السعودية للملكية الفكرية',
  trustLeadAr:
    'ستة منتجات من متجر خريطة الحل مسجّلة مصنفات برمجية لدى الهيئة السعودية للملكية الفكرية. الأرقام أدناه لشهادات التسجيل الصادرة. ليست علامة تجارية ولا براءة اختراع.',
} as const;

export const STORE_SAIP_PUBLIC_WORKS: readonly StoreSaipWork[] = [
  {
    id: 'cafe',
    titleAr: 'كافينا1',
    latin: 'Kaffina1',
    certificateNo: '26-12-103276935',
    certImage: '/images/store/saip/cafe-26-12-103276935.png',
    buyPath: ROUTE_PATHS.STORE_CAFE,
  },
  {
    id: 'grocers',
    titleAr: 'تمويناتا1',
    latin: 'Tamwinata1',
    certificateNo: '26-12-103276933',
    certImage: '/images/store/saip/grocers-26-12-103276933.png',
    buyPath: ROUTE_PATHS.STORE_GROCERS,
  },
  {
    id: 'produce',
    titleAr: 'خضارنا1',
    latin: 'Khodarna1',
    certificateNo: '26-12-103276978',
    certImage: '/images/store/saip/produce-26-12-103276978.png',
    buyPath: ROUTE_PATHS.STORE_PRODUCE,
  },
  {
    id: 'kitchen',
    titleAr: 'طبختنا1',
    latin: 'Tabkhatna1',
    certificateNo: '26-12-103276936',
    certImage: '/images/store/saip/kitchen-26-12-103276936.png',
    buyPath: ROUTE_PATHS.STORE_KITCHEN,
  },
  {
    id: 'lounge',
    titleAr: 'لاونجا1',
    latin: 'Launja1',
    certificateNo: '26-12-103276926',
    certImage: '/images/store/saip/lounge-26-12-103276926.png',
    buyPath: ROUTE_PATHS.STORE_LOUNGE,
  },
  {
    id: 'event',
    titleAr: 'اجواء1',
    latin: 'Ajwa1',
    certificateNo: '26-12-103276923',
    certImage: '/images/store/saip/event-26-12-103276923.png',
    buyPath: ROUTE_PATHS.STORE_EVENT,
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
