import { Component, type ReactNode } from 'react';
import { ROUTE_PATHS } from '@/lib/index';

type Props = { children: ReactNode };

type State = { error: Error | null };

function isChunkLoadError(error: Error): boolean {
  return /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message,
  );
}

/** يمنع الشاشة البيضاء عند فشل تحميل حزمة lazy بعد نشر جديد أو كاش PWA قديم */
export class ChunkLoadErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('[ChunkLoadErrorBoundary]', error);
  }

  private handleRetry = (): void => {
    try {
      sessionStorage.removeItem('hm-chunk-recover');
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  private handleHome = (): void => {
    window.location.replace(`${window.location.origin}/#${ROUTE_PATHS.BARBERS_LANDING}`);
  };

  render() {
    if (!this.state.error) return this.props.children;

    const chunk = isChunkLoadError(this.state.error);

    return (
      <div
        dir="rtl"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center text-slate-100"
      >
        <p className="text-lg font-bold text-amber-200">تعذّر تحميل هذه الصفحة</p>
        <p className="max-w-md text-sm text-slate-400">
          {chunk
            ? 'يبدو أن نسخة المتصفح أو التطبيق المثبّت قديمة. جرّب إعادة التحميل أو العودة لصفحة الشركاء.'
            : 'حدث خطأ غير متوقع أثناء فتح الصفحة.'}
        </p>
        <p className="max-w-md font-mono text-xs text-slate-600" dir="ltr">
          {this.state.error.message}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100"
          >
            إعادة التحميل
          </button>
          <button
            type="button"
            onClick={this.handleHome}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200"
          >
            العودة لصفحة الشركاء
          </button>
        </div>
      </div>
    );
  }
}
