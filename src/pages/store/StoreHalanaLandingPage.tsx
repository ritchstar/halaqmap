/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط حلانا1 — 894 و1788 ر.س عبر ميسر. لا تجربة في الصفحة.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreHalanaOrderForm } from '@/components/store/StoreHalanaOrderForm';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreProductReadLink } from '@/components/store/StoreProductReadLink';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import { StoreShot } from '@/components/store/StoreShot';
import { STORE_BRAND_LATIN } from '@/config/storeFront';
import {
  STORE_HALANA_LIVE,
  STORE_HALANA_LIVE_FEATURES,
  STORE_HALANA_LIVE_PACKS,
  STORE_HALANA_LIVE_PUBLIC_ENABLED,
} from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export default function StoreHalanaLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_HALANA_LIVE.documentTitle);

  if (!STORE_HALANA_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#c45c7a]">{STORE_HALANA_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_HALANA_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_HALANA_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#c45c7a]">{STORE_HALANA_LIVE.priceLineAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_HALANA_READ} />
            <StoreLandingFold accentClass="text-[#c45c7a]">
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.problemTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_HALANA_LIVE.problemBodyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.solutionTitleAr}</p>
            <p className="mt-2 max-w-xl text-base leading-8 text-white/78">{STORE_HALANA_LIVE.leadAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.howTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_HALANA_LIVE.howLeadAr}</p>
            <ol className="mt-3 max-w-xl list-decimal space-y-2 pr-5 text-sm leading-7 text-white/75">
              {STORE_HALANA_LIVE.howSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
              <li>
                {STORE_HALANA_LIVE.howTicketLeadAr}
                <ul className="mt-2 list-disc space-y-1 pr-5">
                  {STORE_HALANA_LIVE.ticketItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
              <li>{STORE_HALANA_LIVE.whatsappLineAr}</li>
            </ol>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_HALANA_LIVE.webLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.subscribePayTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">{STORE_HALANA_LIVE.payIndependenceAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.priceTitleAr}</p>
            <p className="mt-2 text-2xl font-black text-[#c45c7a]">{STORE_HALANA_LIVE.priceLineAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{STORE_HALANA_LIVE.durationLineAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.legalTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/75">
              {STORE_HALANA_LIVE.legalLeadBeforeAr}
              <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-[#c45c7a]">
                {STORE_BRAND_LATIN}
              </code>
              {STORE_HALANA_LIVE.legalLeadAfterAr}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">{STORE_HALANA_LIVE.privacyAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.startTitleAr}</p>
            <p className="mt-2 max-w-xl text-sm font-extrabold leading-7 text-[#f4efe4]">{STORE_HALANA_LIVE.closeAr}</p>
            <p className="mt-6 text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.featuresTitleAr}</p>
            <ul className="mt-3 space-y-3">
              {STORE_HALANA_LIVE_FEATURES.map((item) => (
                <li
                  key={item.titleAr}
                  className={
                    'pulse' in item && item.pulse
                      ? 'restaurant-feature-pulse rounded-2xl border border-[#c45c7a]/45 bg-[#1a0c10] px-4 py-3.5'
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
              linkClassName="text-[#c45c7a]"
              productTitleAr={STORE_HALANA_LIVE.titleAr}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {STORE_HALANA_LIVE_PACKS.map((pack) => (
                <span key={pack.id} className="rounded-full border border-[#c45c7a]/35 px-3 py-1 text-xs text-[#c45c7a]">
                  {pack.priceLineAr}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#halana-order"
                className="rounded-full bg-[#c45c7a] px-5 py-2.5 text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('halana-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_HALANA_LIVE.orderCtaLandingAr}
              </a>
              <StoreProductBenefitsLink />
              <StoreProductSupportLink to={ROUTE_PATHS.STORE_HALANA_SUPPORT} className="border-[#c45c7a]/50 text-[#c45c7a]" />
            </div>
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
                <span>{STORE_HALANA_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#c45c7a] transition-transform', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#1a0c10]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_HALANA_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_HALANA_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#c45c7a]">
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#c45c7a]/35 bg-[#1a0c10]">
            <StoreShot
              reel="halana"
              alt={STORE_HALANA_LIVE.heroAltAr}
              className="aspect-[16/10] w-full"
            />
            <figcaption className="border-t border-[#c45c7a]/20 bg-[#1a0c10] px-5 py-4">
              <p className="text-xl font-black">{STORE_HALANA_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_HALANA_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-2xl">
          <StoreHalanaOrderForm renewToken={renewToken} />
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
