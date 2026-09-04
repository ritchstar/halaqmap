/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import { STORE_ATLAS_CARDS, STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasHero({ compact = false }: { compact?: boolean }) {
  const [focusId, setFocusId] = useState('produce');
  const focused = STORE_ATLAS_CARDS.find((card) => card.id === focusId) ?? STORE_ATLAS_CARDS[0];

  return (
    <section className="store-atlas__section">
      <div className="store-atlas__shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className={compact ? 'text-[2.15rem] font-extrabold leading-tight' : 'text-5xl font-extrabold leading-tight md:text-6xl'}>
            {STORE_ATLAS_COPY.heroTitleAr}
          </h1>
          <p className="store-atlas__body mt-4 max-w-xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.heroLeadAr}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-atlas__btn store-atlas__btn--gold">
              {STORE_ATLAS_COPY.heroPrimaryAr}
            </Link>
            <a href="#atlas-products" className="store-atlas__btn store-atlas__btn--ghost">
              {STORE_ATLAS_COPY.heroSecondaryAr}
            </a>
          </div>
        </div>
        <div className="store-atlas__constellation store-atlas__card relative overflow-hidden p-5">
          <img
            src={focused?.sectorImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
          />
          <div className="relative z-10">
            <div className="mb-3 flex flex-wrap gap-2">
              {STORE_ATLAS_CARDS.slice(0, 6).map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setFocusId(card.id)}
                  className="store-atlas__chip min-h-11 px-3 text-sm font-bold"
                >
                  {card.nameAr}
                </button>
              ))}
            </div>
            {focused ? (
              <div className="flex justify-center">
                <ProductUiPreview kind={focused.uiKind} compact={compact} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
