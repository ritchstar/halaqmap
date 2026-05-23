import type { LucideIcon } from 'lucide-react';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { cn } from '@/lib/utils';

type Accent = 'cyan' | 'emerald' | 'amber' | 'violet' | 'slate';

const accentMap: Record<Accent, string> = {
  cyan: 'border-cyan-600/50 bg-cyan-950/30 text-cyan-300',
  emerald: 'border-emerald-600/50 bg-emerald-950/30 text-emerald-300',
  amber: 'border-amber-600/50 bg-amber-950/30 text-amber-300',
  violet: 'border-violet-600/50 bg-violet-950/30 text-violet-300',
  slate: 'border-slate-600 bg-slate-700/50 text-slate-300',
};

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
  className?: string;
};

export function StaffMetricTile({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'slate',
  className,
}: Props) {
  return (
    <div className={cn(staffTheme.metricTile, className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5 text-right">
          <p className={staffTheme.pageEyebrow}>{title}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-white">{value}</p>
          {subtitle ? <p className={staffTheme.muted}>{subtitle}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
            accentMap[accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
