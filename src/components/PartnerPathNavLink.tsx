import { Link } from 'react-router-dom';
import { ArrowUpLeft, Building2 } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { cn } from '@/lib/utils';

type PartnerPathNavLinkProps = {
  variant?: 'header' | 'headerCompact' | 'footer';
  className?: string;
};

const PARTNER_PATH_ARIA = 'مسار الشركاء — تسجيل الصالونات';
const PARTNER_REGISTER_CTA_AR = 'سجّل ' + '\u0635\u0627\u0644\u0648\u0646\u0643';

export function PartnerPathNavLink({ variant = 'header', className }: PartnerPathNavLinkProps) {
  if (variant === 'footer') {
    return (
      <Link
        to={ROUTE_PATHS.BARBERS_LANDING}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-[0.72rem] font-bold text-amber-200 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-100',
          className,
        )}
        aria-label={PARTNER_PATH_ARIA}
      >
        <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{`مسار الشركاء · ${PARTNER_REGISTER_CTA_AR}`}</span>
        <ArrowUpLeft className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      </Link>
    );
  }

  if (variant === 'headerCompact') {
    return (
      <Link
        to={ROUTE_PATHS.BARBERS_LANDING}
        className={cn(
          'group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl border border-amber-400/35 bg-gradient-to-l from-amber-500/14 to-amber-600/8 px-2.5 py-2 shadow-[0_0_14px_rgba(245,158,11,0.12)] transition-all active:scale-[0.98] hover:border-amber-400/55 hover:bg-amber-500/18',
          className,
        )}
        aria-label={PARTNER_PATH_ARIA}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/12">
          <Building2 className="h-4 w-4 text-amber-300" aria-hidden />
        </span>
        <span className="hidden min-[380px]:flex flex-col leading-tight">
          <span className="text-[0.72rem] font-black text-amber-50">مسار الشركاء</span>
          <span className="text-[0.58rem] font-semibold text-amber-200/80">{PARTNER_REGISTER_CTA_AR}</span>
        </span>
        <span className="min-[380px]:hidden text-[0.72rem] font-black text-amber-50">شركاء</span>
      </Link>
    );
  }

  return (
    <Link
      to={ROUTE_PATHS.BARBERS_LANDING}
      className={cn(
        'group inline-flex h-10 items-center gap-2.5 rounded-xl border border-amber-400/35 bg-gradient-to-l from-amber-500/14 to-amber-600/8 px-3.5 shadow-[0_0_16px_rgba(245,158,11,0.12)] transition-all hover:border-amber-400/55 hover:bg-amber-500/18 hover:shadow-[0_0_22px_rgba(245,158,11,0.20)]',
        className,
      )}
      title="مسار الشركاء — تسجيل الصالونات ورخصة النفاذ الرقمية"
      aria-label={PARTNER_PATH_ARIA}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/12">
        <Building2 className="h-4 w-4 text-amber-300" aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[0.86rem] font-black text-amber-50">مسار الشركاء</span>
        <span className="mt-0.5 text-[0.62rem] font-semibold text-amber-200/85">{PARTNER_REGISTER_CTA_AR}</span>
      </span>
    </Link>
  );
}
