/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط خضار الحي.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreProduceOrderForm } from '@/components/store/StoreProduceOrderForm';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreProductReadLink } from '@/components/store/StoreProductReadLink';
import { StoreSaipTrustLine } from '@/components/store/StoreSaipTrustLine';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreProduceStudio } from '@/components/store/StoreProduceStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import { STORE_BRAND_LATIN } from '@/config/storeFront';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_FEATURES,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  STORE_PRODUCE_LIVE_PACKS,
  STORE_PRODUCE_LIVE_PUBLIC_ENABLED,
} from '@/config/storeProduceLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export default function StoreProduceLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_PRODUCE_LIVE.documentTitle);

  if (!STORE_PRODUCE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#3d8b4a]">{STORE_PRODUCE_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_PRODUCE_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_PRODUCE_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#3d8b4a]">{STORE_PRODUCE_LIVE.priceLineAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_PRODUCE_READ} />
            <StoreLandingFold accentClass="text-[#3d8b4a]">
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.problemTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_PRODUCE_LIVE.problemBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.solutionTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_PRODUCE_LIVE.leadAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.howTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.howLeadAr}</p>
            <ol className="mt-3 max-w-xl list-decimal space-y-2 pr-5 text-sm leading-7 text-white/75">
              {STORE_PRODUCE_LIVE.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.ingestLineAr}</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.hoursLineAr}</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.presenceLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.payTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.payIndependenceAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.chatBuyerTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.chatBuyerHintAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.legalTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">
              {STORE_PRODUCE_LIVE.legalLeadBeforeAr}
              <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-[#3d8b4a]">
                {STORE_BRAND_LATIN}
              </code>
              {STORE_PRODUCE_LIVE.legalLeadAfterAr}
            </p>
            <StoreSaipTrustLine productId="produce" />
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.priceTitleAr}</p>
            <p className="mt-2 text-2xl font-black text-[#3d8b4a]">{STORE_PRODUCE_LIVE.priceLineAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{STORE_PRODUCE_LIVE.durationLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.startTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm font-extrabold leading-7 text-[#f4efe4]">{STORE_PRODUCE_LIVE.closeAr}</p>
            {renewToken ? (
              <p className="mt-4 rounded-xl border border-[#3d8b4a]/35 bg-[#3d8b4a]/10 px-4 py-3 text-sm leading-7">
                انتهت المدة. الرابط ما زال لديكم. أتمّوا الشراء مرة أخرى لتمديد نفس المتجر.
              </p>
            ) : null}
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.featuresTitleAr}</p>
            <ul className="mt-3 space-y-3">
              {STORE_PRODUCE_LIVE_FEATURES.map((item) => (
                <li
                  key={item.titleAr}
                  className={
                    'pulse' in item && item.pulse
                      ? 'produce-feature-pulse rounded-2xl border border-[#3d8b4a]/45 bg-[#0b1a10] px-4 py-3.5'
                      : 'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
                  }
                >
                  <p
                    className={
                      'pulse' in item && item.pulse
                        ? 'produce-feature-pulse__text'
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
            <div className="mt-5 flex flex-wrap gap-2">
              {STORE_PRODUCE_LIVE_PACKS.map((pack) => (
                <span key={pack.id} className="rounded-full border border-[#3d8b4a]/35 px-3 py-1 text-xs text-[#3d8b4a]">
                  {pack.priceLineAr}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className="rounded-full bg-[#3d8b4a] px-5 py-2.5 text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_PRODUCE_LIVE.tryCtaAr}
              </a>
              <a
                href="#produce-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('produce-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_PRODUCE_LIVE.orderCtaAr}
              </a>
              <StoreProductBenefitsLink />
              <StoreProductSupportLink to={ROUTE_PATHS.STORE_PRODUCE_SUPPORT} className="border-[#3d8b4a]/50 text-[#3d8b4a]" />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#3d8b4a]"
              productTitleAr={STORE_PRODUCE_LIVE.titleAr}
            />
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
                <span>{STORE_PRODUCE_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#3d8b4a] transition-transform', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#0b1a10]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_PRODUCE_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_PRODUCE_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#3d8b4a]">
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#3d8b4a]/35 bg-[#0b1a10]">
            <StoreShot
              reel="produce"
              alt={STORE_PRODUCE_LIVE.heroAltAr}
              className="aspect-[16/10] w-full"
            />
            <figcaption className="border-t border-[#3d8b4a]/20 bg-[#0b1a10] px-5 py-4">
              <p className="text-xl font-black">{STORE_PRODUCE_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_PRODUCE_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreInViewMount>
            <StoreProduceStudio token={STORE_PRODUCE_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
          <div className="mt-10 max-w-2xl">
            <StoreProduceOrderForm renewToken={renewToken} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
