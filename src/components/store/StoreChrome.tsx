/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import { STORE_PRODUCT_BENEFITS_COPY } from '@/config/storeProductBenefitsCopy';
import { STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED, STORE_GIFT_COPY } from '@/config/storeGiftCampaign';
import { STORE_GENERAL_TRIAL_COPY, STORE_GENERAL_TRIAL_PUBLIC_ENABLED } from '@/config/storeProductTrial';
import { STORE_REVIEWS_COPY, STORE_REVIEWS_PUBLIC_ENABLED } from '@/config/storeReviews';
import { STORE_ABOUT_COPY, STORE_BRAND_LATIN, STORE_CONTACT_EMAIL, STORE_CONTACT_PHONE_DISPLAY, STORE_CONTACT_PHONE_E164, STORE_CONTACT_WHATSAPP_URL, STORE_CONTACT_X_HANDLE, STORE_CONTACT_X_URL, STORE_FOOTER_CONTACT, STORE_LANDING_COPY, STORE_ORIGIN, STORE_VISUALS } from '@/config/storeFront';
import { STORE_HMTUBE } from '@/config/storeHmTube';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { EcommerceVerifiedFooterBadge } from '@/components/EcommerceVerifiedFooterBadge';
import { StoreVisitorEngage } from '@/components/store/StoreVisitorEngage';
import { useIsMobile } from '@/hooks/use-mobile';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { isStoreProductLandingPath } from '@/lib/storeHmTube';
import { cn } from '@/lib/utils';
import { useEffect, type ReactNode } from 'react';

export function StoreVisitorShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    lockPartnerDarkCanvas();
    rememberStoreAffiliateRef();
  }, []);
  return (
    <div dir="rtl" className="store-product-shell min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      {children}
    </div>
  );
}

function StoreHmTubeMark({ featured = false }: { featured?: boolean }) {
  return (
    <span
      className={cn(
        'store-hmtube-live inline-flex shrink-0 overflow-hidden rounded-xl',
        featured && 'store-hmtube-live--hero',
      )}
    >
      <img
        src={STORE_HMTUBE.markSrc}
        alt=""
        width={featured ? 72 : 40}
        height={featured ? 72 : 40}
        className={cn('shrink-0 rounded-xl object-cover', featured ? 'h-[4.5rem] w-[4.5rem]' : 'h-10 w-10')}
      />
    </span>
  );
}

function StoreHmTubeCopy({ featured = false }: { featured?: boolean }) {
  return (
    <span className={cn('min-w-0 text-start', featured ? 'max-w-[14rem]' : 'hidden max-w-[9.5rem] sm:block sm:max-w-[12rem]')}>
      <span dir="ltr" className={cn('block font-black tracking-wide text-[#e8c547]', featured ? 'text-lg' : 'text-sm')}>
        {STORE_HMTUBE.brand}
      </span>
      <span className={cn('block leading-4 text-white/88', featured ? 'mt-0.5 text-sm' : 'text-[0.68rem]')}>
        {STORE_HMTUBE.labelAr}
      </span>
    </span>
  );
}

function StoreHmTubeLink({ featured = false }: { featured?: boolean }) {
  return (
    <Link
      to={ROUTE_PATHS.YOUTUBE_STORE}
      aria-label={`${STORE_HMTUBE.labelAr} ${STORE_HMTUBE.brand}`}
      className={cn(
        'flex shrink-0 items-center gap-2 border border-[#e8c547]/35 bg-black/35 hover:border-[#e8c547]/70',
        featured
          ? 'rounded-3xl px-3 py-2 shadow-[0_16px_36px_-18px_rgba(45,212,191,0.65)]'
          : 'store-ops-tool rounded-2xl px-1.5 py-1',
      )}
    >
      <StoreHmTubeMark featured={featured} />
      <StoreHmTubeCopy featured={featured} />
    </Link>
  );
}

export function StoreHmTubeHero() {
  return <StoreHmTubeLink featured />;
}

