import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { ROUTE_PATHS } from '@/lib';
import {
  LISTING_LICENSE_LEGAL_FOOTNOTE,
  LISTING_LICENSE_PRICING_CARDS,
  type ListingLicenseCardAccent,
} from '@/config/listingLicenseCards';
import {
  ApplePayBadgeIcon,
  MadaBadgeIcon,
  VisaMastercardBadgeIcon,
} from '@/components/billing/PaymentMethodBadgeIcons';
import { cn } from '@/lib/utils';

type Variant = 'embedded-light' | 'embedded-dark' | 'standalone-dark';

const accentStyles: Record<
  ListingLicenseCardAccent,
  { ring: string; glow: string; badge: string; price: string; btn: string }
> = {
  bronze: {
    ring: 'ring-amber-500/35',
    glow: 'from-amber-500/20 via-amber-600/5 to-transparent',
    badge: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
    price: 'text-amber-100',
    btn: 'bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950',
  },
  gold: {
    ring: 'ring-yellow-400/40',
    glow: 'from-yellow-400/25 via-amber-500/10 to-transparent',
    badge: 'border-yellow-300/45 bg-yellow-500/15 text-yellow-50',
    price: 'text-yellow-50',
    btn: 'bg-gradient-to-l from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950',
  },
  diamond: {
    ring: 'ring-cyan-400/45',
    glow: 'from-cyan-400/25 via-sky-500/10 to-transparent',
    badge: 'border-cyan-300/45 bg-cyan-500/15 text-cyan-50',
    price: 'text-cyan-50',
    btn: 'bg-gradient-to-l from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatPriceSar(amount: number): string {
  return amount.toLocaleString('en-US');
}

type Props = {
  variant?: Variant;
  className?: string;
  /** إخفاء العنوان عند تضمينه داخل تذييل مزدحم */
  showHeader?: boolean;
};

export function ListingLicensePricingMatrix({
  variant = 'embedded-light',
  className,
  showHeader = true,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isDarkShell = variant !== 'embedded-light';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variant === 'embedded-light' &&
          'rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-950 via-[#071426] to-slate-900 p-6 shadow-2xl md:p-10',
        variant === 'embedded-dark' && 'py-2',
        variant === 'standalone-dark' &&
          'rounded-3xl border border-white/10 bg-gradient-to-br from-[#061223] via-[#071426] to-[#0b1522] p-6 md:p-12 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]',
        className,
      )}
      aria-labelledby="listing-license-pricing-heading"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        animate={reduceMotion ? false : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
        animate={reduceMotion ? false : { opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {showHeader ? (
          <motion.header variants={cardVariants} className="mb-8 text-center md:mb-10 md:text-right">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-200/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              متجر البرمجيات · ISIC4 474151
            </p>
            <h2
              id="listing-license-pricing-heading"
              className="text-2xl font-extrabold tracking-tight text-white md:text-3xl"
            >
              تراخيص الإدراج الرقمي الموحّدة
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:mx-0 md:text-base">
              باقات مسبقة الدفع لخدمات الإدراج البرمجية على خريطة حلاق ماب — اختر المستوى، ادفع، وفعّل الظهور فوراً.
            </p>
          </motion.header>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {LISTING_LICENSE_PRICING_CARDS.map((card) => {
            const styles = accentStyles[card.accent];
            const paymentTo = `${ROUTE_PATHS.PAYMENT}?${new URLSearchParams({ tier: card.tierQuery }).toString()}`;

            return (
              <motion.article
                key={card.tier}
                variants={cardVariants}
                whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.22 } }}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10',
                  'bg-white/[0.06] p-6 backdrop-blur-xl backdrop-saturate-150',
                  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.55)]',
                  'ring-1',
                  styles.ring,
                )}
              >
                <motion.div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
                    styles.glow,
                  )}
                />

                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-6 -top-6 opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.2]"
                >
                  <HalaqmapBrandMark className="h-28 w-28 rounded-2xl grayscale" />
                </div>

                <div className="relative z-10 flex flex-1 flex-col text-right">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm',
                        styles.badge,
                      )}
                    >
                      <span aria-hidden>{card.badge}</span>
                      {card.nameAr}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{card.validityLabel}</span>
                  </div>

                  <p className="text-sm font-medium text-slate-300">{card.subtitleAr}</p>

                  <div className="mt-5 flex items-baseline justify-end gap-2">
                    <span className="text-sm font-medium text-slate-400">ر.س</span>
                    <span className={cn('text-4xl font-black tabular-nums tracking-tight', styles.price)}>
                      {formatPriceSar(card.priceSar)}
                    </span>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-300">
                    {card.highlights.map((line) => (
                      <li key={line} className="flex items-start justify-end gap-2 leading-6">
                        <span>{line}</span>
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                      </li>
                    ))}
                  </ul>

                  <NavLink to={paymentTo} className="mt-6 block">
                    <Button
                      type="button"
                      className={cn('w-full font-bold shadow-lg transition-transform active:scale-[0.98]', styles.btn)}
                    >
                      شراء وتفعيل الترخيص
                    </Button>
                  </NavLink>

                  <div
                    className={cn(
                      'mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4 text-slate-400',
                      isDarkShell ? 'text-slate-400' : 'text-slate-400',
                    )}
                  >
                    <MadaBadgeIcon className="opacity-80" />
                    <ApplePayBadgeIcon className="opacity-80" />
                    <VisaMastercardBadgeIcon className="opacity-80" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.p
          variants={cardVariants}
          className="mt-8 text-center text-[11px] leading-relaxed text-slate-500 md:text-xs md:leading-relaxed"
        >
          {LISTING_LICENSE_LEGAL_FOOTNOTE}
        </motion.p>
      </motion.div>
    </section>
  );
}
