/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هدية بخورنا1 — صفحة المشاركة.
 */
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreBakhurnaGiftEnterForm } from '@/components/store/StoreBakhurnaGiftEnterForm';
import {
  STORE_BAKHURNA_GIFT_CAMPAIGN_PUBLIC_ENABLED,
  STORE_BAKHURNA_GIFT_COPY,
} from '@/config/storeBakhurnaGiftCampaign';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchStoreBakhurnaGiftState, type StoreBakhurnaGiftPublicState } from '@/lib/storeBakhurnaGiftCampaignRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreBakhurnaGiftLandingPage() {
  useDocumentTitle(STORE_BAKHURNA_GIFT_COPY.documentTitle);
  const [state, setState] = useState<StoreBakhurnaGiftPublicState | null>(null);

  useEffect(() => {
    void fetchStoreBakhurnaGiftState().then(setState);
  }, []);

  if (!STORE_BAKHURNA_GIFT_CAMPAIGN_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_BAKHURNA} replace />;
  }

  const copy = STORE_BAKHURNA_GIFT_COPY;
  const exhausted = state?.exhausted === true;
  const closed = state?.closed === true && !exhausted;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-wide text-[#6E4A26]">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">{copy.titleAr}</h1>
          <p className="mt-4 text-base leading-8 text-white/78 md:text-lg">{copy.leadAr}</p>

          <section className="mt-8 rounded-2xl border border-white/12 bg-[#1a140c]/80 p-5">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{copy.packTitleAr}</h2>
            <p className="mt-3 text-sm leading-7 text-white/75">{copy.packBodyAr}</p>
          </section>

          {state ? (
            <p className="mt-6 text-sm font-bold text-[#6E4A26]">
              {copy.cycleLabelAr} {state.slotNo} {copy.ofSlotsAr}
              {' · '}
              {copy.qualifiedLabelAr} {state.qualifiedCount} {copy.ofCapAr}
            </p>
          ) : null}

          {exhausted ? <p className="mt-4 text-sm leading-7 text-white/75">{copy.exhaustedAr}</p> : null}
          {closed ? <p className="mt-4 text-sm leading-7 text-white/75">{copy.closedAr}</p> : null}

          <div className="mt-8">
            <StoreBakhurnaGiftEnterForm accepting={Boolean(state?.accepting ?? true)} />
          </div>

          {state?.nominees?.length ? (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{copy.nomineesTitleAr}</h2>
              <ul className="mt-3 space-y-2">
                {state.nominees.map((row) => (
                  <li
                    key={`${row.slotNo}-${row.givenName}`}
                    className="rounded-xl border border-[#6E4A26]/20 bg-[#1a140c]/70 px-4 py-3 text-sm text-white/80"
                  >
                    <span className="font-extrabold text-[#6E4A26]">{row.givenName}</span>
                    {' · '}
                    {row.productLabelAr}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
