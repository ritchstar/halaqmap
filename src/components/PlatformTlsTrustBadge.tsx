import { ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import {
  PLATFORM_TLS_CARD_BODY_AR,
  PLATFORM_TLS_CARD_TITLE_AR,
  PLATFORM_TLS_COMPACT_LABEL_AR,
  PLATFORM_TLS_DOMAIN,
  PLATFORM_TLS_SSL_LABS_GRADE,
  PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR,
  PLATFORM_TLS_SSL_LABS_URL,
  PLATFORM_TLS_SUMMARY_AR,
} from '@/config/platformTlsTrust';
import { cn } from '@/lib/utils';

type Variant = 'compact' | 'card' | 'strip';
type Tone = 'light' | 'dark';

type PlatformTlsTrustBadgeProps = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  showLink?: boolean;
};

export function PlatformTlsTrustBadge({
  variant = 'compact',
  tone = 'light',
  className,
  showLink = true,
}: PlatformTlsTrustBadgeProps) {
  const linkClass =
    tone === 'dark'
      ? 'text-teal-300 hover:text-teal-200 underline-offset-4 hover:underline'
      : 'text-primary hover:text-primary/90 underline-offset-4 hover:underline';

  const reportLink = showLink ? (
    <a
      href={PLATFORM_TLS_SSL_LABS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1 text-sm font-medium', linkClass)}
      aria-label={`عرض تقرير SSL Labs لتقييم ${PLATFORM_TLS_SSL_LABS_GRADE} على ${PLATFORM_TLS_DOMAIN}`}
    >
      <span>عرض تقرير SSL Labs</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </a>
  ) : null;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem]',
          tone === 'dark'
            ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
            : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
          className,
        )}
        title={PLATFORM_TLS_SUMMARY_AR.replace(/`/g, '')}
      >
        <ShieldCheck
          className={cn('h-3.5 w-3.5 shrink-0', tone === 'dark' ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400')}
          aria-hidden
        />
        <span className="font-semibold">{PLATFORM_TLS_COMPACT_LABEL_AR}</span>
        {showLink && (
          <a
            href={PLATFORM_TLS_SSL_LABS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'font-bold tabular-nums',
              tone === 'dark' ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 dark:text-emerald-300',
            )}
            aria-label={`تقرير SSL Labs — ${PLATFORM_TLS_SSL_LABS_GRADE}`}
          >
            {PLATFORM_TLS_SSL_LABS_GRADE}
          </a>
        )}
      </div>
    );
  }

  if (variant === 'strip') {
    return (
      <div
        className={cn(
          'rounded-2xl border p-5 sm:p-6',
          tone === 'dark'
            ? 'border-emerald-400/20 bg-emerald-500/[0.08]'
            : 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
          className,
        )}
        role="region"
        aria-label="شهادة أمان الاتصال"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black tabular-nums',
                tone === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
                  : 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300',
              )}
              aria-hidden
            >
              {PLATFORM_TLS_SSL_LABS_GRADE}
            </div>
            <div>
              <p
                className={cn(
                  'text-base font-bold',
                  tone === 'dark' ? 'text-emerald-50' : 'text-foreground',
                )}
              >
                {PLATFORM_TLS_CARD_TITLE_AR}
              </p>
              <p
                className={cn(
                  'mt-1 text-sm leading-relaxed',
                  tone === 'dark' ? 'text-emerald-100/80' : 'text-muted-foreground',
                )}
              >
                {PLATFORM_TLS_SUMMARY_AR.replace(/`/g, '')}
              </p>
              <p
                className={cn(
                  'mt-2 text-xs',
                  tone === 'dark' ? 'text-emerald-200/60' : 'text-muted-foreground/80',
                )}
              >
                آخر فحص موثّق: {PLATFORM_TLS_SSL_LABS_REPORT_DATE_AR} · {PLATFORM_TLS_DOMAIN}
              </p>
            </div>
          </div>
          {reportLink}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        tone === 'dark'
          ? 'border-emerald-400/20 bg-emerald-500/[0.08]'
          : 'border-border bg-card',
        className,
      )}
      role="region"
      aria-label="شارة أمان الدفع والاتصال"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            tone === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10',
          )}
        >
          <ShieldCheck
            className={cn('h-5 w-5', tone === 'dark' ? 'text-emerald-300' : 'text-emerald-600')}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                'font-semibold',
                tone === 'dark' ? 'text-emerald-50' : 'text-foreground',
              )}
            >
              {PLATFORM_TLS_CARD_TITLE_AR}
            </h3>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-xs font-black tabular-nums',
                tone === 'dark'
                  ? 'bg-emerald-500/25 text-emerald-100'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
              )}
            >
              {PLATFORM_TLS_SSL_LABS_GRADE}
            </span>
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed',
              tone === 'dark' ? 'text-emerald-100/80' : 'text-muted-foreground',
            )}
          >
            {PLATFORM_TLS_CARD_BODY_AR}
          </p>
          <div
            className={cn(
              'mt-3 flex items-center gap-2 text-sm',
              tone === 'dark' ? 'text-emerald-200/70' : 'text-muted-foreground',
            )}
          >
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            <span>معلوماتك والمعاملات محمية أثناء النقل</span>
          </div>
          {reportLink && <div className="mt-3">{reportLink}</div>}
        </div>
      </div>
    </div>
  );
}
