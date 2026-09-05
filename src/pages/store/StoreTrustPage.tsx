/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * التوثيق والتحقق — متجر halaqmap. ثقة رسمية أولاً، ثم فحوص تقنية مساندة.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, ShieldCheck, X } from 'lucide-react';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { EcommerceVerifiedFooterBadge } from '@/components/EcommerceVerifiedFooterBadge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { STORE_TRUST_COPY } from '@/config/storeFront';
import { PLATFORM_EXTERNAL_TRUST_SCANS } from '@/config/platformOperationalTrust';
import {
  PLATFORM_TLS_DOMAIN,
  PLATFORM_TLS_SSL_LABS_GRADE,
  PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR,
  PLATFORM_TLS_SSL_LABS_URL,
} from '@/config/platformTlsTrust';
import { LEGAL_ECOMMERCE_INQUIRY_URL } from '@/config/partnerLegal';
import { STORE_SAIP_COPY, STORE_SAIP_PUBLIC_WORKS, type StoreSaipWork } from '@/config/storeSaipRegistry';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

const REPUTATION_SCANS = PLATFORM_EXTERNAL_TRUST_SCANS.filter((scan) => scan.id !== 'ssl-labs');

type CertPreview = StoreSaipWork;
type ImagePreview = { src: string; titleAr: string; alt: string; productPath?: string };

const proseClass = 'max-w-[42rem] text-base leading-[1.75] text-white/78';

function StoreProductName({ children }: { children: string }) {
  return (
    <bdi dir="rtl" className="inline-block [unicode-bidi:isolate]">
      {children}
    </bdi>
  );
}

function TrustSectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6 ${className}`}>
      {children}
    </section>
  );
}

export default function StoreTrustPage() {
  useDocumentTitle(STORE_TRUST_COPY.documentTitle);
  const [certPreview, setCertPreview] = useState<CertPreview | null>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);

  useEffect(() => {
    const metaName = 'description';
    let tag = document.querySelector(`meta[name="${metaName}"]`);
    const created = !tag;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', metaName);
      document.head.appendChild(tag);
    }
    const previous = tag.getAttribute('content');
    tag.setAttribute('content', STORE_TRUST_COPY.metaDescriptionAr);
    return () => {
      if (created) {
        tag?.remove();
      } else if (previous) {
        tag?.setAttribute('content', previous);
      }
    };
  }, []);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <article className="px-5 py-10 md:py-14">
        <div className="mx-auto w-full max-w-[70rem]">
          <header>
            <h1 className="text-3xl font-extrabold leading-tight text-[#f4efe4] md:text-4xl lg:text-5xl">
              {STORE_TRUST_COPY.titleAr}
            </h1>
            <p className={`mt-5 ${proseClass}`}>{STORE_TRUST_COPY.leadAr}</p>
            <p className={`mt-4 text-sm leading-[1.75] text-white/55 ${proseClass}`}>
              {STORE_TRUST_COPY.scansTimingNoteAr}
            </p>
          </header>

          <div className="mt-12 space-y-8">
            <TrustSectionCard>
              <h2 className="text-xl font-extrabold text-[#f4efe4] md:text-2xl">{STORE_TRUST_COPY.ecomTitleAr}</h2>
              <p className={`mt-4 ${proseClass}`}>{STORE_TRUST_COPY.ecomBodyAr}</p>
              <div className="mt-6">
                <EcommerceVerifiedFooterBadge variant="dark" />
              </div>
              <a
                href={LEGAL_ECOMMERCE_INQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
              >
                {STORE_TRUST_COPY.ecomVerifyAr}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </TrustSectionCard>

            <TrustSectionCard>
              <h2 className="text-xl font-extrabold text-[#f4efe4] md:text-2xl">{STORE_TRUST_COPY.activityTitleAr}</h2>
              <p className={`mt-4 ${proseClass}`}>{STORE_TRUST_COPY.activityBodyAr}</p>
              <Link
                to={`${ROUTE_PATHS.STORE_ABOUT}#registered-activities`}
                className="mt-5 inline-flex text-sm font-bold text-[#7ec8e3] underline-offset-4 hover:underline"
              >
                {STORE_TRUST_COPY.activityCtaAr}
              </Link>
            </TrustSectionCard>

            <TrustSectionCard>
              <h2 className="text-xl font-extrabold text-[#f4efe4] md:text-2xl">{STORE_TRUST_COPY.saipTitleAr}</h2>
              <p className={`mt-4 ${proseClass}`}>{STORE_SAIP_COPY.trustLeadAr}</p>
              <p className={`mt-3 text-sm leading-[1.75] text-white/60 ${proseClass}`}>{STORE_SAIP_COPY.trustNoteAr}</p>
              <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {STORE_SAIP_PUBLIC_WORKS.map((work) => (
                  <li
                    key={work.id}
                    className="flex flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-4"
                  >
                    <span className="inline-flex w-fit rounded-full border border-[#e8c547]/35 bg-[#e8c547]/10 px-2.5 py-0.5 text-xs font-bold text-[#e8c547]">
                      {STORE_SAIP_COPY.badgeAr}
                    </span>
                    <p className="mt-3 text-lg font-extrabold text-[#f4efe4]">
                      {work.certificateRegisteredNameAr ? (
                        <>
                          {STORE_SAIP_COPY.productLabelAr}{' '}
                          <StoreProductName>{work.titleAr}</StoreProductName>
                        </>
                      ) : (
                        <StoreProductName>{work.titleAr}</StoreProductName>
                      )}
                    </p>
                    {work.certificateRegisteredNameAr ? (
                      <p className="mt-2 text-sm leading-[1.75] text-white/70">
                        {STORE_SAIP_COPY.registeredNameLabelAr}{' '}
                        <StoreProductName>{work.certificateRegisteredNameAr}</StoreProductName>
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-white/75">
                      {STORE_SAIP_COPY.certLabelAr}
                      <br />
                      <bdi dir="ltr" className="mt-1 inline-block font-bold text-[#e8c547]">
                        {work.certificateNo}
                      </bdi>
                    </p>
                    <button
                      type="button"
                      onClick={() => setCertPreview(work)}
                      className="mt-3 block w-full overflow-hidden rounded-xl border border-white/10 bg-white transition hover:border-[#e8c547]/35"
                    >
                      <img
                        src={work.certImage}
                        alt={`${work.titleAr} — ${STORE_SAIP_COPY.certImageAltAr}`}
                        className="aspect-[5/3] w-full object-contain object-top p-1"
                      />
                    </button>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setCertPreview(work)}
                        className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-sm font-bold text-[#e8c547]"
                      >
                        {STORE_SAIP_COPY.viewCertAr}
                      </button>
                      <Link
                        to={work.buyPath}
                        className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-sm font-bold text-[#7ec8e3] underline-offset-4 hover:underline"
                      >
                        {STORE_SAIP_COPY.productPageAr}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </TrustSectionCard>

            <TrustSectionCard>
              <p className="text-xs font-black tracking-[0.18em] text-[#e8c547]">{STORE_TRUST_COPY.sslKickerAr}</p>
              <h2 className="mt-2 text-xl font-extrabold text-[#f4efe4] md:text-2xl">{STORE_TRUST_COPY.sslTitleAr}</h2>
              <p className={`mt-4 ${proseClass}`}>{STORE_TRUST_COPY.sslBodyAr}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <dt className="text-xs font-bold text-white/55">{STORE_TRUST_COPY.sslDomainLabelAr}</dt>
                  <dd dir="ltr" className="mt-1 font-mono text-sm font-bold text-[#e8c547]">
                    {PLATFORM_TLS_DOMAIN}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <dt className="text-xs font-bold text-white/55">{STORE_TRUST_COPY.sslGradeLabelAr}</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 font-bold text-emerald-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                    <span dir="ltr">{PLATFORM_TLS_SSL_LABS_GRADE}</span>
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <dt className="text-xs font-bold text-white/55">{STORE_TRUST_COPY.sslDateLabelAr}</dt>
                  <dd className="mt-1 text-sm font-bold text-white/85">{PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR}</dd>
                </div>
              </dl>
              <p className={`mt-4 text-sm leading-[1.75] text-white/60 ${proseClass}`}>
                {STORE_TRUST_COPY.sslScopeNoteAr}
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() =>
                    setImagePreview({
                      src: STORE_TRUST_COPY.sslImage,
                      titleAr: `${PLATFORM_TLS_DOMAIN} — ${STORE_TRUST_COPY.sslTitleAr}`,
                      alt: STORE_TRUST_COPY.sslAltAr,
                    })
                  }
                  className="shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white sm:w-40"
                >
                  <img
                    src={STORE_TRUST_COPY.sslImage}
                    alt={STORE_TRUST_COPY.sslAltAr}
                    className="aspect-[16/10] w-full object-contain object-top"
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-[1.75] text-white/55">{STORE_TRUST_COPY.sslCaptionAr}</p>
                  <a
                    href={PLATFORM_TLS_SSL_LABS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
                  >
                    {STORE_TRUST_COPY.sslVerifyAr}
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </div>
            </TrustSectionCard>

            <TrustSectionCard>
              <h2 className="text-xl font-extrabold text-[#f4efe4] md:text-2xl">{STORE_TRUST_COPY.scansTitleAr}</h2>
              <p className={`mt-4 ${proseClass}`}>{STORE_TRUST_COPY.scansLeadAr}</p>
              <ul className="mt-5 grid gap-4 md:grid-cols-2">
                {REPUTATION_SCANS.map((scan) => (
                  <li key={scan.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                    <p className="font-extrabold text-[#e8c547]">{scan.labelAr}</p>
                    <p className="mt-2 text-base leading-[1.75] text-white/72">{scan.summaryAr}</p>
                    <a
                      href={scan.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#7ec8e3] underline-offset-4 hover:underline"
                    >
                      {STORE_TRUST_COPY.scanOpenAr}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </TrustSectionCard>

            <p className={`${proseClass} text-sm leading-[1.75] text-white/55`}>{STORE_TRUST_COPY.disclaimerAr}</p>
          </div>
        </div>
      </article>

      <Dialog open={certPreview !== null} onOpenChange={(open) => !open && setCertPreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/15 bg-[#0b1a24] text-[#f4efe4]">
          {certPreview ? (
            <>
              <DialogTitle className="pe-10 text-lg font-extrabold text-[#f4efe4]">
                <StoreProductName>{certPreview.titleAr}</StoreProductName>
              </DialogTitle>
              <DialogClose className="absolute end-4 top-4 rounded-full border border-white/15 p-1 text-white/70 hover:text-white">
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">إغلاق</span>
              </DialogClose>
              <img
                src={certPreview.certImage}
                alt={`${certPreview.titleAr} — ${STORE_SAIP_COPY.certImageAltAr}`}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white object-contain"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={certPreview.certImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  فتح الصورة الأصلية
                </a>
                <Link
                  to={certPreview.buyPath}
                  className="inline-flex rounded-full bg-[#e8c547] px-4 py-2 text-sm font-extrabold text-[#061018]"
                  onClick={() => setCertPreview(null)}
                >
                  {STORE_SAIP_COPY.productPageAr}
                </Link>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={imagePreview !== null} onOpenChange={(open) => !open && setImagePreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-white/15 bg-[#0b1a24] text-[#f4efe4]">
          {imagePreview ? (
            <>
              <DialogTitle className="pe-10 text-lg font-extrabold text-[#f4efe4]">{imagePreview.titleAr}</DialogTitle>
              <DialogClose className="absolute end-4 top-4 rounded-full border border-white/15 p-1 text-white/70 hover:text-white">
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">إغلاق</span>
              </DialogClose>
              <img
                src={imagePreview.src}
                alt={imagePreview.alt}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white object-contain"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={imagePreview.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-[#7ec8e3]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  فتح الصورة الأصلية
                </a>
                <a
                  href={PLATFORM_TLS_SSL_LABS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-[#e8c547] px-4 py-2 text-sm font-extrabold text-[#061018]"
                >
                  {STORE_TRUST_COPY.sslVerifyAr}
                </a>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
