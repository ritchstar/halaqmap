/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { STORE_GIFT_COPY } from '@/config/storeGiftCampaign';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { confirmStoreGift } from '@/lib/storeGiftCampaignRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreGiftConfirmPage() {
  useDocumentTitle(STORE_GIFT_COPY.confirmTitleAr);
  const [message, setMessage] = useState(STORE_GIFT_COPY.confirmLeadAr);

  useEffect(() => {
    const token = readHashQueryParam('t') || '';
    if (!token) {
      setMessage(STORE_GIFT_COPY.confirmFailAr);
      return;
    }
    void confirmStoreGift(token).then((result) => {
      setMessage(result.ok ? STORE_GIFT_COPY.confirmOkAr : result.error || STORE_GIFT_COPY.confirmFailAr);
    });
  }, []);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-6 text-center">
          <h1 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_GIFT_COPY.confirmTitleAr}</h1>
          <p className="mt-4 text-sm leading-7 text-white/75">{message}</p>
          <Link
            to={ROUTE_PATHS.STORE_GIFT}
            className="mt-6 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
          >
            {STORE_GIFT_COPY.kickerAr}
          </Link>
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
