/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة "صفحة المسارات" — تعيد تقديم كتالوج الحلول كمسارات مهنية.
 * تجريبية ومعزولة تماماً (/store/paths-lab): لا تمس الفهرس الحالي، ولا
 * منطق الدفع أو الطلب. قرار الدمج النهائي لكروسور بعد المراجعة.
 */
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PathsHero } from '@/components/store/paths/PathsHero';
import { PathSearch } from '@/components/store/paths/PathSearch';
import { OperatingModelFilter } from '@/components/store/paths/OperatingModelFilter';
import { ProductPathGrid } from '@/components/store/paths/ProductPathGrid';
import { PathHelpBanner } from '@/components/store/paths/PathHelpBanner';
import { SharedDeliverablesSection } from '@/components/store/paths/SharedDeliverablesSection';
import {
  PRODUCT_PATH_OPERATING_MODEL_OPTIONS,
  STORE_PRODUCT_PATHS,
  productPathSearchHaystack,
} from '@/lib/storeProductPathAdapter';
import type { ProductPathOperatingModel } from '@/config/storeProductPathTypes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StorePathEvents } from '@/lib/storePathAnalytics';

const GRID_ANCHOR_ID = 'paths-grid';
const HELP_ANCHOR_ID = 'paths-help';

export const STORE_PATHS_LAB_ENABLED = true;

export default function StorePathsLabPage() {
  useDocumentTitle('صفحة المسارات — خريطة الحل | معاينة');
  const [query, setQuery] = useState('');
  const [model, setModel] = useState<ProductPathOperatingModel | 'all'>('all');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    StorePathEvents.labView();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const timer = window.setTimeout(() => StorePathEvents.search(trimmed.length), 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    StorePathEvents.filterApply(model);
  }, [model]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return STORE_PRODUCT_PATHS.filter((path) => {
      if (model !== 'all' && path.operatingModel !== model) return false;
      if (!needle) return true;
      return productPathSearchHaystack(path).includes(needle);
    });
  }, [query, model]);

  if (!STORE_PATHS_LAB_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <div className="min-h-screen bg-[#e9e5dc] px-3 py-6 sm:px-6 sm:py-10" dir="rtl">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8">
        <PathsHero
          onExplore={() => document.getElementById(GRID_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth' })}
          onHelp={() => document.getElementById(HELP_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth' })}
        />

        <div id={GRID_ANCHOR_ID} className="flex flex-col gap-5 scroll-mt-6">
          <PathSearch value={query} onChange={setQuery} />
          <OperatingModelFilter options={PRODUCT_PATH_OPERATING_MODEL_OPTIONS} active={model} onChange={setModel} />
          <ProductPathGrid
            paths={filtered}
            onReset={() => {
              setQuery('');
              setModel('all');
            }}
          />
        </div>

        <div id={HELP_ANCHOR_ID} className="scroll-mt-6">
          <PathHelpBanner />
        </div>

        <SharedDeliverablesSection />
      </div>
    </div>
  );
}
