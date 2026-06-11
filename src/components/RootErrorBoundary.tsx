import type { ReactNode } from 'react';
import { Component } from 'react';
import { forceHardRefresh } from '@/lib/platformBuildSync';

type Props = { children: ReactNode };
type State = { error: Error | null };

const RECOVER_FLAG = 'hm-dom-recover-v2';
const AMBIENT_RECOVER_FLAG = 'hm-ambient-recover-v1';
const REACT_HOOK_RECOVER_FLAG = 'hm-react-hook-recover-v1';

function isDomRemoveChildError(error: Error): boolean {
  return /removeChild/i.test(error.message) || /not a child of this node/i.test(error.message);
}

function isReactHookDispatcherError(error: Error): boolean {
  return (
    /reading 'useState'/i.test(error.message) ||
    /Invalid hook call/i.test(error.message) ||
    /hooks can only be called inside/i.test(error.message)
  );
}

function isAmbientProviderError(error: Error): boolean {
  return /usePlatformAmbient must be used within PlatformAmbientProvider/i.test(error.message);
}

function currentRecoverPathKey(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** يمنع الشاشة البيضاء الصامتة ويعرض رسالة خطأ قابلة للفهم */
export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Log error for monitoring (Sentry, LogRocket, etc.)
    if (import.meta.env.DEV) {
      console.error('[RootErrorBoundary] Caught error:', error);
    }
    
    // For DOM-related errors, attempt one auto-recovery per route
    if (typeof window !== 'undefined' && isDomRemoveChildError(error)) {
      try {
        const pathKey = `${RECOVER_FLAG}:${currentRecoverPathKey()}`;
        const alreadyRecovered = sessionStorage.getItem(pathKey) === '1';
        if (!alreadyRecovered) {
          sessionStorage.setItem(pathKey, '1');
          void forceHardRefresh();
        }
      } catch {
        // Fallback to simple reload if sessionStorage fails
        window.location.reload();
      }
    }

    // Stale HMR / duplicate React bundles — one hard refresh per route.
    if (typeof window !== 'undefined' && isReactHookDispatcherError(error)) {
      try {
        const pathKey = `${REACT_HOOK_RECOVER_FLAG}:${currentRecoverPathKey()}`;
        const alreadyRecovered = sessionStorage.getItem(pathKey) === '1';
        if (!alreadyRecovered) {
          sessionStorage.setItem(pathKey, '1');
          void forceHardRefresh();
        }
      } catch {
        window.location.reload();
      }
    }

    // If stale bundles still throw old ambient-provider error, force one hard refresh.
    if (typeof window !== 'undefined' && isAmbientProviderError(error)) {
      try {
        const pathKey = `${AMBIENT_RECOVER_FLAG}:${currentRecoverPathKey()}`;
        const alreadyRecovered = sessionStorage.getItem(pathKey) === '1';
        if (!alreadyRecovered) {
          sessionStorage.setItem(pathKey, '1');
          void forceHardRefresh();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  private handleRecoverClick = (): void => {
    try {
      sessionStorage.removeItem(RECOVER_FLAG);
      sessionStorage.removeItem(`${RECOVER_FLAG}:${currentRecoverPathKey()}`);
      sessionStorage.removeItem(AMBIENT_RECOVER_FLAG);
      sessionStorage.removeItem(`${AMBIENT_RECOVER_FLAG}:${currentRecoverPathKey()}`);
      sessionStorage.removeItem(REACT_HOOK_RECOVER_FLAG);
      sessionStorage.removeItem(`${REACT_HOOK_RECOVER_FLAG}:${currentRecoverPathKey()}`);
      localStorage.removeItem('hm-sw-reset-v5');
      localStorage.removeItem('hm-sw-reset-v3');
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then((regs) =>
          Promise.all(regs.map((r) => r.unregister())),
        );
      }
      if ('caches' in window) {
        void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const domMismatch = isDomRemoveChildError(this.state.error);
      const stack = typeof this.state.error.stack === 'string'
        ? this.state.error.stack.split('\n').slice(0, 8).join('\n')
        : null;
      return (
        <div
          dir="rtl"
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#061223] px-6 text-center text-slate-100"
        >
          <p className="text-lg font-bold text-rose-300">تعذّر تحميل المنصة</p>
          <p className="max-w-md text-sm text-slate-400">{this.state.error.message}</p>
          {stack ? (
            <pre
              dir="ltr"
              className="max-w-3xl overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-left text-[11px] leading-5 text-slate-300"
            >
              {stack}
            </pre>
          ) : null}
          {domMismatch ? (
            <p className="max-w-md text-xs text-slate-500">
              اضغط إعادة التحميل لتنظيف الكاش يدوياً — إن استمر الخطأ جرّب نافذة خاصة أو تواصل مع الدعم.
            </p>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200"
            onClick={domMismatch ? this.handleRecoverClick : () => window.location.reload()}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
