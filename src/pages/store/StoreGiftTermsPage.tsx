/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شروط هدايا خريطة الحل — مستقلة عن كاردي8.
 */
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { STORE_GIFT_TERMS_COPY, STORE_GIFT_TERMS_VERSION } from '@/config/storeGiftCampaign';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreGiftTermsPage() {
  useDocumentTitle(STORE_GIFT_TERMS_COPY.documentTitle);
  const copy = STORE_GIFT_TERMS_COPY;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-wide text-[#e8c547]">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold text-[#f4efe4]">{copy.titleAr}</h1>
          <p className="mt-4 text-base leading-8 text-white/75">{copy.subtitleAr}</p>
          <p className="mt-2 text-xs text-white/45">
            {copy.versionLabelAr}: {STORE_GIFT_TERMS_VERSION}
          </p>
          <div className="mt-8 space-y-6">
            {copy.sections.map((section) => (
              <section key={section.titleAr} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
                <h2 className="text-xl font-extrabold text-[#f4efe4]">{section.titleAr}</h2>
                <p className="mt-3 text-sm leading-7 text-white/75">{section.bodyAr}</p>
              </section>
            ))}
          </div>
          <Link
            to={ROUTE_PATHS.STORE_GIFT}
            className="mt-8 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
          >
            {copy.backAr}
          </Link>
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
