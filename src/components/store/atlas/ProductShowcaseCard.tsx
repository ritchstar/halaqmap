/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import { STORE_ATLAS_COPY, storeAtlasCardCtaAr, type StoreAtlasCard } from '@/config/storeAtlasTokens';

export function ProductShowcaseCard({ card }: { card: StoreAtlasCard }) {
  const external = card.href.startsWith('http');
  const cta = storeAtlasCardCtaAr(card.status);
  const body = (
    <>
      <div className="relative overflow-hidden rounded-[20px] border border-[var(--atlas-line)] bg-[#07141c] p-3">
        <img
          src={card.sectorImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative flex justify-center py-2">
          <ProductUiPreview kind={card.uiKind} compact actionAr={card.uiKind === 'produce' ? 'أرسل الطلب للصندوق' : 'أكمل الطلب'} />
        </div>
      </div>
      <h3 className="store-atlas__card-title mt-4">{card.nameAr}</h3>
      <p className="store-atlas__meta mt-2 font-extrabold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.forWhomLabelAr}</p>
      <p className="store-atlas__body mt-1">{card.forWhomAr}</p>
      <p className="store-atlas__body mt-2 text-[var(--atlas-muted)]">{card.resultAr}</p>
      <ul className="store-atlas__meta mt-3 space-y-1 text-[var(--atlas-ivory)]">
        {card.caps.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
      <span className="store-atlas__btn store-atlas__btn--teal mt-4 w-full">{cta}</span>
    </>
  );

  if (external) {
    return (
      <a href={card.href} data-atlas-card={card.id} className="store-atlas__card block p-5" target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link to={card.href} data-atlas-card={card.id} className="store-atlas__card block p-5">
      {body}
    </Link>
  );
}
