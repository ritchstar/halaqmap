/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "ما الذي يتغير بعد التفعيل؟" — تحسّن تشغيلي واقعي، بلا وعود مالية.
 */
export function PathOutcomeSection({ outcomesAr, accent }: { outcomesAr: readonly string[]; accent: string }) {
  if (outcomesAr.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">ما الذي يتغير بعد التفعيل؟</h2>
      <ul className="mt-4 space-y-2.5 text-sm leading-7 text-[#1f2933]">
        {outcomesAr.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" style={{ color: accent }}>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
