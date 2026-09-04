/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY, STORE_ATLAS_SECTORS, type StoreAtlasCard } from '@/config/storeAtlasTokens';
import { STORE_VISUALS } from '@/config/storeFront';

export function ProductShowcaseCard({ card }: { card: StoreAtlasCard }) {
  const sector = STORE_ATLAS_SECTORS.find((item) => item.id === card.sector);
  const external = card.href.startsWith('http');
  const cta = `${STORE_ATLAS_COPY.discoverPrefixAr} ${card.nameAr}`;
  const body = (
    <>
      <div className="flex items-center gap-2">
        <img src={STORE_VISUALS.logo} alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
        <p className="text-xs font-bold text-[var(--atlas-teal)]">{sector?.titleAr}</p>
      </div>
      <img src={card.image} alt={card.imageAlt} className="mt-3 aspect-[16/10] w-full rounded-2xl object-cover" />
      <h3 className="mt-4 text-[1.35rem] font-extrabold">{card.nameAr}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">{card.resultAr}</p>
      <ul className="mt-3 space-y-1 text-sm text-[var(--atlas-ivory)]">
        {card.caps.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-bold text-[var(--atlas-teal)]">
        {card.status === 'trial' ? STORE_ATLAS_COPY.statusTrialAr : STORE_ATLAS_COPY.statusBriefAr}
      </p>
      <span className="store-atlas__btn store-atlas__btn--ghost mt-4 w-full">{cta}</span>
    </>
  );

  if (external) {
    return (
      <a href={card.href} className="store-atlas__card block p-4" target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link to={card.href} className="store-atlas__card block p-4">
      {body}
    </Link>
  );
}
