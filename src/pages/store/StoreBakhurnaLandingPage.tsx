/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط بخورنا1.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreBakhurnaOrderForm } from '@/components/store/StoreBakhurnaOrderForm';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreBakhurnaStudio } from '@/components/store/bakhurna/BakhurnaStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreDedicatedPageCallout, StoreDedicatedPageReelCaption } from '@/components/store/StoreDedicatedPageCallout';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import {
  STORE_BAKHURNA_LIVE,
  STORE_BAKHURNA_LIVE_FEATURES,
  STORE_BAKHURNA_LIVE_LAB_TOKEN,
  STORE_BAKHURNA_LIVE_PUBLIC_ENABLED,
} from '@/config/storeBakhurnaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const prose = 'max-w-xl text-base leading-[1.75] text-white/78';
const proseSm = 'max-w-xl text-sm leading-[1.75] text-white/75';

export default function StoreBakhurnaLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_BAKHURNA_LIVE.documentTitle);

  if (!STORE_BAKHURNA_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const trialHref = `${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=bakhurna`;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#6E4A26]">{STORE_BAKHURNA_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_BAKHURNA_LIVE.titleAr}</h1>
            <p className={`mt-4 ${prose} font-extrabold text-[#f4efe4]`}>{STORE_BAKHURNA_LIVE.hookAr}</p>
            <p className={`mt-4 ${prose}`}>{STORE_BAKHURNA_LIVE.leadAr}</p>
            <p className={`mt-4 ${proseSm} font-bold text-[#f0e2cc]`}>{STORE_BAKHURNA_LIVE.valueLineAr}</p>
            <StoreDedicatedPageCallout
              audience="neighbor"
              accentClass="text-[#6E4A26]"
              borderClass="border-[#6E4A26]/35"
              bgClass="bg-[#6E4A26]/8"
              className="mt-5"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/85"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_BAKHURNA_LIVE.tryCtaAr}
              </a>
              <Link
                to={trialHref}
                className="rounded-full bg-[#6E4A26] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_BAKHURNA_LIVE.trialCtaAr}
              </Link>
              <StoreProductBenefitsLink />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#6E4A26]"
              productTitleAr={STORE_BAKHURNA_LIVE.titleAr}
            />
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#6E4A26]/35 bg-[#1a140c]">
            <StoreShot reel="bakhurna" alt={STORE_BAKHURNA_LIVE.heroAltAr} className="aspect-[16/10] w-full" />
            <figcaption className="border-t border-[#6E4A26]/20 bg-[#1a140c] px-5 py-4">
              <p className="text-xl font-black">{STORE_BAKHURNA_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_BAKHURNA_LIVE.qrPhraseAr}</p>
              <StoreDedicatedPageReelCaption />
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <StoreLandingFold titleAr="تفاصيل بخورنا1" accentClass="text-[#6E4A26]">
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.problemTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_BAKHURNA_LIVE.problemBodyAr}</p>
              <p className={`mt-3 ${proseSm} font-bold text-[#6E4A26]`}>{STORE_BAKHURNA_LIVE.problemCloseAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.solutionTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_BAKHURNA_LIVE.solutionBodyAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.howTitleAr}</h2>
              <ol className="mt-3 max-w-xl space-y-4">
                {STORE_BAKHURNA_LIVE.howSteps.map((step, index) => (
                  <li key={step.titleAr} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-extrabold text-[#6E4A26]">
                      {index + 1}. {step.titleAr}
                    </p>
                    <p className={`mt-1 ${proseSm}`}>{step.bodyAr}</p>
                  </li>
                ))}
              </ol>
              <p className={`mt-4 ${proseSm}`}>{STORE_BAKHURNA_LIVE.ingestLineAr}</p>
            </div>
            <div>
              <p className={proseSm}>{STORE_BAKHURNA_LIVE.hoursLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_BAKHURNA_LIVE.preorderLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_BAKHURNA_LIVE.presenceLineAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.featuresTitleAr}</h2>
              <ul className="mt-3 space-y-3">
                {STORE_BAKHURNA_LIVE_FEATURES.map((item) => (
                  <li
                    key={item.titleAr}
                    className={
                      'pulse' in item && item.pulse
                        ? 'rounded-2xl border border-[#6E4A26]/45 bg-[#1a140c] px-4 py-3.5'
                        : 'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
                    }
                  >
                    <p className="text-sm font-extrabold leading-7 text-white/90">{item.titleAr}</p>
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
            <StoreBakhurnaStudio token={STORE_BAKHURNA_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-[#1a140c]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.payTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_BAKHURNA_LIVE.payIndependenceAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_BAKHURNA_LIVE.payFeeLineAr}</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a140c]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.legalTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_BAKHURNA_LIVE.legalBodyAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_BAKHURNA_LIVE.legalPrivacyAr}</p>
            <Link to={STORE_BAKHURNA_LIVE.trustHref} className="mt-4 inline-flex text-sm font-bold text-[#6E4A26] underline-offset-4 hover:underline">
              {STORE_BAKHURNA_LIVE.trustLinkAr}
            </Link>
          </div>

          {!renewToken ? (
            <div id="bakhurna-trial" className="scroll-mt-8 rounded-2xl border border-[#6E4A26]/35 bg-[#6E4A26]/10 p-5 md:p-6">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.trialTitleAr}</h2>
              <p className={`mt-3 ${prose}`}>{STORE_BAKHURNA_LIVE.trialLeadAr}</p>
              <Link
                to={trialHref}
                className="mt-5 inline-flex rounded-full bg-[#6E4A26] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_BAKHURNA_LIVE.trialCtaAr}
              </Link>
            </div>
          ) : (
            <p className="rounded-xl border border-[#6E4A26]/35 bg-[#6E4A26]/10 px-4 py-3 text-sm leading-7">
              انتهت المدة. الرابط ما زال لديكم. أتمّوا التمديد لتفعيل نفس الصفحة واللوحة.
            </p>
          )}

          <div>
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_BAKHURNA_LIVE.extensionTitleAr}</h2>
            <p className={`mt-2 ${proseSm}`}>{STORE_BAKHURNA_LIVE.extensionLeadAr}</p>
            <div className="mt-5 max-w-2xl">
              <StoreBakhurnaOrderForm renewToken={renewToken} />
            </div>
          </div>

          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
            <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
              <span>{STORE_BAKHURNA_LIVE.termsFoldTriggerAr}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#6E4A26] transition-transform', termsOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#1a140c]/80 p-4 text-sm leading-8 text-white/70">
              <p>{STORE_BAKHURNA_LIVE.termsFoldTitleAr}</p>
              <p className="mt-2">{STORE_BAKHURNA_LIVE.termsFoldBodyAr}</p>
              <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#6E4A26]">
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
