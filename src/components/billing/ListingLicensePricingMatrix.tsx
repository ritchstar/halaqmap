import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Check, Gem, Minus, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import {
  DIAMOND_PRODUCT_SMART_HINT_AR,
  DIAMOND_PRODUCT_SMART_LABEL_AR,
  DIAMOND_PRODUCT_STANDARD_HINT_AR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import {
  LISTING_LICENSE_LEGAL_FOOTNOTE,
  LISTING_LICENSE_PRICING_CARDS,
  type ListingLicenseCardAccent,
} from '@/config/listingLicenseCards';
import {
  clampListingLicenseQuantity,
  computeListingLicenseTotalSar,
  computeListingLicenseUnitSar,
  formatListingLicenseQuantitySummaryAr,
  isDigitalShiftAddonAllowed,
  listingLicenseCtaLabelAr,
  LISTING_LICENSE_MAX_QUANTITY,
  LISTING_LICENSE_MIN_QUANTITY,
} from '@/config/listingLicenseQuantity';
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

function initialQuantities(): Record<SubscriptionTier, number> {
  return {
    [SubscriptionTier.BRONZE]: 1,
    [SubscriptionTier.GOLD]: 1,
    [SubscriptionTier.DIAMOND]: 1,
  };
}

type DiamondProductChoice = 'standard' | 'smart';

function DiamondProductSegment({
  value,
  onChange,
  reduceMotion,
}: {
  value: DiamondProductChoice;
  onChange: (next: DiamondProductChoice) => void;
  reduceMotion: boolean | null;
}) {
  const options: { id: DiamondProductChoice; label: string; hint: string }[] = [
    { id: 'standard', label: DIAMOND_PRODUCT_STANDARD_LABEL_AR, hint: DIAMOND_PRODUCT_STANDARD_HINT_AR },
    { id: 'smart', label: DIAMOND_PRODUCT_SMART_LABEL_AR, hint: DIAMOND_PRODUCT_SMART_HINT_AR },
  ];

  return (
    <motion.div
      className="mt-4 rounded-2xl border border-cyan-400/30 bg-slate-950/50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
      role="tablist"
      aria-label="اختيار نوع الباقة الماسية"
      initial={false}
      animate={{
        boxShadow:
          value === 'smart'
            ? '0 0 28px -8px rgba(34,211,238,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      transition={{ duration: 0.28 }}
    >
      <motion.div className="relative grid grid-cols-2 gap-1">
        {!reduceMotion ? (
          <motion.div
            layoutId="diamond-product-segment-indicator"
            className="pointer-events-none absolute inset-y-0 rounded-xl bg-gradient-to-l from-cyan-500/90 to-sky-400/85 shadow-[0_4px_20px_-4px_rgba(34,211,238,0.55)]"
            style={{
              width: 'calc(50% - 2px)',
              ...(value === 'standard'
                ? { right: 2, left: 'auto' }
                : { left: 2, right: 'auto' }),
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        ) : null}
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.id)}
              className={cn(
                'relative z-[1] flex min-h-[4.25rem] flex-col items-end justify-center gap-0.5 rounded-xl px-3 py-2.5 text-right transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                active ? 'text-slate-950' : 'text-cyan-50/90 hover:text-white',
              )}
            >
              <span className="text-sm font-extrabold leading-tight">{opt.label}</span>
              <span
                className={cn(
                  'text-[10px] font-medium leading-snug',
                  active ? 'text-slate-900/75' : 'text-cyan-200/65',
                )}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

type Props = {
  variant?: Variant;
  className?: string;
  showHeader?: boolean;
};

export function ListingLicensePricingMatrix({
  variant = 'embedded-light',
  className,
  showHeader = true,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isDarkShell = variant !== 'embedded-light';
  const [quantities, setQuantities] = useState(initialQuantities);
  /** منتج الماسية — قياسية (200) أو ذكية مع المناوب (225) */
  const [diamondProductChoice, setDiamondProductChoice] = useState<DiamondProductChoice>('standard');
  const isAiAddonSelected = diamondProductChoice === 'smart';

  const setQty = (tier: SubscriptionTier, next: number) => {
    setQuantities((prev) => ({
      ...prev,
      [tier]: clampListingLicenseQuantity(next),
    }));
  };

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
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl lg:block"
        animate={reduceMotion ? false : { opacity: [0.2, 0.38, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
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
              الحزم البرمجية لخدمات الإدراج الرقمي الموحّدة
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:mx-0 md:text-base">
              اختر المستوى وعدد البطاقات (كل بطاقة = 30 يوم إدراج). ادفع المجموع وفعّل الظهور فوراً.
            </p>
          </motion.header>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3 lg:items-center lg:gap-6">
          {LISTING_LICENSE_PRICING_CARDS.map((card) => {
            const isDiamond = card.accent === 'diamond';
            const styles = accentStyles[card.accent];
            const qty = quantities[card.tier];
            const diamondAddonActive = isDigitalShiftAddonAllowed(
              card.tier,
              isDiamond && isAiAddonSelected,
            );
            const pricingOptions = diamondAddonActive ? { digitalShiftAddon: true } : undefined;
            const unitSar = computeListingLicenseUnitSar(card.tier, pricingOptions);
            const totalSar = computeListingLicenseTotalSar(card.tier, qty, pricingOptions);
            const summaryAr = formatListingLicenseQuantitySummaryAr(qty);
            const ctaLabel = listingLicenseCtaLabelAr(qty, totalSar);
            const paymentParams = new URLSearchParams({
              tier: card.tierQuery,
              qty: String(qty),
            });
            if (diamondAddonActive) paymentParams.set('aiAddon', '1');
            const paymentTo = `${ROUTE_PATHS.PAYMENT}?${paymentParams.toString()}`;

            return (
              <motion.div
                key={card.tier}
                variants={cardVariants}
                className={cn('relative flex flex-col', isDiamond && 'z-20 lg:scale-[1.06]')}
              >
                {isDiamond ? <motion.div aria-hidden className="diamond-pricing-aura" /> : null}

                <motion.article
                  whileHover={
                    reduceMotion ? undefined : { y: isDiamond ? -8 : -6, transition: { duration: 0.22 } }
                  }
                  className={cn(
                    'group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10',
                    'bg-white/[0.06] backdrop-blur-xl backdrop-saturate-150',
                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.55)]',
                    'ring-1',
                    styles.ring,
                    isDiamond ? 'diamond-card-shell p-7 pt-9' : 'p-6',
                  )}
                >
                <motion.div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
                    styles.glow,
                    isDiamond && 'from-cyan-400/30 via-slate-400/10 to-indigo-950/30',
                  )}
                />

                {isDiamond && card.premiumRibbonAr ? (
                  <span className="diamond-premium-badge">
                    <Gem className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                    {card.premiumRibbonAr}
                  </span>
                ) : null}

                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute -end-6 -top-6 transition-opacity duration-300 group-hover:opacity-[0.22]',
                    isDiamond ? 'opacity-[0.18]' : 'opacity-[0.12]',
                  )}
                >
                  <HalaqmapBrandMark
                    className={cn('h-28 w-28 rounded-2xl', !isDiamond && 'grayscale')}
                  />
                </div>

                <div className="relative z-10 flex flex-1 flex-col text-right">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    {isDiamond ? (
                      <span className="diamond-sheen-wrap border border-cyan-300/40 bg-slate-900/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                        <span className="diamond-metallic-title relative z-[1] inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-extrabold">
                          <span aria-hidden>{card.badge}</span>
                          {card.title}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm',
                          styles.badge,
                        )}
                      >
                        <span aria-hidden>{card.badge}</span>
                        {card.title}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-[11px] font-medium',
                        isDiamond ? 'text-cyan-200/80' : 'text-slate-400',
                      )}
                    >
                      {card.validityLabel}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-sm font-medium',
                      isDiamond ? 'text-cyan-100/90' : 'text-slate-300',
                    )}
                  >
                    {card.subtitleAr}
                  </p>

                  {card.digitalShiftAddonAvailable ? (
                    <DiamondProductSegment
                      value={diamondProductChoice}
                      onChange={setDiamondProductChoice}
                      reduceMotion={reduceMotion}
                    />
                  ) : null}

                  <div className="mt-5 flex items-baseline justify-end gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isDiamond ? 'text-slate-300' : 'text-slate-400',
                      )}
                    >
                      ر.س
                    </span>
                    {isDiamond ? (
                      <span className="diamond-metallic-price tabular-nums">
                        {formatPriceSar(qty === 1 ? unitSar : totalSar)}
                      </span>
                    ) : (
                      <span className={cn('text-4xl font-black tabular-nums tracking-tight', styles.price)}>
                        {formatPriceSar(totalSar)}
                      </span>
                    )}
                  </div>
                  {isDiamond ? (
                    <p className="mt-1 text-end text-xs text-cyan-200/70">
                      {diamondAddonActive
                        ? `الماسية الذكية · ${formatPriceSar(unitSar)} ر.س/بطاقة`
                        : `الماسية القياسية · ${formatPriceSar(TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND])} ر.س/بطاقة`}
                    </p>
                  ) : null}
                  {qty > 1 ? (
                    <p className="mt-0.5 text-end text-xs text-slate-500">
                      المجموع: {formatPriceSar(totalSar)} ر.س ({formatPriceSar(unitSar)} × {qty}{' '}
                      {card.packageUnitLabelAr})
                    </p>
                  ) : (
                    <p className="mt-0.5 text-end text-xs text-slate-500">
                      {formatPriceSar(unitSar)} ر.س / {card.packageUnitLabelAr}
                    </p>
                  )}

                  <div
                    className={cn(
                      'mt-4 rounded-xl border bg-black/20 p-3',
                      isDiamond
                        ? 'border-cyan-400/25 bg-cyan-950/20'
                        : 'border-white/10',
                    )}
                    aria-label="اختيار عدد البطاقات"
                  >
                    <p className="mb-2 text-xs font-semibold text-slate-300">عدد البطاقات (حزم برمجية)</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-200 hover:bg-white/10"
                          disabled={qty <= LISTING_LICENSE_MIN_QUANTITY}
                          onClick={() => setQty(card.tier, qty - 1)}
                          aria-label="تقليل العدد"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2.5rem] text-center text-lg font-bold tabular-nums text-white">
                          {qty}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-200 hover:bg-white/10"
                          disabled={qty >= LISTING_LICENSE_MAX_QUANTITY}
                          onClick={() => setQty(card.tier, qty + 1)}
                          aria-label="زيادة العدد"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-200/90">{summaryAr}</p>
                  </div>

                  <ul
                    className={cn(
                      'mt-5 flex-1 space-y-3 text-sm',
                      isDiamond ? 'text-slate-200' : 'text-slate-300',
                    )}
                  >
                    {card.highlights.map((line) => (
                      <li key={line} className="flex items-start justify-end gap-2.5 leading-relaxed">
                        <span className={isDiamond ? 'text-[13px]' : undefined}>{line}</span>
                        {isDiamond ? (
                          <Gem className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" aria-hidden />
                        ) : (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                        )}
                      </li>
                    ))}
                  </ul>

                  <NavLink to={paymentTo} className="mt-6 block">
                    <Button
                      type="button"
                      className={cn(
                        'h-auto min-h-11 whitespace-normal py-2.5 text-sm font-bold shadow-lg transition-transform active:scale-[0.98]',
                        isDiamond ? 'diamond-cta w-full' : styles.btn,
                      )}
                    >
                      {ctaLabel}
                    </Button>
                  </NavLink>

                  <div
                    className={cn(
                      'mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4',
                      isDarkShell ? 'text-slate-400' : 'text-slate-400',
                    )}
                  >
                    <MadaBadgeIcon className="opacity-80" />
                    <ApplePayBadgeIcon className="opacity-80" />
                    <VisaMastercardBadgeIcon className="opacity-80" />
                  </div>
                </div>
              </motion.article>
              </motion.div>
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
