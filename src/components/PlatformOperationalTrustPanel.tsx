import { ExternalLink, ShieldCheck } from 'lucide-react';
import {
  PLATFORM_EXTERNAL_SCANS_DISCLAIMER_AR,
  PLATFORM_EXTERNAL_TRUST_SCANS,
  PLATFORM_INTERNAL_PROGRAM_BODY_AR,
  PLATFORM_INTERNAL_PROGRAM_SUMMARY_AR,
  PLATFORM_INTERNAL_PROGRAM_TITLE_AR,
  PLATFORM_OPERATIONAL_TRUST_CLOSING_AR,
  PLATFORM_OPERATIONAL_TRUST_INTRO_AR,
  PLATFORM_OPERATIONAL_TRUST_SECTION_ID,
  PLATFORM_OPERATIONAL_TRUST_TITLE_AR,
} from '@/config/platformOperationalTrust';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';
import { cn } from '@/lib/utils';

type Variant = 'full' | 'compact';
type Tone = 'light' | 'dark';

type PlatformOperationalTrustPanelProps = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  showTlsStrip?: boolean;
};

export function PlatformOperationalTrustPanel({
  variant = 'full',
  tone = 'light',
  className,
  showTlsStrip = true,
}: PlatformOperationalTrustPanelProps) {
  const linkClass =
    tone === 'dark'
      ? 'text-teal-300 hover:text-teal-200 underline-offset-4 hover:underline'
      : 'text-primary hover:text-primary/90 underline-offset-4 hover:underline';

  const mutedClass = tone === 'dark' ? 'text-slate-300/80' : 'text-muted-foreground';
  const titleClass = tone === 'dark' ? 'text-emerald-50' : 'text-foreground';
  const cardBorder =
    tone === 'dark' ? 'border-white/12 bg-white/[0.04]' : 'border-border bg-card/80';

  if (variant === 'compact') {
    return (
      <div
        className={cn('rounded-xl border p-4 text-sm leading-relaxed', cardBorder, className)}
        role="region"
        aria-label={PLATFORM_OPERATIONAL_TRUST_TITLE_AR}
      >
        <p className={cn('font-semibold', titleClass)}>{PLATFORM_OPERATIONAL_TRUST_TITLE_AR}</p>
        <p className={cn('mt-2', mutedClass)}>{PLATFORM_OPERATIONAL_TRUST_INTRO_AR.replace(/\*\*/g, '')}</p>
        <ul className={cn('mt-3 space-y-2', mutedClass)}>
          {PLATFORM_EXTERNAL_TRUST_SCANS.map((scan) => (
            <li key={scan.id}>
              <a
                href={scan.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('inline-flex items-center gap-1 font-medium', linkClass)}
              >
                <span>{scan.labelAr}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
              <span className="mx-1">—</span>
              <span>{scan.summaryAr.replace(/`/g, '')}</span>
            </li>
          ))}
        </ul>
        <p className={cn('mt-3 text-xs', mutedClass)}>{PLATFORM_EXTERNAL_SCANS_DISCLAIMER_AR}</p>
        <p className={cn('mt-3 text-xs font-medium', titleClass)}>
          {PLATFORM_INTERNAL_PROGRAM_SUMMARY_AR}
        </p>
      </div>
    );
  }

  return (
    <section
      id={PLATFORM_OPERATIONAL_TRUST_SECTION_ID}
      className={cn('scroll-mt-24 space-y-6', className)}
      aria-labelledby="operational-trust-heading"
    >
      <div className="text-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold mb-4',
            tone === 'dark'
              ? 'bg-emerald-500/15 text-emerald-200'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
          )}
        >
          <ShieldCheck className="h-5 w-5" aria-hidden />
          <span>الثقة التشغيلية</span>
        </div>
        <h2 id="operational-trust-heading" className={cn('text-3xl font-bold', titleClass)}>
          {PLATFORM_OPERATIONAL_TRUST_TITLE_AR}
        </h2>
        <p className={cn('mt-4 max-w-2xl mx-auto text-base leading-relaxed', mutedClass)}>
          {PLATFORM_OPERATIONAL_TRUST_INTRO_AR.replace(/\*\*/g, '')}
        </p>
      </div>

      {showTlsStrip ? <PlatformTlsTrustBadge variant="strip" tone={tone} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLATFORM_EXTERNAL_TRUST_SCANS.map((scan) => (
          <article
            key={scan.id}
            className={cn('rounded-2xl border p-5', cardBorder)}
          >
            <h3 className={cn('text-base font-bold', titleClass)}>{scan.labelAr}</h3>
            <p className={cn('mt-2 text-sm leading-relaxed', mutedClass)}>
              {scan.summaryAr.replace(/`/g, '')}
            </p>
            <p className={cn('mt-3 text-xs', mutedClass)}>آخر فحص موثّق: {scan.reportDateAr}</p>
            <a
              href={scan.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('mt-4 inline-flex items-center gap-1 text-sm font-medium', linkClass)}
            >
              <span>عرض التقرير</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </article>
        ))}
      </div>

      <p className={cn('text-sm leading-relaxed text-center max-w-3xl mx-auto', mutedClass)}>
        {PLATFORM_EXTERNAL_SCANS_DISCLAIMER_AR}
      </p>

      <div
        className={cn(
          'rounded-2xl border p-6 sm:p-8',
          tone === 'dark'
            ? 'border-emerald-400/20 bg-emerald-500/[0.08]'
            : 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-teal-500/5',
        )}
      >
        <h3 className={cn('text-lg font-bold', titleClass)}>{PLATFORM_INTERNAL_PROGRAM_TITLE_AR}</h3>
        <p className={cn('mt-3 text-sm sm:text-base leading-relaxed', mutedClass)}>
          {PLATFORM_INTERNAL_PROGRAM_BODY_AR.replace(/\*\*/g, '')}
        </p>
      </div>

      <p className={cn('text-center text-sm font-medium', mutedClass)}>
        {PLATFORM_OPERATIONAL_TRUST_CLOSING_AR}
      </p>
    </section>
  );
}
