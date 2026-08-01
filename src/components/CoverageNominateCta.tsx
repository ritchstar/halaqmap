/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { MapPinned } from 'lucide-react';
import {
  COVERAGE_NOMINATE_CTA_AR,
  COVERAGE_NOMINATE_CTA_HINT_AR,
} from '@/config/coverageSalonNominateCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

/** أيقونة فيروزية مشعّة أسفل صالون الماس التعليمي — ترشيح تغطية المنطقة. */
export function CoverageNominateCta({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto mt-5 max-w-lg px-1', className)} dir="rtl">
      <Link
        to={ROUTE_PATHS.COVERAGE_SALON_NOMINATE}
        className={cn(
          'group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-400/40',
          'bg-cyan-500/[0.08] px-4 py-3.5 transition',
          'hover:border-cyan-300/60 hover:bg-cyan-500/[0.14]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
          'shadow-[0_0_24px_rgba(34,211,238,0.22)]',
        )}
        aria-label={COVERAGE_NOMINATE_CTA_AR}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-l from-transparent via-cyan-400/10 to-transparent"
        />
        <span
          aria-hidden
          className={cn(
            'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            'border border-cyan-300/50 bg-cyan-500/25 text-cyan-100',
            'shadow-[0_0_18px_rgba(34,211,238,0.55)]',
          )}
        >
          <MapPinned className="h-5 w-5 text-cyan-200" />
        </span>
        <span className="relative min-w-0 text-right">
          <span className="block text-sm font-black text-cyan-50">{COVERAGE_NOMINATE_CTA_AR}</span>
          <span className="mt-0.5 block text-[0.7rem] font-medium text-cyan-100/70">
            {COVERAGE_NOMINATE_CTA_HINT_AR}
          </span>
        </span>
      </Link>
    </div>
  );
}
