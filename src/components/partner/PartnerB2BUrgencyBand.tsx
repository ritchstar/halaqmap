import { motion } from 'framer-motion';
import { PARTNER_B2B_URGENCY_AR } from '@/config/partnerMallNarrativeCopy';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'light' | 'dark';
  className?: string;
};

export function PartnerB2BUrgencyBand({ variant = 'light', className }: Props) {
  const isDark = variant === 'dark';

  return (
    <section
      className={cn(
        'relative z-10 py-16 md:py-20',
        isDark
          ? 'border-y border-teal-500/15 bg-teal-500/[0.04]'
          : 'border-y border-amber-100 bg-amber-50/50',
        className,
      )}
      dir="rtl"
    >
      <div className="mx-auto max-w-4xl px-5">
        <div className="mb-8 text-center">
          <span
            className={cn(
              'mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold',
              isDark
                ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                : 'border-amber-200 bg-amber-50 text-amber-700',
            )}
          >
            {PARTNER_B2B_URGENCY_AR.kicker}
          </span>
          <h2
            className={cn(
              'text-2xl font-black md:text-3xl',
              isDark ? 'text-white' : 'text-slate-900',
            )}
          >
            {PARTNER_B2B_URGENCY_AR.title}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className={cn(
            'mb-6 rounded-2xl border p-6 text-center md:p-8',
            isDark
              ? 'border-amber-400/20 bg-amber-400/[0.05]'
              : 'border-amber-200 bg-white',
          )}
        >
          <p
            className={cn(
              'text-base leading-relaxed md:text-lg',
              isDark ? 'text-slate-200' : 'text-slate-700',
            )}
          >
            {PARTNER_B2B_URGENCY_AR.lead}
          </p>
        </motion.div>

        <div className="space-y-3">
          {PARTNER_B2B_URGENCY_AR.points.map((point, index) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                'rounded-xl border px-4 py-3.5 text-sm leading-relaxed',
                isDark
                  ? 'border-teal-500/20 bg-white/[0.03] text-slate-200'
                  : 'border-slate-200 bg-white text-slate-700',
              )}
            >
              {point}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
