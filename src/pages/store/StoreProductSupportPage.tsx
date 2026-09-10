/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة دليل تشغيل وتسويق منتج المتجر. تُختار بالنطاق لا بإعداد يُستورد من App.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreGrocersOpsPlanView } from '@/components/store/grocers/StoreGrocersOpsPlanView';
import { StoreKitchenOpsPlanView } from '@/components/store/kitchen/StoreKitchenOpsPlanView';
import { StoreProduceOpsPlanView } from '@/components/store/produce/StoreProduceOpsPlanView';
import { StoreProductSupportGuideView } from '@/components/store/StoreProductSupportGuide';
import { STORE_GROCERS_OPS_PLAN_COPY } from '@/config/storeGrocersOpsPlanCopy';
import { STORE_KITCHEN_OPS_PLAN_COPY } from '@/config/storeKitchenOpsPlanCopy';
import { STORE_PRODUCE_OPS_PLAN_COPY } from '@/config/storeProduceOpsPlanCopy';
import { storeProductSupportByPath } from '@/config/storeProductSupport';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreProductSupportPage() {
  const location = useLocation();
  const guide = storeProductSupportByPath(location.pathname);
  const isProduceOpsPlan = location.pathname === ROUTE_PATHS.STORE_PRODUCE_SUPPORT;
  const isKitchenOpsPlan = location.pathname === ROUTE_PATHS.STORE_KITCHEN_SUPPORT;
  const isGrocersOpsPlan = location.pathname === ROUTE_PATHS.STORE_GROCERS_SUPPORT;
  useDocumentTitle(
    isProduceOpsPlan
      ? STORE_PRODUCE_OPS_PLAN_COPY.documentTitle
      : isKitchenOpsPlan
        ? STORE_KITCHEN_OPS_PLAN_COPY.documentTitle
        : isGrocersOpsPlan
          ? STORE_GROCERS_OPS_PLAN_COPY.documentTitle
          : guide?.documentTitle || 'halaqmap',
  );

  if (!guide && !isProduceOpsPlan && !isKitchenOpsPlan && !isGrocersOpsPlan) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      {isProduceOpsPlan ? (
        <StoreProduceOpsPlanView />
      ) : isKitchenOpsPlan ? (
        <StoreKitchenOpsPlanView />
      ) : isGrocersOpsPlan ? (
        <StoreGrocersOpsPlanView />
      ) : guide ? (
        <StoreProductSupportGuideView guide={guide} />
      ) : null}
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
