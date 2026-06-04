import { cn } from '@/lib/utils';
import {
  PARTNER_TECHNICAL_PARTNER_COMPARE,
  type PartnerTechnicalPartnerCompareSide,
} from '@/config/partnerTechnicalPartnerDoctrine';

type Props = {
  variant?: 'full' | 'compact';
  className?: string;
};

function CompareCard({ side, variant }: { side: PartnerTechnicalPartnerCompareSide; variant: 'full' | 'compact' }) {
  const isHalaqmap = side.id === 'halaqmap';
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 text-right shadow-[0_18px_40px_rgba(148,163,184,0.08)]',
        isHalaqmap
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50'
          : 'border-slate-200 bg-white/95',
        variant === 'compact' && 'p-4',
      )}
    >
      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-500">{side.label}</p>
      <p
        className={cn(
          'mt-1 font-mono text-[0.65rem]',
          isHalaqmap ? 'text-emerald-700' : 'text-slate-500',
        )}
      >
        {side.eyebrow}
      </p>
      <h3 className={cn('mt-2 font-black text-slate-900', variant === 'compact' ? 'text-base' : 'text-lg')}>
        {side.title}
      </h3>
      <ul className={cn('mt-3 space-y-2', variant === 'compact' ? 'text-[0.72rem]' : 'text-sm')}>
        {side.bullets.map((bullet) => (
          <li key={bullet} className="leading-relaxed text-slate-600">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartnerTechnicalPartnerCompare({ variant = 'full', className }: Props) {
  const { sectionTitle, sectionLead, sides } = PARTNER_TECHNICAL_PARTNER_COMPARE;

  if (variant === 'compact') {
    return (
      <div className={cn('grid gap-3 md:grid-cols-2', className)}>
        {sides.map((side) => (
          <CompareCard key={side.id} side={side} variant="compact" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-slate-900 md:text-3xl">{sectionTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{sectionLead}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sides.map((side) => (
          <CompareCard key={side.id} side={side} variant="full" />
        ))}
      </div>
    </div>
  );
}
