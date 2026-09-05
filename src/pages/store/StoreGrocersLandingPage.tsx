/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط تموينات الحي.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreGrocersOrderForm } from '@/components/store/StoreGrocersOrderForm';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreProductReadLink } from '@/components/store/StoreProductReadLink';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreGrocersStudio } from '@/components/store/StoreGrocersStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import {
  STORE_GROCERS_EXTENSION_PRICING,
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_FEATURES,
  STORE_GROCERS_LIVE_LAB_TOKEN,
  STORE_GROCERS_LIVE_PUBLIC_ENABLED,
} from '@/config/storeGrocersLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const prose = 'max-w-xl text-base leading-[1.75] text-white/78';
const proseSm = 'max-w-xl text-sm leading-[1.75] text-white/75';

export default function StoreGrocersLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [chatDetailsOpen, setChatDetailsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_GROCERS_LIVE.documentTitle);

  if (!STORE_GROCERS_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const trialHref = `${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=grocers`;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#8fbf7a]">{STORE_GROCERS_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{STORE_GROCERS_LIVE.titleAr}</h1>
            <p className={`mt-4 ${prose} font-extrabold text-[#f4efe4]`}>{STORE_GROCERS_LIVE.hookAr}</p>
            <p className={`mt-4 ${prose}`}>{STORE_GROCERS_LIVE.leadAr}</p>
            <p className={`mt-4 ${proseSm} font-bold text-[#d8f0cc]`}>{STORE_GROCERS_LIVE.valueLineAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_GROCERS_READ} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={trialHref}
                className="rounded-full bg-[#8fbf7a] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_GROCERS_LIVE.trialCtaAr}
              </Link>
              <a
                href="#live-preview"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/85"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_GROCERS_LIVE.tryCtaAr}
              </a>
              <a
                href="#grocers-extension"
                className="rounded-full border border-[#8fbf7a]/40 px-5 py-2.5 text-sm font-bold text-[#8fbf7a]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('grocers-extension')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_GROCERS_LIVE.orderCtaAr}
              </a>
              <StoreProductBenefitsLink />
              <StoreProductSupportLink to={ROUTE_PATHS.STORE_GROCERS_SUPPORT} className="border-[#8fbf7a]/50 text-[#8fbf7a]" />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#8fbf7a]"
              productTitleAr={STORE_GROCERS_LIVE.titleAr}
            />
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#8fbf7a]/35 bg-[#07140e]">
            <StoreShot reel="grocers" alt={STORE_GROCERS_LIVE.heroAltAr} className="aspect-[16/10] w-full" />
            <figcaption className="border-t border-[#8fbf7a]/20 bg-[#07140e] px-5 py-4">
              <p className="text-xl font-black">{STORE_GROCERS_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_GROCERS_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <StoreLandingFold titleAr="تفاصيل تمويناتا1" accentClass="text-[#8fbf7a]">
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.problemTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_GROCERS_LIVE.problemBodyAr}</p>
              <p className={`mt-3 ${proseSm} font-bold text-[#8fbf7a]`}>{STORE_GROCERS_LIVE.problemCloseAr}</p>
              <p className={`mt-2 ${proseSm} text-white/65`}>{STORE_GROCERS_LIVE.problemNoCommissionAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.solutionTitleAr}</h2>
              <p className={`mt-2 ${prose}`}>{STORE_GROCERS_LIVE.solutionBodyAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.howTitleAr}</h2>
              <ol className="mt-3 max-w-xl space-y-4">
                {STORE_GROCERS_LIVE.howSteps.map((step, index) => (
                  <li key={step.titleAr} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-extrabold text-[#8fbf7a]">
                      {index + 1}. {step.titleAr}
                    </p>
                    <p className={`mt-1 ${proseSm}`}>{step.bodyAr}</p>
                  </li>
                ))}
              </ol>
              <p className={`mt-4 ${proseSm}`}>{STORE_GROCERS_LIVE.ingestLineAr}</p>
              <p className={`mt-2 ${proseSm} font-bold text-[#8fbf7a]`}>{STORE_GROCERS_LIVE.catalogCountLineAr}</p>
            </div>
            <div>
              <p className={proseSm}>{STORE_GROCERS_LIVE.hoursLineAr}</p>
              <p className={`mt-3 ${proseSm}`}>{STORE_GROCERS_LIVE.presenceLineAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.featuresTitleAr}</h2>
              <ul className="mt-3 space-y-3">
                {STORE_GROCERS_LIVE_FEATURES.map((item) => (
                  <li
                    key={item.titleAr}
                    className={
                      'pulse' in item && item.pulse
                        ? 'grocers-feature-pulse rounded-2xl border border-[#8fbf7a]/45 bg-[#07140e] px-4 py-3.5'
                        : 'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
                    }
                  >
                    <p
                      className={
                        'pulse' in item && item.pulse
                          ? 'grocers-feature-pulse__text'
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
            <StoreGrocersStudio token={STORE_GROCERS_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-[#07140e]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.payTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_GROCERS_LIVE.payIndependenceAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_GROCERS_LIVE.payFeeLineAr}</p>
          </div>

          <div id="grocers-chat-addon" className="rounded-2xl border border-white/12 bg-[#07140e]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.chatAddonTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_GROCERS_LIVE.chatAddonLeadAr}</p>
            <p className={`mt-2 ${proseSm} text-[#8fbf7a]`}>
              {STORE_GROCERS_LIVE.chatAddonPrice6Ar} {STORE_GROCERS_LIVE.chatAddonPrice12Ar}
            </p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#07140e]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.legalTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_GROCERS_LIVE.legalBodyAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_GROCERS_LIVE.legalCertAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_GROCERS_LIVE.legalPrivacyAr}</p>
            <Link to={STORE_GROCERS_LIVE.trustHref} className="mt-4 inline-flex text-sm font-bold text-[#8fbf7a] underline-offset-4 hover:underline">
              {STORE_GROCERS_LIVE.trustLinkAr}
            </Link>
          </div>

          {!renewToken ? (
            <div id="grocers-trial" className="scroll-mt-8 rounded-2xl border border-[#8fbf7a]/35 bg-[#8fbf7a]/10 p-5 md:p-6">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.trialTitleAr}</h2>
              <p className={`mt-3 ${prose}`}>{STORE_GROCERS_LIVE.trialLeadAr}</p>
              <Link
                to={trialHref}
                className="mt-5 inline-flex rounded-full bg-[#8fbf7a] px-5 py-2.5 text-sm font-bold text-[#061018]"
              >
                {STORE_GROCERS_LIVE.trialCtaAr}
              </Link>
            </div>
          ) : (
            <p className="rounded-xl border border-[#8fbf7a]/35 bg-[#8fbf7a]/10 px-4 py-3 text-sm leading-7">
              انتهت المدة. الرابط ما زال لديكم. أتمّوا التمديد لتفعيل نفس المتجر ولوحة الكاشير.
            </p>
          )}

          <div id="grocers-extension" className="scroll-mt-8">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_GROCERS_LIVE.extensionTitleAr}</h2>
            <p className={`mt-2 ${proseSm}`}>{STORE_GROCERS_LIVE.extensionLeadAr}</p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#8fbf7a]/30">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#8fbf7a]/10 text-right">
                    <th className="px-4 py-3 font-extrabold">{STORE_GROCERS_LIVE.extensionTableHeadModeAr}</th>
                    <th className="px-4 py-3 font-extrabold">{STORE_GROCERS_LIVE.extensionTableHeadTerm1Ar}</th>
                    <th className="px-4 py-3 font-extrabold">{STORE_GROCERS_LIVE.extensionTableHeadTerm2Ar}</th>
                  </tr>
                </thead>
                <tbody>
                  {STORE_GROCERS_EXTENSION_PRICING.map((row) => (
                    <tr key={row.modeAr} className="border-b border-white/8">
                      <td className="px-4 py-3 font-bold">{row.modeAr}</td>
                      <td className="px-4 py-3">
                        {row.price6Sar} ر.س · {row.days6Ar}
                      </td>
                      <td className="px-4 py-3">
                        {row.price12Sar} ر.س · {row.days12Ar}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 max-w-2xl">
              <StoreGrocersOrderForm renewToken={renewToken} chatDetailsOpen={chatDetailsOpen} onChatDetailsToggle={setChatDetailsOpen} />
            </div>
          </div>

          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
            <CollapsibleTrigger type="button" className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold">
              <span>{STORE_GROCERS_LIVE.termsFoldTriggerAr}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#8fbf7a] transition-transform', termsOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#07140e]/80 p-4 text-sm leading-8 text-white/70">
              <p>{STORE_GROCERS_LIVE.termsFoldTitleAr}</p>
              <p className="mt-2">{STORE_GROCERS_LIVE.termsFoldBodyAr}</p>
              <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#8fbf7a]">
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
