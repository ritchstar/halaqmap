/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { CSSProperties } from 'react';
import { IndependentStoreIdentity } from '@/components/store/neighbor/IndependentStoreIdentity';
import { cn } from '@/lib/utils';

export function NeighborFloatingCart({
  visible,
  itemCount,
  lineCount,
  totalSar,
  shopName,
  accent,
  checkoutLabel,
  onCheckout,
}: {
  visible: boolean;
  itemCount: number;
  lineCount: number;
  totalSar: number;
  shopName: string;
  accent: string;
  checkoutLabel: string;
  onCheckout: () => void;
}) {
  if (!visible) return null;

  return (
    <div
      className={cn('neighbor-floating-cart')}
      style={{ '--neighbor-accent': accent } as CSSProperties}
      role="region"
      aria-label="ملخص السلة"
    >
      <IndependentStoreIdentity shopName={shopName} compact className="neighbor-floating-cart__identity" />
      <div className="neighbor-floating-cart__row">
        <div className="neighbor-floating-cart__summary">
          <p className="neighbor-floating-cart__count">
            {itemCount} {itemCount === 1 ? 'صنف' : 'أصناف'}
            {lineCount !== itemCount ? ` · ${lineCount} وحدة` : ''}
          </p>
          <p className="neighbor-floating-cart__total">{totalSar} ر.س</p>
        </div>
        <button type="button" className="neighbor-floating-cart__cta" onClick={onCheckout}>
          {checkoutLabel}
        </button>
      </div>
    </div>
  );
}
