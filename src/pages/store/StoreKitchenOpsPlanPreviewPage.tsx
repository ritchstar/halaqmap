/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة دليل تشغيل وتسويق طبختنا1 — بلا فهرسة.
 */
import { useEffect } from 'react';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreKitchenOpsPlanView } from '@/components/store/kitchen/StoreKitchenOpsPlanView';
import { STORE_KITCHEN_OPS_PLAN_COPY } from '@/config/storeKitchenOpsPlanCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function StoreKitchenOpsPlanPreviewPage() {
  useDocumentTitle(STORE_KITCHEN_OPS_PLAN_COPY.documentTitle);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <StoreKitchenOpsPlanView preview />
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
