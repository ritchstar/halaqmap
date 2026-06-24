import { motion } from 'framer-motion';
import { DoorOpen, Eye, Phone, SlidersHorizontal } from 'lucide-react';
import {
  PARTNER_FREEDOM_PILLARS,
  PARTNER_FREEDOM_SECTION_KICKER_AR,
  PARTNER_FREEDOM_SECTION_LEAD_AR,
  PARTNER_FREEDOM_SECTION_TITLE_AR,
} from '@/config/partnerFreedomNarrativeCopy';
import { cn } from '@/lib/utils';

const ICONS = [Eye, Phone, SlidersHorizontal, DoorOpen] as const;

type Props = {
  compact?: boolean;
  className?: string;
};

export function PartnerFreedomPillars({ compact = false, className }: Props) {
  return (
    <section
      id="حرية-التشغيل"
      className={cn('relative z-10 border-y border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white py-20', className)}
      dir="rtl"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-teal-200/20 blur-[80px]" />
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 text-xs font-black tracking-[0.2em] text-emerald-700"
          >
            {PARTNER_FREEDOM_SECTION_KICKER_AR}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn('font-black text-slate-900', compact ? 'text-2xl' : 'text-3xl md:text-4xl')}
          >
            {PARTNER_FREEDOM_SECTION_TITLE_AR}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base"
          >
            {PARTNER_FREEDOM_SECTION_LEAD_AR}
          </motion.p>
        </div>

        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4')}>
          {PARTNER_FREEDOM_PILLARS.map((pillar, i) => {
            const Icon = ICONS[i] ?? Eye;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_12px_32px_rgba(16,185,129,0.08)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className={cn('mb-2 font-bold text-slate-900', compact ? 'text-sm' : 'text-base')}>
                  {pillar.title}
                </h3>
                <p className={cn('leading-relaxed text-slate-600', compact ? 'text-xs' : 'text-sm')}>
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
