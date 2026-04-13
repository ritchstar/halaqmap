import { useSyncExternalStore } from 'react';
import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';

const LS_PREFIX = 'halaqmap_diamond_schedule_pub_';

/** هل تُعرض كتلة جدولة المواعيد (ماسي فقط) — بيانات الحلاق + تفضيل محلي من لوحة التحكم */
export function isDiamondAppointmentSchedulingShown(barber: Barber): boolean {
  if (barber.subscription !== SubscriptionTier.DIAMOND) return false;
  if (barber.diamondAppointmentSchedulingEnabled === false) return false;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(`${LS_PREFIX}${barber.id}`) === '0') {
      return false;
    }
  } catch {
    /* ignore */
  }
  return true;
}

export function setDiamondSchedulingPublicLocal(barberId: string, visible: boolean): void {
  try {
    localStorage.setItem(`${LS_PREFIX}${barberId}`, visible ? '1' : '0');
    window.dispatchEvent(new Event('halaqmap-diamond-schedule-visibility'));
  } catch {
    /* ignore */
  }
}

export function readDiamondSchedulingPublicLocal(barberId: string): boolean | null {
  try {
    const v = localStorage.getItem(`${LS_PREFIX}${barberId}`);
    if (v === '0') return false;
    if (v === '1') return true;
  } catch {
    /* ignore */
  }
  return null;
}

/** يعيد الاشتراك عند تغيير الإظهار من لوحة الحلاق (نفس المتصفح) */
export function useDiamondAppointmentSchedulingShown(barber: Barber): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener('storage', handler);
      window.addEventListener('halaqmap-diamond-schedule-visibility', handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('halaqmap-diamond-schedule-visibility', handler);
      };
    },
    () => isDiamondAppointmentSchedulingShown(barber),
    () => isDiamondAppointmentSchedulingShown(barber)
  );
}
