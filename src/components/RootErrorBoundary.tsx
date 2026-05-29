import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

const RECOVER_FLAG = 'hm-dom-recover-v2';

function isDomRemoveChildError(error: Error): boolean {
  return /removeChild/i.test(error.message) || /not a child of this node/i.test(error.message);
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
    if (typeof window === 'undefined' || !isDomRemoveChildError(error)) return;
    try {
      const pathKey = `${window.location.pathname}${window.location.search}`;
      const scopedFlag = `${RECOVER_FLAG}:${pathKey}`;
      if (sessionStorage.getItem(RECOVER_FLAG) === '1' || sessionStorage.getItem(scopedFlag) === '1') {
        return;
      }
      sessionStorage.setItem(RECOVER_FLAG, '1');
      sessionStorage.setItem(scopedFlag, '1');
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
      window.setTimeout(() => window.location.reload(), 250);
    } catch {
      /* ignore recovery errors */
    }
  }

  render() {
    if (this.state.error) {
      const domMismatch = isDomRemoveChildError(this.state.error);
      return (
        <div
          dir="rtl"
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#061223] px-6 text-center text-slate-100"
        >
          <p className="text-lg font-bold text-rose-300">تعذّر تحميل المنصة</p>
          <p className="max-w-md text-sm text-slate-400">{this.state.error.message}</p>
          {domMismatch ? (
            <p className="max-w-md text-xs text-slate-500">
              جارٍ تنظيف الكاش تلقائياً — إن لم تُحدَّث الصفحة، اضغط إعادة التحميل مرة واحدة.
            </p>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-200"
            onClick={() => window.location.reload()}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
