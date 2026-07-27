/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useLayoutEffect } from 'react';
import { captureMoyasarReturnInHashRoute } from '@/lib/moyasarPaymentReturn';

/** احتياط بعد index.html — إن وُجد ?id= خارج مسار HashRouter نُعيد التوجيه لصفحة الدفع. */
export function MoyasarPaymentReturnGate() {
  useLayoutEffect(() => {
    captureMoyasarReturnInHashRoute();
  }, []);
  return null;
}
