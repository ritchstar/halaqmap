/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعريف متجر halaqmap على واجهة المتجر — من نحن.
 */
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreLaterServicesSection } from '@/components/store/StoreLaterServicesSection';
import { StoreShot } from '@/components/store/StoreShot';
import { LICENSED_COMMERCIAL_ACTIVITIES } from '@/config/licensedCommercialActivities';
import {
  STORE_ABOUT_COPY,
  STORE_BRAND_LATIN,
  STORE_LIVE_PRODUCTS,
  STORE_PUBLIC_NAME_AR,
  STORE_VISUALS,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreAboutPage() {
  useDocumentTitle(STORE_ABOUT_COPY.documentTitle);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <header className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_ABOUT_COPY.kicker}</p>
              <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">
                {STORE_ABOUT_COPY.titleAr}
              </h1>
              <p className="mt-2 text-2xl font-extrabold text-[#e8c547]">
                <span dir="ltr" className="inline-block tracking-wide">
                  {STORE_BRAND_LATIN}
                </span>
                <span className="mx-2 text-white/35">·</span>
                {STORE_PUBLIC_NAME_AR}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
                {STORE_ABOUT_COPY.intro}
              </p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-[#e8c547]/30 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]">
              <StoreShot
                src={STORE_VISUALS.hero}
                alt="واجهة برمجية لمتجر halaqmap"
                className="aspect-[4/3]"
                eager
              />
            </figure>
          </header>

          <section className="mt-12 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.natureTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/75 md:text-base md:leading-8">
              {STORE_ABOUT_COPY.natureBody}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {STORE_ABOUT_COPY.naturePoints.map((point) => (
                <li
                  key={point}
                  className="rounded-xl border border-white/10 bg-[#061018]/70 px-4 py-3 text-sm leading-7 text-white/80 md:text-base"
                >
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="mt-5 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.natureCta}
            </Link>
          </section>

          <section className="mt-8 rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.trustTeaserTitleAr}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              {STORE_ABOUT_COPY.trustTeaserBodyAr}
            </p>
            <Link
              to={ROUTE_PATHS.STORE_TRUST}
              className="mt-5 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.trustTeaserCtaAr}
            </Link>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.activitiesTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              {STORE_ABOUT_COPY.activitiesLead}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {LICENSED_COMMERCIAL_ACTIVITIES.map((activity) => (
                <li
                  key={activity.code}
                  className="rounded-xl border border-white/12 bg-white/[0.04] p-4"
                >
                  <p className="font-extrabold text-[#f4efe4]">{activity.label}</p>
                  <p className="mt-1 text-sm text-[#e8c547]">
                    <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.8rem]">
                      {activity.code}
                    </code>
                    {activity.primary ? (
                      <span className="ms-2 font-bold text-[#e8c547]">النشاط الرئيسي</span>
                    ) : null}
                  </p>
                  {activity.definition ? (
                    <p className="mt-2 text-sm text-white/60">{activity.definition}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.productsTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              {STORE_ABOUT_COPY.productsLead}
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {STORE_LIVE_PRODUCTS.map((product) => (
                <li key={product.id}>
                  <a
                    href={product.href}
                    className="block overflow-hidden rounded-2xl border border-white/12 bg-[#0b1a24]/70 transition hover:border-[#e8c547]/40"
                  >
                    <StoreShot src={product.image} alt={product.imageAlt} className="aspect-[16/9]" />
                    <div className="flex items-start gap-3 p-4">
                      <img
                        src={product.mark}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#e8c547]">{product.nameAr}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">{product.blurb}</p>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
              <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.cloudTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75 md:text-base md:leading-8">
                {STORE_ABOUT_COPY.cloudLead}
              </p>
              <ul className="mt-4 space-y-2">
                {STORE_ABOUT_COPY.cloudPoints.map((point) => (
                  <li key={point} className="text-sm leading-7 text-white/72 md:text-base">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04]">
              <StoreShot
                src={STORE_VISUALS.radar}
                alt="رادار استعلام برمجي لمنتج حلاق ماب ضمن أعمال المتجر"
                className="aspect-[16/9]"
              />
              <div className="p-5 md:p-6">
                <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.detailsTitle}</h2>
                <ul className="mt-4 space-y-2">
                  {STORE_ABOUT_COPY.detailsIn.map((item) => (
                    <li key={item} className="text-sm leading-7 text-white/72">
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {STORE_ABOUT_COPY.detailsOut.map((item) => (
                    <li key={item} className="text-sm leading-7 text-white/55">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.customTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base md:leading-8">
              {STORE_ABOUT_COPY.customBody}
            </p>
            <div className="mt-8">
              <StoreLaterServicesSection nested />
            </div>
            <h3 className="mt-8 text-xl font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.processTitle}</h3>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {STORE_ABOUT_COPY.processSteps.map((step) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-white/12 bg-[#061018]/80 p-4"
                >
                  <p className="text-sm font-bold text-[#e8c547]">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{step.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-2xl border border-white/12 bg-white/[0.04] p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.ctaTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/75">{STORE_ABOUT_COPY.ctaLead}</p>
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="mt-5 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.ctaLabel}
            </Link>
          </section>
        </div>
      </article>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
