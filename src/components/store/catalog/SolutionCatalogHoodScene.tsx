/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد الحي — خريطة الحل كنقطة مركزية تربط نشاطات جار الحي.
 */
import type { CSSProperties } from 'react';
import { ProductMark } from '@/components/store/catalog/ProductMark';
import { StoreBrandMark } from '@/components/store/StoreBrandMark';
import type { SolutionCatalogProduct } from '@/config/storeSolutionCatalog';

const HOOD_NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  'B-01': { x: 14, y: 78 },
  'B-02': { x: 82, y: 28 },
  'B-03': { x: 86, y: 76 },
  'B-04': { x: 12, y: 24 },
  'C-01': { x: 50, y: 12 },
};

function hoodLineColor(stripe: SolutionCatalogProduct['stripe']) {
  if (stripe === 'blue') return 'var(--sc-blue)';
  if (stripe === 'yellow') return 'var(--sc-yellow)';
  return 'var(--sc-brick)';
}

export function SolutionCatalogHoodScene({
  products,
  onOpen,
}: {
  products: readonly SolutionCatalogProduct[];
  onOpen: (product: SolutionCatalogProduct) => void;
}) {
  return (
    <section className="solution-catalog__hood" aria-labelledby="catalog-hood-title">
      <h2 id="catalog-hood-title" className="solution-catalog__hood-title">
        حيّك في واجهة واحدة
      </h2>
      <div className="solution-catalog__hood-stage">
        <svg className="solution-catalog__hood-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {products.map((product) => {
            const layout = HOOD_NODE_LAYOUT[product.code];
            if (!layout) return null;
            return (
              <line
                key={product.code}
                x1="50"
                y1="50"
                x2={layout.x}
                y2={layout.y}
                stroke={hoodLineColor(product.stripe)}
                strokeWidth="0.35"
                opacity="0.42"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <div className="solution-catalog__hood-center" aria-hidden>
          <StoreBrandMark className="solution-catalog__hood-brand" />
          <span className="solution-catalog__hood-center-label">خريطة الحل</span>
        </div>

        <div className="solution-catalog__hood-nodes">
          {products.map((product) => {
            const layout = HOOD_NODE_LAYOUT[product.code];
            if (!layout) return null;
            return (
              <button
                key={product.code}
                type="button"
                className="solution-catalog__hood-node"
                data-stripe={product.stripe}
                style={
                  {
                    '--hood-x': `${layout.x}%`,
                    '--hood-y': `${layout.y}%`,
                  } as CSSProperties
                }
                onClick={() => onOpen(product)}
                aria-label={`${product.nameAr} — ${product.summaryAr}`}
              >
                <span className="solution-catalog__hood-node-mark">
                  <ProductMark
                    logoSrc={product.logoSrc}
                    name={product.nameAr}
                    code={product.code}
                    accent={product.stripe}
                    compact
                  />
                </span>
                <span className="solution-catalog__hood-node-name">{product.nameAr}</span>
                <span className="solution-catalog__hood-node-summary">{product.summaryAr}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const SOLUTION_CATALOG_HOOD_CODES = ['B-01', 'B-02', 'B-03', 'B-04', 'C-01'] as const;
