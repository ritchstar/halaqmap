import {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_LABEL_AR,
  LICENSED_ACTIVITY_IN_SCOPE_AR,
  LICENSED_ACTIVITY_OUT_OF_SCOPE_AR,
  LICENSED_ACTIVITY_SCOPE_PARAGRAPH_AR,
  LICENSED_ACTIVITY_SCOPE_TITLE_AR,
  ISIC_MOC_ACTIVITY_NAME_AR,
  ISIC_MOC_MAIN_SECTOR_AR,
  ISIC_MOC_SUB_SECTOR_AR,
} from '@/config/legalActivityScope';
import { LEGAL_NATIONAL_UNIFIED_NUMBER, LEGAL_UNIFIED_NUMBER_LABEL_AR } from '@/config/partnerLegal';
import { cn } from '@/lib/utils';
import { CheckCircle2, Scale, XCircle } from 'lucide-react';

type Props = {
  className?: string;
  compact?: boolean;
};

export function LicensedActivityScopeCard({ className, compact = false }: Props) {
  return (
    <div
      dir="rtl"
      className={cn(
        'overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/8 to-[#020912]',
        'shadow-[0_0_24px_rgba(245,158,11,0.06)] ring-1 ring-amber-400/10',
        className,
      )}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="px-5 py-5">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1">
          <Scale className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-[0.65rem] font-black tracking-wide text-amber-200">
            {ISIC_ACTIVITY_CODE_LABEL_AR}: {ISIC_ACTIVITY_CODE}
          </span>
        </div>
        <h2 className="text-xl font-black text-white md:text-2xl">{LICENSED_ACTIVITY_SCOPE_TITLE_AR}</h2>
        <p className="mt-1 text-xs font-semibold text-amber-200/80">{ISIC_ACTIVITY_LABEL_AR}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{LICENSED_ACTIVITY_SCOPE_PARAGRAPH_AR}</p>
        {!compact && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400 space-y-1.5">
            <p>
              <span className="font-semibold text-slate-300">{LEGAL_UNIFIED_NUMBER_LABEL_AR}:</span>{' '}
              <span dir="ltr" className="font-mono text-slate-200">
                {LEGAL_NATIONAL_UNIFIED_NUMBER}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-300">وزارة التجارة · ISIC4 {ISIC_ACTIVITY_CODE}:</span>{' '}
              {ISIC_MOC_ACTIVITY_NAME_AR}
            </p>
            <p>القطاع الرئيسي: {ISIC_MOC_MAIN_SECTOR_AR}</p>
            <p>القطاع الفرعي: {ISIC_MOC_SUB_SECTOR_AR}</p>
          </div>
        )}

        {!compact && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                ضمن النطاق
              </h3>
              <ul className="space-y-2">
                {LICENSED_ACTIVITY_IN_SCOPE_AR.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[0.78rem] leading-snug text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/6 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-rose-300">
                <XCircle className="h-4 w-4" />
                خارج النطاق
              </h3>
              <ul className="space-y-2">
                {LICENSED_ACTIVITY_OUT_OF_SCOPE_AR.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[0.78rem] leading-snug text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
    </div>
  );
}
