/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة خام للمناسبة المشتراة — بلا هيدر أو تذييل أو توثيق.
 */
import { useEffect, type ReactNode } from 'react';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import { STORE_LIVE_MARK_AR } from '@/config/storeLiveAtmosphere';

export function StorePurchasedShell({ children }: { children: ReactNode }) {
  useEffect(() => lockPartnerDarkCanvas(), []);

  return (
    <div dir="rtl" className="store-purchased-shell relative min-h-[100svh] bg-[#050308] text-[#f7edd8]">
      {children}
      <p className="store-live-mark pointer-events-none fixed bottom-1 left-1/2 z-30 -translate-x-1/2">
        {STORE_LIVE_MARK_AR}
      </p>
    </div>
  );
}
