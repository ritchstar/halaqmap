/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف ثيم المنتج — data-product + data-context + رموز CSS.
 */
import { useEffect, type CSSProperties, type ReactNode } from 'react';
import type { StoreProductId, StoreProductThemeContext } from '@/config/storeProductThemes';
import { lockStoreProductCanvas, productThemeCssVars, productThemeTokens } from '@/lib/storeProductThemes';
import { cn } from '@/lib/utils';

export function StoreProductThemeRoot({
  product,
  context,
  className,
  style,
  customStorefrontPageBg,
  children,
}: {
  product?: StoreProductId;
  context: StoreProductThemeContext;
  className?: string;
  style?: CSSProperties;
  customStorefrontPageBg?: string;
  children: ReactNode;
}) {
  const vars = productThemeCssVars(product, context, customStorefrontPageBg);
  const canvasBg =
    context === 'operator'
      ? productThemeTokens(product, 'operator').pageBg
      : String(vars['--storefront-page-bg' as keyof CSSProperties] ?? productThemeTokens(product, 'storefront').pageBg);

  useEffect(() => lockStoreProductCanvas(canvasBg), [canvasBg]);

  return (
    <div
      className={cn('store-product-theme', className)}
      data-product={product || 'fallback'}
      data-context={context}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}
