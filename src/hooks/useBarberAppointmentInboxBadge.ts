import { useCallback, useEffect, useState } from 'react';
import { listBarberBookingsRemote } from '@/lib/diamondAppointmentBookingRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export type BarberAppointmentInboxBadgeState = {
  pendingCount: number;
  hasPending: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

/** يجمع حجوزات العملاء بانتظار تأكيد الحلاق — للشارة على تبويب «المواعيد». */
export function useBarberAppointmentInboxBadge(enabled = true): BarberAppointmentInboxBadgeState {
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

  return {
    pendingCount,
    hasPending: pendingCount > 0,
    loading,
    refresh,
  };
}
