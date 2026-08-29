/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط مطعمنا1 — صفحة مطعم الحي.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreRestaurantOrderForm } from '@/components/store/StoreRestaurantOrderForm';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreRestaurantStudio } from '@/components/store/StoreRestaurantStudio';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_FEATURES,
  STORE_RESTAURANT_LIVE_LAB_TOKEN,
  STORE_RESTAURANT_LIVE_PACKS,
  STORE_RESTAURANT_LIVE_PUBLIC_ENABLED,
} from '@/config/storeRestaurantLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export default function StoreRestaurantLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_RESTAURANT_LIVE.documentTitle);

  if (!STORE_RESTAURANT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#e08a3c]">{STORE_RESTAURANT_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight">{STORE_RESTAURANT_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_RESTAURANT_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#e08a3c]">{STORE_RESTAURANT_LIVE.priceLineAr}</p>
            <p className="mt-2 text-sm font-bold leading-7 text-[#e08a3c]">{STORE_MOBILE_VENDOR.priceLineAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{STORE_RESTAURANT_LIVE.durationLineAr}</p>
            {renewToken ? (
              <p className="mt-4 rounded-xl border border-[#e08a3c]/35 bg-[#e08a3c]/10 px-4 py-3 text-sm leading-7">
                انتهت المدة. الرابط ما زال لديكم. أتمّوا الشراء مرة أخرى لتمديد نفس الصفحة.
              </p>
            ) : null}
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.howTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_RESTAURANT_LIVE.howLeadAr}</p>
            <ul className="mt-3 max-w-xl list-disc space-y-1 pr-5 text-sm leading-7 text-white/75">
              {STORE_RESTAURANT_LIVE.ticketItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_RESTAURANT_LIVE.whatsappLineAr}</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_RESTAURANT_LIVE.payIndependenceAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.opsTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_RESTAURANT_LIVE.opsBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.featuresTitleAr}</p>
            <ul className="mt-3 space-y-3">
              {STORE_RESTAURANT_LIVE_FEATURES.map((item) => (
                <li
                  key={item.titleAr}
                  className={
                    'pulse' in item && item.pulse
                      ? 'restaurant-feature-pulse rounded-2xl border border-[#e08a3c]/45 bg-[#1a1008] px-4 py-3.5'
                      : 'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
                  }
                >
                  <p
                    className={
                      'pulse' in item && item.pulse
                        ? 'restaurant-feature-pulse__text'
                        : 'text-sm font-extrabold leading-7 text-white/90'
                    }
                  >
                    {item.titleAr}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-white/70">{item.bodyAr}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/75">{STORE_RESTAURANT_LIVE.privacyAr}</p>
            <p className="mt-3 max-w-xl text-sm font-extrabold leading-7 text-[#f4efe4]">{STORE_RESTAURANT_LIVE.closeAr}</p>
            <StoreEnterpriseDirectMail
              className="mt-4 max-w-xl"
              linkClassName="text-[#e08a3c]"
              productTitleAr={STORE_RESTAURANT_LIVE.titleAr}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {STORE_RESTAURANT_LIVE_PACKS.map((pack) => (
                <span key={pack.id} className="rounded-full border border-[#e08a3c]/35 px-3 py-1 text-xs text-[#e08a3c]">
                  {pack.priceLineAr}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className="rounded-full bg-[#e08a3c] px-5 py-2.5 text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_RESTAURANT_LIVE.tryCtaAr}
              </a>
              <a
                href="#restaurant-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('restaurant-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_RESTAURANT_LIVE.orderCtaAr}
              </a>
              <StoreProductBenefitsLink />
            </div>
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
                <span>{STORE_RESTAURANT_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#e08a3c] transition-transform', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#1a1008]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_RESTAURANT_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_RESTAURANT_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#e08a3c]">
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#e08a3c]/35 bg-[#1a1008]">
            <StoreShot
              reel="restaurant"
              alt={STORE_RESTAURANT_LIVE.heroAltAr}
              className="aspect-[16/10] w-full"
              eager
            />
            <figcaption className="border-t border-[#e08a3c]/20 bg-[#1a1008] px-5 py-4">
              <p className="text-xl font-black">{STORE_RESTAURANT_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_RESTAURANT_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreRestaurantStudio token={STORE_RESTAURANT_LIVE_LAB_TOKEN} />
          <div className="mt-10 max-w-2xl">
            <StoreRestaurantOrderForm renewToken={renewToken} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
