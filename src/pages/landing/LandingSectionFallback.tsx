/** شاشة انتظار خفيفة لأقسام LandingPreview المُحمّلة عند الطلب */
export function LandingSectionFallback({ label = 'جاري التحميل…' }: { label?: string }) {
  return (
    <div
      dir="rtl"
      className="flex min-h-[8rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-slate-400"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-400" />
        {label}
      </span>
    </div>
  );
}
