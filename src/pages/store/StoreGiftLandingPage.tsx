/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هدية خريطة الحل — صفحة المشاركة.
 */
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreGiftEnterForm } from '@/components/store/StoreGiftEnterForm';
import {
  STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED,
  STORE_GIFT_COPY,
} from '@/config/storeGiftCampaign';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchStoreGiftState, type StoreGiftPublicState } from '@/lib/storeGiftCampaignRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreGiftLandingPage() {
  useDocumentTitle(STORE_GIFT_COPY.documentTitle);
  const [state, setState] = useState<StoreGiftPublicState | null>(null);

  useEffect(() => {
    void fetchStoreGiftState().then(setState);
  }, []);

  if (!STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const copy = STORE_GIFT_COPY;
  const exhausted = state?.exhausted === true;
  const closed = state?.closed === true && !exhausted;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-wide text-[#e8c547]">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">{copy.titleAr}</h1>
          <p className="mt-4 text-base leading-8 text-white/78 md:text-lg">{copy.leadAr}</p>

          <section className="mt-8 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{copy.differenceTitleAr}</h2>
            <p className="mt-3 text-sm leading-7 text-white/75">{copy.weddingDiffAr}</p>
            <p className="mt-2 text-sm leading-7 text-white/75">{copy.eventDiffAr}</p>
          </section>

          {state ? (
            <p className="mt-6 text-sm font-bold text-[#e8c547]">
              {copy.cycleLabelAr} {state.slotNo} {copy.ofSlotsAr}
              {' · '}
              {copy.qualifiedLabelAr} {state.qualifiedCount} {copy.ofCapAr}
            </p>
          ) : null}

          {exhausted ? <p className="mt-4 text-sm leading-7 text-white/75">{copy.exhaustedAr}</p> : null}
          {closed ? <p className="mt-4 text-sm leading-7 text-white/75">{copy.closedAr}</p> : null}

          <div className="mt-8">
            <StoreGiftEnterForm accepting={Boolean(state?.accepting ?? true)} />
          </div>

          {state?.nominees?.length ? (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{copy.nomineesTitleAr}</h2>
              <ul className="mt-3 space-y-2">
                {state.nominees.map((row) => (
                  <li
                    key={`${row.slotNo}-${row.givenName}`}
                    className="rounded-xl border border-[#e8c547]/20 bg-[#0b1a24]/70 px-4 py-3 text-sm text-white/80"
                  >
                    <span className="font-extrabold text-[#e8c547]">{row.givenName}</span>
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
