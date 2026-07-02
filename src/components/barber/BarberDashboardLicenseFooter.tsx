import { BarberDashboardOutboundLink } from '@/components/barber/BarberDashboardOutboundLink';
import { CalendarClock, Package, RefreshCw, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { buildBuyPackageUrl } from '@/lib/buyPackageRouter';
import type { ListingLicenseBalance } from '@/lib/listingLicenseRemote';
import { cn } from '@/lib/utils';

import { DIAMOND_PRODUCT_SMART_LABEL_AR } from '@/config/subscriptionPricing';

function tierLabelAr(tier: SubscriptionTier | null, digitalShiftUnlocked?: boolean): string {
  if (tier === SubscriptionTier.DIAMOND) {
    return digitalShiftUnlocked ? DIAMOND_PRODUCT_SMART_LABEL_AR : 'ماسي';
  }
  if (tier === SubscriptionTier.GOLD) return 'ذهبي';
  if (tier === SubscriptionTier.BRONZE) return 'برونزي';
  return '—';
}

function tierToBuyParam(tier: SubscriptionTier | null): 'bronze' | 'gold' | 'diamond' {
  if (tier === SubscriptionTier.DIAMOND) return 'diamond';
  if (tier === SubscriptionTier.GOLD) return 'gold';
  return 'bronze';
}

type BarberDashboardLicenseFooterProps = {
  subscriptionTier: SubscriptionTier | null;
  listingBalance: ListingLicenseBalance | null;
  loading?: boolean;
  digitalShiftUnlocked?: boolean;
  onRedeem?: () => void;
  className?: string;
};

export function BarberDashboardLicenseFooter({
  subscriptionTier,
  listingBalance,
  loading = false,
  digitalShiftUnlocked = false,
  onRedeem,
  className,
}: BarberDashboardLicenseFooterProps) {
  const activeTier =
    subscriptionTier ??
    (listingBalance?.activeTier === 'diamond'
      ? SubscriptionTier.DIAMOND
      : listingBalance?.activeTier === 'gold'
        ? SubscriptionTier.GOLD
        : listingBalance?.activeTier === 'bronze'
          ? SubscriptionTier.BRONZE
          : null);

  const rechargeUrl = buildBuyPackageUrl({
    tier: tierToBuyParam(activeTier),
    plan: 'monthly',
    licenseMonths: 1,
  });
  const pricingUrl = `${ROUTE_PATHS.BARBERS_LANDING}#listing-license-pricing-heading`;
  const hasActiveListing = listingBalance?.hasActiveListing === true;
  const daysRemaining = listingBalance?.listingDaysRemaining ?? 0;
  const lowBalance = hasActiveListing && daysRemaining > 0 && daysRemaining <= 7;

  return (
    <footer
      className={cn(
        'mt-auto border-t border-border/40 bg-gradient-to-l from-primary/5 via-background to-amber-500/5',
        'pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
        className,
      )}
    >
      <div className="container mx-auto space-y-4 px-3 py-5 sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Package className="h-4 w-4 text-primary" aria-hidden />
              <p className="text-sm font-bold">رخصة النفاذ الرقمية</p>
              {activeTier ? (
                <Badge variant="secondary" className="text-[11px]">
                  {tierLabelAr(activeTier, digitalShiftUnlocked)}
                </Badge>
              ) : null}
              {hasActiveListing ? (
                <Badge
                  variant={lowBalance ? 'destructive' : 'default'}
                  className="text-[11px]"
                >
                  {loading ? '…' : `${daysRemaining} يوم متبقٍ`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[11px]">
                  لا حزمة نشطة
                </Badge>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">جاري تحميل صلاحية الحزمة…</p>
            ) : hasActiveListing ? (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  أيام الإدراج المتبقية:{' '}
                  <strong className="text-foreground">{daysRemaining}</strong>
                </span>
                {listingBalance?.validUntil ? (
                  <span dir="ltr" className="text-xs">
                    حتى {new Date(listingBalance.validUntil).toLocaleDateString('ar-SA')}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                لا توجد حزمة إدراج نشطة على حسابك. جدّد النفاذ أو استرد رمز حزمة لاستئناف الظهور على
                المنصة.
              </p>
            )}

            {lowBalance ? (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                تبقّى أقل من أسبوع على انتهاء الحزمة — جدّد مبكراً لتجنّب انقطاع الظهور.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <BarberDashboardOutboundLink to={rechargeUrl}>
                <RefreshCw className="h-4 w-4" />
                {hasActiveListing ? 'تجديد / شحن الحزمة' : 'شراء حزمة نفاذ'}
              </BarberDashboardOutboundLink>
            </Button>
            <Button asChild variant="outline" size="sm">
              <BarberDashboardOutboundLink to={pricingUrl}>استعراض الباقات والأسعار</BarberDashboardOutboundLink>
            </Button>
            {onRedeem ? (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onRedeem}>
                <Ticket className="h-4 w-4" />
                استرداد رمز الحزمة
              </Button>
            ) : null}
          </div>
        </div>

        <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
          كل حزمة = 30 يوم نفاذ · دفع لمرة واحدة · لا تجديد تلقائي · للمساعدة:{' '}
          <a href="mailto:admin@halaqmap.com" className="text-primary hover:underline">
            admin@halaqmap.com
          </a>
        </p>
      </div>
    </footer>
  );
}
