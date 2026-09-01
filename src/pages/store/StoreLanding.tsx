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
  StoreHmTubeHero,
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreDeskChatCard } from '@/components/store/StoreDeskChatCard';
import { StoreLaterServicesSection } from '@/components/store/StoreLaterServicesSection';
import { StoreGiftPromoBanner } from '@/components/store/StoreGiftPromoBanner';
import { StoreLiveOpsBanner } from '@/components/store/StoreLiveOpsBanner';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreShot } from '@/components/store/StoreShot';
import type { StoreMarketingReelId } from '@/config/storeMarketingReels';
import {
  STORE_GREETING_OCCASIONS,
  STORE_LANDING_COPY,
  STORE_LIVE_PRODUCTS,
  STORE_SECTOR_SPLIT_COPY,
  STORE_SOFTWARE_SHOTS,
  STORE_TRUST_COPY,
  storeCardsPath,
} from '@/config/storeFront';
import { STORE_INTRO_CARD_COPY } from '@/config/storeIntroCardCopy';
import { STORE_MEET_QR_COPY } from '@/config/storeMeetQr';
import { PLATFORM_TLS_SSL_LABS_GRADE } from '@/config/platformTlsTrust';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { STORE_WEDDING_LIVE_PUBLIC_ENABLED } from '@/config/storeWeddingLive';
import { STORE_EVENT_LIVE_PUBLIC_ENABLED } from '@/config/storeEventLive';
import { STORE_LOUNGE_LIVE_PUBLIC_ENABLED } from '@/config/storeLoungeLive';
import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_PUBLIC_ENABLED } from '@/config/storeGrocersLive';
import { STORE_RESTAURANT_LIVE, STORE_RESTAURANT_LIVE_PUBLIC_ENABLED } from '@/config/storeRestaurantLive';
import { STORE_CAFE_LIVE, STORE_CAFE_LIVE_PUBLIC_ENABLED } from '@/config/storeCafeLive';
import { STORE_KITCHEN_LIVE, STORE_KITCHEN_LIVE_PUBLIC_ENABLED } from '@/config/storeKitchenLive';
import { STORE_PRODUCE_LIVE, STORE_PRODUCE_LIVE_PUBLIC_ENABLED } from '@/config/storeProduceLive';
import { storeLiveProductReel, storeSoftwareShotReel } from '@/config/storeMarketingReels';

