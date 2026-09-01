/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة دليل تشغيل وتسويق منتج المتجر. تُختار بالنطاق لا بإعداد يُستورد من App.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreProductSupportGuideView } from '@/components/store/StoreProductSupportGuide';
import { storeProductSupportByPath } from '@/config/storeProductSupport';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreProductSupportPage() {
  const location = useLocation();
  const guide = storeProductSupportByPath(location.pathname);
  useDocumentTitle(guide?.documentTitle || 'halaqmap');

  if (!guide) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <StoreProductSupportGuideView guide={guide} />
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
