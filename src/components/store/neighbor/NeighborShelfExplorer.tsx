/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState, type CSSProperties } from 'react';
import {
  NEIGHBOR_SHELF_ALL_CATEGORY,
  filterNeighborShelf,
  neighborShelfCategories,
  type NeighborShelfFilter,
  type NeighborShelfRow,
} from '@/lib/neighborShelfFilter';
import { cn } from '@/lib/utils';

export function NeighborShelfExplorer({
  items,
  accent,
  onFilterChange,
  searchThreshold = 8,
}: {
  items: readonly NeighborShelfRow[];
  accent: string;
  onFilterChange?: (filter: NeighborShelfFilter) => void;
  searchThreshold?: number;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(NEIGHBOR_SHELF_ALL_CATEGORY);
  const categories = useMemo(() => neighborShelfCategories(items), [items]);
  const showSearch = items.length >= searchThreshold;

  function emit(nextQuery: string, nextCategory: string) {
    onFilterChange?.({ query: nextQuery, category: nextCategory });
  }

  return (
    <div className="neighbor-shelf-explorer">
      {showSearch ? (
        <label className="neighbor-shelf-explorer__search">
          <span className="sr-only">بحث في الأصناف</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              emit(next, category);
            }}
            placeholder="ابحث في الأصناف…"
            className="neighbor-shelf-explorer__input"
            enterKeyHint="search"
            autoComplete="off"
          />
        </label>
      ) : null}
      {categories.length > 1 ? (
        <div className="neighbor-shelf-explorer__chips" role="tablist" aria-label="تصنيفات الأصناف">
          <CategoryChip
            label="الكل"
            active={category === NEIGHBOR_SHELF_ALL_CATEGORY}
            accent={accent}
            onClick={() => {
              setCategory(NEIGHBOR_SHELF_ALL_CATEGORY);
              emit(query, NEIGHBOR_SHELF_ALL_CATEGORY);
            }}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              accent={accent}
              onClick={() => {
                setCategory(cat);
                emit(query, cat);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  accent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn('neighbor-shelf-chip', active && 'neighbor-shelf-chip--active')}
      style={active ? ({ '--neighbor-accent': accent } as CSSProperties) : undefined}
    >
      {label}
    </button>
  );
}

export function useNeighborShelfFilter(
  items: readonly NeighborShelfRow[],
  filter: NeighborShelfFilter,
): NeighborShelfRow[] {
  return useMemo(() => filterNeighborShelf(items, filter), [items, filter]);
}
