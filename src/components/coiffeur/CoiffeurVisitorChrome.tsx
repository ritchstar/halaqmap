/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * هيكل جوال/سطح مكتب لتجربة المستعلمة — نفس انضباط رئيسية حلاق ماب:
 * رأس مضغوط بلا أزرار متزاحمة، والبحث في رصيف سفلي على الجوال.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { MOBILE_DOCK_CLEARANCE } from '@/lib/mobilePageShell';
import { CoiffeurSearchButton, COIFFEUR_VISITOR_CANVAS_CLASS } from '@/components/coiffeur/CoiffeurSearchButton';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';
import { cn } from '@/lib/utils';

type HeaderProps = {
  brandTo?: string;
};

export function CoiffeurVisitorHeader({ brandTo }: HeaderProps) {
  const brand = (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#f4d4c0]/30 bg-[#2a1218]">
        <Sparkles className="h-4 w-4 text-[#f4d4c0]" />
      </div>
      <p className="truncate text-[1rem] font-black tracking-wide text-[#f7efe8]">{COIFFEUR_BRAND_AR}</p>
    </div>
  );

  return (
    <header className="relative sticky top-0 z-40 border-b border-rose-200/10 bg-[#14080e]/92 backdrop-blur-md">
      <div className="mx-auto flex h-[3.5rem] max-w-6xl items-center px-4 md:h-16">
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
      <p className="text-xs leading-7 text-rose-100/45">{COIFFEUR_UMBRELLA_LINE_AR}</p>
      <p className="mt-2 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_LEGAL_AR}</p>
      <p className="mt-1 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
      <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="mt-3 inline-block text-[11px] text-rose-100/40">
        السياسات
      </Link>
      {showInterest ? (
        <Link to={ROUTE_PATHS.COIFFEUR_INTEREST} className="mt-3 block text-[11px] text-rose-100/40">
          سجّلي اهتمامك وتلقّي التحديثات
        </Link>
      ) : null}
      {showPartnersLater ? (
        <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="mt-3 block text-[11px] text-rose-100/40">
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
