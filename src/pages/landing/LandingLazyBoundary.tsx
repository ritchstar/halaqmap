/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يمنع سقوط الصفحة الرئيسية كاملة عند فشل حزمة فرعية (رادار، نتائج، لوحة وكيل…).
 */
import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = { failed: boolean };

export class LandingLazyBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    if (import.meta.env.DEV) {
      console.warn('[LandingLazyBoundary]', error.message);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
