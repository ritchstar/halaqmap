/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import {
  DIAMOND_PRODUCT_SMART_LABEL_AR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
  DIAMOND_WITH_ADDON_MONTHLY_SAR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import {
  softwareLicenseFormNameAr,
  type SoftwareLicenseFormSurface,
} from '@/config/softwareLicenseTerminology';
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
import { BannerRadiationField, type BannerRadiationTier } from '@/components/BannerRadiationField';

type Variant = 'embedded-light' | 'embedded-dark' | 'standalone-dark';

/** عدد نقاط المزايا الظاهرة قبل طي الباقي — يكفي للمقارنة دون إطالة البطاقة. */
const FEATURES_PREVIEW_COUNT = 2;

const shellClass =
  'rounded-xl border border-slate-700 bg-slate-900 p-6 md:p-8';

const cardBase =
  'flex h-full flex-col rounded-lg border border-slate-700 bg-slate-800 p-5 text-right text-slate-100';

const cardDiamond =
  'flex h-full flex-col rounded-lg border-2 border-slate-500 bg-slate-800 p-5 text-right text-slate-100';

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
  licenseSurface?: SoftwareLicenseFormSurface;
  /** يُدمَج في رابط الدفع (purpose، requestId، linkedBarberId، …) دون استبدال tier/qty. */
  extraPaymentSearch?: Record<string, string>;
};

function paymentHref(base: URLSearchParams, extra?: Record<string, string>): string {
  const merged = new URLSearchParams(base);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      const v = value?.trim();
      if (v && !merged.has(key)) merged.set(key, v);
    }
  }
  return `${ROUTE_PATHS.PAYMENT}?${merged.toString()}`;
}

