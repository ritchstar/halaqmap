/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductInterfaceFrame } from '@/components/store/atlas/ProductInterfaceFrame';
import { STORE_ATLAS_CARDS, STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasHero({ compact = false }: { compact?: boolean }) {
  const [focusId, setFocusId] = useState(STORE_ATLAS_CARDS[0]?.id ?? 'produce');
  const focused = STORE_ATLAS_CARDS.find((card) => card.id === focusId) ?? STORE_ATLAS_CARDS[0];

  return (
    <section className={compact ? 'px-3 py-8' : 'px-4 py-16 md:py-20'}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className={compact ? 'text-[2.1rem] font-extrabold leading-tight' : 'text-5xl font-extrabold leading-tight md:text-6xl'}>
            {STORE_ATLAS_COPY.heroTitleAr}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.heroLeadAr}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-atlas__btn store-atlas__btn--gold">
              {STORE_ATLAS_COPY.heroPrimaryAr}
            </Link>
            <a href="#atlas-products" className="store-atlas__btn store-atlas__btn--ghost">
              {STORE_ATLAS_COPY.heroSecondaryAr}
            </a>
          </div>
        </div>
        <div className="store-atlas__constellation store-atlas__card relative min-h-[22rem] overflow-hidden p-5">
          <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full opacity-70" aria-hidden>
            <path d="M28 190 C80 140, 120 80, 210 70 S300 40, 290 20" fill="none" stroke="#0D9488" strokeWidth="1" />
            <path d="M20 40 C90 70, 140 150, 250 180" fill="none" stroke="#1D3340" strokeWidth="1" />
            {STORE_ATLAS_CARDS.slice(0, 7).map((card, index) => {
              const x = 36 + ((index * 41) % 250);
              const y = 36 + ((index * 29) % 170);
              const on = card.id === focusId;
              return (
                <circle
                  key={card.id}
                  cx={x}
                  cy={y}
                  r={on ? 6 : 3.5}
                  fill={on ? '#E8C547' : '#0D9488'}
                />
              );
            })}
          </svg>
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
            {focused ? <ProductInterfaceFrame src={focused.image} alt={focused.imageAlt} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
