import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PARTNER_B2B_FEATURE_CARDS,
  PARTNER_B2B_FEATURE_EXTRAS,
  PARTNER_B2B_FEATURES_SECTION_AR,
  PARTNER_B2B_VISUAL_ASSETS,
} from '@/config/partnerMallNarrativeCopy';
import { cn } from '@/lib/utils';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Props = {
  variant?: 'light' | 'dark';
  className?: string;
};

export function PartnerB2BVisualFeatureCards({ variant = 'light', className }: Props) {
  const isDark = variant === 'dark';
  const section = useInView();

  return (
    <section
      id="مزايا-الشركاء"
      className={cn(
        'relative z-10 py-20 md:py-24',
        isDark ? 'bg-[#0A1628]' : 'bg-white',
        className,
      )}
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          ref={section.ref}
          initial="hidden"
          animate={section.visible ? 'visible' : 'hidden'}
          className="mb-12 text-center md:mb-14"
        >
          <motion.span
            variants={fadeUp}
            className={cn(
              'mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold',
              isDark
                ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                : 'border-teal-200 bg-teal-50 text-teal-700',
            )}
          >
            {PARTNER_B2B_FEATURES_SECTION_AR.kicker}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className={cn(
              'text-2xl font-black md:text-4xl',
              isDark ? 'text-white' : 'text-slate-900',
            )}
          >
            {PARTNER_B2B_FEATURES_SECTION_AR.title}{' '}
            <span className={isDark ? 'text-teal-400' : 'text-teal-600'}>
              {PARTNER_B2B_FEATURES_SECTION_AR.titleAccent}
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PARTNER_B2B_FEATURE_CARDS.map((card, index) => (
            <motion.article
              key={card.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={index}
              className={cn(
                'group overflow-hidden rounded-2xl border transition-all duration-300',
                isDark
                  ? 'border-teal-500/20 bg-white/[0.03] hover:border-teal-400/35 hover:shadow-[0_0_36px_rgba(13,148,136,0.12)]'
                  : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(148,163,184,0.12)]',
              )}
            >
              <div className="relative h-44 overflow-hidden sm:h-48">
                <img
                  src={PARTNER_B2B_VISUAL_ASSETS[card.asset]}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t to-transparent',
                    isDark ? 'from-[#0A1628] via-[#0A1628]/45' : 'from-white via-white/40',
                  )}
                />
                <span
                  className={cn(
                    'absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold',
                    isDark ? 'bg-teal-500 text-[#0A1628]' : 'bg-teal-600 text-white',
                  )}
                >
                  {card.badge}
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="mb-3 text-2xl">{card.icon}</div>
                <h3
                  className={cn(
                    'mb-3 text-lg font-bold leading-snug',
                    isDark ? 'text-white' : 'text-slate-900',
                  )}
                >
                  {card.title}
                </h3>
                <p
                  className={cn(
                    'mb-4 text-sm leading-relaxed',
                    isDark ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {card.description}
                </p>
                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold',
                    isDark
                      ? 'border-teal-400/25 bg-teal-500/10 text-teal-200'
                      : 'border-teal-200 bg-teal-50 text-teal-700',
                  )}
                >
                  ✓ {card.highlight}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {PARTNER_B2B_FEATURE_EXTRAS.map((item, index) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              custom={index}
              className={cn(
                'flex gap-4 rounded-2xl border p-5',
                isDark
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-slate-200 bg-slate-50/80',
              )}
            >
              <div className="shrink-0 text-2xl">{item.icon}</div>
              <div>
                <h4 className={cn('mb-1 font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {item.title}
                </h4>
                <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
