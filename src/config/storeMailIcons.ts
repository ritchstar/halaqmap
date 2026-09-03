/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هوية أيقونات روابط المتجر — اللوحة والإيميل يتبعان المصدر نفسه.
 * لا يُستورد من App.
 */
export type StoreMailProductId = 'wedding' | 'event' | 'lounge' | 'grocers' | 'restaurant' | 'cafe' | 'kitchen' | 'produce' | 'halana';

export type StoreMailIconTheme = {
  id: StoreMailProductId | 'affiliate';
  markAr: string;
  titleAr: string;
  accent: string;
  ink: string;
  canvas: string;
  ring: string;
};

export const STORE_MAIL_PRODUCT_ICONS: readonly StoreMailIconTheme[] = [
  {
    id: 'wedding',
    markAr: 'ا',
    titleAr: 'افراحي1',
    accent: '#e8c547',
    ink: '#061018',
    canvas: '#1a1208',
    ring: '#f0d36a',
  },
  {
    id: 'event',
    markAr: 'ج',
    titleAr: 'اجواء1',
    accent: '#14b8a6',
    ink: '#042f2e',
    canvas: '#06201e',
    ring: '#5eead4',
  },
  {
    id: 'lounge',
    markAr: 'ل',
    titleAr: 'لاونجا1',
    accent: '#d4a574',
    ink: '#1a1208',
    canvas: '#1a140c',
    ring: '#e8c49a',
  },
  {
    id: 'grocers',
    markAr: 'ت',
    titleAr: 'تمويناتا1',
    accent: '#8fbf7a',
    ink: '#102010',
    canvas: '#0f1a10',
    ring: '#b7e0a4',
  },
  {
    id: 'restaurant',
    markAr: 'م',
    titleAr: 'مطعمنا1',
    accent: '#e08a3c',
    ink: '#1a0e08',
    canvas: '#1a120c',
    ring: '#f0b27a',
  },
  {
    id: 'cafe',
    markAr: 'ك',
    titleAr: 'كافينا1',
    accent: '#c48a4a',
    ink: '#1a1008',
    canvas: '#1a120c',
    ring: '#e0b27a',
  },
  {
    id: 'kitchen',
    markAr: 'ط',
    titleAr: 'طبختنا1',
    accent: '#b45a3c',
    ink: '#1a0c08',
    canvas: '#1a0c08',
    ring: '#d48a6a',
  },
  {
    id: 'produce',
    markAr: 'خ',
    titleAr: 'خضارنا1',
    accent: '#3d8b4a',
    ink: '#061018',
    canvas: '#0b1a10',
    ring: '#7ec98a',
  },
  {
    id: 'halana',
    markAr: 'ح',
    titleAr: 'حلانا1',
    accent: '#c45c7a',
    ink: '#1a0c10',
    canvas: '#1a0c10',
    ring: '#e08aa0',
  },
] as const;

export const STORE_MAIL_AFFILIATE_ICON: StoreMailIconTheme = {
  id: 'affiliate',
  markAr: 'س',
  titleAr: 'المجموعة التسويقية للمتجر الإلكتروني',
  accent: '#e8c547',
  ink: '#061018',
  canvas: '#07141c',
  ring: '#14b8a6',
};

export function storeMailProductIcon(id: StoreMailProductId): StoreMailIconTheme {
  const found = STORE_MAIL_PRODUCT_ICONS.find((item) => item.id === id);
  if (!found) return STORE_MAIL_PRODUCT_ICONS[0];
  return found;
}
