/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * محوّل تصنيف الدعوة الحرة — رجالي أو نسائي من البداية.
 */
import { Link, Navigate } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { STORE_EVENT_LIVE, STORE_EVENT_LIVE_PUBLIC_ENABLED } from '@/config/storeEventLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreEventHubPage() {
  useDocumentTitle(STORE_EVENT_LIVE.documentTitle);

  if (!STORE_EVENT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_EVENT_LIVE.hubKickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4]">{STORE_EVENT_LIVE.hubTitleAr}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/75">{STORE_EVENT_LIVE.hubLeadAr}</p>
          <p className="mt-4 text-2xl font-black text-[#e8c547]">{STORE_EVENT_LIVE.priceLineAr}</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <Link
            to={ROUTE_PATHS.STORE_EVENT_MEN}
            className="overflow-hidden rounded-2xl border border-[#e8c547]/35 bg-[#0b1a24]/80 text-right"
          >
            <img src="/images/store/lab/lab-luxury-gold.png" alt="" className="aspect-[16/8] w-full object-cover" />
            <div className="p-5">
              <h2 className="text-xl font-extrabold">{STORE_EVENT_LIVE.hubMenTitleAr}</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_EVENT_LIVE.hubMenLeadAr}</p>
              <span className="mt-4 inline-flex text-sm font-bold text-[#e8c547]">{STORE_EVENT_LIVE.hubMenCtaAr}</span>
            </div>
          </Link>
          <Link
            to={ROUTE_PATHS.STORE_EVENT_WOMEN}
            className="overflow-hidden rounded-2xl border border-[#e4b7c5]/35 bg-[#0b1a24]/80 text-right"
          >
            <img src="/images/store/lab/lab-luxury-rosegold.png" alt="" className="aspect-[16/8] w-full object-cover" />
            <div className="p-5">
              <h2 className="text-xl font-extrabold">{STORE_EVENT_LIVE.hubWomenTitleAr}</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_EVENT_LIVE.hubWomenLeadAr}</p>
              <span className="mt-4 inline-flex text-sm font-bold text-[#e4b7c5]">{STORE_EVENT_LIVE.hubWomenCtaAr}</span>
            </div>
          </Link>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
