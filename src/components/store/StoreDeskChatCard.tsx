/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة محادثة الإدارة على واجهة المتجر. تُحمَّل كسولة حتى لا تُسقط صفحة المتجر.
 */
import { Component, lazy, Suspense, type ReactNode } from 'react';

const FounderDeskBannerLazy = lazy(() =>
  import('@/components/partner/FounderDeskBanner').then((m) => ({ default: m.FounderDeskBanner })),
);

class QuietDeskGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function StoreDeskChatCard({ className }: { className?: string }) {
  return (
    <QuietDeskGuard>
      <Suspense fallback={null}>
        <FounderDeskBannerLazy className={className} origin="store" />
      </Suspense>
    </QuietDeskGuard>
  );
}
