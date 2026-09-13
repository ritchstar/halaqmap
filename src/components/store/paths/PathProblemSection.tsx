/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "الواقع قبل المنتج" — المشكلة التشغيلية الحقيقية، من محتوى المسار نفسه.
 */
export function PathProblemSection({ problemsAr }: { problemsAr: readonly string[] }) {
  if (problemsAr.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffaf4] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">الواقع قبل المنتج</h2>
      <ul className="mt-4 space-y-2.5 text-sm leading-7 text-[#566269]">
        {problemsAr.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="text-[#b84c3a]">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
