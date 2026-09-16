/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حقول شحن خارج النطاق يملؤها المشغّل بنفسه — بلا ربط شركات أو تسعير آلي من المنصة.
 */
export type ShopShippingProfile = {
  shippingEnabled: boolean;
  shippingCarrierAr: string;
  shippingPriceAr: string;
  shippingEtaAr: string;
  shippingCodAllowed: boolean;
  shippingNotesAr: string;
  shippingUpdatedAt: string;
};

export const DEFAULT_SHOP_SHIPPING: ShopShippingProfile = {
  shippingEnabled: false,
  shippingCarrierAr: '',
  shippingPriceAr: '',
  shippingEtaAr: '',
  shippingCodAllowed: false,
  shippingNotesAr: '',
  shippingUpdatedAt: '',
};

/** نص ثابت، لا يُعدّله المشغّل — يظهر في لوحة التشغيل وفي صفحة العميل معاً. */
export const SHOP_SHIPPING_DISCLAIMER_AR =
  'خدمة الشحن خارج النطاق يديرها النشاط مباشرة مع شركة الشحن التي يتعامل معها، دون أي وساطة من منصة خريطة الحل. ' +
  'الاتفاق على السعر والمدة والتسليم والتتبع بين النشاط والعميل مباشرة، ومسؤولية تنفيذ الشحنة تقع على النشاط وحده.';

export function parseShopShippingProfile(
  raw: Record<string, unknown> | null | undefined,
  fallback: ShopShippingProfile = DEFAULT_SHOP_SHIPPING,
): ShopShippingProfile {
  const row = raw && typeof raw === 'object' ? raw : {};
  return {
    shippingEnabled: row.shippingEnabled === true,
    shippingCarrierAr: String(row.shippingCarrierAr ?? fallback.shippingCarrierAr ?? '').trim().slice(0, 80),
    shippingPriceAr: String(row.shippingPriceAr ?? fallback.shippingPriceAr ?? '').trim().slice(0, 120),
    shippingEtaAr: String(row.shippingEtaAr ?? fallback.shippingEtaAr ?? '').trim().slice(0, 80),
    shippingCodAllowed: row.shippingCodAllowed === true,
    shippingNotesAr: String(row.shippingNotesAr ?? fallback.shippingNotesAr ?? '').trim().slice(0, 400),
    shippingUpdatedAt: String(row.shippingUpdatedAt || fallback.shippingUpdatedAt || '').slice(0, 40),
  };
}
