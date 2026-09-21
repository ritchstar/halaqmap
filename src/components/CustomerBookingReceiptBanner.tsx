/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بانر موعد الزبون: يستطلع حالة القبول من الخادم ويتيح الإلغاء.
 */
import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  cancelCustomerBookingRemote,
  fetchCustomerBookingStatusRemote,
} from '@/lib/diamondAppointmentBookingRemote';
import {
  clearCustomerNamedBookingReceipt,
  customerBookingStatusLabelAr,
  formatCustomerBookingRef,
  patchCustomerNamedBookingReceiptStatus,
  persistCustomerNamedBookingReceipt,
  readCustomerNamedBookingReceipt,
  type CustomerBookingLiveStatus,
} from '@/lib/customerNamedBookingReceipt';
import { cn } from '@/lib/utils';

const POLL_MS = 8_000;

export function CustomerBookingReceiptBanner({
  barberId,
  className,
}: {
  barberId: string;
  className?: string;
}) {
  const [receipt, setReceipt] = useState(() => readCustomerNamedBookingReceipt(barberId));
  const [status, setStatus] = useState<CustomerBookingLiveStatus | undefined>(receipt?.status);
  const [canCancel, setCanCancel] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [phonePrompt, setPhonePrompt] = useState('');
  const [needsPhone, setNeedsPhone] = useState(() => !receipt?.customerPhone);

  const refresh = useCallback(async () => {
    const current = readCustomerNamedBookingReceipt(barberId);
    if (!current) {
      setReceipt(null);
      return;
    }
    setReceipt(current);
    if (!current.customerPhone) {
      setNeedsPhone(true);
      return;
    }
    setNeedsPhone(false);
    const res = await fetchCustomerBookingStatusRemote({
      bookingId: current.bookingId,
      customerPhone: current.customerPhone,
    });
    if (!res.ok) return;
    setStatus(res.booking.status);
    setCanCancel(res.booking.canCancel);
    patchCustomerNamedBookingReceiptStatus(barberId, res.booking.status);
    if (res.booking.bookingDate || res.booking.bookingTime) {
      persistCustomerNamedBookingReceipt({
        ...current,
        date: res.booking.bookingDate || current.date,
        time: res.booking.bookingTime || current.time,
        status: res.booking.status,
      });
      setReceipt(readCustomerNamedBookingReceipt(barberId));
    }
  }, [barberId]);

  useEffect(() => {
    void refresh();
    if (!receipt?.customerPhone && !phonePrompt) return;
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh, receipt?.customerPhone, phonePrompt]);

  if (!receipt) return null;
  const ref = formatCustomerBookingRef(receipt.bookingId);
  const label = customerBookingStatusLabelAr(status);
  const isConfirmed = status === 'confirmed';
  const isCancelled = status === 'cancelled';

  const bindPhone = () => {
    const phone = phonePrompt.trim();
    if (!/^05\d{8}$/.test(phone)) {
      toast.error('أدخل رقم الجوال المستخدم عند الحجز (05xxxxxxxx).');
      return;
    }
    persistCustomerNamedBookingReceipt({ ...receipt, customerPhone: phone });
    setNeedsPhone(false);
    void refresh();
  };

  const onCancel = async () => {
    if (!receipt.customerPhone) {
      setNeedsPhone(true);
      toast.message('أدخل رقم الجوال أولاً لإلغاء الموعد.');
      return;
    }
    if (!window.confirm('هل تريد إلغاء هذا الموعد؟')) return;
    setCancelling(true);
    const res = await cancelCustomerBookingRemote({
      bookingId: receipt.bookingId,
      customerPhone: receipt.customerPhone,
    });
    setCancelling(false);
    if (!res.ok) {
      toast.error(res.error);
      void refresh();
      return;
    }
    patchCustomerNamedBookingReceiptStatus(barberId, 'cancelled');
    setStatus('cancelled');
    setCanCancel(false);
    toast.success('تم إلغاء الموعد.');
    void refresh();
  };

  const dismiss = () => {
    clearCustomerNamedBookingReceipt();
    setReceipt(null);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border px-3 py-2.5',
        isConfirmed
          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-950 dark:text-emerald-50'
          : isCancelled
            ? 'border-border bg-muted/40 text-foreground'
            : 'border-amber-400/45 bg-amber-500/15 text-amber-950 dark:text-amber-50',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <CalendarCheck
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            isConfirmed ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-200',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          <p className="font-bold">
            {isConfirmed
              ? 'تم قبول موعدك من الصالون'
              : isCancelled
                ? 'أُلغي الموعد'
                : `لديك موعد برقم ${ref}`}
          </p>
          <p className="text-xs opacity-90">
            {isConfirmed || isCancelled ? `رقم ${ref} · ` : null}
            {receipt.date} — الساعة {receipt.time}
            {!isConfirmed && !isCancelled ? ` · ${label}` : null}
          </p>
        </div>
      </div>

      {needsPhone ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="05xxxxxxxx"
            value={phonePrompt}
            onChange={(e) => setPhonePrompt(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground sm:max-w-[10rem]"
            aria-label="رقم الجوال للمتابعة"
          />
          <Button type="button" size="sm" variant="secondary" onClick={bindPhone}>
            متابعة حالة الموعد
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canCancel && !isCancelled ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
              disabled={cancelling}
              onClick={() => void onCancel()}
            >
              {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              إلغاء الموعد
            </Button>
          ) : null}
          {(isCancelled || status === 'completed') && (
            <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
              إخفاء
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
