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
import { StoreDeskChatCard } from '@/components/store/StoreDeskChatCard';
import { StoreLaterServicesSection } from '@/components/store/StoreLaterServicesSection';
import { StoreLiveOpsBanner } from '@/components/store/StoreLiveOpsBanner';
import { StoreShot } from '@/components/store/StoreShot';
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
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="mt-6 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)] hover:bg-[#f0d36a]"
              onClick={openRequestForm}
            >
              {STORE_LANDING_COPY.heroCta}
            </Link>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#e8c547]/30 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]">
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

      <StoreLiveOpsBanner />

      <section id="store-newest-products" className="px-4 pb-4">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="store-newest-title text-2xl font-black text-[#e8c547] md:text-3xl">
            {STORE_LANDING_COPY.newestTitleAr}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-white/72">{STORE_LANDING_COPY.newestLeadAr}</p>
        </div>
      </section>

      {STORE_WEDDING_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#e8c547]/35 bg-[#0b1a24]/70">
            <StoreShot reel="wedding" alt="افراحي1 رجالي" className="aspect-[16/7]" />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.weddingLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.weddingLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_WEDDING} className="mt-4 inline-flex text-sm font-bold text-[#e8c547]">
                {STORE_LANDING_COPY.weddingLiveCtaAr}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e4b7c5]/35 bg-[#0b1a24]/70">
            <StoreShot reel="wedding-women" alt="افراحي1 نسائي" className="aspect-[16/7]" />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.weddingLiveWomenTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.weddingLiveWomenLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_WEDDING_WOMEN} className="mt-4 inline-flex text-sm font-bold text-[#e4b7c5]">
                {STORE_LANDING_COPY.weddingLiveWomenCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_EVENT_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/70">
            <StoreShot reel="event" alt="اجواء1" className="aspect-[16/7]" />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.eventLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.eventLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_EVENT} className="mt-4 inline-flex text-sm font-bold text-[#e8c547]">
                {STORE_LANDING_COPY.eventLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_LOUNGE_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#d4a574]/30 bg-[#0b1a24]/70">
            <StoreShot reel="lounge" alt="لاونجا1" className="aspect-[16/7]" />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.loungeLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.loungeLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_LOUNGE} className="mt-4 inline-flex text-sm font-bold text-[#d4a574]">
                {STORE_LANDING_COPY.loungeLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_GROCERS_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#8fbf7a]/30 bg-[#07140e]/70">
            <StoreShot
              reel="grocers"
              alt={STORE_GROCERS_LIVE.heroAltAr}
              className="aspect-[16/7] w-full"
            />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.grocersLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.grocersLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_GROCERS} className="mt-4 inline-flex text-sm font-bold text-[#8fbf7a]">
                {STORE_LANDING_COPY.grocersLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_RESTAURANT_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#e08a3c]/30 bg-[#1a1008]/70">
            <StoreShot
              reel="restaurant"
              alt={STORE_RESTAURANT_LIVE.heroAltAr}
              className="aspect-[16/7] w-full"
            />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.restaurantLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.restaurantLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_RESTAURANT} className="mt-4 inline-flex text-sm font-bold text-[#e08a3c]">
                {STORE_LANDING_COPY.restaurantLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_CAFE_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#c48a4a]/30 bg-[#1a1008]/70">
            <StoreShot
              reel="lounge"
              alt={STORE_CAFE_LIVE.heroAltAr}
              className="aspect-[16/7] w-full"
            />
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.cafeLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.cafeLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_CAFE} className="mt-4 inline-flex text-sm font-bold text-[#c48a4a]">
                {STORE_LANDING_COPY.cafeLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {STORE_KITCHEN_LIVE_PUBLIC_ENABLED ? (
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#b45a3c]/30 bg-[#1a0c08]/70">
            <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-[#b45a3c]/40 to-[#061018] px-6 text-center">
              <p className="text-3xl font-black">{STORE_KITCHEN_LIVE.titleAr}</p>
            </div>
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.kitchenLiveTitleAr}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.kitchenLiveLeadAr}</p>
              <Link to={ROUTE_PATHS.STORE_KITCHEN} className="mt-4 inline-flex text-sm font-bold text-[#b45a3c]">
                {STORE_LANDING_COPY.kitchenLiveCtaAr}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_SECTOR_SPLIT_COPY.titleAr}</h2>
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

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <StoreLaterServicesSection onOpenForm={openRequestForm} />
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

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
            <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.paidInvitesTitleAr}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_LANDING_COPY.paidInvitesLeadAr}</p>
            <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-4 inline-flex text-sm font-bold text-[#e8c547]">
              {STORE_LANDING_COPY.paidInvitesCtaAr}
            </Link>
          </div>
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
