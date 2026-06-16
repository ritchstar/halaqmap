import { useEffect, type ReactNode } from 'react';
import { Clock, Shield, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button, type ButtonProps } from '@/components/ui/button';
import { SubscriptionTier } from '@/lib/index';
import { cn } from '@/lib/utils';

/** غلاف بنر التواصل — mobile-first، بدون تمدد أفقي. */
export const BARBER_CONTACT_SHEET_SHELL =
  'fixed z-[70] flex min-w-0 flex-col gap-0 border bg-background p-4 shadow-lg ' +
  'left-1/2 top-1/2 w-[min(calc(100vw-1rem),56rem)] max-w-[min(calc(100vw-1rem),56rem)] max-h-[min(92dvh,90vh)] ' +
  '-translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto overscroll-contain scroll-pb-6 ' +
  'sm:max-w-4xl sm:rounded-lg sm:p-6 ' +
  'max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-auto max-sm:w-[calc(100vw-1rem)] max-sm:max-w-[calc(100vw-1rem)] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-2xl';

export const BARBER_CONTACT_INNER_CLASS = 'barber-contact-inner';

export const BARBER_CONTACT_SHEET_BODY =
  'barber-contact-inner mt-4 min-w-0 max-w-full overflow-x-clip space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:space-y-6 sm:pb-0';

export const BARBER_CONTACT_SHEET_SECTION = 'barber-contact-inner min-w-0 max-w-full overflow-x-clip';

/** أزرار CTA داخل البنر — نص متعدد الأسطر على الجوال. */
export const BARBER_CONTACT_CTA_BUTTON =
  'w-full h-auto whitespace-normal py-4 text-base font-semibold sm:py-6 sm:text-lg';

export function BarberContactCtaButton({ className, ...props }: ButtonProps) {
  return <Button className={cn(BARBER_CONTACT_CTA_BUTTON, className)} {...props} />;
}

export function BarberContactRatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn('h-4 w-4', star <= rating ? 'fill-accent text-accent' : 'text-muted')}
        />
      ))}
    </div>
  );
}

const TIER_BADGE_CONFIG: Record<
  SubscriptionTier,
  { label: string; className: string }
> = {
  [SubscriptionTier.DIAMOND]: {
    label: 'ماسي',
    className: 'bg-gradient-to-r from-accent via-accent/80 to-accent text-accent-foreground',
  },
  [SubscriptionTier.GOLD]: {
    label: 'ذهبي',
    className: 'bg-gradient-to-r from-accent/70 via-accent/60 to-accent/70 text-accent-foreground',
  },
  [SubscriptionTier.BRONZE]: {
    label: 'برونزي',
    className: 'bg-muted text-muted-foreground',
  },
};

export function BarberContactTierBadge({ tier }: { tier: SubscriptionTier }) {
  const config = TIER_BADGE_CONFIG[tier];
  return (
    <Badge className={cn(config.className, 'px-3 py-1 font-semibold')}>{config.label}</Badge>
  );
}

export function BarberContactSheetBarberHeader({
  title,
  verified = false,
  tier,
  rating,
  reviewCount,
  isOpen,
}: {
  title: ReactNode;
  verified?: boolean;
  tier: SubscriptionTier;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
}) {
  return (
    <DialogHeader className="barber-contact-inner min-w-0 max-w-full space-y-3 overflow-x-clip text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <DialogTitle className="text-xl font-bold leading-snug break-words sm:text-2xl">{title}</DialogTitle>
          {verified ? (
            <Badge variant="outline" className="flex shrink-0 items-center gap-1 border-primary text-primary">
              <Shield className="h-3 w-3" />
              موثق
            </Badge>
          ) : null}
        </div>
        <div className="shrink-0 self-start">
          <BarberContactTierBadge tier={tier} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <BarberContactRatingStars rating={rating} />
          <span className="mr-1">({reviewCount} تقييم)</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 shrink-0" />
          <span className={isOpen ? 'text-green-600' : 'text-destructive'}>
            {isOpen ? 'مفتوح الآن' : 'مغلق'}
          </span>
        </div>
      </div>
    </DialogHeader>
  );
}

export function BarberContactSheetSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(BARBER_CONTACT_SHEET_SECTION, className)}>
      {children}
    </section>
  );
}

export function BarberContactSheet({
  open,
  onOpenChange,
  header,
  children,
  contentClassName,
  bodyClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[70]"
        className={cn(
          BARBER_CONTACT_SHEET_SHELL,
          'grid-cols-1 !gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
          contentClassName,
        )}
        dir="rtl"
      >
        {header}
        <div className={cn(BARBER_CONTACT_SHEET_BODY, bodyClassName)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
