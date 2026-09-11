/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { CSSProperties } from 'react';
import { HonestProductPlaceholder } from '@/components/store/neighbor/HonestProductPlaceholder';
import type { NeighborShelfRow } from '@/lib/neighborShelfFilter';
import { cn } from '@/lib/utils';

export function QuickAddProductCard({
  item,
  layout,
  qty,
  accent,
  onMinus,
  onPlus,
}: {
  item: NeighborShelfRow;
  layout: 'compact' | 'row';
  qty: number;
  accent: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const photo = item.photoSrc?.trim();
  const inCart = qty > 0;

  if (layout === 'row') {
    return (
      <article
        className={cn(
          'neighbor-product-card neighbor-product-card--row',
          inCart && 'neighbor-product-card--active',
        )}
      >
        <div className="neighbor-product-card__media neighbor-product-card__media--row">
          {photo ? (
            <img src={photo} alt="" loading="lazy" className="neighbor-product-card__img" />
          ) : (
            <HonestProductPlaceholder nameAr={item.nameAr} category={item.category} />
          )}
        </div>
        <div className="neighbor-product-card__body neighbor-product-card__body--row">
          <p className="neighbor-product-card__name">{item.nameAr}</p>
          {item.category ? <p className="neighbor-product-card__meta">{item.category}</p> : null}
          <p className="neighbor-product-card__price">{item.price} ر.س</p>
        </div>
        <NeighborQtyControls qty={qty} accent={accent} onMinus={onMinus} onPlus={onPlus} />
      </article>
    );
  }

  return (
    <article
      className={cn(
        'neighbor-product-card neighbor-product-card--compact',
        inCart && 'neighbor-product-card--active',
      )}
    >
      <div className="neighbor-product-card__media">
        {photo ? (
          <img src={photo} alt="" loading="lazy" className="neighbor-product-card__img" />
        ) : (
          <HonestProductPlaceholder nameAr={item.nameAr} category={item.category} />
        )}
      </div>
      <div className="neighbor-product-card__body">
        <p className="neighbor-product-card__name">{item.nameAr}</p>
        <p className="neighbor-product-card__price">{item.price} ر.س</p>
        <NeighborQtyControls qty={qty} accent={accent} onMinus={onMinus} onPlus={onPlus} />
      </div>
    </article>
  );
}

function NeighborQtyControls({
  qty,
  accent,
  onMinus,
  onPlus,
}: {
  qty: number;
  accent: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="neighbor-qty" style={{ '--neighbor-accent': accent } as CSSProperties}>
      <button type="button" className="neighbor-qty__btn" onClick={onMinus} aria-label="تقليل الكمية">
        −
      </button>
      <span className="neighbor-qty__value" aria-live="polite">
        {qty}
      </span>
      <button type="button" className="neighbor-qty__btn neighbor-qty__btn--plus" onClick={onPlus} aria-label="زيادة الكمية">
        +
      </button>
    </div>
  );
}
