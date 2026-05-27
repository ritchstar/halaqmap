import { ExternalLink, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  PLATFORM_TRUST_FOOTER_AR,
  PLATFORM_TRUST_HEADLINE_AR,
  PLATFORM_TRUST_PILLARS_AR,
  type PlatformTrustPillarId,
} from '@/config/platformIdentity';
import {
  PLATFORM_TLS_SSL_LABS_GRADE,
  PLATFORM_TLS_SSL_LABS_URL,
} from '@/config/platformTlsTrust';
import { cn } from '@/lib/utils';

type Variant = 'strip' | 'compact' | 'inline';
type Tone = 'light' | 'dark';

type PlatformTrustStripProps = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  showTlsLink?: boolean;
};

const PILLAR_ICONS: Record<PlatformTrustPillarId, typeof Lock> = {
  encrypted: Lock,
  direct: Users,
  transparent: Sparkles,
};

function TrustPillars({
  tone,
  className,
}: {
  tone: Tone;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {PLATFORM_TRUST_PILLARS_AR.map((pillar) => {
        const Icon = PILLAR_ICONS[pillar.id];
        return (
          <span
            key={pillar.id}
            title={pillar.hintAr}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-semibold',
              tone === 'dark'
                ? 'border-white/12 bg-white/[0.04] text-slate-200'
                : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-900 dark:text-emerald-100',
            )}
          >
            <Icon
              className={cn(
                'h-3 w-3 shrink-0',
                tone === 'dark' ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400',
              )}
              aria-hidden
            />
            {pillar.labelAr}
          </span>
        );
      })}
    </div>
  );
}

export function PlatformTrustStrip({
  variant = 'strip',
  tone = 'light',
  className,
  showTlsLink = true,
}: PlatformTrustStripProps) {
  if (variant === 'inline') {
    return (
      <p
        className={cn(
          'text-center text-[0.62rem] leading-relaxed',
          tone === 'dark' ? 'text-slate-500' : 'text-muted-foreground',
          className,
        )}
      >
        {PLATFORM_TRUST_FOOTER_AR}
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col gap-2', className)} role="region" aria-label="ثقة المنصة التقنية">
        <TrustPillars tone={tone} />
      </div>
    );
  }

  const tlsLink = showTlsLink ? (
    <a
      href={PLATFORM_TLS_SSL_LABS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        tone === 'dark'
          ? 'text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline'
          : 'text-primary hover:text-primary/90 underline-offset-4 hover:underline',
      )}
    >
      <span>تقرير SSL Labs — {PLATFORM_TLS_SSL_LABS_GRADE}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  ) : null;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        tone === 'dark'
          ? 'border-emerald-400/20 bg-emerald-500/[0.07]'
          : 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
        className,
      )}
      role="region"
      aria-label="ثقة المنصة التقنية"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              tone === 'dark' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-500/15 text-emerald-700',
            )}
          >
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p
              className={cn(
                'text-sm font-bold leading-snug sm:text-base',
                tone === 'dark' ? 'text-emerald-50' : 'text-foreground',
              )}
            >
              {PLATFORM_TRUST_HEADLINE_AR}
            </p>
            <TrustPillars tone={tone} className="mt-3" />
          </div>
        </div>
        {tlsLink ? <div className="shrink-0 sm:pt-1">{tlsLink}</div> : null}
      </div>
    </div>
  );
}
