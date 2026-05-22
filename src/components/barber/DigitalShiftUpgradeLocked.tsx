import { Link } from 'react-router-dom';
import { Bot, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DigitalShiftFeatureBullets } from '@/components/billing/DigitalShiftFeatureBullets';
import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR } from '@/config/subscriptionPricing';
import { TERM_PACKAGE_ACTIVATION_AR } from '@/config/softwareLicenseTerminology';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';

function buildSmartDiamondCheckoutHref(): string {
  const params = new URLSearchParams({
    tier: SubscriptionTier.DIAMOND,
    qty: '1',
    aiAddon: '1',
  });
  return `${ROUTE_PATHS.PAYMENT}?${params.toString()}`;
}

function buildPartnersPricingHref(): string {
  return `${ROUTE_PATHS.BARBERS_LANDING}#listing-license-pricing-heading`;
}

function GlowOrb({ className = '' }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl ${className}`}
      aria-hidden
    />
  );
}

export function DigitalShiftUpgradeLocked({
  subscriptionTier,
}: {
  subscriptionTier: SubscriptionTier;
}) {
  const isDiamond = subscriptionTier === SubscriptionTier.DIAMOND;
  const checkoutHref = buildSmartDiamondCheckoutHref();
  const pricingHref = buildPartnersPricingHref();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-slate-950/90 via-slate-900/75 to-indigo-950/80 p-6 shadow-[0_0_48px_-12px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-10">
      <GlowOrb className="right-0 top-0 translate-x-1/4 -translate-y-1/4" />
      <GlowOrb className="bottom-0 left-0 -translate-x-1/4 translate-y-1/4 opacity-60" />
      <GlowOrb className="left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <span
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <span
            className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/30 blur-xl"
            aria-hidden
          />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-500/10 shadow-[0_0_32px_rgba(34,211,238,0.45)] ring-1 ring-cyan-200/20">
            <Lock
              className="h-9 w-9 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
          <Sparkles
            className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-cyan-200/90"
            aria-hidden
          />
        </div>

        <div className="mb-2 flex items-center gap-2 text-cyan-200/80">
          <Bot className="h-4 w-4" aria-hidden />
          <span className="text-xs font-medium tracking-wide">حلاق ماب · الماسية الذكية</span>
        </div>

        <h2 className="text-2xl font-bold text-cyan-50 sm:text-3xl">ميزتك الذكية بانتظارك! 🤖✨</h2>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-cyan-100/85 sm:text-base">
          اجعل الذكاء الاصطناعي موظفك المخلص المتاح 24 ساعة للرد التلقائي على محادثات الزبائن، تأكيد
          الحجوزات، وتنظيم جدولك بذكاء تام دون تشتت.
        </p>

        <div className="mt-5 max-w-lg w-full rounded-xl border border-cyan-400/20 bg-cyan-950/40 px-4 py-3 text-right">
          <DigitalShiftFeatureBullets
            title="مزايا المناوب — بما فيها الشات المترجم"
            className="[&_p]:text-cyan-100/90 [&_li]:text-cyan-100/75"
          />
        </div>

        {!isDiamond ? (
          <p className="mt-3 max-w-lg text-xs text-cyan-200/70 sm:text-sm">
            المناوب الذكي متاح ضمن <strong className="text-cyan-100">الباقة الماسية الذكية</strong> — ابدأ
            بالترقية للماسية ثم فعّل الإضافة الذكية من صفحة التسعير.
          </p>
        ) : (
          <p className="mt-3 max-w-lg text-xs text-cyan-200/70 sm:text-sm">
            باقتك الحالية <strong className="text-cyan-100">الماسية القياسية</strong> — فعّل المناوب بإضافة{' '}
            <strong className="text-cyan-100">+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س</strong> شهرياً فقط.
          </p>
        )}

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 border border-cyan-300/40 bg-gradient-to-l from-cyan-500 to-sky-400 px-6 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.55)] hover:from-cyan-400 hover:to-sky-300 sm:w-auto"
          >
            <Link to={checkoutHref}>
              {TERM_PACKAGE_ACTIVATION_AR} وتفعيل المناوب الذكي بـ +{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س فقط
            </Link>
          </Button>
        </div>

        <Link
          to={pricingHref}
          className="mt-4 text-sm text-cyan-200/80 underline-offset-4 transition hover:text-cyan-100 hover:underline"
        >
          عرض جدول الباقات والأسعار
        </Link>
      </div>
    </div>
  );
}
