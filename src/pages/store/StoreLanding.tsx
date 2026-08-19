/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة متجر halaqmap على store.halaqmap.com — البداية.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StoreServiceRequestForm } from '@/components/store/StoreServiceRequestForm';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_GREETING_OCCASIONS,
  STORE_LANDING_COPY,
  STORE_LIVE_PRODUCTS,
  storeCardsPath,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreLanding() {
  useDocumentTitle(STORE_LANDING_COPY.documentTitle);

  useEffect(() => {
    ProductEvents.storeLandingView({ source: 'landing' });
  }, []);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_LANDING_COPY.kicker}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">
            {STORE_LANDING_COPY.latinMark}
          </h1>
          <p className="mt-2 text-2xl font-extrabold text-[#e8c547] md:text-3xl">
            {STORE_LANDING_COPY.publicName}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
            {STORE_LANDING_COPY.heroLead}
          </p>
        </div>
      </section>

      <section id="request" className="px-4 pb-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_LANDING_COPY.requestTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.requestLead}</p>
            <div className="mt-6">
              <StoreServiceRequestForm source="store-landing" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <h2 className="text-xl font-extrabold">المنتجات الحالية</h2>
              <ul className="mt-4 space-y-3">
                {STORE_LIVE_PRODUCTS.map((product) => (
                  <li key={product.id}>
                    <a
                      href={product.href}
                      className="block rounded-xl border border-white/10 bg-[#061018]/70 p-4 transition hover:border-[#e8c547]/40"
                    >
                      <p className="font-extrabold text-[#e8c547]">{product.nameAr}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">{product.blurb}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.comingSoonTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {STORE_LANDING_COPY.comingSoonLead}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
          <h2 className="text-2xl font-extrabold">{STORE_LANDING_COPY.freeCardsTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_LANDING_COPY.freeCardsLead}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STORE_GREETING_OCCASIONS.map((item) => (
              <Link
                key={item.id}
                to={storeCardsPath(item.id)}
                className="rounded-xl border border-white/12 bg-[#061018] p-4 transition hover:border-[#e8c547]/50"
              >
                <p className="font-extrabold text-[#f4efe4]">{item.titleAr}</p>
                <p className="mt-1 text-sm text-white/65">{item.subtitleAr}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#e8c547]">
                  إصدار البطاقة
                  <ArrowLeft className="h-4 w-4" />
                </p>
              </Link>
            ))}
          </div>
          <Link
            to={ROUTE_PATHS.STORE_CARDS}
            className="mt-4 inline-flex text-sm font-bold text-white/70 underline-offset-4 hover:underline"
          >
            فتح الاستوديو
          </Link>
        </div>
      </section>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
