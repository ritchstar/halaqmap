import type { ReactNode } from 'react';
import type { AiStaffBoundaryDef } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

type Props = {
  boundary: AiStaffBoundaryDef;
  children: ReactNode;
  className?: string;
};

export function AiStaffBoundarySection({ boundary, children, className }: Props) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-2xl border p-5 md:p-6',
        boundary.covert
          ? 'border-red-500/25 bg-gradient-to-br from-slate-950/80 via-red-950/20 to-background'
          : 'border-border/60 bg-muted/20',
        className,
      )}
      aria-labelledby={`ai-boundary-${boundary.id}`}
    >
      <header className="space-y-1 text-right border-b border-border/40 pb-4">
        <h3
          id={`ai-boundary-${boundary.id}`}
          className={cn(
            'text-base font-extrabold tracking-tight md:text-lg',
            boundary.covert ? 'text-red-100/95' : 'text-foreground',
          )}
        >
          {boundary.titleAr}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{boundary.subtitleAr}</p>
      </header>
      {children}
    </section>
  );
}
