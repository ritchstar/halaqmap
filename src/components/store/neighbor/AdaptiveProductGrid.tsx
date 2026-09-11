/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { QuickAddProductCard } from '@/components/store/neighbor/QuickAddProductCard';
import { neighborProductLayout, type NeighborShelfRow } from '@/lib/neighborShelfFilter';

export function AdaptiveProductGrid({
  items,
  qty,
  accent,
  onBump,
}: {
  items: readonly NeighborShelfRow[];
  qty: Record<string, number>;
  accent: string;
  onBump: (catalogId: string, delta: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="neighbor-shelf-empty text-sm leading-7 text-white/65">
        لا توجد أصناف مطابقة — جرّب تصنيفاً آخر أو عدّل البحث.
      </p>
    );
  }

  return (
    <div className="neighbor-product-grid">
      {items.map((item) => {
        const layout = neighborProductLayout(item);
        return (
          <QuickAddProductCard
            key={item.catalogId}
            item={item}
            layout={layout}
            qty={qty[item.catalogId] || 0}
            accent={accent}
            onMinus={() => onBump(item.catalogId, -1)}
            onPlus={() => onBump(item.catalogId, 1)}
          />
        );
      })}
    </div>
  );
}
