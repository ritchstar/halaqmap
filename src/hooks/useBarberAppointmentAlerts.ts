import { useEffect, useRef } from 'react';
import { listBarberBookingsRemote } from '@/lib/diamondAppointmentBookingRemote';
import { readBarberChatAlertPrefs } from '@/lib/barberDashboardChatAlertPrefs';
import { playBarberChatAlert } from '@/lib/barberDashboardChatAlertSound';
import { emitBarberAppointmentPending } from '@/lib/barberInboxEvents';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

const SEEN_KEY = (barberId: string) => `halaqmap.barberApptAlertSeen.v1.${barberId.trim()}`;
const COOLDOWN_MS = 6_000;

function readSeen(barberId: string): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY(barberId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writeSeen(barberId: string, seen: Set<string>): void {
  try {
    localStorage.setItem(SEEN_KEY(barberId), JSON.stringify([...seen].slice(-300)));
  } catch {
    /* ignore */
  }
}

/**
 * تنبيه صوتي + حدث شارة عند وصول طلب موعد pending جديد (ماسي).
 */
export function useBarberAppointmentAlerts(
  barberId: string | undefined,
  enabled = true,
): void {
  const bootstrappedRef = useRef(false);
  const lastPlayedRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    bootstrappedRef.current = false;
  }, [barberId]);

  useEffect(() => {
    if (!enabled || !barberId?.trim()) return;
    const id = barberId.trim();

    const tick = async () => {
      if (!isPollingTabActive()) return;
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const res = await listBarberBookingsRemote();
        if (!res.ok) return;
        const pending = res.items.filter(
          (row) => row.kind === 'customer_booking' && row.status === 'pending',
        );
        const pendingIds = pending.map((row) => row.id);
        const seen = readSeen(id);

        if (!bootstrappedRef.current) {
          for (const pid of pendingIds) seen.add(pid);
          writeSeen(id, seen);
          bootstrappedRef.current = true;
          emitBarberAppointmentPending({
            barberId: id,
            bookingId: pendingIds[0] ?? '',
            pendingCount: pendingIds.length,
          });
          return;
        }

        let played = false;
        for (const pid of pendingIds) {
          if (seen.has(pid)) continue;
          seen.add(pid);
          emitBarberAppointmentPending({
            barberId: id,
            bookingId: pid,
            pendingCount: pendingIds.length,
          });
          const prefs = readBarberChatAlertPrefs(id);
          if (!prefs.enabled) continue;
          const now = Date.now();
          if (!played && now - lastPlayedRef.current >= COOLDOWN_MS) {
            lastPlayedRef.current = now;
            played = true;
            void playBarberChatAlert('appointment', prefs);
          }
        }
        writeSeen(id, seen);
      } finally {
        busyRef.current = false;
      }
    };

    void tick();
    const iv = window.setInterval(() => void tick(), POLL_MS.DIAMOND_APPOINTMENT_BOOKINGS);
    const onFocus = () => void tick();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener('focus', onFocus);
    };
  }, [barberId, enabled]);
}
