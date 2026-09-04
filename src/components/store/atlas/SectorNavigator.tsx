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
  const count = cards.length;

  return (
    <section id="atlas-products" className="store-atlas__section store-atlas__products">
      <div className="store-atlas__shell">
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.sectorAskAr}</p>
        <div className={cn('mt-4 flex gap-2', compact ? 'overflow-x-auto pb-2' : 'flex-wrap')}>
          {STORE_ATLAS_SECTORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSector(item.id)}
              className={cn(
                'store-atlas__chip min-h-11 shrink-0 px-4 text-sm font-extrabold',
                sector === item.id && 'text-[var(--atlas-teal)]',
              )}
            >
              {item.titleAr}
            </button>
          ))}
        </div>
        <div
          className={cn(
            'store-atlas__grid mt-6',
            compact && '!grid-cols-1',
            count === 1 && 'store-atlas__grid--single',
            count === 2 && 'store-atlas__grid--pair',
            count % 2 === 1 && count > 1 && 'store-atlas__grid--odd',
          )}
        >
          {cards.map((card) => (
            <ProductShowcaseCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
