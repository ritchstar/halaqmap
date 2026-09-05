/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط دعوة الزواج التفاعلية — معاينة كاملة داخل الصفحة.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreGiftPromoBanner } from '@/components/store/StoreGiftPromoBanner';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreProductReadLink } from '@/components/store/StoreProductReadLink';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreWeddingInviteCard } from '@/components/store/StoreWeddingInviteCard';
import { StoreWeddingLiveStudio } from '@/components/store/StoreWeddingLiveStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import { StoreWeddingOrderForm } from '@/components/store/StoreWeddingOrderForm';
import { STORE_BRAND_LATIN } from '@/config/storeFront';
import {
  STORE_WEDDING_LIVE_LAB_TOKEN,
  STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN,
  STORE_WEDDING_LIVE_PUBLIC_ENABLED,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveTextClass,
  type StoreWeddingLiveVoice,
} from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { defaultWeddingLiveLabState, weddingLiveDefaultStyle } from '@/lib/storeWeddingLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export default function StoreWeddingLandingPage() {
  const location = useLocation();
  const voice: StoreWeddingLiveVoice = location.pathname.includes('/wedding/women') ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  const demo = defaultWeddingLiveLabState(voice);
  const [termsOpen, setTermsOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(true);
  useDocumentTitle(copy.documentTitle);

  useEffect(() => {
    ProductEvents.storeWeddingLandingView({ voice });
  }, [voice]);

  useEffect(() => {
    const orderEl = document.getElementById('wedding-order');
    const stickyEl = document.getElementById('wedding-sticky-buy');
    if (!orderEl || !stickyEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(!entry?.isIntersecting);
      },
      { root: null, threshold: 0.08, rootMargin: '0px 0px -72px 0px' },
    );
    observer.observe(orderEl);
    return () => observer.disconnect();
  }, [voice]);

  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const fill = weddingLiveFillClass(voice);
  const text = weddingLiveTextClass(voice);
  const labToken = voice === 'women' ? STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN : STORE_WEDDING_LIVE_LAB_TOKEN;
  const sisterHref = voice === 'women' ? ROUTE_PATHS.STORE_WEDDING : ROUTE_PATHS.STORE_WEDDING_WOMEN;
  const sisterLabel = copy.womenLinkCtaAr;

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <StoreGiftPromoBanner compact ultraCompact />
      <section className="px-4 py-10 md:py-14" data-voice={voice}>
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className={cn('text-sm font-bold tracking-wide', text)}>{copy.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#f4efe4] md:text-4xl">
              <bdi>{copy.titleAr}</bdi>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{copy.leadAr}</p>
            <p className="mt-3 max-w-xl text-sm font-bold leading-7 text-white/70">{copy.valueLineAr}</p>
            <p className={cn('mt-4 text-2xl font-black', text)}>
              <bdi>{copy.priceLineAr}</bdi>
            </p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_WEDDING_READ} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#live-preview"
                className={cn('w-full rounded-full px-5 py-3 text-center text-sm font-bold sm:w-auto sm:py-2.5', fill)}
                onClick={(event) => {
                  event.preventDefault();
                  ProductEvents.storeWeddingTryClick({ voice });
                  scrollToId('live-preview');
                }}
              >
                {copy.tryCtaAr}
              </a>
              <a
                href="#wedding-order"
                className="w-full rounded-full border border-white/20 px-5 py-3 text-center text-sm font-bold text-white/80 sm:w-auto sm:py-2.5"
                onClick={(event) => {
                  event.preventDefault();
                  ProductEvents.storeWeddingOrderOpen({ voice });
                  scrollToId('wedding-order');
                }}
              >
                {copy.activateCtaAr}
              </a>
              <Link
                to={sisterHref}
                className="w-full rounded-full border border-white/15 px-5 py-3 text-center text-sm font-bold text-white/55 sm:w-auto sm:py-2.5"
              >
                {sisterLabel}
              </Link>
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName={text}
              productTitleAr={copy.titleAr}
            />
          </div>
          <div className="space-y-4">
            <figure className="overflow-hidden rounded-2xl border border-white/12">
              <StoreShot
                reel={voice === 'women' ? 'wedding-women' : 'wedding'}
                alt={copy.titleAr}
                className="aspect-[16/9]"
              />
            </figure>
            <StoreWeddingInviteCard host={demo.host} styleId={weddingLiveDefaultStyle(voice)} />
          </div>
        </div>
      </section>

      <section id="live-preview" className="scroll-mt-20 px-4 pb-6">
        <div className="mx-auto max-w-5xl">
          <p className={cn('text-sm font-bold', text)}>{copy.startTitleAr}</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{copy.closeAr}</p>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/12 bg-[#0b1a24]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#f4efe4]">{copy.packageTitleAr}</h2>
          <p className="mt-2 text-sm leading-7 text-white/75">{copy.packageLeadAr}</p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-white/70">
            {copy.packageItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className={text}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="text-base font-extrabold text-[#f4efe4]">{copy.postPaymentTitleAr}</h3>
            <p className="mt-1 text-sm text-[#f4d7a8]">{copy.postPaymentLeadAr}</p>
            <ul className="mt-3 space-y-3">
              {copy.postPaymentLinks.map((link) => (
                <li key={link.titleAr} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <p className="text-sm font-bold text-[#f4efe4]">{link.titleAr}</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">{link.bodyAr}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl">
          <StoreLandingFold accentClass={text}>
            <p className="text-base font-extrabold text-[#f4efe4]">{copy.problemTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{copy.problemBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{copy.solutionTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{copy.solutionBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{copy.howTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{copy.howLeadAr}</p>
            <ol className="mt-3 max-w-xl list-decimal space-y-2 pr-5 text-sm leading-7 text-white/75">
              {copy.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{copy.privacyTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{copy.privacyBodyAr}</p>
            <p className="mt-4 text-sm font-extrabold text-[#f4efe4]">{copy.privacyDataTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{copy.privacyDataBodyAr}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">{copy.deviceLockBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{copy.legalTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">
              {copy.legalLeadBeforeAr}
              <code dir="ltr" className={cn('inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold', text)}>
                {STORE_BRAND_LATIN}
              </code>
              {copy.legalLeadAfterAr}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{copy.priceBodyAr}</p>
          </StoreLandingFold>
          <div className="mt-4 flex flex-wrap gap-3">
            <StoreProductBenefitsLink />
            <StoreProductSupportLink to={ROUTE_PATHS.STORE_HALLS_SUPPORT} className="border-[#e8c547]/50 text-[#e8c547]" />
          </div>
          <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
            <CollapsibleTrigger
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
            >
              <span>{copy.termsFoldTriggerAr}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', text, termsOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#0b1a24]/80 p-4 text-sm leading-8 text-white/70">
              <p>{copy.termsFoldTitleAr}</p>
              <p className="mt-2">{copy.termsFoldBodyAr}</p>
              <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className={cn('mt-3 inline-flex', text)}>
                شروط الخدمة
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <StoreInViewMount minHeightClass="min-h-[28rem]">
            <StoreWeddingLiveStudio token={labToken} />
          </StoreInViewMount>
          <div className="mt-10 max-w-2xl">
            <StoreWeddingOrderForm voice={voice} />
          </div>
        </div>
      </section>

      <aside
        id="wedding-sticky-buy"
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#061018]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200',
          stickyVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className={cn('text-sm font-black sm:text-base', text)}>
            <bdi>{copy.stickyBuyLineAr}</bdi>
          </p>
          <button
            type="button"
            className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-bold', fill)}
            onClick={() => {
              ProductEvents.storeWeddingOrderOpen({ voice });
              scrollToId('wedding-order');
            }}
          >
            {copy.stickyBuyCtaAr}
          </button>
        </div>
      </aside>
      <div className="pb-24">
        <StoreVisitorFooter />
      </div>
    </StoreVisitorShell>
  );
}
