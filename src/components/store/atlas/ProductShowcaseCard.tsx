/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة منتج بطبقتين: سطح فاتح للمحتوى، وقشرة رقمية داكنة لمعاينة الواجهة.
 */
import { Link } from 'react-router-dom';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import {
  STORE_ATLAS_COPY,
  STORE_ATLAS_SECTORS,
  storeAtlasCardGlow,
  type StoreAtlasCard,
} from '@/config/storeAtlasTokens';
import { isGeneralTrialProduct } from '@/config/storeProductTrial';

function sectorTitleAr(sector: StoreAtlasCard['sector']): string {
  return STORE_ATLAS_SECTORS.find((item) => item.id === sector)?.titleAr ?? '';
}

export function ProductShowcaseCard({ card }: { card: StoreAtlasCard }) {
  const external = card.href.startsWith('http');
  const idle = card.status === 'brief';
  const showTrial = isGeneralTrialProduct(card.id);
  const ctaAr = showTrial ? STORE_ATLAS_COPY.tryNowAr : `${STORE_ATLAS_COPY.discoverPrefixAr} ${card.nameAr}`;
  const body = (
    <>
      <div className="store-atlas__product-shell">
        <img
          src={card.sectorImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />
        <svg className="store-atlas__card-signals" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <circle cx="92" cy="10" r="1.8" fill="var(--signal-color, #35c9bb)" opacity={idle ? 0.35 : 1} />
          <path
            d="M 92 12 L 92 34"
            fill="none"
            stroke="var(--signal-color, #35c9bb)"
            opacity={idle ? 0.3 : 0.6}
            strokeWidth="0.7"
            strokeDasharray="2.5 3"
          />
          <circle cx="92" cy="36" r="1.3" fill="none" stroke="var(--signal-gold, #e8c547)" strokeWidth="0.7" opacity="0.7" />
        </svg>
        <div className="relative flex justify-center px-3 py-4">
          <ProductUiPreview
            kind={card.uiKind}
            compact
            actionAr={card.uiKind === 'produce' ? 'أرسل الطلب للصندوق' : 'أكمل الطلب'}
          />
        </div>
      </div>
      <div className="store-atlas__product-content">
        <span className="store-atlas__product-badge">{sectorTitleAr(card.sector)}</span>
        <h3 className="store-atlas__product-name">
          <span className={idle ? 'store-atlas__node is-idle' : 'store-atlas__node'} aria-hidden />
          {card.nameAr}
        </h3>
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.forWhomLabelAr}</p>
        <p className="store-atlas__product-audience">{card.forWhomAr}</p>
        <p className="store-atlas__product-result">{card.resultAr}</p>
        <ul className="store-atlas__product-caps">
          {card.caps.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>
        <div className="store-atlas__product-actions">
          <span className="store-atlas__btn store-atlas__btn--primary w-full">
            {ctaAr} <span className="store-atlas__cta-arrow">←</span>
          </span>
        </div>
      </div>
    </>
  );

  const glow = storeAtlasCardGlow(card.id);
  const shared = {
    'data-atlas-card': card.id,
    'data-atlas-glow': card.id,
    className: 'store-atlas__product-card',
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
