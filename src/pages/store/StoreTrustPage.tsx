/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تصنيفات وفحوص مستقلة لمتجر halaqmap — تحقق علني، بلا ترتيب بحث.
 */
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { EcommerceVerifiedFooterBadge } from '@/components/EcommerceVerifiedFooterBadge';
import {
  STORE_BRAND_LATIN,
  STORE_PUBLIC_NAME_AR,
  STORE_TRUST_COPY,
} from '@/config/storeFront';
import {
  PLATFORM_EXTERNAL_TRUST_SCANS,
} from '@/config/platformOperationalTrust';
import {
  PLATFORM_TLS_DOMAIN,
  PLATFORM_TLS_SSL_LABS_GRADE,
  PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR,
  PLATFORM_TLS_SSL_LABS_URL,
} from '@/config/platformTlsTrust';
import {
  LEGAL_ECOMMERCE_INQUIRY_URL,
} from '@/config/partnerLegal';
import { STORE_SAIP_COPY, STORE_SAIP_PUBLIC_WORKS } from '@/config/storeSaipRegistry';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

const REPUTATION_SCANS = PLATFORM_EXTERNAL_TRUST_SCANS.filter((scan) => scan.id !== 'ssl-labs');

export default function StoreTrustPage() {
  useDocumentTitle(STORE_TRUST_COPY.documentTitle);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <header>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_TRUST_COPY.kicker}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">
              {STORE_TRUST_COPY.titleAr}
            </h1>
            <p className="mt-2 text-2xl font-extrabold text-[#e8c547]">
              <span dir="ltr" className="inline-block tracking-wide">
                {STORE_BRAND_LATIN}
              </span>
              <span className="mx-2 text-white/35">·</span>
              {STORE_PUBLIC_NAME_AR}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
              {STORE_TRUST_COPY.leadAr}
            </p>
          </header>

          <section className="mt-12 overflow-hidden rounded-[1.75rem] border border-[#e8c547]/35 bg-[#0b1a24]/85">
            <div className="grid items-center gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 md:p-8">
                <p className="text-xs font-black tracking-[0.18em] text-[#e8c547]">{STORE_TRUST_COPY.sslKickerAr}</p>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug text-[#f4efe4] md:text-3xl">
                  {STORE_TRUST_COPY.sslTitleAr}
                </h2>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-sm font-black text-emerald-100">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  <span dir="ltr">{PLATFORM_TLS_SSL_LABS_GRADE}</span>
                  <span className="font-bold text-emerald-50/80">Qualys SSL Labs</span>
                </p>
                <p className="mt-4 text-sm leading-7 text-white/75 md:text-base md:leading-8">
                  {STORE_TRUST_COPY.sslBodyAr}
                </p>
                <p className="mt-3 text-xs text-white/50">
                  <code dir="ltr">{PLATFORM_TLS_DOMAIN}</code>
                  <span className="mx-2">·</span>
                  {PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR}
                </p>
                <a
                  href={PLATFORM_TLS_SSL_LABS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
                >
                  {STORE_TRUST_COPY.sslVerifyAr}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <figure className="border-t border-white/10 bg-white lg:border-t-0 lg:border-s">
                <img
                  src={STORE_TRUST_COPY.sslImage}
                  alt={STORE_TRUST_COPY.sslAltAr}
                  className="aspect-[16/10] w-full bg-white object-contain object-top"
                />
                <figcaption className="border-t border-white/10 bg-[#061018] px-4 py-3 text-sm font-bold text-[#e8c547]">
                  {STORE_TRUST_COPY.sslCaptionAr}
                </figcaption>
              </figure>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_TRUST_COPY.ecomTitleAr}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{STORE_TRUST_COPY.ecomBodyAr}</p>
              <div className="mt-5">
                <EcommerceVerifiedFooterBadge variant="dark" />
              </div>
              <a
                href={LEGAL_ECOMMERCE_INQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e8c547] underline-offset-4 hover:underline"
              >
                {STORE_TRUST_COPY.ecomVerifyAr}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_TRUST_COPY.activityTitleAr}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{STORE_TRUST_COPY.activityBodyAr}</p>
              <Link
                to={ROUTE_PATHS.STORE_ABOUT}
                className="mt-5 inline-flex text-sm font-bold text-[#e8c547] underline-offset-4 hover:underline"
              >
                {STORE_TRUST_COPY.activityCtaAr}
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_TRUST_COPY.saipTitleAr}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">{STORE_TRUST_COPY.saipLeadAr}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {STORE_SAIP_PUBLIC_WORKS.map((work) => (
                <li key={work.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                  <p className="font-extrabold text-[#e8c547]">{work.titleAr}</p>
                  <p className="mt-2 text-xs leading-6 text-white/60">{STORE_SAIP_COPY.phraseAr}</p>
                  <p className="mt-2 text-sm text-white/75">
                    {STORE_SAIP_COPY.certLabelAr}
                    {' '}
                    <code dir="ltr" className="inline-block font-bold text-white/90">
                      {work.certificateNo}
                    </code>
                  </p>
                  <Link
                    to={work.buyPath}
                    className="mt-3 inline-flex text-sm font-bold text-[#e8c547] underline-offset-4 hover:underline"
                  >
                    {STORE_TRUST_COPY.saipOpenAr}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_TRUST_COPY.scansTitleAr}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{STORE_TRUST_COPY.scansLeadAr}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {REPUTATION_SCANS.map((scan) => (
                <li key={scan.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                  <p className="font-extrabold text-[#e8c547]">{scan.labelAr}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{scan.summaryAr.replace(/`/g, '')}</p>
                  <p className="mt-2 text-xs text-white/45">{scan.reportDateAr}</p>
                  <a
                    href={scan.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/80 underline-offset-4 hover:text-[#e8c547] hover:underline"
                  >
                    {STORE_TRUST_COPY.scanOpenAr}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 max-w-3xl text-sm leading-7 text-white/55">{STORE_TRUST_COPY.disclaimerAr}</p>
        </div>
      </article>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
