/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة خام للمناسبة المشتراة — بلا هيدر أو تذييل أو توثيق.
 */
import { useEffect, type ReactNode } from 'react';
import { StoreShopLife } from '@/components/store/StoreShopLife';
import { StoreShopSky } from '@/components/store/StoreShopSky';
import { StoreLiveStoreLink } from '@/components/store/StoreLiveStoreLink';
import { PlatformContinuousDevelopmentNotice } from '@/components/platform/PlatformContinuousDevelopmentNotice';
import { useIsMobile } from '@/hooks/use-mobile';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import { STORE_LIVE_MARK_AR } from '@/config/storeLiveAtmosphere';
import type { StoreLiveSectorId } from '@/config/storeSectorIdentity';
import { resolveStoreLivePageStyle, type StoreLiveSurface } from '@/lib/storeSectorIdentity';
import type { StoreShopSkyProduct, StoreShopSkySurface } from '@/config/storeShopSky';
import { cn } from '@/lib/utils';

export function StorePurchasedShell({
  children,
  sector,
  surface = 'storefront',
  sky,
  skySurface = 'shop',
  skyLat,
  skyLng,
  life = false,
  showStoreLink = false,
  pageBg,
}: {
  children: ReactNode;
  sector?: StoreLiveSectorId;
  surface?: StoreLiveSurface;
  sky?: StoreShopSkyProduct;
  skySurface?: StoreShopSkySurface;
  skyLat?: number;
  skyLng?: number;
  life?: boolean;
  showStoreLink?: boolean;
  pageBg?: string;
}) {
  useEffect(() => lockPartnerDarkCanvas(), []);
  const isMobile = useIsMobile();
  const isWorkspace = surface === 'workspace';
  const operatorPageBg = isWorkspace ? '' : pageBg;
  const pageStyle = resolveStoreLivePageStyle({ sector, surface, operatorPageBg });
  const customPageBg = Boolean(String(operatorPageBg || '').trim());
  const showSky = Boolean(sky) && !isWorkspace && !(life && isMobile) && !customPageBg;
  const showLife = life && !isWorkspace;
  const canvas = showSky || showLife || customPageBg || Boolean(sector);

  return (
    <div
      dir="rtl"
      className={cn(
        'store-purchased-shell relative min-h-[100svh] text-[#f4efe6]',
        isWorkspace ? 'store-live-workspace' : 'store-live-storefront',
        sector ? `store-live-sector--${sector}` : null,
      )}
      data-store-sector={sector || undefined}
      data-store-surface={surface}
      style={pageStyle}
    >
      {sky && showSky ? <StoreShopSky product={sky} surface={skySurface} lat={skyLat} lng={skyLng} hideChip={showLife} /> : null}
      {showLife ? <StoreShopLife compact={surface === 'storefront'} /> : null}
      {canvas ? (
        <div className="store-purchased-shell__body relative z-10">
          <PlatformContinuousDevelopmentNotice variant="shop" className="mx-auto max-w-3xl px-3 pt-2 sm:px-4" />
          {children}
        </div>
      ) : (
        <>
          <PlatformContinuousDevelopmentNotice variant="shop" className="mx-auto max-w-3xl px-3 pt-2 sm:px-4" />
          {children}
        </>
      )}
      {showStoreLink ? <StoreLiveStoreLink /> : null}
      <p className="store-live-mark pointer-events-none fixed bottom-1 left-1/2 z-30 -translate-x-1/2">
        {STORE_LIVE_MARK_AR}
      </p>
    </div>
  );
}
