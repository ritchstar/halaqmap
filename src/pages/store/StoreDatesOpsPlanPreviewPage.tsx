/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة خطة تشغيل وتسويق تمرتنا1 — بلا فهرسة.
 */
import { useEffect } from 'react';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreDatesOpsPlanView } from '@/components/store/dates/StoreDatesOpsPlanView';
import { STORE_DATES_OPS_PLAN_COPY } from '@/config/storeDatesOpsPlanCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function StoreDatesOpsPlanPreviewPage() {
  useDocumentTitle(STORE_DATES_OPS_PLAN_COPY.documentTitle);

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
      <StoreDatesOpsPlanView preview />
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
