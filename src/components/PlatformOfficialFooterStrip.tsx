import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import {
  PLATFORM_OFFICIAL_ENTITY_ABOUT_LINK_LABEL,
  PLATFORM_OFFICIAL_FOOTER_LEGAL_LINE,
  PLATFORM_MEDIA_LICENSE_FOOTER_LINE,
} from '@/config/platformGrowthNarrative';
import {
  PLATFORM_OPERATIONAL_TRUST_FOOTER_LINK_AR,
  PLATFORM_OPERATIONAL_TRUST_FOOTER_SHORT_AR,
  PLATFORM_OPERATIONAL_TRUST_SECTION_ID,
} from '@/config/platformOperationalTrust';

type Variant = 'light' | 'dark';

/**
 * النص القانوني الرسمي + رابط «عن المؤسسة» — موحّد بين مسار المستخدم والشركاء ولوحة الحلّاق.
 */
export function PlatformOfficialFooterStrip({ variant = 'light' }: { variant?: Variant }) {
  const border =
    variant === 'dark' ? 'border-white/15 bg-white/[0.06]' : 'border-border/60 bg-muted/40';
  const titleColor = variant === 'dark' ? 'text-slate-100' : 'text-foreground';
  const linkClass =
    variant === 'dark'
      ? 'text-emerald-200 hover:text-emerald-100 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-sm'
      : 'text-primary hover:text-primary/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm';

  return (
    <div
      className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${border}`}
      role="contentinfo"
      aria-label="حقوق الملكية والمؤسسة"
    >
      <p
        className={`text-center text-sm font-semibold leading-relaxed sm:text-base ${titleColor}`}
      >
        {PLATFORM_OFFICIAL_FOOTER_LEGAL_LINE}
      </p>
      <p className={`mt-2 text-center text-sm font-bold leading-relaxed sm:text-base ${titleColor}`}>
        {PLATFORM_MEDIA_LICENSE_FOOTER_LINE}
      </p>
      <div className="mt-3 flex justify-center">
        <NavLink
          to={ROUTE_PATHS.ABOUT}
          className={`text-sm font-medium sm:text-base ${linkClass}`}
        >
          {PLATFORM_OFFICIAL_ENTITY_ABOUT_LINK_LABEL}
        </NavLink>
      </div>
      <p
        className={`mt-3 text-center text-xs leading-relaxed sm:text-sm ${
          variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
        }`}
      >
        {PLATFORM_OPERATIONAL_TRUST_FOOTER_SHORT_AR}{' '}
        <NavLink
          to={`${ROUTE_PATHS.ABOUT}#${PLATFORM_OPERATIONAL_TRUST_SECTION_ID}`}
          className={linkClass}
        >
          {PLATFORM_OPERATIONAL_TRUST_FOOTER_LINK_AR}
        </NavLink>
      </p>
    </div>
  );
}
