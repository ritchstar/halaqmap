/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم G — الأسئلة المتكررة.
 */
export interface TabkhatnaRamadanFaqProps {
  titleAr: string;
  items: readonly { q: string; a: string }[];
}

export function TabkhatnaRamadanFaq({ titleAr, items }: TabkhatnaRamadanFaqProps) {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <details key={item.q} className="rounded-xl border border-[#3d8b4a]/20 bg-[#faf6ec] px-4 py-3">
            <summary className="cursor-pointer text-sm font-extrabold text-[#234226]">{item.q}</summary>
            <p className="mt-2 text-sm leading-7 text-[#3f3527]/80">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
