/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حقل نصي بلا إطار صورة زخرفي. النصوص في div فقط حتى تبقى موسّطة.
 */
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StoreHallFieldPlate({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('hall-field-plate', className)}>
      <div className="hall-field-plate__inner" data-bidi="off">
        {children}
      </div>
    </div>
  );
}
