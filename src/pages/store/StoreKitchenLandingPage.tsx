/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط طبختنا1 — صفحة الأسرة المنتجة. 300 و600 ر.س عبر ميسر.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreKitchenGiftPromoBanner } from '@/components/store/StoreKitchenGiftPromoBanner';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreKitchenOrderForm } from '@/components/store/StoreKitchenOrderForm';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreKitchenStudio } from '@/components/store/StoreKitchenStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import { StoreShot } from '@/components/store/StoreShot';
import { STORE_BRAND_LATIN } from '@/config/storeFront';
import {
  STORE_KITCHEN_LIVE,
  STORE_KITCHEN_LIVE_FEATURES,
  STORE_KITCHEN_LIVE_LAB_TOKEN,
  STORE_KITCHEN_LIVE_PACKS,
  STORE_KITCHEN_LIVE_PUBLIC_ENABLED,
} from '@/config/storeKitchenLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export default function StoreKitchenLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_KITCHEN_LIVE.documentTitle);

  if (!STORE_KITCHEN_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <StoreKitchenGiftPromoBanner compact />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#b45a3c]">{STORE_KITCHEN_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_KITCHEN_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_KITCHEN_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#b45a3c]">{STORE_KITCHEN_LIVE.priceLineAr}</p>
            <StoreLandingFold accentClass="text-[#b45a3c]">
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.problemTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_KITCHEN_LIVE.problemBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.solutionTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_KITCHEN_LIVE.leadAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.howTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_KITCHEN_LIVE.howLeadAr}</p>
            <ol className="mt-3 max-w-xl list-decimal space-y-2 pr-5 text-sm leading-7 text-white/75">
              {STORE_KITCHEN_LIVE.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
              <li>
                {STORE_KITCHEN_LIVE.howTicketLeadAr}
                <ul className="mt-2 list-disc space-y-1 pr-5">
                  {STORE_KITCHEN_LIVE.ticketItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
              <li>{STORE_KITCHEN_LIVE.whatsappLineAr}</li>
            </ol>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_KITCHEN_LIVE.webLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.payTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_KITCHEN_LIVE.payIndependenceAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.priceTitleAr}</p>
            <p className="mt-2 text-2xl font-black text-[#b45a3c]">{STORE_KITCHEN_LIVE.priceLineAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{STORE_KITCHEN_LIVE.supportLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.legalTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">
              {STORE_KITCHEN_LIVE.legalLeadBeforeAr}
              <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-[#b45a3c]">
                {STORE_BRAND_LATIN}
              </code>
              {STORE_KITCHEN_LIVE.legalLeadAfterAr}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_KITCHEN_LIVE.privacyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.startTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm font-extrabold leading-7 text-[#f4efe4]">{STORE_KITCHEN_LIVE.closeAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_KITCHEN_LIVE.featuresTitleAr}</p>
            <ul className="mt-3 space-y-3">
              {STORE_KITCHEN_LIVE_FEATURES.map((item) => (
                <li
                  key={item.titleAr}
                  className={
                    'pulse' in item && item.pulse
                      ? 'restaurant-feature-pulse rounded-2xl border border-[#b45a3c]/45 bg-[#1a0c08] px-4 py-3.5'
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
            </StoreLandingFold>
            <StoreEnterpriseDirectMail
              className="mt-4 max-w-xl"
              linkClassName="text-[#b45a3c]"
              productTitleAr={STORE_KITCHEN_LIVE.titleAr}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {STORE_KITCHEN_LIVE_PACKS.map((pack) => (
                <span key={pack.id} className="rounded-full border border-[#b45a3c]/35 px-3 py-1 text-xs text-[#b45a3c]">
                  {pack.priceLineAr}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#kitchen-order"
                className="rounded-full bg-[#b45a3c] px-5 py-2.5 text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('kitchen-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_KITCHEN_LIVE.orderCtaAr}
              </a>
              <a
                href="#live-preview"
                className="rounded-full border border-[#b45a3c]/50 px-5 py-2.5 text-sm font-bold text-[#b45a3c]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_KITCHEN_LIVE.tryCtaAr}
              </a>
              <StoreProductBenefitsLink />
              <StoreProductSupportLink to={ROUTE_PATHS.STORE_KITCHEN_SUPPORT} className="border-[#b45a3c]/50 text-[#b45a3c]" />
            </div>
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
                <span>{STORE_KITCHEN_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#b45a3c] transition-transform', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#1a0c08]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_KITCHEN_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_KITCHEN_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#b45a3c]">
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#b45a3c]/35 bg-[#1a0c08]">
            <StoreShot
              reel="kitchen"
              alt={STORE_KITCHEN_LIVE.heroAltAr}
              className="aspect-[16/10] w-full"
            />
            <figcaption className="border-t border-[#b45a3c]/20 bg-[#1a0c08] px-5 py-4">
              <p className="text-xl font-black">{STORE_KITCHEN_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_KITCHEN_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreInViewMount>
            <StoreKitchenStudio token={STORE_KITCHEN_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
          <div className="mt-10 max-w-2xl">
            <StoreKitchenOrderForm renewToken={renewToken} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
