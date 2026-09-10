/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة دليل تشغيل وتسويق تمويناتا1 — بلا فهرسة.
 */
import { useEffect } from 'react';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreGrocersOpsPlanView } from '@/components/store/grocers/StoreGrocersOpsPlanView';
import { STORE_GROCERS_OPS_PLAN_COPY } from '@/config/storeGrocersOpsPlanCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function StoreGrocersOpsPlanPreviewPage() {
  useDocumentTitle(STORE_GROCERS_OPS_PLAN_COPY.documentTitle);

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
      <StoreGrocersOpsPlanView preview />
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
