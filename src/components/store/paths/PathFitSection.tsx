/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "هل هذا المسار يناسبك؟" — قسم ملاءمة صريح لبناء الثقة، لا لإقناع الجميع.
 */
import type { ProductPathEditorialContent } from '@/config/storeProductPathTypes';

export function PathFitSection({ editorial, accent }: { editorial: ProductPathEditorialContent; accent: string }) {
  if (editorial.fitForAr.length === 0 && editorial.notFitForAr.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">هل هذا المسار يناسبك؟</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {editorial.fitForAr.length > 0 ? (
          <div className="rounded-xl border p-4" style={{ borderColor: accent }}>
            <p className="text-sm font-extrabold" style={{ color: accent }}>
              يناسبك إذا…
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#1f2933]">
              {editorial.fitForAr.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {editorial.notFitForAr.length > 0 ? (
          <div className="rounded-xl border border-[#bdb5a7] bg-[#f7f4ed] p-4">
            <p className="text-sm font-extrabold text-[#566269]">قد لا يكون مناسباً لك إذا…</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#566269]">
              {editorial.notFitForAr.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
