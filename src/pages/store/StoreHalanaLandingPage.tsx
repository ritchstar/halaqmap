/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط حلانا1 — 894 و1,788 ر.س. لا تجربة في الصفحة.
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
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_LIVE,
  STORE_HALANA_LIVE_FEATURES,
  STORE_HALANA_LIVE_PACKS,
  STORE_HALANA_LIVE_PUBLIC_ENABLED,
} from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const prose = 'max-w-xl text-base leading-[1.75] text-white/78';
const proseSm = 'max-w-xl text-sm leading-[1.75] text-white/75';

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
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
              <bdi>{STORE_HALANA_LIVE.titleAr}</bdi>
            </h1>
            <p className={`mt-4 ${prose}`}>{STORE_HALANA_LIVE.leadAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_HALANA_READ} />
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
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#c45c7a]"
              productTitleAr={STORE_HALANA_LIVE.titleAr}
            />
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#c45c7a]/35 bg-[#1a0c10]">
            <StoreShot
              src={STORE_HALANA_ATMOSPHERE.hero}
              alt={STORE_HALANA_LIVE.heroAltAr}
              className="aspect-[16/10] w-full"
              eager
            />
            <figcaption className="border-t border-[#c45c7a]/20 bg-[#1a0c10] px-5 py-4">
              <p className="text-xl font-black">{STORE_HALANA_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_HALANA_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <StoreLandingFold titleAr="تفاصيل حلانا1" accentClass="text-[#c45c7a]">
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.problemTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_HALANA_LIVE.problemBodyAr}</p>
              <p className={`mt-3 ${proseSm} font-bold text-[#f4c4d4]`}>{STORE_HALANA_LIVE.problemCloseAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.howTitleAr}</h2>
              <ol className="mt-3 max-w-xl space-y-4">
                {STORE_HALANA_LIVE.howSteps.map((step, index) => (
                  <li key={step.titleAr} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-extrabold text-[#c45c7a]">
                      {index + 1}. {step.titleAr}
                    </p>
                    <p className={`mt-1 ${proseSm}`}>{step.bodyAr}</p>
                  </li>
                ))}
              </ol>
              <p className={`mt-4 ${proseSm} font-bold text-[#f4c4d4]`}>{STORE_HALANA_LIVE.refDisclaimerAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.featuresTitleAr}</h2>
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
                    <p className={`mt-1 ${proseSm}`}>{item.bodyAr}</p>
                  </li>
                ))}
              </ul>
              <p className={`mt-4 ${proseSm}`}>{STORE_HALANA_LIVE.scopeLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_HALANA_LIVE.statusOverviewAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_HALANA_LIVE.allergensLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_HALANA_LIVE.changePolicyAr}</p>
            </div>
          </StoreLandingFold>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-[#1a0c10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.payTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_HALANA_LIVE.payLeadAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_HALANA_LIVE.payIndependenceAr}</p>
            <p className={`mt-3 ${proseSm} font-bold text-[#f4c4d4]`}>{STORE_HALANA_LIVE.payNoPlatformGateAr}</p>
            <p className={`mt-2 ${proseSm}`}>{STORE_HALANA_LIVE.payNoCommissionAr}</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a0c10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.privacyTitleAr}</h2>
            <p className={`mt-3 ${proseSm}`}>{STORE_HALANA_LIVE.privacyAr}</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a0c10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.pricingTitleAr}</h2>
            <p className={`mt-2 ${proseSm}`}>{STORE_HALANA_LIVE.pricingLeadAr}</p>
            <ul className="mt-4 space-y-2 text-lg font-black text-[#c45c7a]">
              <li>
                <bdi>{STORE_HALANA_LIVE.pack6LineAr}</bdi>
              </li>
              <li>
                <bdi>{STORE_HALANA_LIVE.pack12LineAr}</bdi>
              </li>
            </ul>
            <ul className="mt-4 space-y-2">
              {STORE_HALANA_LIVE_PACKS.map((pack) => (
                <li key={pack.id} className={`${proseSm} rounded-xl border border-white/10 px-4 py-3`}>
                  <p className="font-extrabold text-white/90">
                    <bdi>{pack.titleAr}</bdi> · <bdi>{pack.priceLineAr}</bdi>
                  </p>
                  <p className="mt-1">{pack.lineAr}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a0c10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_HALANA_LIVE.legalTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_HALANA_LIVE.legalBodyAr}</p>
            <Link to={STORE_HALANA_LIVE.trustHref} className="mt-4 inline-flex text-sm font-bold text-[#c45c7a] underline-offset-4 hover:underline">
              {STORE_HALANA_LIVE.trustLinkAr}
            </Link>
          </div>

          <div className="max-w-2xl">
            <StoreHalanaOrderForm renewToken={renewToken} />
          </div>

          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
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
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
