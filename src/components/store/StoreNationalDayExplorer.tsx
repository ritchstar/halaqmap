/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NATIONAL_DAY_SEGMENTS,
  STORE_NATIONAL_DAY_COPY,
  nationalDayProductsForSegment,
  type NationalDaySegmentId,
} from '@/config/storeNationalDay';
import { cn } from '@/lib/utils';

export function StoreNationalDayExplorer() {
  const copy = STORE_NATIONAL_DAY_COPY;
  const [segment, setSegment] = useState<NationalDaySegmentId>('daily_retail');
  const products = useMemo(() => nationalDayProductsForSegment(segment), [segment]);

  return (
    <section className="store-national-day__section" aria-labelledby="national-day-explorer">
      <h2 id="national-day-explorer" className="store-national-day__section-title">
        {copy.explorerTitleAr}
      </h2>
      <p className="store-national-day__section-lead">{copy.explorerLeadAr}</p>
      <div className="store-national-day__chips" role="tablist" aria-label={copy.explorerTitleAr}>
        {NATIONAL_DAY_SEGMENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={segment === item.id}
            className={cn('store-national-day__chip', segment === item.id && 'store-national-day__chip--active')}
            onClick={() => setSegment(item.id)}
          >
            {item.labelAr}
          </button>
        ))}
      </div>
      <ul className="store-national-day__product-list">
        {products.map((product) => (
          <li key={product.id} className="store-national-day__product-card">
            <p className="store-national-day__product-label">{product.labelAr}</p>
            <h3 className="store-national-day__product-headline">{product.headlineAr}</h3>
            <p className="store-national-day__product-story">{product.storyAr}</p>
            <Link to={product.href} className="store-national-day__btn store-national-day__btn--ghost">
              {copy.productCtaAr}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
