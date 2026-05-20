import { motion } from 'framer-motion';
import { Award, FileBadge, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  assertHonorBoardB2BContext,
  type HonorBoardContext,
} from '@/config/honorBoardBoundaries';
import {
  HONOR_BOARD_CORE_VALUES,
  HONOR_BOARD_MANIFESTO_BADGE,
  HONOR_BOARD_MANIFESTO_PARAGRAPHS,
  HONOR_BOARD_MANIFESTO_TITLE,
  HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD,
} from '@/config/honorBoardManifesto';
import { cn } from '@/lib/utils';

export type HonorBoardVariant = 'professional-commitment' | 'core-values' | 'legal';

type HonorBoardProps = {
  /** B2B routing context — enforced at runtime */
  context: HonorBoardContext;
  variant: HonorBoardVariant;
  className?: string;
};

const VARIANT_HEADINGS: Record<HonorBoardVariant, string> = {
  'professional-commitment': 'التزام مهني',
  'core-values': 'القيم الأساسية',
  legal: 'لوحة الشرف — الميثاق المؤسسي',
};

export function HonorBoard({ context, variant, className }: HonorBoardProps) {
  assertHonorBoardB2BContext(context);

  const heading = VARIANT_HEADINGS[variant];
  const isCompact = variant === 'professional-commitment';
  const isAdminFooter = variant === 'core-values';

  return (
    <section
      className={cn('text-right', className)}
      aria-labelledby={`honor-board-${variant}-title`}
      data-honor-board-context={context}
    >
      <motion.div
        initial={{ opacity: 0, y: isCompact ? 12 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'honor-board-breathe relative overflow-hidden rounded-2xl border',
          isCompact
            ? 'border-slate-600/60 bg-gradient-to-br from-slate-800/90 via-slate-900 to-slate-950 p-5 sm:p-6'
            : isAdminFooter
              ? 'border-amber-500/20 bg-gradient-to-br from-slate-900/95 via-slate-950 to-black p-6 sm:p-8 ring-1 ring-cyan-500/10'
              : 'border-emerald-600/20 bg-gradient-to-br from-emerald-500/[0.07] via-background to-amber-500/[0.05] p-6 sm:p-8 shadow-sm ring-1 ring-amber-500/10',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(13,148,136,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.08),transparent_50%)]"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge
              className={cn(
                'gap-1.5 border-0 shadow-sm',
                isAdminFooter
                  ? 'bg-gradient-to-r from-amber-700/90 to-amber-600/90 text-amber-50'
                  : 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-emerald-50',
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {HONOR_BOARD_MANIFESTO_BADGE}
            </Badge>
            {isAdminFooter ? (
              <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-100">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                B2B فقط
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <FileBadge
              className={cn(
                'h-5 w-5 shrink-0',
                isAdminFooter ? 'text-amber-400' : 'text-emerald-700 dark:text-emerald-400',
              )}
              aria-hidden
            />
            <h2
              id={`honor-board-${variant}-title`}
              className={cn(
                'font-bold leading-snug',
                isCompact ? 'text-base sm:text-lg text-slate-100' : 'text-lg sm:text-xl text-foreground',
              )}
            >
              {heading}
            </h2>
          </div>

          {isCompact ? (
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              <p className="text-pretty">{HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD}</p>
              <p className="text-pretty text-slate-400">{HONOR_BOARD_MANIFESTO_PARAGRAPHS[0]}</p>
            </div>
          ) : (
            <>
              <p className="text-sm sm:text-base font-medium text-muted-foreground">{HONOR_BOARD_MANIFESTO_TITLE}</p>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-foreground/90">
                {HONOR_BOARD_MANIFESTO_PARAGRAPHS.map((paragraph, index) => (
                  <p key={index} className="text-pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          )}

          <div
            className={cn(
              'divide-y divide-border/60 rounded-xl border backdrop-blur-sm',
              isCompact
                ? 'border-slate-600/40 bg-slate-900/50 divide-slate-700/60'
                : isAdminFooter
                  ? 'border-amber-500/15 bg-black/40 divide-amber-500/10'
                  : 'border-emerald-600/15 bg-background/70',
            )}
          >
            {HONOR_BOARD_CORE_VALUES.map((section) => (
              <div key={section.id} className="px-4 py-3 sm:px-5 sm:py-4">
                <p
                  className={cn(
                    'mb-1.5 text-xs font-semibold tracking-wide',
                    isAdminFooter
                      ? 'text-amber-300/90'
                      : isCompact
                        ? 'text-slate-400'
                        : 'text-emerald-800/80 dark:text-emerald-300/90',
                  )}
                >
                  {section.label}
                </p>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isCompact ? 'text-slate-300' : 'text-foreground/90',
                  )}
                >
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
