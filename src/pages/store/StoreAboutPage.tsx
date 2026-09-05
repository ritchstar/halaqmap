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
  STORE_ABOUT_PLATFORM_LINKS,
  STORE_ABOUT_SPECIALIZED_PRODUCTS,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

const proseClass = 'max-w-[42rem] text-base leading-[1.75] text-white/78';

function StoreProductName({ children }: { children: string }) {
  return (
    <span dir="rtl" className="inline-block [unicode-bidi:isolate]">
      {children}
    </span>
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
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#f4efe4] md:text-4xl lg:text-[2.65rem]">
                {STORE_ABOUT_COPY.titleAr}
                <br />
                <span className="text-[#e8c547]">{STORE_ABOUT_COPY.titleLine2Ar}</span>
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

          <section className="mt-14">
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
              to={ROUTE_PATHS.STORE_LANDING}
              className="mt-6 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.howCtaAr}
            </Link>
          </section>

          <section className="mt-14">
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

            <div className="mt-10">
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

          <section className="mt-14">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.pathTitleAr}</h2>
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

          <section className="mt-14 rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 md:p-7">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.cloudTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.cloudBodyAr}</p>
            <ul className="mt-5 space-y-2">
              {STORE_ABOUT_COPY.cloudBenefits.map((benefit) => (
                <li key={benefit} className="text-base leading-[1.75] text-white/78">
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTE_PATHS.STORE_PRODUCT_BENEFITS}
              className="mt-5 inline-flex text-base font-bold text-[#7ec8e3] underline-offset-4 hover:underline"
            >
              {STORE_ABOUT_COPY.cloudMoreAr}
            </Link>
          </section>

          <section className="mt-14 rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/80 p-5 md:p-7">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.trustTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.trustBodyAr}</p>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.trustLegalAr}</p>
            <p className={`mt-3 ${proseClass}`}>{STORE_ABOUT_COPY.trustCommitmentAr}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {STORE_ABOUT_COPY.trustLinks.map((link) =>
                'href' in link ? (
                  <a
                    key={link.labelAr}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3] transition hover:border-[#7ec8e3]/40"
                  >
                    {link.labelAr}
                  </a>
                ) : (
                  <Link
                    key={link.labelAr}
                    to={link.to}
                    className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3] transition hover:border-[#7ec8e3]/40"
                  >
                    {link.labelAr}
                  </Link>
                ),
              )}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.activitiesTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.activitiesLeadAr}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {LICENSED_COMMERCIAL_ACTIVITIES.map((activity) => (
                <li
                  key={activity.code}
                  className="rounded-xl border border-white/12 bg-white/[0.04] p-4"
                >
                  <p className="text-base font-extrabold leading-[1.75] text-[#f4efe4]">{activity.label}</p>
                  <p className="mt-2 text-base text-[#e8c547]">
                    {STORE_ABOUT_COPY.activityCodeLabelAr}{' '}
                    <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-bold">
                      {activity.code}
                    </code>
                    {activity.primary ? (
                      <span className="ms-2 font-bold text-[#e8c547]">النشاط الرئيسي</span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.platformsTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.platformsLeadAr}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {STORE_ABOUT_PLATFORM_LINKS.map((platform) => (
                <li key={platform.nameAr}>
                  <a
                    href={platform.href}
                    className="block overflow-hidden rounded-2xl border border-white/12 bg-[#0b1a24]/70 transition hover:border-[#e8c547]/35"
                  >
                    <StoreShot reel={platform.reel} alt={platform.nameAr} className="aspect-[16/9]" />
                    <div className="p-4">
                      <p className="text-lg font-extrabold text-[#e8c547]">
                        <StoreProductName>{platform.nameAr}</StoreProductName>
                      </p>
                      <p className="mt-2 text-base leading-[1.75] text-white/72">{platform.blurbAr}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-7">
            <h2 className="text-2xl font-extrabold text-[#f4efe4] md:text-3xl">{STORE_ABOUT_COPY.ctaTitleAr}</h2>
            <p className={`mt-4 ${proseClass}`}>{STORE_ABOUT_COPY.ctaLeadAr}</p>
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="mt-6 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
            >
              {STORE_ABOUT_COPY.ctaLabelAr}
            </Link>
          </section>
        </div>
      </article>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
