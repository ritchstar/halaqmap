/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const RECEIPT_STORAGE_KEY = 'hm-customer-named-booking-receipt-v1';

export type CustomerBookingLiveStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type CustomerNamedBookingReceipt = {
  bookingId: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  /** رقم الجوال المستخدم عند الحجز — مطلوب لاستطلاع الحالة والإلغاء */
  customerPhone: string;
  /** آخر حالة معروفة من الخادم (اختياري) */
  status?: CustomerBookingLiveStatus;
  at: string;
};

export function formatCustomerBookingRef(bookingId: string): string {
  const compact = bookingId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const tail = (compact.slice(-8) || compact || '--------').padStart(6, '0');
  return `HM-${tail}`;
}

export function persistCustomerNamedBookingReceipt(
  input: Omit<CustomerNamedBookingReceipt, 'at'> & { at?: string },
): void {
  if (typeof window === 'undefined') return;
  const bookingId = input.bookingId.trim();
  const barberId = input.barberId.trim();
  const customerPhone = String(input.customerPhone ?? '').trim();
  if (!bookingId || !barberId) return;
  try {
    const existing = readCustomerNamedBookingReceipt(barberId);
    sessionStorage.setItem(
      RECEIPT_STORAGE_KEY,
      JSON.stringify({
        bookingId,
        barberId,
        barberName: input.barberName.trim(),
        date: input.date.trim(),
        time: input.time.trim(),
        customerPhone: customerPhone || existing?.customerPhone || '',
        status: input.status ?? existing?.status,
        at: input.at || new Date().toISOString(),
      } satisfies CustomerNamedBookingReceipt),
    );
  } catch {
    /* private mode / quota */
  }
}

export function patchCustomerNamedBookingReceiptStatus(
  barberId: string,
  status: CustomerBookingLiveStatus,
): void {
  const current = readCustomerNamedBookingReceipt(barberId);
  if (!current) return;
  persistCustomerNamedBookingReceipt({ ...current, status });
}

export function clearCustomerNamedBookingReceipt(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(RECEIPT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readCustomerNamedBookingReceipt(
  barberId?: string,
): CustomerNamedBookingReceipt | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerNamedBookingReceipt;
    if (!parsed?.bookingId || !parsed?.barberId) return null;
    const expected = barberId?.trim();
    if (expected && parsed.barberId !== expected) return null;
    return {
      ...parsed,
      customerPhone: String(parsed.customerPhone ?? '').trim(),
    };
  } catch {
    return null;
  }
}

export function homeWithSalonPath(barberId: string): string {
  const id = barberId.trim();
  return id ? `/?salon=${encodeURIComponent(id)}` : '/';
}

export function customerBookingStatusLabelAr(status: CustomerBookingLiveStatus | undefined): string {
  switch (status) {
    case 'confirmed':
      return 'تم قبول الموعد من الصالون';
    case 'cancelled':
      return 'أُلغي الموعد';
    case 'completed':
      return 'اكتمل الموعد';
    case 'no_show':
      return 'سُجّل عدم حضور';
    case 'pending':
    default:
      return 'بانتظار تأكيد الصالون';
  }
}
