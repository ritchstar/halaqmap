import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import {
  SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_PLURAL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import { DigitalShiftAddonToggle } from '@/components/billing/DigitalShiftAddonToggle';
import {
  LISTING_LICENSE_LEGAL_FOOTNOTE,
  LISTING_LICENSE_PRICING_CARDS,
  LISTING_LICENSE_PRICING_DISPLAY_ORDER,
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

const shellClass =
  'rounded-xl border border-slate-700 bg-slate-900 p-6 md:p-8';

const cardBase =
  'flex h-full min-h-[520px] flex-col rounded-lg border border-slate-700 bg-slate-800 p-5 text-right text-slate-100';

const cardDiamond =
  'flex h-full min-h-[520px] flex-col rounded-lg border-2 border-slate-500 bg-slate-800 p-5 text-right text-slate-100';

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
  const [quantities, setQuantities] = useState(initialQuantities);
  const [digitalShiftAddon, setDigitalShiftAddon] = useState(false);

  const cardsByTier = useMemo(
    () => new Map(LISTING_LICENSE_PRICING_CARDS.map((c) => [c.tier, c])),
    [],
  );

  const orderedCards = useMemo(
    () =>
      LISTING_LICENSE_PRICING_DISPLAY_ORDER.map((tier) => cardsByTier.get(tier)).filter(
        (c): c is (typeof LISTING_LICENSE_PRICING_CARDS)[number] => Boolean(c),
      ),
    [cardsByTier],
  );

  const setQty = (tier: SubscriptionTier, next: number) => {
    setQuantities((prev) => ({
      ...prev,
      [tier]: clampListingLicenseQuantity(next),
    }));
  };

  return (
    <section
      className={cn(
        shellClass,
        variant === 'embedded-dark' && 'border-0 bg-transparent p-0',
        className,
      )}
      aria-labelledby="listing-license-pricing-heading"
    >
      {showHeader ? (
        <header className="mb-8 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            B2B · ISIC4 474151
          </p>
          <h2 id="listing-license-pricing-heading" className="mt-2 text-2xl font-bold text-white md:text-3xl">
            {SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            {SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_PLURAL_AR} مبنية على{' '}
            <strong className="font-semibold text-slate-200">{SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR}</strong>. اختر المستوى وعدد البطاقات (كل
            بطاقة = 30 يوم إدراج).
          </p>
        </header>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        {orderedCards.map((card) => {
          const isDiamond = card.accent === 'diamond';
          const qty = quantities[card.tier];
          const diamondAddonActive = isDigitalShiftAddonAllowed(card.tier, isDiamond && digitalShiftAddon);
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
            <article key={card.tier} className={cn(isDiamond ? cardDiamond : cardBase)}>
              {isDiamond && card.premiumRibbonAr ? (
                <span className="mb-3 inline-flex self-end rounded-md border border-slate-500 bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-100">
                  {card.premiumRibbonAr}
                </span>
              ) : (
                <span className="mb-3 inline-flex self-end rounded-md border border-slate-600 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  مستوى {card.title}
                </span>
              )}

              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500">{card.validityLabel}</span>
                <span className="text-lg font-bold text-white">
                  <span aria-hidden className="me-1">
                    {card.badge}
                  </span>
                  {card.title}
                </span>
              </div>

              <p className="text-sm font-semibold leading-snug text-slate-200">{card.productTitleAr}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{card.subtitleAr}</p>

              {card.digitalShiftAddonAvailable ? (
                <DigitalShiftAddonToggle
                  checked={digitalShiftAddon}
                  onCheckedChange={setDigitalShiftAddon}
                  id={`pricing-shift-${card.tier}`}
                />
              ) : null}

              <div className="mt-5 flex items-baseline justify-end gap-2">
                <span className="text-sm font-medium text-slate-500">ر.س</span>
                <span className="text-3xl font-bold tabular-nums text-white">
                  {formatPriceSar(isDiamond && qty === 1 ? unitSar : totalSar)}
                </span>
              </div>
              {isDiamond ? (
                <p className="mt-1 text-end text-xs text-slate-500">
                  {diamondAddonActive
                    ? `ماسي + المناوب · ${formatPriceSar(unitSar)} ر.س/حزمة`
                    : `ماسي قياسي · ${formatPriceSar(TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND])} ر.س/حزمة`}
                </p>
              ) : null}
              <p className="mt-0.5 text-end text-xs text-slate-500">
                {qty > 1
                  ? `المجموع: ${formatPriceSar(totalSar)} ر.س (${formatPriceSar(unitSar)} × ${qty} ${card.packageUnitLabelAr})`
                  : `${formatPriceSar(unitSar)} ر.س / ${card.packageUnitLabelAr}`}
              </p>

              <div
                className="mt-4 rounded-lg border border-slate-600 bg-slate-900 p-3"
                aria-label="اختيار عدد البطاقات"
              >
                <p className="mb-2 text-xs font-semibold text-slate-400">عدد البطاقات</p>
                <div className="flex items-center justify-end gap-1 rounded-md border border-slate-600 bg-slate-800 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-300 hover:bg-slate-700 hover:text-white"
                    disabled={qty <= LISTING_LICENSE_MIN_QUANTITY}
                    onClick={() => setQty(card.tier, qty - 1)}
                    aria-label="تقليل العدد"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2.5rem] text-center text-lg font-bold tabular-nums text-white">{qty}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-300 hover:bg-slate-700 hover:text-white"
                    disabled={qty >= LISTING_LICENSE_MAX_QUANTITY}
                    onClick={() => setQty(card.tier, qty + 1)}
                    aria-label="زيادة العدد"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{summaryAr}</p>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-300">
                {card.highlights.map((line) => (
                  <li key={line} className="flex items-start justify-end gap-2 leading-relaxed">
                    <span>{line}</span>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </li>
                ))}
              </ul>

              <NavLink to={paymentTo} className="mt-6 block">
                <Button
                  type="button"
                  className={cn(
                    'h-auto min-h-11 w-full whitespace-normal py-2.5 text-sm font-semibold',
                    isDiamond
                      ? 'border border-slate-400 bg-slate-100 text-slate-900 hover:bg-white'
                      : 'border border-slate-600 bg-slate-700 text-slate-100 hover:bg-slate-600',
                  )}
                >
                  {ctaLabel}
                </Button>
              </NavLink>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-slate-700 pt-4">
                <MadaBadgeIcon className="opacity-70" />
                <ApplePayBadgeIcon className="opacity-70" />
                <VisaMastercardBadgeIcon className="opacity-70" />
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500 md:text-xs">{LISTING_LICENSE_LEGAL_FOOTNOTE}</p>
    </section>
  );
}
