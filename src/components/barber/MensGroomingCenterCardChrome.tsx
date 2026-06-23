import { MensGroomingCenterIcon } from '@/components/icons/MensGroomingCenterIcon';
import {
  MENS_GROOMING_CENTER_BANNER_TAGLINE_AR,
  MENS_GROOMING_CENTER_FILTER_LABEL_AR,
} from '@/lib/mensGroomingCenterDisplay';
import { cn } from '@/lib/utils';

type BannerLinesProps = {
  lines: string[];
  compact?: boolean;
};

export function MensGroomingCenterHeroChrome() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-500/15 to-transparent" />
      <div className="absolute bottom-10 left-3 h-16 w-16 rounded-full bg-amber-400/10 blur-2xl" />
      <div className="absolute top-12 right-4 h-12 w-12 rounded-full bg-amber-300/10 blur-xl" />
    </div>
  );
}

type BadgeProps = { size?: 'sm' | 'md'; className?: string };

export function MensGroomingCenterBadge({ size = 'sm', className }: BadgeProps) {
  const sizing = size === 'md' ? 'px-3 py-1.5 text-xs gap-2' : 'px-2.5 py-1 text-[10px] gap-1.5';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-amber-300/50 bg-amber-500/20 font-bold text-amber-50 backdrop-blur-sm',
        sizing,
        className,
      )}
    >
      <MensGroomingCenterIcon
        className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}
        title={MENS_GROOMING_CENTER_FILTER_LABEL_AR}
      />
      {MENS_GROOMING_CENTER_FILTER_LABEL_AR}
    </span>
  );
}

export function MensGroomingCenterHeroBanner({ lines, compact }: BannerLinesProps) {
  const displayLines = lines.filter(Boolean).slice(0, 4);
  return (
    <div
      className={cn(
        'absolute top-0 inset-x-0 z-10 border-b border-amber-300/30 bg-gradient-to-l from-amber-900/90 via-amber-800/85 to-amber-900/90 text-amber-50 backdrop-blur-sm',
        compact ? 'px-2 py-1.5' : 'px-3 py-2',
      )}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <MensGroomingCenterIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          <span className={cn('font-bold leading-none', compact ? 'text-[10px]' : 'text-xs')}>
            {MENS_GROOMING_CENTER_FILTER_LABEL_AR}
          </span>
        </div>
        {displayLines.length > 0 ? (
          <p
            className={cn(
              'max-w-full truncate font-medium text-amber-100/95',
              compact ? 'text-[9px]' : 'text-[10px]',
            )}
          >
            {displayLines.join(' · ')}
          </p>
        ) : (
          <p className={cn('text-amber-100/80', compact ? 'text-[9px]' : 'text-[10px]')}>
            {MENS_GROOMING_CENTER_BANNER_TAGLINE_AR}
          </p>
        )}
      </div>
    </div>
  );
}

export function MensGroomingCenterDetailBanner({ lines }: { lines: string[] }) {
  const displayLines = lines.filter(Boolean);
  return (
    <div className="rounded-xl border border-amber-400/35 bg-gradient-to-l from-amber-500/12 via-amber-900/5 to-transparent p-4">
      <div className="flex items-start gap-3">
        <MensGroomingCenterIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{MENS_GROOMING_CENTER_FILTER_LABEL_AR}</p>
          <p className="mt-1 text-sm text-muted-foreground">{MENS_GROOMING_CENTER_BANNER_TAGLINE_AR}</p>
          {displayLines.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {displayLines.map((line) => (
                <li
                  key={line}
                  className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
