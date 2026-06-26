import { motion } from 'framer-motion';
import { Eye, Link2, Shield, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  OWNER_WATCH_FEATURE_DIAMOND_LINE,
  OWNER_WATCH_FEATURE_GOLD_LINE,
  OWNER_WATCH_FEATURE_TAGLINE_AR,
  OWNER_WATCH_FEATURE_TITLE_AR,
  OWNER_WATCH_TIER_INTRO_AR,
  OWNER_WATCH_UPGRADE_NUDGE_AR,
} from '@/config/ownerWatchFeatureCopy';
import { PARTNER_PRODUCT_HUB_SECTION_IDS } from '@/config/partnerProductHubCopy';
import { ROUTE_PATHS } from '@/lib/index';
import { cn } from '@/lib/utils';

const HIGHLIGHT_ICONS = [Smartphone, Eye, Shield, Link2] as const;

type Props = {
  className?: string;
  compact?: boolean;
  variant?: 'light' | 'dark';
};

export function PartnerOwnerWatchSpotlight({
  className,
  compact = false,
  variant = 'light',
}: Props) {
  const isDark = variant === 'dark';

  return (
    <section
      id="غرفة-المراقبة"
      className={cn(
        'relative z-10 border-y py-16 md:py-20',
        isDark
          ? 'border-amber-500/20 bg-[#0A1628]'
          : 'border-amber-100 bg-gradient-to-b from-amber-50/80 to-white',
        className,
      )}
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={cn(
                'mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black',
                isDark
                  ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800',
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              ميزة كبرى · ذهبي وماسي
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
              {OWNER_WATCH_FEATURE_TITLE_AR}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={cn(
                'mt-3 text-base font-bold',
                isDark ? 'text-amber-200' : 'text-amber-800',
              )}
            >
              {OWNER_WATCH_FEATURE_TAGLINE_AR}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={cn(
                'mt-4 text-sm leading-relaxed',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {OWNER_WATCH_TIER_INTRO_AR}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={cn(
                'mt-4 text-xs font-semibold',
                isDark ? 'text-teal-200/90' : 'text-teal-700',
              )}
            >
              {OWNER_WATCH_UPGRADE_NUDGE_AR}
            </motion.p>
            <Link
              to={`${ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}#${PARTNER_PRODUCT_HUB_SECTION_IDS.ownerWatch}`}
              className={cn(
                'mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition',
                isDark
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-amber-600 text-white hover:bg-amber-500',
              )}
            >
              شاهد غرفة المراقبة في المعاينة
            </Link>
          </div>

          <div className="space-y-3">
            {[OWNER_WATCH_FEATURE_GOLD_LINE, OWNER_WATCH_FEATURE_DIAMOND_LINE].map((line, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? Eye;
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'rounded-2xl border p-4',
                    isDark
                      ? 'border-amber-500/25 bg-white/[0.04]'
                      : 'border-amber-100 bg-white shadow-[0_12px_32px_rgba(245,158,11,0.08)]',
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl',
                        i === 0
                          ? isDark
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-amber-100 text-amber-800'
                          : isDark
                            ? 'bg-cyan-500/20 text-cyan-200'
                            : 'bg-cyan-100 text-cyan-800',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        'text-xs font-black',
                        isDark ? 'text-amber-100' : 'text-slate-800',
                      )}
                    >
                      {i === 0 ? 'ذهبي' : 'ماسي'}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      isDark ? 'text-slate-300' : 'text-slate-600',
                    )}
                  >
                    {line}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
