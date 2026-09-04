/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import { STORE_ATLAS_COPY, storeAtlasCardGlow, type StoreAtlasCard } from '@/config/storeAtlasTokens';
import { isGeneralTrialProduct } from '@/config/storeProductTrial';

export function ProductShowcaseCard({ card }: { card: StoreAtlasCard }) {
  const external = card.href.startsWith('http');
  const showTrial = isGeneralTrialProduct(card.id);
  const body = (
    <>
      <svg className="store-atlas__card-signals" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <circle cx="92" cy="10" r="1.8" fill={card.status === 'brief' ? 'rgb(13 148 136 / 0.28)' : '#35c9bb'} />
        <path
          d="M 92 12 L 92 34"
          fill="none"
          stroke={card.status === 'brief' ? 'rgb(13 148 136 / 0.22)' : 'rgb(13 148 136 / 0.45)'}
          strokeWidth="0.7"
          strokeDasharray="2.5 3"
        />
        <circle cx="92" cy="36" r="1.3" fill="none" stroke="#e8c547" strokeWidth="0.7" opacity="0.7" />
      </svg>
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
      <h3 className="store-atlas__card-title mt-4">
        <span className={card.status === 'brief' ? 'store-atlas__node is-idle' : 'store-atlas__node'} aria-hidden />
        {card.nameAr}
      </h3>
      <p className="store-atlas__meta mt-2 font-extrabold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.forWhomLabelAr}</p>
      <p className="store-atlas__body mt-1">{card.forWhomAr}</p>
      <p className="store-atlas__body mt-2 text-[var(--atlas-muted)]">{card.resultAr}</p>
      <ul className="store-atlas__meta mt-3 space-y-1 text-[var(--atlas-ivory)]">
        {card.caps.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
      {showTrial ? (
        <span className="store-atlas__btn store-atlas__btn--teal-fill mt-4 w-full">{STORE_ATLAS_COPY.tryNowAr}</span>
      ) : (
        <span className="store-atlas__link-cta mt-4">
          اكتشف المنتج <span className="store-atlas__cta-arrow">←</span>
        </span>
      )}
    </>
  );

  const glow = storeAtlasCardGlow(card.id);
  const shared = {
    'data-atlas-card': card.id,
    'data-atlas-glow': card.id,
    className: 'store-atlas__card store-atlas__skin store-atlas__skin--cool block p-5',
    style: { ['--atlas-glow' as string]: glow },
  };

  if (external) {
    return (
      <a href={card.href} {...shared} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link to={card.href} {...shared}>
      {body}
    </Link>
  );
}
