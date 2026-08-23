/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حقل داخل إطار صورة. النصوص في div فقط حتى تبقى موسّطة.
 */
import { STORE_HALL_FIELD_FRAME } from '@/config/storeHallFrames';
import { StoreHallOrnamentFrame } from '@/components/store/StoreHallOrnamentFrame';
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
      <StoreHallOrnamentFrame src={STORE_HALL_FIELD_FRAME} />
      <div className="hall-field-plate__inner" data-bidi="off">
        {children}
      </div>
    </div>
  );
}
