import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** يمنع الشاشة البيضاء الصامتة ويعرض رسالة خطأ قابلة للفهم */
export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          dir="rtl"
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#061223] px-6 text-center text-slate-100"
        >
          <p className="text-lg font-bold text-rose-300">تعذّر تحميل المنصة</p>
          <p className="max-w-md text-sm text-slate-400">{this.state.error.message}</p>
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
