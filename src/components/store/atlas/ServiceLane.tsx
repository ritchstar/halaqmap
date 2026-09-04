/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * المهن والخدمات: صف أفقي متكامل، لا شبكة بطاقات منتجات.
 */
import { STORE_ATLAS_COPY, STORE_ATLAS_SERVICES } from '@/config/storeAtlasTokens';

export function ServiceLane() {
  return (
    <section className="store-atlas__section store-atlas__dark-band border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)]">
      <div className="store-atlas__shell">
        <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.servicesTitleAr}</h2>
        <p className="store-atlas__body mt-3 max-w-2xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.servicesLeadAr}</p>
        <ol className="mt-8 space-y-3">
          {STORE_ATLAS_SERVICES.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-[var(--atlas-line)] bg-[var(--atlas-card)] px-4 py-4"
            >
              <p className="store-atlas__meta w-10 shrink-0 font-extrabold text-[var(--atlas-teal)]">0{index + 1}</p>
              <div className="min-w-[16rem] max-w-xl flex-1">
                <p className="text-xl font-extrabold">{item.nameAr}</p>
                <p className="store-atlas__meta mt-1 text-[var(--atlas-muted)]">{item.forWhomAr}</p>
                <p className="store-atlas__body mt-1">{item.resultAr}</p>
              </div>
              <a href={item.href} className="store-atlas__link-cta shrink-0">
                اكتشف المنتج <span className="store-atlas__cta-arrow">←</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
