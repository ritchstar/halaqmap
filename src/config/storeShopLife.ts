/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حياة صفحة الحي واللوحة: إضاءة ثلاثية وحرارة المدن. بلا شعار المتجر.
 * لا يُستورد من App.
 */
export const STORE_SHOP_LIGHT_ZONES = ['top', 'mid', 'bottom'] as const;

export type StoreShopLightZone = (typeof STORE_SHOP_LIGHT_ZONES)[number];

export const STORE_SHOP_LIGHT_STORAGE_KEY = 'store-shop-light-zone';

export const STORE_SHOP_LIFE_COPY = {
  lightsAriaAr: 'إضاءة الصفحة',
  topAr: 'أعلى',
  midAr: 'وسط',
  bottomAr: 'أسفل',
  citiesAriaAr: 'حرارة مدن المملكة',
} as const;

export const STORE_SHOP_LIGHT_LABEL: Record<StoreShopLightZone, string> = {
  top: STORE_SHOP_LIFE_COPY.topAr,
  mid: STORE_SHOP_LIFE_COPY.midAr,
  bottom: STORE_SHOP_LIFE_COPY.bottomAr,
};
