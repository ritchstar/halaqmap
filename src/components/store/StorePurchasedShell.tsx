/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة خام للمناسبة المشتراة — بلا هيدر أو تذييل أو توثيق.
 */
import { useEffect, type ReactNode } from 'react';
import { StoreShopSky } from '@/components/store/StoreShopSky';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import { STORE_LIVE_MARK_AR } from '@/config/storeLiveAtmosphere';
import type { StoreShopSkyProduct, StoreShopSkySurface } from '@/config/storeShopSky';

export function StorePurchasedShell({
  children,
  sky,
  skySurface = 'shop',
  skyLat,
  skyLng,
}: {
  children: ReactNode;
  sky?: StoreShopSkyProduct;
  skySurface?: StoreShopSkySurface;
  skyLat?: number;
  skyLng?: number;
}) {
  useEffect(() => lockPartnerDarkCanvas(), []);

  return (
    <div dir="rtl" className="store-purchased-shell relative min-h-[100svh] bg-[#050308] text-[#f7edd8]">
      {sky ? <StoreShopSky product={sky} surface={skySurface} lat={skyLat} lng={skyLng} /> : null}
      {sky ? <div className="relative z-10">{children}</div> : children}
      <p className="store-live-mark pointer-events-none fixed bottom-1 left-1/2 z-30 -translate-x-1/2">
        {STORE_LIVE_MARK_AR}
      </p>
    </div>
  );
}
