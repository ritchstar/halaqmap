/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { IdCard } from 'lucide-react';
import {
  MAP_CONTACT_CARD_CTA_AR,
  MAP_CONTACT_CARD_CTA_HINT_AR,
} from '@/config/mapContactCardCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

/** تحت «رشح صالونك» / نتائج البحث — يفتح مصمّم بطاقة تواصل ماب */
export function MapContactCardCta({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto mt-3 max-w-lg px-1', className)} dir="rtl">
      <Link
        to={ROUTE_PATHS.MAP_CONTACT_CARD}
        className={cn(
          'group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-teal-400/40',
          'bg-teal-500/[0.08] px-4 py-3.5 transition',
          'hover:border-teal-300/60 hover:bg-teal-500/[0.14]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
          'shadow-[0_0_24px_rgba(45,212,191,0.2)]',
        )}
        aria-label={MAP_CONTACT_CARD_CTA_AR}
      >
        <span
          aria-hidden
          className={cn(
            'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            'border border-teal-300/50 bg-teal-500/25 text-teal-100',
            'shadow-[0_0_18px_rgba(45,212,191,0.45)]',
          )}
        >
          <IdCard className="h-5 w-5 text-teal-200" />
        </span>
        <span className="relative min-w-0 text-right">
          <span className="block text-sm font-black text-teal-50">{MAP_CONTACT_CARD_CTA_AR}</span>
          <span className="mt-0.5 block text-[0.7rem] font-medium text-teal-100/70">
            {MAP_CONTACT_CARD_CTA_HINT_AR}
          </span>
        </span>
      </Link>
    </div>
  );
}
