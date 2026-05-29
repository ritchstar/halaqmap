import { useLayoutEffect } from 'react';
import { dismissInitialPaintShell } from '@/lib/dismissInitialPaintShell';

/** يضمن إزالة قشرة LCP على كل المسارات — لا يعتمد على `LandingPreview` وحده. */
export function InitialPaintShellGuard() {
  useLayoutEffect(() => {
    dismissInitialPaintShell();
  }, []);
  return null;
}
