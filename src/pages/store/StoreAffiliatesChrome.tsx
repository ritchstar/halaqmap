/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { STORE_AFFILIATE_COPY } from '@/config/storeAffiliateLive';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function StoreAffiliatesChrome({ children }: { children: ReactNode }) {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(20,184,166,0.14),transparent_55%)]" />
      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to={ROUTE_PATHS.STORE_AFFILIATES} className="text-sm font-bold text-teal-200 hover:underline">
            {STORE_AFFILIATE_COPY.kickerAr}
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-xs">
            <Link to={ROUTE_PATHS.STORE_AFFILIATES_ENTER} className="text-teal-300 hover:underline">
              {STORE_AFFILIATE_COPY.homeApplyCtaAr}
            </Link>
            <Link to={ROUTE_PATHS.STORE_AFFILIATES_DESK} className="text-teal-300 hover:underline">
              {STORE_AFFILIATE_COPY.homeDeskCtaAr}
            </Link>
            <Link to={ROUTE_PATHS.STORE_AFFILIATES_RULES} className="text-teal-300/80 hover:underline">
              {STORE_AFFILIATE_COPY.homeRulesCtaAr}
            </Link>
          </nav>
        </div>
      </header>
      <main className="relative z-10 container mx-auto max-w-3xl space-y-8 px-4 py-8 pb-16">{children}</main>
      <footer className="relative z-10 border-t border-white/8 px-4 py-6 text-center text-xs text-slate-500">
        <p className="mb-3">{STORE_AFFILIATE_COPY.isolationAr}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`https://www.halaqmap.com/#${ROUTE_PATHS.AMBASSADOR_ENTER}`} className="text-slate-400 hover:text-teal-200">
            {STORE_AFFILIATE_COPY.outboundHalaqAr}
          </a>
          <a href={`https://coiffeur.halaqmap.com/#${ROUTE_PATHS.COIFFEUR_AMBASSADORS}`} className="text-slate-400 hover:text-teal-200">
            {STORE_AFFILIATE_COPY.outboundCoiffeurAr}
          </a>
        </div>
      </footer>
    </div>
  );
}
