/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعريف متجر halaqmap على واجهة المتجر — عن خريطة الحل.
 */
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreShot } from '@/components/store/StoreShot';
import { LICENSED_COMMERCIAL_ACTIVITIES } from '@/config/licensedCommercialActivities';
import {
  STORE_ABOUT_COPY,
  STORE_ABOUT_FEATURED_PRODUCTS,
  STORE_ABOUT_HERO_COLLAGE,
  STORE_ABOUT_SPECIALIZED_PRODUCTS,
  STORE_COMMISSION_COPY,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

const proseClass = 'max-w-[42rem] text-base leading-[1.75] text-white/78';
const sectionGap = 'mt-14';

function StoreProductName({ children }: { children: string }) {
  return (
    <bdi dir="rtl" className="inline-block [unicode-bidi:isolate]">
      {children}
    </bdi>
  );
}

export default function StoreAboutPage() {
  useDocumentTitle(STORE_ABOUT_COPY.documentTitle);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <header className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_ABOUT_COPY.kickerAr}</p>
              <h1 className="mt-3 text-2xl font-extrabold leading-[1.45] text-[#f4efe4] md:text-3xl lg:text-[2rem]">
                {STORE_ABOUT_COPY.titleAr}
              </h1>
              <p className={`mt-5 ${proseClass}`}>{STORE_ABOUT_COPY.introLeadAr}</p>
              <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.introBodyAr}</p>
              <p className="mt-4 text-base font-bold tracking-wide text-[#e8c547]/90">
                {STORE_ABOUT_COPY.journeyAr}
              </p>
              <p className="mt-2 text-base font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.taglineAr}</p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-white/12 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]">
              <div className="grid grid-cols-2 gap-px bg-white/10">
                {STORE_ABOUT_HERO_COLLAGE.map((frame) => (
                  <StoreShot
                    key={frame.reel}
                    reel={frame.reel}
                    alt={frame.alt}
                    className="aspect-square w-full"
                    eager
                  />
                ))}
              </div>
            </figure>
          </header>

          <section className={sectionGap}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.howTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.howBodyAr}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {STORE_ABOUT_COPY.howPillars.map((pillar) => (
                <li
                  key={pillar.titleAr}
                  className="rounded-xl border border-white/10 bg-[#0b1a24]/70 p-4"
                >
                  <p className="font-extrabold text-[#e8c547]">{pillar.titleAr}</p>
                  <p className="mt-2 text-base leading-[1.75] text-white/75">{pillar.bodyAr}</p>
                </li>
              ))}
            </ul>
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="mt-6 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.howCtaAr}
            </Link>
          </section>

          <section className={sectionGap}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.samplesTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.samplesLeadAr}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {STORE_ABOUT_FEATURED_PRODUCTS.map((product) => (
                <li key={product.id}>
                  <a
                    href={product.href}
                    className="block overflow-hidden rounded-2xl border border-white/12 bg-[#0b1a24]/70 transition hover:border-[#e8c547]/35"
                  >
                    <StoreShot reel={product.reel} alt={product.imageAlt} className="aspect-[16/9]" />
                    <div className="p-4">
                      <p className="text-lg font-extrabold text-[#e8c547]">
                        <StoreProductName>{product.nameAr}</StoreProductName>
                      </p>
                      <p className="mt-2 text-base leading-[1.75] text-white/72">{product.blurbAr}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <p className={`mt-6 ${proseClass}`}>{STORE_ABOUT_COPY.samplesEcosystemAr}</p>
            <div className="mt-8">
              <h3 className="text-xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.specializedGroupTitleAr}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {STORE_ABOUT_SPECIALIZED_PRODUCTS.map((product) => (
                  <li key={product.nameAr}>
                    <a
                      href={product.href}
                      className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-base font-bold text-white/85 transition hover:border-[#e8c547]/40 hover:text-[#e8c547]"
                    >
                      <StoreProductName>{product.nameAr}</StoreProductName>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={`${sectionGap} rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 md:p-7`}>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_ABOUT_COPY.cloudKickerAr}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.cloudTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.cloudBodyAr}</p>
            <Link
              to={ROUTE_PATHS.STORE_PRODUCT_BENEFITS}
              className="mt-5 inline-flex text-base font-bold text-[#7ec8e3] underline-offset-4 hover:underline"
            >
              {STORE_ABOUT_COPY.cloudMoreAr}
            </Link>
          </section>

          <section className={sectionGap}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.modelTitleAr}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/12 bg-[#0b1a24]/70 p-5">
                <h3 className="text-lg font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.modelInTitleAr}</h3>
                <ul className="mt-4 space-y-2">
                  {STORE_ABOUT_COPY.modelIn.map((item) => (
                    <li key={item} className="text-base leading-[1.75] text-white/78">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/12 bg-[#0b1a24]/70 p-5">
                <h3 className="text-lg font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.modelOutTitleAr}</h3>
                <ul className="mt-4 space-y-2">
                  {STORE_ABOUT_COPY.modelOut.map((item) => (
                    <li key={item} className="text-base leading-[1.75] text-white/65">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className={sectionGap}>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_ABOUT_COPY.pathKickerAr}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.pathTitleAr}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {STORE_ABOUT_COPY.pathCards.map((card) => (
                <li
                  key={card.titleAr}
                  className="flex flex-col rounded-xl border border-white/12 bg-[#0b1a24]/70 p-5"
                >
                  <p className="text-lg font-extrabold text-[#e8c547]">{card.titleAr}</p>
                  <p className="mt-3 flex-1 text-base leading-[1.75] text-white/75">{card.bodyAr}</p>
                  <Link
                    to={card.to}
                    className="mt-5 inline-flex w-fit rounded-full bg-[#e8c547] px-4 py-2 text-sm font-extrabold text-[#061018]"
                  >
                    {card.ctaAr}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${sectionGap} rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/80 p-5 md:p-7`}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.trustTitleAr}</h2>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.trustTeaserTitleAr}</h3>
              <p className="mt-2 text-base font-bold text-[#e8c547]">{STORE_ABOUT_COPY.trustTeaserLeadAr}</p>
              <p className={`mt-3 ${proseClass}`}>{STORE_ABOUT_COPY.trustTeaserBodyAr}</p>
              <Link
                to={ROUTE_PATHS.STORE_TRUST}
                className="mt-5 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
              >
                {STORE_ABOUT_COPY.trustTeaserCtaAr}
              </Link>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-xl font-extrabold text-[#f4efe4]">{STORE_ABOUT_COPY.reliabilityTitleAr}</h3>
              <p className={`mt-3 ${proseClass}`}>{STORE_ABOUT_COPY.reliabilityBodyAr}</p>
              <p className={`mt-5 ${proseClass}`}>
                <span className="font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.officialChannelsTitleAr}</span>
                {' '}
                {STORE_ABOUT_COPY.officialChannelsBodyAr}
              </p>
              <p className={`mt-4 ${proseClass}`}>
                <span className="font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.governanceTitleAr}</span>
                {' '}
                {STORE_ABOUT_COPY.governanceBodyAr}
              </p>
              <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.trustLegalAr}</p>
            </div>
          </section>

          <section className={sectionGap}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.activitiesTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.activitiesLeadAr}</p>
            <p className={`mt-3 text-sm leading-[1.75] text-white/55 ${proseClass}`}>
              {STORE_ABOUT_COPY.activitiesFootnoteAr}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {LICENSED_COMMERCIAL_ACTIVITIES.map((activity) => (
                <li
                  key={activity.code}
                  className="rounded-xl border border-white/12 bg-white/[0.04] p-4"
                >
                  <p className="text-base font-extrabold leading-[1.75] text-[#f4efe4]">{activity.label}</p>
                  <p className="mt-2 text-base text-[#e8c547]">
                    {STORE_ABOUT_COPY.activityCodeLabelAr}{' '}
                    <bdi dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-bold">
                      {activity.code}
                    </bdi>
                    {activity.primary ? (
                      <span className="ms-2 font-bold text-[#e8c547]">النشاط الرئيسي</span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${sectionGap} rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 md:p-7`}>
            <p className="text-sm font-bold tracking-wide text-white/45">{STORE_COMMISSION_COPY.kickerAr}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_COMMISSION_COPY.titleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_COMMISSION_COPY.leadAr}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={STORE_COMMISSION_COPY.halaqHref}
                className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3] transition hover:border-[#7ec8e3]/40"
              >
                {STORE_COMMISSION_COPY.halaqLabelAr}
              </a>
              <a
                href={STORE_COMMISSION_COPY.coiffeurHref}
                className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3] transition hover:border-[#7ec8e3]/40"
              >
                {STORE_COMMISSION_COPY.coiffeurLabelAr}
              </a>
              <a
                href={STORE_COMMISSION_COPY.storeHref}
                className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3] transition hover:border-[#7ec8e3]/40"
              >
                {STORE_COMMISSION_COPY.storeLabelAr}
              </a>
            </div>
          </section>

          <section className={sectionGap}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.customTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.customBodyAr}</p>
            <h3 className="mt-8 text-xl font-extrabold text-[#e8c547]">{STORE_ABOUT_COPY.processTitleAr}</h3>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {STORE_ABOUT_COPY.processSteps.map((step) => (
                <li
                  key={step.titleAr}
                  className="rounded-xl border border-white/12 bg-[#0b1a24]/70 p-4"
                >
                  <p className="font-extrabold text-[#e8c547]">{step.titleAr}</p>
                  <p className="mt-2 text-base leading-[1.75] text-white/72">{step.bodyAr}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${sectionGap} rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-7`}>
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.ctaTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.ctaLeadAr}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={ROUTE_PATHS.STORE_LANDING}
                className="inline-flex rounded-full border border-[#e8c547]/50 px-5 py-2.5 text-sm font-extrabold text-[#e8c547]"
              >
                {STORE_ABOUT_COPY.ctaExploreAr}
              </Link>
              <Link
                to={ROUTE_PATHS.STORE_REQUEST}
                className="inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
              >
                {STORE_ABOUT_COPY.ctaRequestAr}
              </Link>
            </div>
          </section>
        </div>
      </article>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
