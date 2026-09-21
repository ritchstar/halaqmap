/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة حالة الموعد بعد الإرسال — استطلاع حي + إلغاء.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, Loader2, Store, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  cancelCustomerBookingRemote,
  fetchCustomerBookingStatusRemote,
} from '@/lib/diamondAppointmentBookingRemote';
import {
  customerBookingStatusLabelAr,
  formatCustomerBookingRef,
  homeWithSalonPath,
  patchCustomerNamedBookingReceiptStatus,
  type CustomerBookingLiveStatus,
} from '@/lib/customerNamedBookingReceipt';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const POLL_MS = 6_000;

type Props = {
  bookingId: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  customerPhone: string;
  compact?: boolean;
  onBookAnother?: () => void;
};

export function CustomerBookingLiveStatusCard({
  bookingId,
  barberId,
  barberName,
  date,
  time,
  customerPhone,
  compact,
  onBookAnother,
}: Props) {
  const [status, setStatus] = useState<CustomerBookingLiveStatus>('pending');
  const [canCancel, setCanCancel] = useState(true);
  const [displayDate, setDisplayDate] = useState(date);
  const [displayTime, setDisplayTime] = useState(time);
  const [cancelling, setCancelling] = useState(false);

  const refresh = useCallback(async () => {
    if (!customerPhone) return;
    const res = await fetchCustomerBookingStatusRemote({ bookingId, customerPhone });
    if (!res.ok) return;
    setStatus(res.booking.status);
    setCanCancel(res.booking.canCancel);
    if (res.booking.bookingDate) setDisplayDate(res.booking.bookingDate);
    if (res.booking.bookingTime) setDisplayTime(res.booking.bookingTime);
    patchCustomerNamedBookingReceiptStatus(barberId, res.booking.status);
  }, [bookingId, customerPhone, barberId]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const onCancel = async () => {
    if (!window.confirm('هل تريد إلغاء هذا الموعد؟')) return;
    setCancelling(true);
    const res = await cancelCustomerBookingRemote({ bookingId, customerPhone });
    setCancelling(false);
    if (!res.ok) {
      toast.error(res.error);
      void refresh();
      return;
    }
    setStatus('cancelled');
    setCanCancel(false);
    patchCustomerNamedBookingReceiptStatus(barberId, 'cancelled');
    toast.success('تم إلغاء الموعد.');
  };

  const ref = formatCustomerBookingRef(bookingId);
  const confirmed = status === 'confirmed';
  const cancelled = status === 'cancelled';

  return (
    <div
      className={cn(
        'barber-contact-inner min-w-0 max-w-full space-y-4 overflow-x-clip rounded-xl border p-4',
        confirmed
          ? 'border-emerald-500/45 bg-emerald-500/10'
          : cancelled
            ? 'border-border bg-muted/30'
            : 'border-amber-400/40 bg-amber-500/10',
        compact && 'space-y-3 p-3',
      )}
    >
      <div className="flex items-start gap-2 text-center sm:text-right">
        <CheckCircle2
          className={cn(
            'mx-auto h-10 w-10 shrink-0 sm:mx-0',
            confirmed ? 'text-emerald-600' : cancelled ? 'text-muted-foreground' : 'text-amber-600',
            compact && 'h-5 w-5',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className={cn('font-bold text-foreground', compact ? 'text-sm' : 'text-xl')}>
            {confirmed ? 'تم قبول الموعد' : cancelled ? 'أُلغي الموعد' : 'تم إرسال الطلب'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {confirmed
              ? `الصالون قبل موعدك لدى ${barberName}.`
              : cancelled
                ? 'يمكنك حجز موعد آخر إن رغبت.'
                : `وصل طلبك إلى ${barberName}. سيُحدَّث هذا العرض تلقائياً عند قبول الصالون.`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">رقم الموعد</p>
        <p className="mt-1 font-mono text-lg font-black tracking-wide" dir="ltr">
          {ref}
        </p>
        <p className="mt-2 text-sm text-foreground">
          {displayDate} — الساعة {displayTime}
        </p>
        <p
          className={cn(
            'mt-2 text-xs font-semibold',
            confirmed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-200',
          )}
        >
          {customerBookingStatusLabelAr(status)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {canCancel && !cancelled ? (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            disabled={cancelling}
            onClick={() => void onCancel()}
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            إلغاء الموعد
          </Button>
        ) : null}
        <Button asChild className="w-full gap-2 font-bold">
          <Link to={homeWithSalonPath(barberId)}>
            <Store className="h-4 w-4" />
            المتابعة مع الصالون
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full gap-2">
          <Link to={ROUTE_PATHS.HOME}>
            <Home className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </Button>
        {onBookAnother ? (
          <Button type="button" variant="ghost" className="w-full" onClick={onBookAnother}>
            حجز موعد آخر
          </Button>
        ) : null}
      </div>
    </div>
  );
}
