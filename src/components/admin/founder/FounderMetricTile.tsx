import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { founderMotion, founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Accent = 'cyan' | 'gold' | 'amber' | 'violet';

const accentMap: Record<Accent, { icon: string; value: string }> = {
  cyan: {
    icon: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]',
    value: 'text-white',
  },
  gold: {
    icon: 'border-amber-400/40 bg-amber-500/10 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.22)]',
    value: 'text-white',
  },
  amber: {
    icon: 'border-amber-400/35 bg-amber-500/10 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.18)]',
    value: 'text-white',
  },
  violet: {
    icon: 'border-violet-400/35 bg-violet-500/10 text-violet-200 shadow-[0_0_14px_rgba(167,139,250,0.2)]',
    value: 'text-white',
  },
};

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
  delay?: number;
  className?: string;
  staggered?: boolean;
};

export function FounderMetricTile({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'cyan',
  delay = 0,
  className,
  staggered = false,
}: Props) {
  const tone = accentMap[accent];

  const motionProps = staggered
    ? { variants: founderMotion.staggerItem }
    : {
        initial: founderMotion.stagger.initial,
        animate: founderMotion.stagger.animate,
        transition: { ...founderMotion.stagger.transition, delay },
      };

  return (
    <motion.div {...motionProps} className={cn(founderTheme.metricTile, className)}>
      <div className={founderTheme.metricGlow} aria-hidden />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2 text-right">
          <p className={founderTheme.pageEyebrow}>{title}</p>
          <p className={cn('text-3xl font-bold tabular-nums tracking-tight', tone.value)}>{value}</p>
          {subtitle ? <p className={founderTheme.muted}>{subtitle}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-lg',
            tone.icon,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );
}
