/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const RECEIPT_STORAGE_KEY = 'hm-customer-named-booking-receipt-v1';

export type CustomerNamedBookingReceipt = {
  bookingId: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  at: string;
};

export function formatCustomerBookingRef(bookingId: string): string {
  const compact = bookingId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const tail = (compact.slice(-8) || compact || '--------').padStart(6, '0');
  return `HM-${tail}`;
}

export function persistCustomerNamedBookingReceipt(
  input: Omit<CustomerNamedBookingReceipt, 'at'>,
): void {
  if (typeof window === 'undefined') return;
  const bookingId = input.bookingId.trim();
  const barberId = input.barberId.trim();
  if (!bookingId || !barberId) return;
  try {
    sessionStorage.setItem(
      RECEIPT_STORAGE_KEY,
      JSON.stringify({
        bookingId,
        barberId,
        barberName: input.barberName.trim(),
        date: input.date.trim(),
        time: input.time.trim(),
        at: new Date().toISOString(),
      } satisfies CustomerNamedBookingReceipt),
    );
  } catch {
    /* private mode / quota */
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
    return parsed;
  } catch {
    return null;
  }
}

export function homeWithSalonPath(barberId: string): string {
  const id = barberId.trim();
  return id ? `/?salon=${encodeURIComponent(id)}` : '/';
}