export function ListingLicensePricingMatrix({
  variant = 'embedded-light',
  className,
  showHeader = true,
  licenseSurface = 'halaqmap',
  extraPaymentSearch,
}: Props) {
  const [quantities, setQuantities] = useState(initialQuantities);
  const [digitalShiftAddon, setDigitalShiftAddon] = useState(false);
  /** تفاصيل المزايا مطوية افتراضياً — الاختيار عبر السعر والعدد وزر الدفع. */
  const [featuresOpen, setFeaturesOpen] = useState<Partial<Record<SubscriptionTier, boolean>>>({});

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
            {softwareLicenseFormNameAr(licenseSurface)}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            اختر المستوى وعدد الحزم ثم ادفع — كل حزمة = 30 يوم نفاذ. التفاصيل الكاملة مطوية؛ افتحها عند الحاجة فقط.
          </p>
        </header>
      ) : null}

      <div className="banner-radiation-stage">
      <div className="banner-radiation-grid relative z-[1] grid gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
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
          if (licenseSurface === 'coiffeur') paymentParams.set('surface', 'coiffeur');
          const paymentTo = paymentHref(paymentParams, extraPaymentSearch);
          const radiationTier: BannerRadiationTier =
            card.accent === 'diamond' ? 'diamond' : card.accent === 'gold' ? 'gold' : 'bronze';
          const featuresExpanded = featuresOpen[card.tier] === true;
          const previewHighlights = card.highlights.slice(0, FEATURES_PREVIEW_COUNT);
          const hiddenCount = Math.max(0, card.highlights.length - FEATURES_PREVIEW_COUNT);

          return (
            <BannerRadiationField key={card.tier} tier={radiationTier} className="h-full">
            <article className={cn(isDiamond ? cardDiamond : cardBase, 'h-full')}>
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

              <p className="text-sm font-semibold leading-snug text-slate-200">
                {softwareLicenseFormNameAr(licenseSurface)}
              </p>
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
                    ? `${DIAMOND_PRODUCT_SMART_LABEL_AR} · ${formatPriceSar(unitSar)} ر.س/حزمة`
                    : `${DIAMOND_PRODUCT_STANDARD_LABEL_AR} · ${formatPriceSar(TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND])} ر.س/حزمة`}
                </p>
              ) : null}
              <p className="mt-0.5 text-end text-xs text-slate-500">
                {qty > 1
                  ? `المجموع: ${formatPriceSar(totalSar)} ر.س (${formatPriceSar(unitSar)} × ${qty} ${card.packageUnitLabelAr})`
                  : `${formatPriceSar(unitSar)} ر.س / ${card.packageUnitLabelAr}`}
              </p>

              <div
                className="mt-4 rounded-lg border border-slate-600 bg-slate-900 p-3"
                aria-label="اختيار عدد الحزم"
              >
                <p className="mb-2 text-xs font-semibold text-slate-400">عدد الحزم للاشتراك</p>
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

              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {(featuresExpanded ? card.highlights : previewHighlights).map((line) => (
                  <li key={line} className="flex items-start justify-end gap-2 leading-relaxed">
                    <span>{line}</span>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </li>
                ))}
              </ul>

              {hiddenCount > 0 ? (
                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-600/80 bg-slate-900/70 px-3 py-2.5 text-right transition hover:border-slate-500 hover:bg-slate-900"
                  aria-expanded={featuresExpanded}
                  onClick={() =>
                    setFeaturesOpen((prev) => ({
                      ...prev,
                      [card.tier]: !prev[card.tier],
                    }))
                  }
                >
                  <span className="min-w-0 text-xs font-bold text-slate-200 sm:text-sm">
                    {featuresExpanded ? 'طي تفاصيل الباقة' : 'عرض تفاصيل الباقة'}
                    <span className="mt-0.5 block text-[0.65rem] font-normal text-slate-500">
                      {featuresExpanded
                        ? 'إخفاء النقاط الإضافية'
                        : `${hiddenCount} نقطة إضافية — اضغط للفتح`}
                    </span>
                  </span>
                  {featuresExpanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
                  )}
                </button>
              ) : null}

              <NavLink to={paymentTo} className="mt-5 block">
                <Button
                  type="button"
                  className={cn(
                    'h-auto min-h-12 w-full whitespace-normal py-3 text-sm font-semibold',
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
            </BannerRadiationField>
          );
        })}
      </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-600 bg-slate-800/60 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">الحزمة السنوية</p>
            <p className="mt-0.5 text-base font-bold text-white">360 يوم نفاذ متواصل (12 شهر)</p>
          </div>
          <span className="rounded-full border border-slate-500 bg-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-300">
            = 12 بطاقة × 30 يوم
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const annualPrice = computeListingLicenseTotalSar(SubscriptionTier.BRONZE, 12);
            const params = new URLSearchParams({ tier: 'bronze', qty: '12' });
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-900 p-3.5 text-right">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-500">برونزي سنوي</span>
                  <span className="text-lg">🥉</span>
                </div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-black tabular-nums text-white">{formatPriceSar(annualPrice)}</span>
                  <span className="text-xs text-slate-400">ر.س</span>
                </div>
                <p className="text-[11px] text-slate-500">360 يوم · {TIER_MONTHLY_SAR[SubscriptionTier.BRONZE]} ر.س/شهر</p>
                <NavLink to={paymentHref(params, extraPaymentSearch)}>
                  <button type="button" className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-600">
                    اشترِ السنوية
                  </button>
                </NavLink>
              </div>
            );
          })()}

          {(() => {
            const annualPrice = computeListingLicenseTotalSar(SubscriptionTier.GOLD, 12);
            const params = new URLSearchParams({ tier: 'gold', qty: '12' });
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-500 bg-slate-900 p-3.5 text-right">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-400">ذهبي سنوي</span>
                  <span className="text-lg">🥇</span>
                </div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-black tabular-nums text-white">{formatPriceSar(annualPrice)}</span>
                  <span className="text-xs text-slate-400">ر.س</span>
                </div>
                <p className="text-[11px] text-slate-500">360 يوم · {TIER_MONTHLY_SAR[SubscriptionTier.GOLD]} ر.س/شهر</p>
                <NavLink to={paymentHref(params, extraPaymentSearch)}>
                  <button type="button" className="mt-1 w-full rounded-md border border-amber-600/60 bg-amber-900/30 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-800/40">
                    اشترِ السنوية
                  </button>
                </NavLink>
              </div>
            );
          })()}

          {(() => {
            const annualPrice = computeListingLicenseTotalSar(SubscriptionTier.DIAMOND, 12);
            const params = new URLSearchParams({ tier: 'diamond', qty: '12' });
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-400 bg-slate-900 p-3.5 text-right">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-300">ماسي سنوي</span>
                  <span className="text-lg">💎</span>
                </div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-black tabular-nums text-white">{formatPriceSar(annualPrice)}</span>
                  <span className="text-xs text-slate-400">ر.س</span>
                </div>
                <p className="text-[11px] text-slate-500">360 يوم · {TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND]} ر.س/شهر</p>
                <NavLink to={paymentHref(params, extraPaymentSearch)}>
                  <button type="button" className="mt-1 w-full rounded-md border border-slate-300 bg-slate-100 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-white">
                    اشترِ السنوية
                  </button>
                </NavLink>
              </div>
            );
          })()}

          {(() => {
            const annualPrice = computeListingLicenseTotalSar(SubscriptionTier.DIAMOND, 12, { digitalShiftAddon: true });
            const params = new URLSearchParams({ tier: 'diamond', qty: '12', aiAddon: '1' });
            return (
              <div className="flex flex-col gap-2 rounded-lg border border-violet-500/50 bg-violet-950/40 p-3.5 text-right">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-violet-300">ماسي + المناوب 🌙</span>
                  <span className="text-lg">💎</span>
                </div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-black tabular-nums text-white">{formatPriceSar(annualPrice)}</span>
                  <span className="text-xs text-slate-400">ر.س</span>
                </div>
                <p className="text-[11px] text-violet-400/80">360 يوم · {DIAMOND_WITH_ADDON_MONTHLY_SAR} ر.س/شهر</p>
                <p className="text-[10px] text-slate-600">يشمل Add-on المناوب الرقمي</p>
                <NavLink to={paymentHref(params, extraPaymentSearch)}>
                  <button type="button" className="mt-1 w-full rounded-md border border-violet-500/60 bg-violet-800/40 py-2 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-700/50">
                    اشترِ السنوية
                  </button>
                </NavLink>
              </div>
            );
          })()}
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-600">
          الحزمة السنوية = 12 بطاقة مسبقة الدفع (30 يوم/بطاقة) · لا تجديد تلقائي · ISIC4 474151
        </p>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500 md:text-xs">{LISTING_LICENSE_LEGAL_FOOTNOTE}</p>
    </section>
  );
}
