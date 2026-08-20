/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * هيكل جوال/سطح مكتب لتجربة المستعلمة — نفس انضباط رئيسية حلاق ماب:
 * رأس مضغوط بلا أزرار متزاحمة، والبحث في رصيف سفلي على الجوال.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOBILE_DOCK_CLEARANCE } from '@/lib/mobilePageShell';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { CoiffeurSearchButton, COIFFEUR_VISITOR_CANVAS_CLASS } from '@/components/coiffeur/CoiffeurSearchButton';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';
import { SUMMI_HUB_PATH, SUMMI_SITE_ORIGIN } from '@/config/summiCoiffeurRegistry';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { CoiffeurStatusTicker } from '@/components/coiffeur/CoiffeurStatusTicker';
import { cn } from '@/lib/utils';

/** يطابق storeFront — لا تستورد storeHostRedirect من هنا حتى لا تُسحب حزمة App إلى صفحة كوافير. */
const STORE_ORIGIN = 'https://store.halaqmap.com';

type HeaderProps = {
  brandTo?: string;
  sticky?: boolean;
};

export function CoiffeurVisitorHeader({ brandTo, sticky = true }: HeaderProps) {
  const isMobile = useIsMobile();
  const brand = isMobile ? (
    <span className="flex min-w-0 items-center gap-2.5">
      <CoiffeurBrandMark
        className="h-10 w-10 ring-1 ring-[#f4d4c0]/45"
        sizes="40px"
        showWordmark={false}
      />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-base font-black text-white">{COIFFEUR_BRAND_AR}</span>
        <span className="block text-[0.62rem] font-bold text-[#f4d4c0]/80">{COIFFEUR_INQUIRY_COPY.searchHero}</span>
      </span>
    </span>
  ) : (
    <CoiffeurBrandMark className="h-20 w-20 ring-1 ring-[#f4d4c0]/45" sizes="80px" />
  );

  return (
    <header
      className={cn(
        'relative z-40 border-b border-rose-200/10 bg-[#14080e]/92 backdrop-blur-md',
        sticky && 'sticky top-0',
      )}
    >
      <CoiffeurStatusTicker />
      {!isMobile ? <KSACityClocksBar /> : null}
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center px-4',
          isMobile ? 'h-14' : 'min-h-[7.25rem] py-3',
        )}
      >
        {brandTo ? (
          <Link to={brandTo} className="min-w-0 no-underline">
            {brand}
          </Link>
        ) : (
          brand
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4d4c0]/40 to-transparent" />
    </header>
  );
}

type DockProps = {
  busy?: boolean;
  onClick: () => void;
};

export function CoiffeurMobileSearchDock({ busy = false, onClick }: DockProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#f4d4c0]/20 bg-[#14080e]/97 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(20,8,14,0.55)] backdrop-blur-xl md:hidden"
      dir="rtl"
    >
      <div className="mx-auto max-w-lg">
        <CoiffeurSearchButton
          size="hero"
          className="min-h-12 w-full sm:w-full"
          label={busy ? COIFFEUR_INQUIRY_COPY.searchBusy : COIFFEUR_INQUIRY_COPY.searchHero}
          busy={busy}
          onClick={onClick}
        />
      </div>
    </div>
  );
}

export function CoiffeurVisitorGlows() {
  return (
    <>
      <div className="pointer-events-none absolute -left-24 top-24 hidden h-[22rem] w-[22rem] rounded-full bg-rose-400/12 blur-[110px] md:block" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-10 hidden h-[26rem] w-[26rem] rounded-full bg-amber-200/10 blur-[120px] md:block" aria-hidden />
    </>
  );
}

type FooterProps = {
  showPartnersLater?: boolean;
  showInterest?: boolean;
};

export function CoiffeurVisitorFooter({
  showPartnersLater = false,
  showInterest = true,
}: FooterProps) {
  return (
    <footer className="hidden border-t border-rose-200/10 px-5 py-8 text-center md:block">
      <p className="text-sm leading-7 text-rose-50/90">{COIFFEUR_UMBRELLA_LINE_AR}</p>
      <p className="mt-2 text-sm text-rose-100/80">{COIFFEUR_FOOTER_LEGAL_AR}</p>
      <p className="mt-1 text-sm text-rose-100/80">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-sm text-[#f4d4c0]">
          السياسات
        </Link>
        <a href={STORE_ORIGIN} className="text-sm text-[#f4d4c0]">
          المتجر الإلكتروني
        </a>
      </div>
      {showInterest ? (
        <Link to={ROUTE_PATHS.COIFFEUR_INTEREST} className="mt-3 block text-sm text-[#f4d4c0]">
          سجّلي اهتمامك وتلقّي التحديثات
        </Link>
      ) : null}
      <a href={`${SUMMI_SITE_ORIGIN}${SUMMI_HUB_PATH}`} className="mt-3 block text-sm text-[#f4d4c0]">
        أقرب كوافير حسب حاجتك
      </a>
      {showPartnersLater ? (
        <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="mt-3 block text-sm text-[#f4d4c0]">
          مسار المنشآت
        </Link>
      ) : null}
      <Link to={ROUTE_PATHS.COIFFEUR_MARKETING} className="mt-3 block text-sm text-[#f4d4c0]">
        خطط الظهور ومنجزات البحث
      </Link>
    </footer>
  );
}

export function CoiffeurVisitorShell({
  children,
  withMobileDock = true,
}: {
  children: ReactNode;
  withMobileDock?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className={cn(COIFFEUR_VISITOR_CANVAS_CLASS, 'md:pb-0', withMobileDock && MOBILE_DOCK_CLEARANCE)}
    >
      <CoiffeurVisitorGlows />
      {children}
    </div>
  );
}
