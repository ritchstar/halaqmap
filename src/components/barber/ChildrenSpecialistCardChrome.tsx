import { ChildrenSpecialistIcon } from '@/components/icons/ChildrenSpecialistIcon';
import {
  CHILDREN_SPECIALIST_BANNER_TAGLINE_AR,
  CHILDREN_SPECIALIST_FILTER_LABEL_AR,
} from '@/lib/childrenSpecialistDisplay';
import { cn } from '@/lib/utils';

/** زخرفة SVG فوق صورة بطاقة متخصص الأطفال. */
export function ChildrenSpecialistHeroChrome() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <svg className="absolute top-8 left-3 h-8 w-8 text-sky-200/50" viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="6" opacity="0.35" />
        <circle cx="8" cy="10" r="3" opacity="0.25" />
        <circle cx="24" cy="22" r="4" opacity="0.2" />
      </svg>
      <svg className="absolute bottom-14 right-4 h-10 w-10 text-cyan-200/40" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 6l2.5 7.5H30l-6 4.5 2.5 7.5L20 21l-6.5 4.5 2.5-7.5-6-4.5h7.5L20 6z"
          fill="currentColor"
          opacity="0.35"
        />
      </svg>
      <svg className="absolute top-16 right-8 h-6 w-6 text-sky-100/45" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="3" opacity="0.5" />
        <circle cx="14" cy="8" r="2" opacity="0.35" />
        <circle cx="18" cy="14" r="2.5" opacity="0.4" />
      </svg>
    </div>
  );
}

type BadgeProps = {
  size?: 'sm' | 'md';
  className?: string;
};

export function ChildrenSpecialistBadge({ size = 'sm', className }: BadgeProps) {
  const sizing =
    size === 'md'
      ? 'px-3 py-1.5 text-xs gap-2'
      : 'px-2.5 py-1 text-[10px] gap-1.5';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-sky-300/50 bg-sky-500/20 font-bold text-sky-50 backdrop-blur-sm',
        sizing,
        className,
      )}
    >
      <ChildrenSpecialistIcon className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} title="متخصص أطفال" />
      {CHILDREN_SPECIALIST_FILTER_LABEL_AR}
    </span>
  );
}

/** شريط بنر أعلى صورة البطاقة. */
export function ChildrenSpecialistHeroBanner({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'absolute top-0 inset-x-0 z-10 flex items-center justify-center gap-2 border-b border-sky-300/30 bg-gradient-to-l from-sky-600/85 via-cyan-500/80 to-sky-500/85 text-white backdrop-blur-sm',
        compact ? 'px-2 py-1.5' : 'px-3 py-2',
      )}
    >
      <ChildrenSpecialistIcon className={compact ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'} />
      <span className={cn('font-bold leading-none', compact ? 'text-[10px]' : 'text-xs')}>
        {CHILDREN_SPECIALIST_FILTER_LABEL_AR}
      </span>
      {!compact ? (
        <span className="hidden sm:inline text-[10px] font-normal opacity-90">
          · {CHILDREN_SPECIALIST_BANNER_TAGLINE_AR}
        </span>
      ) : null}
    </div>
  );
}

/** بنر تفصيلي في نافذة الصالون. */
export function ChildrenSpecialistDetailBanner() {
  return (
    <div className="barber-contact-inner relative overflow-hidden rounded-xl border border-sky-400/35 bg-gradient-to-br from-sky-500/15 via-cyan-500/10 to-card p-4">
      <ChildrenSpecialistHeroChrome />
      <div className="relative z-[1] flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/20 text-sky-100">
          <ChildrenSpecialistIcon className="h-7 w-7" title="متخصص أطفال" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-base font-bold leading-snug break-words text-sky-900 dark:text-sky-50">
            {CHILDREN_SPECIALIST_FILTER_LABEL_AR}
          </p>
          <p className="text-sm leading-relaxed break-words text-muted-foreground">
            {CHILDREN_SPECIALIST_BANNER_TAGLINE_AR} — صالون يركّز على حلاقة الأطفال ببيئة مناسبة للعائلات.
          </p>
        </div>
      </div>
    </div>
  );
}
