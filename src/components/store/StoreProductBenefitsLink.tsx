/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر إحالة إلى صفحة مزايا المنتجات من صفحات العرض.
 */
import { Link } from 'react-router-dom';
import { STORE_PRODUCT_BENEFITS_COPY } from '@/config/storeProductBenefitsCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreProductBenefitsLink({ className }: { className?: string }) {
  return (
    <Link
      to={ROUTE_PATHS.STORE_PRODUCT_BENEFITS}
      className={cn(
        'rounded-full border border-[#e8c547]/40 px-5 py-2.5 text-sm font-bold text-[#e8c547]',
        className,
      )}
    >
      {STORE_PRODUCT_BENEFITS_COPY.navAr}
    </Link>
  );
}
