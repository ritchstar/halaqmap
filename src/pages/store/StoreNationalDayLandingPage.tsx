/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة هبوط اليوم الوطني — احتفال بأصحاب الأنشطة واكتشاف المنتجات.
 */
import { useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { PlatformContinuousDevelopmentNotice } from '@/components/platform/PlatformContinuousDevelopmentNotice';
import { StoreNationalDayExplorer } from '@/components/store/StoreNationalDayExplorer';
import {
  NATIONAL_DAY_EXPLORER_SCROLL_QUERY,
  STORE_NATIONAL_DAY_CARDS_HREF,
  STORE_NATIONAL_DAY_COPY,
  STORE_NATIONAL_DAY_IDENTITY_MARK_ALT,
  STORE_NATIONAL_DAY_IDENTITY_MARK_SRC,
  STORE_NATIONAL_DAY_PUBLIC_ENABLED,
  nationalDayCampaignPhase,
  nationalDayTrialProductLabels,
} from '@/config/storeNationalDay';
import { STORE_GENERAL_TRIAL_PUBLIC_ENABLED } from '@/config/storeProductTrial';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { scrollToNationalDayExplorer } from '@/lib/storeNationalDayScroll';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreNationalDayLandingPage() {
  const copy = STORE_NATIONAL_DAY_COPY;
  const phase = nationalDayCampaignPhase();
  const location = useLocation();
  useDocumentTitle(copy.documentTitle);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') !== NATIONAL_DAY_EXPLORER_SCROLL_QUERY) return;
    requestAnimationFrame(() => scrollToNationalDayExplorer());
  }, [location.search]);

  if (!STORE_NATIONAL_DAY_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const trialLabels = nationalDayTrialProductLabels();
  const showTrial = STORE_GENERAL_TRIAL_PUBLIC_ENABLED && trialLabels.length > 0;

  return (
    <div dir="rtl" className="store-national-day">
      <header className="store-national-day__header">
        <div className="store-national-day__header-inner">
          <span className="store-national-day__brand">خريطة الحل · المتجر</span>
          <Link to={ROUTE_PATHS.STORE_LANDING} className="store-national-day__nav-link">
            {copy.backStoreAr}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[72rem] px-3 pt-2 sm:px-4">
        <PlatformContinuousDevelopmentNotice variant="store" />
      </div>

      <section className="store-national-day__hero">
        <div className="store-national-day__hero-inner">
          <p className="store-national-day__kicker">{copy.kickerAr}</p>
          <figure className="store-national-day__identity-figure">
            <img
              src={STORE_NATIONAL_DAY_IDENTITY_MARK_SRC}
              alt={STORE_NATIONAL_DAY_IDENTITY_MARK_ALT}
              className="store-national-day__identity-mark"
              width={360}
              height={360}
              decoding="async"
              fetchPriority="high"
            />
          </figure>
          {phase === 'thanks' ? (
            <h1 className="store-national-day__hero-title store-national-day__hero-title--on-dark">
              {copy.thanksTitleAr}
            </h1>
          ) : (
            <h1 className="sr-only">{copy.heroTitleAr}</h1>
          )}
          <p className="store-national-day__hero-lead store-national-day__hero-lead--on-dark">
            {phase === 'thanks' ? copy.thanksLeadAr : copy.heroLeadAr}
          </p>
          {phase === 'active' ? (
            <p className="store-national-day__brand-line store-national-day__brand-line--on-dark">{copy.brandLineAr}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToNationalDayExplorer()}
              className="store-national-day__btn store-national-day__btn--primary"
            >
              {copy.heroCtaAr}
            </button>
            {showTrial ? (
              <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-national-day__btn store-national-day__btn--ghost">
                {copy.trialCtaAr}
              </Link>
            ) : null}
          </div>
          <p className="store-national-day__footnote store-national-day__footnote--on-dark mt-6">{copy.identityNoteAr}</p>
        </div>
      </section>

      <main className="store-national-day__main">
        {phase === 'active' ? (
          <section className="store-national-day__section">
            <h2 className="store-national-day__section-title">{copy.ownersTitleAr}</h2>
            <p className="store-national-day__section-lead">{copy.ownersLeadAr}</p>
            <div className="store-national-day__tiles">
              {copy.ownersTilesAr.map((tile) => (
                <div key={tile} className="store-national-day__tile">
                  {tile}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <StoreNationalDayExplorer />

        <section className="store-national-day__section store-national-day__section--green">
          <h2 className="store-national-day__section-title">{copy.journeyTitleAr}</h2>
          <p className="store-national-day__section-lead">{copy.journeyLeadAr}</p>
          <div className="store-national-day__journey">
            {copy.journeyStepsAr.map((step) => (
              <div key={step} className="store-national-day__journey-step">
                {step}
              </div>
            ))}
          </div>
          <p className="store-national-day__tagline">{copy.journeyTaglineAr}</p>
        </section>

        {showTrial ? (
          <section className="store-national-day__section">
            <h2 className="store-national-day__section-title">{copy.trialTitleAr}</h2>
            <p className="store-national-day__section-lead">{copy.trialLeadAr}</p>
            <div className="store-national-day__trial-products">
              {trialLabels.map((label) => (
                <span key={label} className="store-national-day__trial-pill">
                  {label}
                </span>
              ))}
            </div>
            <p className="store-national-day__footnote">{copy.trialNoteAr}</p>
            <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-national-day__btn store-national-day__btn--primary mt-5">
              {copy.trialCtaAr}
            </Link>
          </section>
        ) : null}

        {phase === 'active' ? (
          <>
            <section className="store-national-day__section">
              <h2 className="store-national-day__section-title">{copy.packTitleAr}</h2>
              <p className="store-national-day__section-lead">{copy.packLeadAr}</p>
              <ul className="store-national-day__list">
                {copy.packItemsAr.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="store-national-day__footnote">{copy.packFootnoteAr}</p>
            </section>

            <section className="store-national-day__section">
              <h2 className="store-national-day__section-title">{copy.cardsTitleAr}</h2>
              <p className="store-national-day__section-lead">{copy.cardsLeadAr}</p>
              <Link to={STORE_NATIONAL_DAY_CARDS_HREF} className="store-national-day__btn store-national-day__btn--ghost mt-4">
                {copy.cardsCtaAr}
              </Link>
            </section>

            <section className="store-national-day__section">
              <h2 className="store-national-day__section-title">{copy.greetingTitleAr}</h2>
              <p className="store-national-day__section-lead">{copy.greetingLeadAr}</p>
              <ul className="mt-4 space-y-3">
                {copy.greetingSamplesAr.map((row) => (
                  <li key={row.shopAr} className="store-national-day__quote">
                    <p className="store-national-day__quote-shop">{row.shopAr}</p>
                    <p className="mt-1">{row.lineAr}</p>
                  </li>
                ))}
              </ul>
              <Link to={ROUTE_PATHS.STORE_REQUEST} className="store-national-day__btn store-national-day__btn--ghost mt-5">
                {copy.greetingShareCtaAr}
              </Link>
            </section>
          </>
        ) : null}

        <section className="store-national-day__section store-national-day__section--green">
          <h2 className="store-national-day__section-title">{copy.closingTitleAr}</h2>
          <p className="store-national-day__section-lead">{copy.closingLeadAr}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToNationalDayExplorer()}
              className="store-national-day__btn store-national-day__btn--primary"
            >
              {copy.closingPrimaryCtaAr}
            </button>
            {showTrial ? (
              <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-national-day__btn store-national-day__btn--ghost">
                {copy.closingSecondaryCtaAr}
              </Link>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="store-national-day__footer">
        <div className="store-national-day__footer-inner">
          <p>{copy.identityNoteAr}</p>
          <nav className="store-national-day__footer-links" aria-label="روابط المتجر">
            <Link to={ROUTE_PATHS.STORE_LANDING}>المتجر</Link>
            {showTrial ? <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL}>طلب تجربة</Link> : null}
            <Link to={ROUTE_PATHS.STORE_ABOUT}>تعريف المتجر</Link>
            <Link to={STORE_NATIONAL_DAY_CARDS_HREF}>بطاقة تهنئة</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
