/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر إحالة إلى دليل تشغيل وتسويق المنتج من صفحة العرض.
 */
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function StoreProductSupportLink({
  to,
  labelAr,
  className,
}: {
  to: string;
  labelAr?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-full border border-current/40 px-5 py-2.5 text-sm font-bold',
        className,
      )}
    >
      {labelAr || 'دليل التشغيل والتسويق'}
    </Link>
  );
}
