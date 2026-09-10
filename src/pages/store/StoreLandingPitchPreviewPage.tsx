/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة تحريرية لواجهة /store — بلا فهرسة ولا نشر تلقائي.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreLandingPhilosophySection } from '@/components/store/StoreLandingPhilosophySection';
import { StoreLandingPitchHero } from '@/components/store/StoreLandingPitchHero';
import { STORE_LANDING_PITCH_COPY } from '@/config/storeLandingPitchCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

function scrollToPreviewSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function StoreLandingPitchPreviewPage() {
  useDocumentTitle('معاينة — واجهة متجر خريطة الحل');

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
      <p className="mx-auto max-w-5xl px-4 pt-4 text-center text-sm font-bold leading-7 text-amber-200/90">
        {STORE_LANDING_PITCH_COPY.previewBannerAr}
      </p>
      <StoreLandingPitchHero onExplore={() => scrollToPreviewSection('preview-product-bridge')} />
      <StoreLandingPhilosophySection />
      <section id="preview-definitions" className="scroll-mt-14 px-4 pb-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[#e8c547]/25 bg-[#e8c547]/[0.05] p-5">
            <h3 className="text-base font-extrabold text-[#e8c547]">صفحة زبائنك الخاصة</h3>
            <p className="mt-3 text-base leading-8 text-white/78">
              {STORE_LANDING_PITCH_COPY.dedicatedPageDefinitionAr}
            </p>
          </article>
          <article className="rounded-2xl border border-teal-300/20 bg-teal-400/[0.04] p-5">
            <h3 className="text-base font-extrabold text-teal-100">تعريف «جار الحي»</h3>
            <p className="mt-3 text-base leading-8 text-white/78">
              {STORE_LANDING_PITCH_COPY.neighborGuestDefinitionAr}
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-white/65">
              {STORE_LANDING_PITCH_COPY.neighborGuestShortAr}
            </p>
          </article>
        </div>
      </section>
      <section id="preview-product-bridge" className="scroll-mt-14 px-4 pb-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/12 bg-black/25 px-5 py-6 text-center">
          <p className="text-base leading-8 text-white/75">{STORE_LANDING_PITCH_COPY.previewBridgeAr}</p>
          <Link
            to={`${ROUTE_PATHS.STORE_LANDING}#store-browse-neighborhood`}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#e8c547]/40 px-5 py-2.5 text-sm font-bold text-[#e8c547]"
          >
            {STORE_LANDING_PITCH_COPY.previewBridgeCtaAr}
          </Link>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
