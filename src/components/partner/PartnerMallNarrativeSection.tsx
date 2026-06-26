import { motion } from 'framer-motion';
import { Building2, DoorOpen, MapPin, QrCode, Sparkles, Store } from 'lucide-react';
import {
  PARTNER_MALL_CLOSING_LINE_AR,
  PARTNER_MALL_PHASES,
  PARTNER_MALL_SECTION_KICKER_AR,
  PARTNER_MALL_SECTION_LEAD_AR,
  PARTNER_MALL_SECTION_TITLE_AR,
  PARTNER_MALL_WHY_NOW,
} from '@/config/partnerMallNarrativeCopy';
import { cn } from '@/lib/utils';

const PHASE_ICONS = [Building2, Store, DoorOpen] as const;
const WHY_ICONS = [MapPin, QrCode, Sparkles] as const;

type Props = {
  compact?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
};

export function PartnerMallNarrativeSection({
  compact = false,
  variant = 'light',
  className,
}: Props) {
  const isDark = variant === 'dark';

  return (
    <section
      id="المول-الرقمي"
      className={cn(
        'relative z-10 border-y py-20',
        isDark
          ? 'border-teal-500/20 bg-[#0A1628]'
          : 'border-amber-100 bg-gradient-to-b from-amber-50/70 to-white',
        className,
      )}
      dir="rtl"
    >
      <div
        className={cn(
          'pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full blur-[80px]',
          isDark ? 'bg-teal-500/10' : 'bg-amber-200/30',
        )}
      />
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              'mb-3 text-xs font-black tracking-[0.2em]',
              isDark ? 'text-teal-400' : 'text-amber-700',
            )}
          >
            {PARTNER_MALL_SECTION_KICKER_AR}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              'font-black',
              isDark ? 'text-white' : 'text-slate-900',
              compact ? 'text-2xl' : 'text-3xl md:text-4xl',
            )}
          >
            {PARTNER_MALL_SECTION_TITLE_AR}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
              'mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base',
              isDark ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {PARTNER_MALL_SECTION_LEAD_AR}
          </motion.p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {PARTNER_MALL_PHASES.map((phase, i) => {
            const Icon = PHASE_ICONS[i] ?? Building2;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative rounded-2xl border p-5',
                  isDark
                    ? 'border-teal-500/25 bg-white/[0.04]'
                    : 'border-amber-100 bg-white shadow-[0_12px_32px_rgba(245,158,11,0.08)]',
                )}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black',
                      isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-amber-100 text-amber-800',
                    )}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      isDark
                        ? 'bg-gradient-to-br from-teal-600 to-cyan-700'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600',
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3
                  className={cn(
                    'mb-2 font-bold',
                    isDark ? 'text-white' : 'text-slate-900',
                    compact ? 'text-sm' : 'text-base',
                  )}
                >
                  {phase.title}
                </h3>
                <p
                  className={cn(
                    'leading-relaxed',
                    isDark ? 'text-slate-400' : 'text-slate-600',
                    compact ? 'text-xs' : 'text-sm',
                  )}
                >
                  {phase.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'md:grid-cols-3')}>
          {PARTNER_MALL_WHY_NOW.map((item, i) => {
            const Icon = WHY_ICONS[i] ?? MapPin;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={cn(
                  'rounded-xl border p-4',
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', isDark ? 'text-teal-400' : 'text-teal-600')} />
                  <h4
                    className={cn(
                      'font-bold',
                      isDark ? 'text-teal-100' : 'text-slate-900',
                      compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {item.title}
                  </h4>
                </div>
                <p
                  className={cn(
                    'leading-relaxed',
                    isDark ? 'text-slate-400' : 'text-slate-600',
                    compact ? 'text-[0.68rem]' : 'text-xs',
                  )}
                >
                  {item.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={cn(
            'mt-10 text-center text-sm font-semibold',
            isDark ? 'text-teal-200/90' : 'text-teal-800',
          )}
        >
          {PARTNER_MALL_CLOSING_LINE_AR}
        </motion.p>
      </div>
    </section>
  );
}
