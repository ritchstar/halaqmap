/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط التعافي في شاشة الخطأ العامة — بلا لوحة إدارة على نطاق المتجر.
 */
import { getAdminDashboardPath } from '@/config/adminAuth';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function isStoreSatelliteHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'store.halaqmap.com' || host.endsWith('.store.halaqmap.com');
}

export type PublicErrorRecoveryAction = {
  labelAr: string;
  onClick: () => void;
};

export function publicErrorRecoveryAction(): PublicErrorRecoveryAction | null {
  if (typeof window === 'undefined') return null;

  if (isStoreSatelliteHost()) {
    return {
      labelAr: 'العودة لواجهة المتجر',
      onClick: () => {
        window.location.replace(`${window.location.origin}/#${ROUTE_PATHS.STORE_LANDING}`);
      },
    };
  }

  if (import.meta.env.DEV) {
    return {
      labelAr: 'لوحة التحكم (تطوير)',
      onClick: () => {
        window.location.hash = `#${getAdminDashboardPath()}`;
        window.location.reload();
      },
    };
  }

  return {
    labelAr: 'العودة للرئيسية',
    onClick: () => {
      window.location.replace(`${window.location.origin}/#/`);
    },
  };
}
