/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شعار واجهة خريطة الحل — ضعف الحجم مع نبض مشع. لا يُستورد من App.
 */
import { STORE_VISUALS } from '@/config/storeFront';
import { cn } from '@/lib/utils';

export function StoreBrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('store-brand-mark', className)} aria-hidden>
      <span className="store-brand-mark__aura" />
      <img
        src={STORE_VISUALS.logo}
        alt=""
        width={88}
        height={88}
        className="store-brand-mark__face"
      />
    </span>
  );
}
