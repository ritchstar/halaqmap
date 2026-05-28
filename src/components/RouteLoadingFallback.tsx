/** شاشة انتظار خفيفة أثناء تحميل مسارات React.lazy */
export function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-[#061223] px-4"
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-slate-300">جاري التحميل…</p>
    </div>
  );
}
