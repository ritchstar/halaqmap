/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import { STORE_ABOUT_COPY, STORE_BRAND_LATIN, STORE_CONTACT_EMAIL, STORE_CONTACT_PHONE_DISPLAY, STORE_CONTACT_PHONE_E164, STORE_CONTACT_WHATSAPP_URL, STORE_CONTACT_X_HANDLE, STORE_CONTACT_X_URL, STORE_FOOTER_CONTACT, STORE_LANDING_COPY, STORE_ORIGIN, STORE_PUBLIC_NAME_AR, STORE_VISUALS } from '@/config/storeFront';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { EcommerceVerifiedFooterBadge } from '@/components/EcommerceVerifiedFooterBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, type ReactNode } from 'react';

export function StoreVisitorShell({ children }: { children: ReactNode }) {
  useEffect(() => lockPartnerDarkCanvas(), []);
  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      {children}
    </div>
  );
}

export function StoreVisitorHeader() {
  const isMobile = useIsMobile();
  return (
    <div className="border-b border-white/10 bg-[#061018]/90">
      {!isMobile ? <KSACityClocksBar /> : null}
      <header className="backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to={ROUTE_PATHS.STORE_LANDING} className="flex min-w-0 items-center gap-3">
            <img
              src={STORE_VISUALS.logo}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
            />
            <span className="min-w-0">
              <p className="text-[0.7rem] font-bold tracking-wide text-[#e8c547]">{STORE_BRAND_LATIN}</p>
              <p className="truncate text-lg font-extrabold text-[#f4efe4]">{STORE_PUBLIC_NAME_AR}</p>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-2 text-sm font-bold">
            <Link
              to={ROUTE_PATHS.STORE_TRUST}
              className="hidden rounded-full px-3 py-1.5 text-white/80 hover:text-[#e8c547] sm:inline-flex"
            >
              {STORE_ABOUT_COPY.trustNavAr}
            </Link>
            <Link
              to={ROUTE_PATHS.STORE_REQUEST}
              className="rounded-full border border-[#e8c547]/40 px-3 py-1.5 text-[#e8c547]"
            >
              طلب خدمة
            </Link>
            <Link
              to={ROUTE_PATHS.STORE_CARDS}
              className="rounded-full bg-[#e8c547] px-3 py-1.5 text-[#061018]"
            >
              بطاقة مجانية
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}

export function StoreVisitorFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
          <Link to={ROUTE_PATHS.STORE_ABOUT} className="text-[#e8c547]">
            {STORE_LANDING_COPY.aboutNavAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_TRUST} className="text-[#e8c547]">
            {STORE_ABOUT_COPY.trustNavAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_REQUEST} className="text-white/80">
            طلب خدمة
          </Link>
          <Link to={ROUTE_PATHS.STORE_LANDING} className="text-white/80">
            واجهة المتجر
          </Link>
          <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="text-white/80">
            {STORE_LANDING_COPY.issuedCardsLegalAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_BEREAVEMENT} className="text-white/55">
            {STORE_LANDING_COPY.bereavementTitleAr}
          </Link>
        </nav>
        <p className="text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.roleLine}</p>
        <p className="text-xs text-white/50">{STORE_ORIGIN}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
          <a href={`mailto:${STORE_CONTACT_EMAIL}`} className="hover:text-[#e8c547]">
            {STORE_FOOTER_CONTACT.emailLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_EMAIL}</span>
          </a>
          <a href={`tel:+${STORE_CONTACT_PHONE_E164}`} className="hover:text-[#e8c547]">
            {STORE_FOOTER_CONTACT.phoneLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_PHONE_DISPLAY}</span>
          </a>
          <a
            href={STORE_CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e8c547]"
          >
            {STORE_FOOTER_CONTACT.whatsappLabelAr}
          </a>
          <a
            href={STORE_CONTACT_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e8c547]"
          >
            {STORE_FOOTER_CONTACT.xLabelAr}
            {' · '}
            <span dir="ltr">{STORE_CONTACT_X_HANDLE}</span>
          </a>
        </div>
        <EcommerceVerifiedFooterBadge variant="dark" />
        <p className="text-xs leading-relaxed text-white/45">{STORE_LANDING_COPY.footerLegal}</p>
      </div>
    </footer>
  );
}
