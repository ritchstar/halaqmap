import { createRoot } from 'react-dom/client';
import './index.css';

async function bootstrapLab(rootEl: HTMLElement): Promise<void> {
  try {
    const { default: LabApp } = await import('@/lab/LabApp');
    createRoot(rootEl).render(<LabApp />);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تشغيل مختبر التصميم.';

    createRoot(rootEl).render(
      <div
        dir="rtl"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100"
      >
        <p className="text-lg font-bold text-amber-300">تعذّر تشغيل المختبر</p>
        <p className="max-w-md text-sm text-slate-400">{message}</p>
        <button
          type="button"
          className="rounded-xl border border-amber-300/35 bg-amber-500/10 px-5 py-2 text-sm font-semibold text-amber-100"
          onClick={() => window.location.reload()}
        >
          إعادة التحميل
        </button>
      </div>,
    );
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  void bootstrapLab(rootEl);
}
