import type { ReactNode } from 'react';
import { staffTheme } from '@/components/admin/staff/staffTheme';
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
        boundary.covert ? staffTheme.boundaryPanelCovert : staffTheme.boundaryPanel,
        className,
      )}
      aria-labelledby={`ai-boundary-${boundary.id}`}
    >
      <header className="space-y-1 border-b border-slate-700 pb-4 text-right">
        <h3
          id={`ai-boundary-${boundary.id}`}
          className={cn(
            'text-base font-bold tracking-tight md:text-lg',
            boundary.covert ? 'text-red-200' : 'text-slate-100',
          )}
        >
          {boundary.titleAr}
        </h3>
        <p className="text-xs leading-relaxed text-slate-400 md:text-sm">{boundary.subtitleAr}</p>
      </header>
      {children}
    </section>
  );
}
