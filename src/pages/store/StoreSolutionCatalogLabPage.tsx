/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة فهرس خريطة الحل (كتالوج شاتلي) — داخلية بلا noindex حتى قرار التعميم.
 */
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { SolutionCatalogApp } from '@/components/store/catalog/SolutionCatalogApp';
import {
  STORE_SOLUTION_CATALOG_COPY,
  STORE_SOLUTION_CATALOG_LAB_ENABLED,
} from '@/config/storeSolutionCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import '@/styles/storeSolutionCatalog.css';

export default function StoreSolutionCatalogLabPage() {
  useDocumentTitle(STORE_SOLUTION_CATALOG_COPY.documentTitle);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!STORE_SOLUTION_CATALOG_LAB_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return <SolutionCatalogApp />;
}
