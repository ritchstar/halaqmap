/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "ماذا تستلم فعلياً؟" — من pathItems الحقيقية في الكتالوج (storeSolutionCatalog.ts)
 * عبر ProductPathDefinition.deliverables، بلا عناصر مضافة هنا.
 */
import type { ProductPathDeliverable } from '@/config/storeProductPathTypes';

export function PathDeliverablesSection({
  deliverables,
  accent,
}: {
  deliverables: readonly ProductPathDeliverable[];
  accent: string;
}) {
  if (deliverables.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffaf4] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">ماذا تستلم فعلياً؟</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {deliverables.map((item) => (
          <div
            key={item.titleAr}
            className="flex items-start gap-2.5 rounded-xl border border-[#bdb5a7] bg-[#fffdf8] p-3.5"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-extrabold text-white"
              style={{ backgroundColor: accent }}
            >
              ✓
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#1f2933]">{item.titleAr}</p>
              {item.descriptionAr ? (
                <p className="mt-1 text-xs leading-6 text-[#566269]">{item.descriptionAr}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
