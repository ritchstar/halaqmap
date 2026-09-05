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
import { StoreProductSupportLink } from '@/components/store/StoreProductSupportLink';
import { StoreProductReadLink } from '@/components/store/StoreProductReadLink';
import { StoreRestaurantOrderForm } from '@/components/store/StoreRestaurantOrderForm';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreRestaurantStudio } from '@/components/store/StoreRestaurantStudio';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreLandingFold } from '@/components/store/StoreLandingFold';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import {
  STORE_RESTAURANT_EXTENSION_PRICING,
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

const prose = 'max-w-xl text-base leading-[1.75] text-white/78';
const proseSm = 'max-w-xl text-sm leading-[1.75] text-white/75';

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
      <section className="px-4 py-10 pb-24 md:py-14 md:pb-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold leading-7 tracking-wide text-[#e08a3c]">{STORE_RESTAURANT_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
              <bdi>{STORE_RESTAURANT_LIVE.titleAr}</bdi>
            </h1>
            <p className={`mt-4 ${prose}`}>{STORE_RESTAURANT_LIVE.leadAr}</p>
            <p className={`mt-3 ${proseSm} font-bold text-[#f3d2b0]`}>{STORE_RESTAURANT_LIVE.opsLineAr}</p>
            <p className={`mt-2 ${proseSm}`}>{STORE_RESTAURANT_LIVE.financialLineAr}</p>
            <StoreProductReadLink to={ROUTE_PATHS.STORE_RESTAURANT_READ} />
            {renewToken ? (
              <p className="mt-4 rounded-xl border border-[#e08a3c]/35 bg-[#e08a3c]/10 px-4 py-3 text-sm leading-7">
                انتهت المدة. الرابط ما زال لديكم. أتمّوا الشراء مرة أخرى لتمديد نفس الصفحة.
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#live-preview"
                className="rounded-full bg-[#e08a3c] px-5 py-2.5 text-center text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_RESTAURANT_LIVE.tryCtaAr}
              </a>
              <a
                href="#restaurant-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-bold text-white/85"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('restaurant-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_RESTAURANT_LIVE.orderCtaAr}
              </a>
              <StoreProductBenefitsLink className="w-full justify-center sm:w-auto" />
              <StoreProductSupportLink
                to={ROUTE_PATHS.STORE_RESTAURANT_SUPPORT}
                className="w-full justify-center border-[#e08a3c]/50 text-[#e08a3c] sm:w-auto"
              />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName="text-[#e08a3c]"
              productTitleAr={STORE_RESTAURANT_LIVE.titleAr}
            />
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#e08a3c]/35 bg-[#1a1008]">
            <StoreShot reel="restaurant" alt={STORE_RESTAURANT_LIVE.heroAltAr} className="aspect-[16/10] w-full" />
            <figcaption className="border-t border-[#e08a3c]/20 bg-[#1a1008] px-5 py-4">
              <p className="text-xl font-black">{STORE_RESTAURANT_LIVE.heroCaptionAr}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_RESTAURANT_LIVE.qrPhraseAr}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <StoreLandingFold titleAr="تفاصيل مطعمنا1" accentClass="text-[#e08a3c]">
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.howTitleAr}</h2>
              <ol className="mt-3 max-w-xl space-y-4">
                {STORE_RESTAURANT_LIVE.howSteps.map((step, index) => (
                  <li key={step.titleAr} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-extrabold text-[#e08a3c]">
                      {index + 1}. {step.titleAr}
                    </p>
                    <p className={`mt-1 ${proseSm}`}>{step.bodyAr}</p>
                  </li>
                ))}
              </ol>
              <p className={`mt-4 ${proseSm}`}>{STORE_RESTAURANT_LIVE.whatsappLineAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.featuresTitleAr}</h2>
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
                    <p className={`mt-1 ${proseSm}`}>{item.bodyAr}</p>
                  </li>
                ))}
              </ul>
              <p className={`mt-4 ${proseSm}`}>{STORE_RESTAURANT_LIVE.opsBodyAr}</p>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.vendorPathTitleAr}</h2>
              <p className={`mt-2 ${proseSm}`}>{STORE_RESTAURANT_LIVE.vendorPathLeadAr}</p>
              <p className={`mt-2 ${proseSm} font-bold text-[#f3d2b0]`}>
                <bdi>{STORE_MOBILE_VENDOR.fixedLeadAr}</bdi>
              </p>
              <p className={`mt-1 ${proseSm} font-bold text-[#f3d2b0]`}>
                <bdi>{STORE_MOBILE_VENDOR.mobileLeadAr}</bdi>
              </p>
            </div>
          </StoreLandingFold>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-[#1a1008]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.payTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_RESTAURANT_LIVE.payLeadAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_RESTAURANT_LIVE.payMethodsAr}</p>
            <p className={`mt-3 ${proseSm} font-bold text-[#f3d2b0]`}>{STORE_RESTAURANT_LIVE.payIndependenceAr}</p>
            <p className={`mt-2 ${proseSm}`}>{STORE_RESTAURANT_LIVE.payNoCommissionAr}</p>
            <p className={`mt-2 ${proseSm} text-white/60`}>{STORE_RESTAURANT_LIVE.payFeeLineAr}</p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a1008]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.privacyTitleAr}</h2>
            <p className={`mt-3 ${proseSm}`}>{STORE_RESTAURANT_LIVE.privacyAr}</p>
            <p className={`mt-3 ${proseSm}`}>{STORE_RESTAURANT_LIVE.privacyArchiveAr}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <StoreInViewMount>
            <StoreRestaurantStudio token={STORE_RESTAURANT_LIVE_LAB_TOKEN} />
          </StoreInViewMount>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div id="restaurant-pricing" className="rounded-2xl border border-white/12 bg-[#1a1008]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.pricingTitleAr}</h2>
            <p className={`mt-2 ${proseSm}`}>{STORE_RESTAURANT_LIVE.pricingLeadAr}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e08a3c]/35 bg-[#e08a3c]/10 px-4 py-3">
                <p className="text-sm text-white/70">مسار ثابت · 180 يوماً</p>
                <p className="mt-1 text-2xl font-black text-[#e08a3c]">
                  <bdi>{formatRestaurantPriceSar(699)}</bdi>
                </p>
              </div>
              <div className="rounded-xl border border-[#e08a3c]/35 bg-[#e08a3c]/10 px-4 py-3">
                <p className="text-sm text-white/70">مسار ثابت · 365 يوماً</p>
                <p className="mt-1 text-2xl font-black text-[#e08a3c]">
                  <bdi>{formatRestaurantPriceSar(999)}</bdi>
                </p>
                <p className="mt-1 text-xs text-[#f3d2b0]">توفير 399 ر.س</p>
              </div>
              <div className="rounded-xl border border-white/15 px-4 py-3">
                <p className="text-sm text-white/70">مسار متحرك · 180 يوماً</p>
                <p className="mt-1 text-2xl font-black text-[#e08a3c]">
                  <bdi>{formatRestaurantPriceSar(799)}</bdi>
                </p>
              </div>
              <div className="rounded-xl border border-white/15 px-4 py-3">
                <p className="text-sm text-white/70">مسار متحرك · 365 يوماً</p>
                <p className="mt-1 text-2xl font-black text-[#e08a3c]">
                  <bdi>{formatRestaurantPriceSar(1250)}</bdi>
                </p>
                <p className="mt-1 text-xs text-[#f3d2b0]">توفير 348 ر.س</p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="border-b border-white/15 text-right text-white/65">
                    <th className="px-3 py-2 font-bold">{STORE_RESTAURANT_LIVE.extensionTableHeadModeAr}</th>
                    <th className="px-3 py-2 font-bold">{STORE_RESTAURANT_LIVE.extensionTableHeadTerm1Ar}</th>
                    <th className="px-3 py-2 font-bold">{STORE_RESTAURANT_LIVE.extensionTableHeadTerm2Ar}</th>
                  </tr>
                </thead>
                <tbody>
                  {STORE_RESTAURANT_EXTENSION_PRICING.map((row) => (
                    <tr key={row.modeAr} className="border-b border-white/8">
                      <td className="px-3 py-3 font-bold text-white/90">{row.modeAr}</td>
                      <td className="px-3 py-3">
                        <bdi>{row.price6Sar} ر.س</bdi>
                      </td>
                      <td className="px-3 py-3">
                        <bdi>{row.price12Sar} ر.س</bdi>
                        <span className="mt-1 block text-xs text-[#f3d2b0]">توفير {row.savings12Ar}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2">
              {STORE_RESTAURANT_LIVE_PACKS.map((pack) => (
                <li key={pack.id} className={`${proseSm} rounded-xl border border-white/10 px-4 py-3`}>
                  <p className="font-extrabold text-white/90">
                    مسار ثابت · <bdi>{pack.titleAr}</bdi> · <bdi>{pack.priceLineAr}</bdi>
                  </p>
                  <p className="mt-1">{pack.lineAr}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#1a1008]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_RESTAURANT_LIVE.legalTitleAr}</h2>
            <p className={`mt-3 ${prose}`}>{STORE_RESTAURANT_LIVE.legalBodyAr}</p>
            <Link
              to={STORE_RESTAURANT_LIVE.trustHref}
              className="mt-4 inline-flex text-sm font-bold text-[#e08a3c] underline-offset-4 hover:underline"
            >
              {STORE_RESTAURANT_LIVE.trustLinkAr}
            </Link>
          </div>

          <div className="max-w-2xl pb-24 md:pb-0">
            <StoreRestaurantOrderForm renewToken={renewToken} />
          </div>

          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
            <CollapsibleTrigger
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
            >
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
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}

function formatRestaurantPriceSar(sar: number): string {
  return `${sar.toLocaleString('ar-SA')} ر.س`;
}
