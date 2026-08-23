/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { AffiliateStoreLane } from '@/components/affiliate/AffiliateStoreLane';
import { STORE_AFFILIATE_COPY } from '@/config/storeAffiliateLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { StoreAffiliatesChrome } from '@/pages/store/StoreAffiliatesChrome';

export default function StoreAffiliatesDeskPage() {
  useDocumentTitle(STORE_AFFILIATE_COPY.deskTitleAr);

  return (
    <StoreAffiliatesChrome>
      <div className="text-center">
        <h1 className="text-3xl font-black text-white">{STORE_AFFILIATE_COPY.deskTitleAr}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.deskGateAr}</p>
      </div>
      <AffiliateStoreLane hideCatalog />
    </StoreAffiliatesChrome>
  );
}
