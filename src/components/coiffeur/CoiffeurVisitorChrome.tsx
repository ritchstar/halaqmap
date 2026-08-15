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
import { MOBILE_DOCK_CLEARANCE } from '@/lib/mobilePageShell';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { CoiffeurSearchButton, COIFFEUR_VISITOR_CANVAS_CLASS } from '@/components/coiffeur/CoiffeurSearchButton';
import {
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';
import { SUMMI_SITE_ORIGIN } from '@/config/summiCoiffeurRegistry';
import { cn } from '@/lib/utils';

type HeaderProps = {
  brandTo?: string;
  sticky?: boolean;
};

export function CoiffeurVisitorHeader({ brandTo, sticky = true }: HeaderProps) {
  const brand = (
    <CoiffeurBrandMark className="h-20 w-20 ring-1 ring-[#f4d4c0]/45" sizes="80px" />
  );

  return (
    <header
      className={cn(
        'relative z-40 border-b border-rose-200/10 bg-[#14080e]/92 backdrop-blur-md',
        sticky && 'sticky top-0',
      )}
    >
      <div className="mx-auto flex min-h-[7.25rem] max-w-6xl items-center px-4 py-3">
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
          className="w-full sm:w-full"
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
      <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="mt-3 inline-block text-sm text-[#f4d4c0]">
        السياسات
      </Link>
      {showInterest ? (
        <Link to={ROUTE_PATHS.COIFFEUR_INTEREST} className="mt-3 block text-sm text-[#f4d4c0]">
          سجّلي اهتمامك وتلقّي التحديثات
        </Link>
      ) : null}
      <a href={`${SUMMI_SITE_ORIGIN}/summi`} className="mt-3 block text-sm text-[#f4d4c0]">
        أقرب كوافير حسب حاجتك
      </a>
      {showPartnersLater ? (
        <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="mt-3 block text-sm text-[#f4d4c0]">
          مسار المنشآت — مرحلة لاحقة
        </Link>
      ) : null}
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
