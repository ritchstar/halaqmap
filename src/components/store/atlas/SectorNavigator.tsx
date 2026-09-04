/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { ProductShowcaseCard } from '@/components/store/atlas/ProductShowcaseCard';
import {
  STORE_ATLAS_COPY,
  STORE_ATLAS_SECTORS,
  storeAtlasCardsBySector,
  type StoreAtlasSectorId,
} from '@/config/storeAtlasTokens';
import { cn } from '@/lib/utils';

export function SectorNavigator({ compact = false }: { compact?: boolean }) {
  const [sector, setSector] = useState<StoreAtlasSectorId>('local');
  const cards = useMemo(() => storeAtlasCardsBySector(sector), [sector]);

  return (
    <section id="atlas-products" className={compact ? 'px-3 py-10' : 'px-4 py-16'}>
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.sectorAskAr}</p>
        <div className={cn('mt-4 flex gap-2', compact ? 'overflow-x-auto pb-2' : 'flex-wrap')}>
          {STORE_ATLAS_SECTORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSector(item.id)}
              className={cn(
                'store-atlas__chip min-h-11 shrink-0 px-4 text-sm font-extrabold',
                sector === item.id && 'border-[var(--atlas-teal)] text-[var(--atlas-teal)]',
              )}
            >
              {item.titleAr}
            </button>
          ))}
        </div>
        <div className={cn('mt-6 grid gap-4', compact ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3')}>
          {cards.map((card) => (
            <ProductShowcaseCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
