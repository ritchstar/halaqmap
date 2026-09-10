/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة خطة تشغيل وتسويق خضارنا1 — بلا فهرسة.
 */
import { useEffect } from 'react';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreProduceOpsPlanView } from '@/components/store/produce/StoreProduceOpsPlanView';
import { STORE_PRODUCE_OPS_PLAN_COPY } from '@/config/storeProduceOpsPlanCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function StoreProduceOpsPlanPreviewPage() {
  useDocumentTitle(STORE_PRODUCE_OPS_PLAN_COPY.documentTitle);

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
      <StoreProduceOpsPlanView preview />
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
