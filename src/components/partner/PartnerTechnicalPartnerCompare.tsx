/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { cn } from '@/lib/utils';
import {
  PARTNER_TECHNICAL_PARTNER_COMPARE,
  type PartnerTechnicalPartnerCompareSide,
} from '@/config/partnerTechnicalPartnerDoctrine';

type Props = {
  variant?: 'full' | 'compact';
  tone?: 'light' | 'dark';
  className?: string;
};

function CompareCard({
  side,
  variant,
  tone,
}: {
  side: PartnerTechnicalPartnerCompareSide;
  variant: 'full' | 'compact';
  tone: 'light' | 'dark';
}) {
  const isHalaqmap = side.id === 'halaqmap';
  const isDark = tone === 'dark';
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 text-right',
        isDark
          ? isHalaqmap
            ? 'border-emerald-400/25 bg-emerald-500/10 shadow-[0_18px_40px_rgba(2,9,18,0.35)]'
            : 'border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(2,9,18,0.35)]'
          : isHalaqmap
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-[0_18px_40px_rgba(148,163,184,0.08)]'
            : 'border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(148,163,184,0.08)]',
        variant === 'compact' && 'p-4',
      )}
    >
      <p className={cn('text-[0.62rem] font-bold uppercase tracking-wider', isDark ? 'text-slate-400' : 'text-slate-500')}>
        {side.label}
      </p>
      <p
        className={cn(
          'mt-1 font-mono text-[0.65rem]',
          isHalaqmap ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : isDark ? 'text-slate-400' : 'text-slate-500',
        )}
      >
        {side.eyebrow}
      </p>
      <h3 className={cn('mt-2 font-black', isDark ? 'text-white' : 'text-slate-900', variant === 'compact' ? 'text-base' : 'text-lg')}>
        {side.title}
      </h3>
      <ul className={cn('mt-3 space-y-2', variant === 'compact' ? 'text-[0.72rem]' : 'text-sm')}>
        {side.bullets.map((bullet) => (
          <li key={bullet} className={cn('leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartnerTechnicalPartnerCompare({ variant = 'full', tone = 'light', className }: Props) {
  const { sectionTitle, sectionLead, sides } = PARTNER_TECHNICAL_PARTNER_COMPARE;

  if (variant === 'compact') {
    return (
      <div className={cn('grid gap-3 md:grid-cols-2', className)}>
        {sides.map((side) => (
          <CompareCard key={side.id} side={side} variant="compact" tone={tone} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h2 className={cn('text-2xl font-black md:text-3xl', tone === 'dark' ? 'text-white' : 'text-slate-900')}>
          {sectionTitle}
        </h2>
        <p className={cn('mx-auto mt-3 max-w-2xl text-sm leading-7', tone === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
          {sectionLead}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sides.map((side) => (
          <CompareCard key={side.id} side={side} variant="full" tone={tone} />
        ))}
      </div>
    </div>
  );
}
