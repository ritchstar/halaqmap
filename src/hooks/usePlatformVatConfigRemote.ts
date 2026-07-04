import { useEffect, useState } from 'react';
import type { PlatformVatSettings } from '@/lib/platformVatSettings';
import { fetchPublicPaymentPageConfig } from '@/lib/publicPaymentPageConfigRemote';

/**
 * إعداد ض.ق.م للعرض على الواجهة من **مصدر الحقيقة الوحيد** (علم ZATCA على الخادم)
 * عبر `/api/public-payment-page-config`. يستبدل قراءة localStorage القديمة كي لا
 * تنافس المصدر الرسمي. مطفأ افتراضياً حتى تُقرأ القيمة.
 */
export function usePlatformVatConfigRemote(): PlatformVatSettings {
  const [settings, setSettings] = useState<PlatformVatSettings>({ enabled: false, ratePercent: 15 });

  useEffect(() => {
    let active = true;
    void fetchPublicPaymentPageConfig().then((cfg) => {
      if (!active) return;
      setSettings({
        enabled: Boolean(cfg.ok && cfg.vatEnabled),
        ratePercent: cfg.ok ? cfg.vatPercent : 15,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
