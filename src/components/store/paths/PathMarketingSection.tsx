/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "كيف يصلك الزبون؟" — خطوات تسويقية واقعية من المحتوى التحريري المضبوط
 * يدوياً (storeProductPathContent.ts)، بلا وعد بترتيب بحث أو نتائج مضمونة.
 */
export function PathMarketingSection({ marketingStepsAr }: { marketingStepsAr: readonly string[] }) {
  if (marketingStepsAr.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">كيف يصلك الزبون؟</h2>
      <ol className="mt-4 space-y-3">
        {marketingStepsAr.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[#bdb5a7] text-xs font-extrabold text-[#1f2933]"
            >
              {index + 1}
            </span>
            <span className="text-sm leading-7 text-[#1f2933]">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
