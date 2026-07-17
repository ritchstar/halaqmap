import { useCallback, useEffect, useState } from 'react';
import { listBarberBookingsRemote } from '@/lib/diamondAppointmentBookingRemote';
import {
  BARBER_APPOINTMENT_PENDING_EVENT,
  type BarberAppointmentPendingDetail,
} from '@/lib/barberInboxEvents';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export type BarberAppointmentInboxBadgeState = {
  pendingCount: number;
  hasPending: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

/** يجمع حجوزات العملاء بانتظار تأكيد الحلاق — للشارة على تبويب «المواعيد». */
export function useBarberAppointmentInboxBadge(
  enabled = true,
  barberId?: string,
): BarberAppointmentInboxBadgeState {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setPendingCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await listBarberBookingsRemote();
      if (!res.ok) return;
      const pending = res.items.filter(
        (row) => row.kind === 'customer_booking' && row.status === 'pending',
      ).length;
      setPendingCount(pending);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const poll = () => {
      if (!isPollingTabActive()) return;
      void refresh();
    };
    const iv = window.setInterval(poll, POLL_MS.DIAMOND_APPOINTMENT_BOOKINGS);
    return () => window.clearInterval(iv);
  }, [enabled, refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const onPending = (ev: Event) => {
      const detail = (ev as CustomEvent<BarberAppointmentPendingDetail>).detail;
      if (barberId && detail?.barberId && detail.barberId !== barberId) return;
      if (typeof detail?.pendingCount === 'number') {
        setPendingCount(detail.pendingCount);
      } else {
        setPendingCount((n) => Math.min(99, n + 1));
      }
      window.setTimeout(() => void refresh(), 800);
    };
    window.addEventListener(BARBER_APPOINTMENT_PENDING_EVENT, onPending);
    return () => window.removeEventListener(BARBER_APPOINTMENT_PENDING_EVENT, onPending);
  }, [barberId, enabled, refresh]);

  return {
    pendingCount,
    hasPending: pendingCount > 0,
    loading,
    refresh,
  };
}
