/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type CSSProperties } from 'react';
import type { SolutionCatalogProduct, SolutionCatalogStripe } from '@/config/storeSolutionCatalog';
import { sanitizeStoreProductImageSrc } from '@/lib/storeDisallowedImagery';

const stripeFallbackBg: Record<SolutionCatalogStripe, string> = {
  brick: '#b84c3a',
  blue: '#1d4f69',
  yellow: '#8b6a13',
};

const stripeModernColor: Record<SolutionCatalogStripe, string> = {
  brick: '#f0b4a4',
  blue: '#9ec5d8',
  yellow: '#f5df9a',
};

function splitCatalogProductName(nameAr: string): { classic: string; modern: string | null } {
  const match = nameAr.trim().match(/^(.+?)(\d+)$/);
  if (match) return { classic: match[1], modern: match[2] };
  return { classic: nameAr, modern: null };
}

type SolutionCatalogProductCardProps = {
  product: SolutionCatalogProduct;
  onOpen: (product: SolutionCatalogProduct) => void;
};

export function SolutionCatalogProductCard({ product, onOpen }: SolutionCatalogProductCardProps) {
  const [imageOk, setImageOk] = useState(true);
  const safeSrc = sanitizeStoreProductImageSrc(product.cardImageSrc);
  const { classic, modern } = splitCatalogProductName(product.nameAr);
  const firstCharacter = product.nameAr.trim().charAt(0) || '؟';
  const showImage = Boolean(safeSrc) && imageOk;

  return (
    <button
      type="button"
      className={`solution-catalog__card-btn solution-catalog__card-btn--${product.stripe}`}
      onClick={() => onOpen(product)}
      aria-label={`فتح بطاقة ${product.nameAr}`}
      style={
        {
          '--sc-card-accent': stripeModernColor[product.stripe],
        } as CSSProperties
      }
    >
      <article className="solution-catalog__card">
        {showImage ? (
          <img
            className="solution-catalog__card-image"
            src={safeSrc}
            alt={`صورة ${product.nameAr}`}
            loading="lazy"
            decoding="async"
            onError={() => setImageOk(false)}
          />
        ) : (
          <div
            className="solution-catalog__card-fallback"
            style={{ backgroundColor: stripeFallbackBg[product.stripe] }}
            aria-hidden="true"
          >
            {firstCharacter}
          </div>
        )}
        <div className="solution-catalog__card-wash" aria-hidden="true" />
        <div className="solution-catalog__card-meta">
          <span className="solution-catalog__code">{product.code}</span>
          <span className="solution-catalog__card-category">{product.categoryAr}</span>
        </div>
        <div className="solution-catalog__card-content">
          <span className="solution-catalog__card-latin">{product.nameEn}</span>
          <h3 className="solution-catalog__card-title">
            <span className="solution-catalog__card-title-classic">{classic}</span>
            {modern ? <span className="solution-catalog__card-title-modern">{modern}</span> : null}
          </h3>
          <p className="solution-catalog__card-summary">{product.summaryAr}</p>
        </div>
      </article>
    </button>
  );
}
