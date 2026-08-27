/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مزايا منتجات المتجر — صفحة زائر مستقلة عن من نحن.
 */
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { STORE_BRAND_LATIN } from '@/config/storeFront';
import { STORE_PRODUCT_BENEFITS_COPY } from '@/config/storeProductBenefitsCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreProductBenefitsPage() {
  useDocumentTitle(STORE_PRODUCT_BENEFITS_COPY.documentTitle);
  const copy = STORE_PRODUCT_BENEFITS_COPY;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <header>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{copy.kickerAr}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">
              {copy.titleAr}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/78 md:text-lg">{copy.leadAr}</p>
          </header>

          <section className="mt-10 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-7">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.whatTitleAr}</h2>
            <p className="mt-3 text-sm leading-7 text-white/78 md:text-base md:leading-8">{copy.whatBodyAr}</p>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              {copy.markBeforeAr}
              <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-[#e8c547]">
                {STORE_BRAND_LATIN}
              </code>
              {copy.markAfterAr}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.advantagesTitleAr}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {copy.advantages.map((item) => (
                <li
                  key={item.titleAr}
                  className="rounded-xl border border-white/10 bg-[#0b1a24]/70 px-4 py-4"
                >
                  <p className="font-extrabold text-[#e8c547]">{item.titleAr}</p>
                  <p className="mt-2 text-sm leading-7 text-white/75">{item.bodyAr}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-white/70">
              {copy.payHostBeforeAr}
              <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-[#e8c547]">
                www.halaqmap.com
              </code>
              {copy.payHostAfterAr}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.howTitleAr}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {copy.howSteps.map((step) => (
                <li
                  key={step.titleAr}
                  className="rounded-xl border border-white/10 bg-[#061018]/70 px-4 py-3"
                >
                  <p className="font-extrabold text-[#f4efe4]">{step.titleAr}</p>
                  <p className="mt-1 text-sm leading-7 text-white/72">{step.bodyAr}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.familiesTitleAr}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">{copy.familiesLeadAr}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {copy.families.map((family) => (
                <li
                  key={family.titleAr}
                  className="rounded-xl border border-white/10 bg-[#0b1a24]/70 px-4 py-4"
                >
                  <p className="font-extrabold text-[#e8c547]">{family.titleAr}</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{family.bodyAr}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {family.links.map((item) =>
                      item.external ? (
                        <a
                          key={item.labelAr}
                          href={item.to}
                          className="rounded-full border border-[#e8c547]/35 px-3 py-1 text-xs font-bold text-[#e8c547]"
                        >
                          {item.labelAr}
                        </a>
                      ) : (
                        <Link
                          key={item.labelAr}
                          to={item.to}
                          className="rounded-full border border-[#e8c547]/35 px-3 py-1 text-xs font-bold text-[#e8c547]"
                        >
                          {item.labelAr}
                        </Link>
                      ),
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.notTitleAr}</h2>
            <ul className="mt-3 space-y-2">
              {copy.notPoints.map((point) => (
                <li key={point} className="text-sm leading-7 text-white/70 md:text-base">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/80 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.legalTitleAr}</h2>
            <p className="mt-3 text-sm leading-7 text-white/75 md:text-base">{copy.legalLeadAr}</p>
            <ul className="mt-4 space-y-2">
              {copy.legalPoints.map((point) => (
                <li key={point} className="text-sm leading-7 text-white/72 md:text-base">
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={ROUTE_PATHS.STORE_ABOUT}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
              >
                {copy.aboutCtaAr}
              </Link>
              <Link
                to={ROUTE_PATHS.STORE_TRUST}
                className="rounded-full border border-[#e8c547]/40 px-5 py-2.5 text-sm font-extrabold text-[#e8c547]"
              >
                {copy.trustCtaAr}
              </Link>
              <Link
                to={ROUTE_PATHS.STORE_LANDING}
                className="rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
              >
                {copy.shopCtaAr}
              </Link>
            </div>
          </section>

          <p className="mt-8 max-w-3xl text-sm font-bold leading-8 text-[#f4efe4] md:text-base">
            {copy.closeAr}
          </p>
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
