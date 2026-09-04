/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رأس أطلس الحلول. بلا شريط ساعات وبلا أزرار عائمة.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { STORE_BRAND_LATIN, STORE_LANDING_COPY, STORE_VISUALS } from '@/config/storeFront';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function AtlasHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={cn('store-atlas__dark-band border-b border-[var(--atlas-line)] bg-[var(--atlas-raised)]', compact ? 'py-2' : 'py-3')}>
      <div className="store-atlas__shell flex items-center gap-2">
        <Link to={ROUTE_PATHS.STORE_LANDING} className="me-auto flex min-w-0 items-center gap-2">
          <img
            src={STORE_VISUALS.logo}
            alt=""
            width={44}
            height={44}
            className={cn('shrink-0 rounded-xl object-cover', compact ? 'h-9 w-9' : 'h-11 w-11')}
          />
          <span className="min-w-0">
            <p className="text-[0.7rem] font-bold text-[var(--atlas-muted)]">{STORE_BRAND_LATIN}</p>
            <p className={cn('truncate font-extrabold', compact ? 'text-sm' : 'text-base')}>{STORE_LANDING_COPY.shopNameAr}</p>
          </span>
        </Link>
        <nav className={cn('hidden items-center gap-1 text-sm font-bold md:flex', compact && 'md:hidden')}>
          <a href="#atlas-products" className="inline-flex min-h-11 items-center px-3 text-[var(--atlas-muted)]">
            {STORE_ATLAS_COPY.headerProductsAr}
          </a>
          <a href="#atlas-journey" className="inline-flex min-h-11 items-center px-3 text-[var(--atlas-muted)]">
            {STORE_ATLAS_COPY.headerSystemAr}
          </a>
          <Link to={ROUTE_PATHS.STORE_TRUST} className="inline-flex min-h-11 items-center px-3 text-[var(--atlas-muted)]">
            {STORE_ATLAS_COPY.headerWorksAr}
          </Link>
          <Link to={ROUTE_PATHS.STORE_REQUEST} className="inline-flex min-h-11 items-center px-3 text-[var(--atlas-teal)]">
            {STORE_ATLAS_COPY.headerRequestAr}
          </Link>
        </nav>
        <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-atlas__btn store-atlas__btn--gold min-h-11 px-3 text-sm">
          {STORE_ATLAS_COPY.headerTrialAr}
        </Link>
      </div>
    </header>
  );
}
