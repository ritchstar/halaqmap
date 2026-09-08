/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة خام للمناسبة المشتراة — بلا هيدر أو تذييل أو توثيق.
 */
import { type ReactNode } from 'react';
import { StoreShopLife } from '@/components/store/StoreShopLife';
import { StoreProductThemeRoot } from '@/components/store/StoreProductThemeRoot';
import { StoreLiveStoreLink } from '@/components/store/StoreLiveStoreLink';
import { PlatformContinuousDevelopmentNotice } from '@/components/platform/PlatformContinuousDevelopmentNotice';
import { STORE_LIVE_MARK_AR } from '@/config/storeLiveAtmosphere';
import type { StoreProductId } from '@/config/storeProductThemes';
import { normalizeStoreLiveSurface } from '@/lib/storeProductThemes';
import { cn } from '@/lib/utils';

export function StorePurchasedShell({
  children,
  product,
  sector,
  surface = 'storefront',
  life = false,
  showStoreLink = false,
  pageBg,
}: {
  children: ReactNode;
  product?: StoreProductId;
  /** @deprecated استخدم product */
  sector?: StoreProductId;
  surface?: 'storefront' | 'workspace';
  life?: boolean;
  showStoreLink?: boolean;
  pageBg?: string;
}) {
  const resolvedProduct = product ?? sector;
  const context = normalizeStoreLiveSurface(surface);
  const isOperator = context === 'operator';
  const customStorefrontBg = isOperator ? undefined : pageBg;
  const showLife = life && !isOperator;

  return (
    <StoreProductThemeRoot
      product={resolvedProduct}
      context={context}
      customStorefrontPageBg={customStorefrontBg}
      className={cn('store-purchased-shell relative min-h-[100svh]')}
    >
      {showLife ? <StoreShopLife compact themed /> : null}
      <div className="store-purchased-shell__body store-product-theme__body relative z-10">
        <PlatformContinuousDevelopmentNotice variant="shop" className="mx-auto max-w-[1240px] px-3 pt-2 sm:px-4" />
        <div className="store-product-theme__frame mx-auto w-full max-w-[1240px] px-3 sm:px-4">
          {children}
        </div>
      </div>
      {showStoreLink ? <StoreLiveStoreLink /> : null}
      <p className="store-live-mark pointer-events-none fixed bottom-1 left-1/2 z-30 -translate-x-1/2">{STORE_LIVE_MARK_AR}</p>
    </StoreProductThemeRoot>
  );
}