export default function StoreLanding() {
  useDocumentTitle(STORE_LANDING_COPY.documentTitle);

  useEffect(() => {
    ProductEvents.storeLandingView({ source: 'landing' });
  }, []);

  const openRequestForm = (event: { preventDefault: () => void }) => {
    const form = document.getElementById('store-service-request');
    if (!form) return;
    event.preventDefault();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_LANDING_COPY.kicker}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#f4efe4] md:text-4xl">
              {STORE_LANDING_COPY.shopNameAr}
            </h1>
            <p className="mt-3 text-xl font-extrabold leading-tight text-white/90 md:text-2xl">
              {STORE_LANDING_COPY.heroHeadlineAr}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
              {STORE_LANDING_COPY.heroLead}
            </p>
            <p className="mt-5 text-base font-extrabold text-[#e8c547] md:text-lg">
              {STORE_LANDING_COPY.heroSolutionsTitleAr}
            </p>
            <ul className="mt-2 max-w-3xl space-y-2 text-base leading-relaxed text-white/78 md:text-lg">
              {STORE_LANDING_COPY.heroSolutions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-5 text-base font-extrabold text-[#e8c547] md:text-lg">
              {STORE_LANDING_COPY.heroInviteKickerAr}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
              {STORE_LANDING_COPY.heroInviteBefore}
              <Link
                to={ROUTE_PATHS.STORE_REQUEST}
                className="font-extrabold text-[#e8c547] underline decoration-[#e8c547]/50 underline-offset-4 hover:decoration-[#e8c547]"
                onClick={openRequestForm}
              >
                {STORE_LANDING_COPY.heroFormLink}
              </Link>
              {STORE_LANDING_COPY.heroInviteAfter}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={ROUTE_PATHS.STORE_REQUEST}
                className="inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)] hover:bg-[#f0d36a]"
                onClick={openRequestForm}
              >
                {STORE_LANDING_COPY.heroCta}
              </Link>
              <StoreProductBenefitsLink />
            </div>
          </div>
          <figure className="relative overflow-hidden rounded-2xl border border-[#e8c547]/30 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]">
            <div className="absolute top-3 start-3 z-10">
              <StoreHmTubeHero />
            </div>
            <StoreShot
              reel="landing"
              alt={STORE_LANDING_COPY.heroShotAlt}
              className="aspect-[4/3]"
              eager
            />
            <figcaption className="border-t border-white/10 bg-[#0b1a24] px-4 py-2 text-sm font-bold text-[#e8c547]">
              {STORE_LANDING_COPY.heroShotCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      <StoreGiftPromoBanner />

      <StoreLiveOpsBanner />

      <section id="store-newest-products" className="px-4 pb-4">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="store-newest-title text-2xl font-black text-[#e8c547] md:text-3xl">
            {STORE_LANDING_COPY.newestTitleAr}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-white/72">{STORE_LANDING_COPY.newestLeadAr}</p>
        </div>
      </section>

      <nav
        aria-label={STORE_LANDING_COPY.newestTitleAr}
        className="sticky top-0 z-20 border-b border-white/10 bg-[#061018]/95 px-4 py-2 backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              ['store-browse-neighborhood', STORE_LANDING_COPY.browseNeighborhoodAr],
              ['store-browse-halls', STORE_LANDING_COPY.browseHallsAr],
              ['store-browse-cards', STORE_LANDING_COPY.browseCardsAr],
              ['store-browse-works', STORE_LANDING_COPY.browseWorksAr],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollStoreBrowse(id)}
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/85 hover:border-[#e8c547]/50 hover:text-[#e8c547]"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <section id="store-browse-neighborhood" className="scroll-mt-14 px-4 pb-8 pt-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.browseNeighborhoodAr}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STORE_PRODUCE_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_PRODUCE}
                reel="produce"
                alt={STORE_PRODUCE_LIVE.heroAltAr}
                titleAr={STORE_LANDING_COPY.produceLiveTitleAr}
                leadAr={STORE_LANDING_COPY.produceLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.produceLiveCtaAr}
                accent="#3d8b4a"
              />
            ) : null}
            {STORE_GROCERS_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_GROCERS}
                reel="grocers"
                alt={STORE_GROCERS_LIVE.heroAltAr}
                titleAr={STORE_LANDING_COPY.grocersLiveTitleAr}
                leadAr={STORE_LANDING_COPY.grocersLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.grocersLiveCtaAr}
                accent="#8fbf7a"
              />
            ) : null}
            {STORE_KITCHEN_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_KITCHEN}
                reel="kitchen"
                alt={STORE_KITCHEN_LIVE.heroAltAr}
                titleAr={STORE_LANDING_COPY.kitchenLiveTitleAr}
                leadAr={STORE_LANDING_COPY.kitchenLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.kitchenLiveCtaAr}
                accent="#b45a3c"
              />
            ) : null}
            {STORE_RESTAURANT_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_RESTAURANT}
                reel="restaurant"
                alt={STORE_RESTAURANT_LIVE.heroAltAr}
                titleAr={STORE_LANDING_COPY.restaurantLiveTitleAr}
                leadAr={STORE_LANDING_COPY.restaurantLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.restaurantLiveCtaAr}
                accent="#e08a3c"
              />
            ) : null}
            {STORE_CAFE_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_CAFE}
                reel="lounge"
                alt={STORE_CAFE_LIVE.heroAltAr}
                titleAr={STORE_LANDING_COPY.cafeLiveTitleAr}
                leadAr={STORE_LANDING_COPY.cafeLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.cafeLiveCtaAr}
                accent="#c48a4a"
              />
            ) : null}
          </div>
        </div>
      </section>

      <section id="store-browse-halls" className="scroll-mt-14 px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.browseHallsAr}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STORE_WEDDING_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_WEDDING}
                reel="wedding"
                alt="افراحي1 رجالي"
                titleAr={STORE_LANDING_COPY.weddingLiveTitleAr}
                leadAr={STORE_LANDING_COPY.weddingLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.weddingLiveCtaAr}
                accent="#e8c547"
              />
            ) : null}
            {STORE_WEDDING_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_WEDDING_WOMEN}
                reel="wedding-women"
                alt="افراحي1 نسائي"
                titleAr={STORE_LANDING_COPY.weddingLiveWomenTitleAr}
                leadAr={STORE_LANDING_COPY.weddingLiveWomenLeadAr}
                ctaAr={STORE_LANDING_COPY.weddingLiveWomenCtaAr}
                accent="#e4b7c5"
              />
            ) : null}
            {STORE_EVENT_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_EVENT}
                reel="event"
                alt="اجواء1"
                titleAr={STORE_LANDING_COPY.eventLiveTitleAr}
                leadAr={STORE_LANDING_COPY.eventLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.eventLiveCtaAr}
                accent="#e8c547"
              />
            ) : null}
            {STORE_LOUNGE_LIVE_PUBLIC_ENABLED ? (
              <StoreBrowseCard
                to={ROUTE_PATHS.STORE_LOUNGE}
                reel="lounge"
                alt="لاونجا1"
                titleAr={STORE_LANDING_COPY.loungeLiveTitleAr}
                leadAr={STORE_LANDING_COPY.loungeLiveLeadAr}
                ctaAr={STORE_LANDING_COPY.loungeLiveCtaAr}
                accent="#d4a574"
              />
            ) : null}
          </div>
        </div>
      </section>

      <section id="store-browse-works" className="scroll-mt-14 px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.browseWorksAr}</h2>
          <p className="mt-3 text-base font-extrabold text-white/90">{STORE_SECTOR_SPLIT_COPY.titleAr}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_SECTOR_SPLIT_COPY.leadAr}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href={STORE_SECTOR_SPLIT_COPY.halaqHref}
              className="rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 transition hover:border-[#e8c547]/40"
            >
              <p className="font-extrabold text-[#e8c547]">{STORE_SECTOR_SPLIT_COPY.halaqNameAr}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{STORE_SECTOR_SPLIT_COPY.halaqBodyAr}</p>
              <p className="mt-3 text-xs text-white/55">
                <code dir="ltr">{STORE_SECTOR_SPLIT_COPY.halaqHost}</code>
              </p>
            </a>
            <a
              href={STORE_SECTOR_SPLIT_COPY.coiffeurHref}
              className="rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 transition hover:border-[#e8c547]/40"
            >
              <p className="font-extrabold text-[#e8c547]">{STORE_SECTOR_SPLIT_COPY.coiffeurNameAr}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{STORE_SECTOR_SPLIT_COPY.coiffeurBodyAr}</p>
              <p className="mt-3 text-xs text-white/55">
                <code dir="ltr">{STORE_SECTOR_SPLIT_COPY.coiffeurHost}</code>
              </p>
            </a>
          </div>
          <div className="mt-8">
            <StoreLaterServicesSection onOpenForm={openRequestForm} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.softwareStripTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {STORE_SOFTWARE_SHOTS.map((shot, index) => (
              <figure
                key={shot.caption}
                className="overflow-hidden rounded-2xl border border-white/12 bg-[#0b1a24]/70"
              >
                <StoreShot reel={storeSoftwareShotReel(index)} alt={shot.alt} className="aspect-[16/10]" />
                <figcaption className="px-3 py-2 text-sm font-bold text-white/75">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="store-service-request" className="px-4 pb-12">
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
                      className="block overflow-hidden rounded-xl border border-white/10 bg-[#061018]/70 transition hover:border-[#e8c547]/40"
                    >
                      <StoreShot reel={storeLiveProductReel(product.id)} alt={product.imageAlt} className="aspect-[16/9]" />
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
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04]">
              <StoreShot
                reel="ops"
                alt="لوحة تشغيل برمجية لحلول المنشآت"
                className="aspect-[16/8]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="store-browse-cards" className="scroll-mt-14 px-4 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
          <p className="text-sm font-bold text-[#e8c547]">{STORE_LANDING_COPY.browseCardsAr}</p>
          <h2 className="mt-1 text-2xl font-extrabold">{STORE_LANDING_COPY.freeCardsTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_LANDING_COPY.freeCardsLead}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STORE_GREETING_OCCASIONS.map((item) => (
              <Link
                key={item.id}
                to={storeCardsPath(item.id)}
                className="overflow-hidden rounded-xl border border-white/12 bg-[#061018] transition hover:border-[#e8c547]/50"
              >
                <StoreShot reel="occasion" alt={item.imageAlt} className="aspect-[16/10]" />
                <div className="p-4">
                  <p className="font-extrabold text-[#f4efe4]">{item.titleAr}</p>
                  <p className="mt-1 text-sm text-white/65">{item.subtitleAr}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#e8c547]">
                    إصدار البطاقة
                    <ArrowLeft className="h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to={ROUTE_PATHS.STORE_CARDS}
            className="mt-4 inline-flex text-sm font-bold text-white/70 underline-offset-4 hover:underline"
          >
            فتح الاستوديو
          </Link>
          <div className="mt-6 rounded-xl border border-[#e8c547]/25 bg-[#061018]/70 p-4">
            <h3 className="text-xl font-extrabold">{STORE_LANDING_COPY.paidInvitesTitleAr}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.paidInvitesLeadAr}</p>
            <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-4 inline-flex text-sm font-bold text-[#e8c547]">
              {STORE_LANDING_COPY.paidInvitesCtaAr}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
          <h2 className="text-2xl font-extrabold">{STORE_INTRO_CARD_COPY.landingDoorTitleAr}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_INTRO_CARD_COPY.landingDoorLeadAr}
          </p>
          <Link
            to={ROUTE_PATHS.STORE_INTRO_CARDS}
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#e8c547]"
          >
            {STORE_INTRO_CARD_COPY.landingDoorCtaAr}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
          <h2 className="text-2xl font-extrabold">{STORE_MEET_QR_COPY.landingDoorTitleAr}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_MEET_QR_COPY.landingDoorLeadAr}
          </p>
          <Link
            to={ROUTE_PATHS.STORE_MEET_QR}
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#e8c547]"
          >
            {STORE_MEET_QR_COPY.landingDoorCtaAr}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="store-trust-scan" className="px-4 pb-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/85">
          <div className="grid items-center lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 md:p-6">
              <p className="text-xs font-black tracking-[0.18em] text-[#e8c547]">{STORE_TRUST_COPY.sslKickerAr}</p>
              <h2 className="mt-2 text-xl font-extrabold text-[#f4efe4] md:text-2xl">
                {STORE_LANDING_COPY.trustStripTitleAr}
              </h2>
              <p className="mt-2 text-sm font-bold leading-7 text-[#e8c547]">{STORE_LANDING_COPY.trustStripLeadAr}</p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-sm font-black text-emerald-100">
                <span dir="ltr">{PLATFORM_TLS_SSL_LABS_GRADE}</span>
                <span className="font-bold text-emerald-50/80">Qualys SSL Labs</span>
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{STORE_LANDING_COPY.trustStripBodyAr}</p>
              <Link
                to={ROUTE_PATHS.STORE_TRUST}
                className="mt-5 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
              >
                {STORE_LANDING_COPY.trustStripCtaAr}
              </Link>
            </div>
            <figure className="border-t border-white/10 bg-white lg:border-t-0 lg:border-s">
              <img
                src={STORE_TRUST_COPY.sslImage}
                alt={STORE_TRUST_COPY.sslAltAr}
                className="aspect-[16/9] w-full bg-white object-contain object-top"
              />
            </figure>
          </div>
        </div>
      </section>

      <section id="store-admin-chat" className="px-4 pb-10">
        <div className="mx-auto max-w-sm">
          <h2 className="text-center text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.deskChatTitle}</h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.deskChatLead}</p>
          <div className="mt-5">
            <StoreDeskChatCard />
          </div>
        </div>
      </section>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}

function scrollStoreBrowse(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function StoreBrowseCard({
  to,
  reel,
  alt,
  titleAr,
  leadAr,
  ctaAr,
  accent,
}: {
  to: string;
  reel: StoreMarketingReelId;
  alt: string;
  titleAr: string;
  leadAr: string;
  ctaAr: string;
  accent: string;
}) {
  return (
    <Link
      to={to}
      className="overflow-hidden rounded-xl border bg-[#0b1a24]/70 transition hover:border-white/30"
      style={{ borderColor: `${accent}59` }}
    >
      <StoreInViewMount minHeightClass="min-h-[8.5rem]">
        <StoreShot reel={reel} alt={alt} className="aspect-[16/10] w-full" />
      </StoreInViewMount>
      <div className="p-3">
        <h3 className="text-base font-extrabold">{titleAr}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-6 text-white/70">{leadAr}</p>
        <p className="mt-2 text-sm font-bold" style={{ color: accent }}>
          {ctaAr}
        </p>
      </div>
    </Link>
  );
}