export function StoreVisitorHeader() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const onGiftPage = location.pathname.startsWith(ROUTE_PATHS.STORE_GIFT);
  const showGiftCta = STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED && !onGiftPage;
  const showHmTube = isStoreProductLandingPath(location.pathname);
  return (
    <div className="border-b border-white/10 bg-[#061018]/90">
      {!isMobile ? <KSACityClocksBar /> : null}
      <header className="backdrop-blur">
        <div className="store-visitor-header__row mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 md:flex-wrap md:gap-3 md:px-4 md:py-3">
          <Link to={ROUTE_PATHS.STORE_LANDING} className="flex min-w-0 items-center gap-2 me-auto md:gap-3">
            <img
              src={STORE_VISUALS.logo}
              alt=""
              width={44}
              height={44}
              className="h-9 w-9 shrink-0 rounded-xl border border-white/10 object-cover md:h-11 md:w-11"
            />
            <span className="min-w-0">
              <p className="text-[0.65rem] font-bold tracking-wide text-[#e8c547] md:text-[0.7rem]">{STORE_BRAND_LATIN}</p>
              <p className="truncate text-base font-extrabold text-[#f4efe4] md:text-lg">{STORE_LANDING_COPY.shopNameAr}</p>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1.5 text-sm font-bold md:gap-2">
            {showGiftCta ? (
            <Link
              to={ROUTE_PATHS.STORE_GIFT}
              className="inline-flex rounded-full bg-[#e8c547] px-3 py-1.5 text-[#061018] shadow-[0_10px_24px_-12px_rgba(232,197,71,0.95)] hover:bg-[#f0d36a]"
            >
              <span className="sm:hidden">{STORE_GIFT_COPY.headerShortAr}</span>
              <span className="hidden sm:inline">{STORE_GIFT_COPY.kickerAr}</span>
            </Link>
            ) : null}
            <Link
              to={ROUTE_PATHS.STORE_PRODUCT_BENEFITS}
              className="hidden rounded-full px-3 py-1.5 text-white/80 hover:text-[#e8c547] sm:inline-flex"
            >
              {STORE_PRODUCT_BENEFITS_COPY.navAr}
            </Link>
            <Link
              to={ROUTE_PATHS.STORE_TRUST}
              className="hidden rounded-full px-3 py-1.5 text-white/80 hover:text-[#e8c547] sm:inline-flex"
            >
              {STORE_ABOUT_COPY.trustNavAr}
            </Link>
            {STORE_REVIEWS_PUBLIC_ENABLED ? (
            <Link
              to={ROUTE_PATHS.STORE_REVIEWS}
              className="hidden rounded-full px-3 py-1.5 text-white/80 hover:text-[#e8c547] sm:inline-flex"
            >
              {STORE_REVIEWS_COPY.navAr}
            </Link>
            ) : null}
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="hidden rounded-full border border-[#e8c547]/40 px-3 py-1.5 text-[#e8c547] sm:inline-flex"
            >
              طلب خدمة
            </Link>
            <Link
              to={ROUTE_PATHS.STORE_CARDS}
              className="hidden rounded-full border border-[#e8c547]/40 px-3 py-1.5 text-[#e8c547] sm:inline-flex"
            >
              بطاقة مجانية
            </Link>
          </nav>
          {showHmTube ? (
            <span className="shrink-0">
              <StoreHmTubeLink />
            </span>
          ) : null}
        </div>
      </header>
      <StoreVisitorEngage />
    </div>
  );
}

export function StoreVisitorFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
          {STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED ? (
          <Link to={ROUTE_PATHS.STORE_GIFT} className="text-[#e8c547]">
            {STORE_GIFT_COPY.kickerAr}
          </Link>
          ) : null}
          {STORE_GENERAL_TRIAL_PUBLIC_ENABLED ? (
          <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="text-teal-300">
            {STORE_GENERAL_TRIAL_COPY.kickerAr}
          </Link>
          ) : null}
          <Link to={ROUTE_PATHS.STORE_ABOUT} className="text-[#e8c547]">
            {STORE_LANDING_COPY.aboutNavAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_PRODUCT_BENEFITS} className="text-[#e8c547]">
            {STORE_PRODUCT_BENEFITS_COPY.navAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_TRUST} className="text-[#e8c547]">
            {STORE_ABOUT_COPY.trustNavAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_REQUEST} className="text-white/80">
            طلب خدمة
          </Link>
          {STORE_REVIEWS_PUBLIC_ENABLED ? (
          <Link to={ROUTE_PATHS.STORE_REVIEWS} className="text-[#e8c547]">
            {STORE_REVIEWS_COPY.navAr}
          </Link>
          ) : null}
          <Link to={ROUTE_PATHS.STORE_LANDING} className="text-white/80">
            واجهة المتجر
          </Link>
          <Link to={ROUTE_PATHS.STORE_INTRO_CARDS} className="text-white/80">
            كروت تعريفية
          </Link>
          <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="text-white/80">
            {STORE_LANDING_COPY.issuedCardsLegalAr}
          </Link>
        </nav>
        <p className="text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.roleLine}</p>
        <p className="text-xs text-white/50">{STORE_ORIGIN}</p>
        <p className="text-xs leading-relaxed text-white/55">{STORE_LANDING_COPY.mediaLicenseLineAr}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
          <a href={`mailto:${STORE_CONTACT_EMAIL}`} className="hover:text-[#e8c547]">
            {STORE_FOOTER_CONTACT.emailLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_EMAIL}</span>
          </a>
          <a href={`tel:+${STORE_CONTACT_PHONE_E164}`} className="hover:text-[#e8c547]">
            {STORE_FOOTER_CONTACT.phoneLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_PHONE_DISPLAY}</span>
          </a>
          <a
            href={STORE_CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e8c547]"
          >
            {STORE_FOOTER_CONTACT.whatsappLabelAr}
          </a>
          <a
            href={STORE_CONTACT_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e8c547]"
          >
            {STORE_FOOTER_CONTACT.xLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_X_HANDLE}</span>
          </a>
        </div>
        <EcommerceVerifiedFooterBadge variant="dark" />
        <p className="text-xs leading-relaxed text-white/45">{STORE_LANDING_COPY.footerLegal}</p>
      </div>
    </footer>
  );
}
