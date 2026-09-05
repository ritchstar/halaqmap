/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط خضارنا1.
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
import { StoreShot } from '@/components/store/StoreShot';
import { StoreProduceStudio } from '@/components/store/StoreProduceStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_FEATURES,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  STORE_PRODUCE_LIVE_PUBLIC_ENABLED,
} from '@/config/storeProduceLive';
import { STORE_PRODUCE_SUPPORT } from '@/config/storeProductSupport';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const prose = 'max-w-xl text-base leading-[1.75] text-white/78';
const proseSm = 'max-w-xl text-sm leading-[1.75] text-white/75';

export default function StoreProduceLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_PRODUCE_LIVE.documentTitle);

  if (!STORE_PRODUCE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const trialHref = `${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=produce`;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#3d8b4a]">{STORE_PRODUCE_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_PRODUCE_LIVE.titleAr}</h1>
            <p className={`mt-4 ${prose} font-extrabold text-[#f4efe4]`}>{STORE_PRODUCE_LIVE.hookAr}</p>
            <p className={`mt-4 ${prose}`}>{STORE_PRODUCE_LIVE.leadAr}</p>
            <p className={`mt-4 ${proseSm} font-bold text-[#d8f0cc]`}>{STORE_PRODUCE_LIVE.valueLineAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_PRODUCE_READ} />
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/85"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_PRODUCE_LIVE.tryCtaAr}
              </a>
              <Link
                to={trialHref}
                className="rounded-full bg-[#3d8b4a] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_PRODUCE_LIVE.trialCtaAr}
              </Link>
              <StoreProductBenefitsLink />
              <StoreProductSupportLink
                to={ROUTE_PATHS.STORE_PRODUCE_SUPPORT}
                labelAr={STORE_PRODUCE_SUPPORT.landingCtaAr}
                className="border-[#3d8b4a]/50 text-[#3d8b4a]"
              />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#3d8b4a]"
              productTitleAr={STORE_PRODUCE_LIVE.titleAr}
            />
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#3d8b4a]/35 bg-[#0b1a10]">
            <StoreShot reel="produce" alt={STORE_PRODUCE_LIVE.heroAltAr} className="aspect-[16/10] w-full" />
            <figcaption className="border-t border-[#3d8b4a]/20 bg-[#0b1a10] px-5 py-4">
              <p className="text-xl font-black">{STORE_PRODUCE_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_PRODUCE_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <StoreLandingFold titleAr="تفاصيل خضارنا1" accentClass="text-[#3d8b4a]">
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.problemTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_PRODUCE_LIVE.problemBodyAr}</p>
              <p className={`mt-3 ${proseSm} font-bold text-[#3d8b4a]`}>{STORE_PRODUCE_LIVE.problemCloseAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.solutionTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_PRODUCE_LIVE.solutionBodyAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.howTitleAr}</h2>
              <ol className="mt-3 max-w-xl space-y-4">
                {STORE_PRODUCE_LIVE.howSteps.map((step, index) => (
                  <li key={step.titleAr} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-extrabold text-[#3d8b4a]">
                      {index + 1}. {step.titleAr}
                    </p>
                    <p className={`mt-1 ${proseSm}`}>{step.bodyAr}</p>
                  </li>
                ))}
              </ol>
              <p className={`mt-4 ${proseSm}`}>{STORE_PRODUCE_LIVE.ingestLineAr}</p>
            </div>
            <div>
              <p className={proseSm}>{STORE_PRODUCE_LIVE.hoursLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_PRODUCE_LIVE.preorderLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_PRODUCE_LIVE.presenceLineAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.featuresTitleAr}</h2>
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
                    <p className={`mt-1 ${proseSm}`}>{item.bodyAr}</p>
                  </li>
                ))}
              </ul>
            </div>
          </StoreLandingFold>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <StoreInViewMount>
            <StoreProduceStudio token={STORE_PRODUCE_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-[#0b1a10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.payTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_PRODUCE_LIVE.payIndependenceAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_PRODUCE_LIVE.payFeeLineAr}</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#0b1a10]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.legalTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_PRODUCE_LIVE.legalBodyAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_PRODUCE_LIVE.legalCertAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_PRODUCE_LIVE.legalPrivacyAr}</p>
            <Link to={STORE_PRODUCE_LIVE.trustHref} className="mt-4 inline-flex text-sm font-bold text-[#3d8b4a] underline-offset-4 hover:underline">
              {STORE_PRODUCE_LIVE.trustLinkAr}
            </Link>
          </div>

          {!renewToken ? (
            <div id="produce-trial" className="scroll-mt-8 rounded-2xl border border-[#3d8b4a]/35 bg-[#3d8b4a]/10 p-5 md:p-6">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.trialTitleAr}</h2>
              <p className={`mt-3 ${prose}`}>{STORE_PRODUCE_LIVE.trialLeadAr}</p>
              <Link
                to={trialHref}
                className="mt-5 inline-flex rounded-full bg-[#3d8b4a] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_PRODUCE_LIVE.trialCtaAr}
              </Link>
            </div>
          ) : (
            <p className="rounded-xl border border-[#3d8b4a]/35 bg-[#3d8b4a]/10 px-4 py-3 text-sm leading-7">
              انتهت المدة. الرابط ما زال لديكم. أتمّوا التمديد لتفعيل نفس الصفحة واللوحة.
            </p>
          )}

          <div>
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_PRODUCE_LIVE.extensionTitleAr}</h2>
            <p className={`mt-2 ${proseSm}`}>{STORE_PRODUCE_LIVE.extensionLeadAr}</p>
            <div className="mt-5 max-w-2xl">
              <StoreProduceOrderForm renewToken={renewToken} />
            </div>
          </div>

          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
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
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
