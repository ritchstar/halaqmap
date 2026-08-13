/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { CalendarCheck } from 'lucide-react';
import {
  formatCustomerBookingRef,
  readCustomerNamedBookingReceipt,
} from '@/lib/customerNamedBookingReceipt';
import { cn } from '@/lib/utils';

export function CustomerBookingReceiptBanner({
  barberId,
  className,
}: {
  barberId: string;
  className?: string;
}) {
  const receipt = readCustomerNamedBookingReceipt(barberId);
  if (!receipt) return null;
  const ref = formatCustomerBookingRef(receipt.bookingId);

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2.5 text-emerald-950 dark:text-emerald-50',
        className,
      )}
      role="status"
    >
      <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden />
      <div className="min-w-0 text-sm leading-relaxed">
        <p className="font-bold">لديك موعد برقم {ref}</p>
        <p className="text-xs text-emerald-800/90 dark:text-emerald-100/80">
          {receipt.date} — الساعة {receipt.time} · بانتظار تأكيد الصالون
        </p>
      </div>
    </div>
  );
}
