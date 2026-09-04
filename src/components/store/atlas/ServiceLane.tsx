/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * المهن والخدمات: تخطيط نصي، لا شبكة بطاقات منتجات.
 */
import { STORE_ATLAS_COPY, STORE_ATLAS_SERVICES } from '@/config/storeAtlasTokens';

export function ServiceLane() {
  return (
    <section className="store-atlas__section border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)]">
      <div className="store-atlas__shell">
        <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.servicesTitleAr}</h2>
        <p className="store-atlas__body mt-3 max-w-2xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.servicesLeadAr}</p>
        <ol className="mt-8 space-y-5">
          {STORE_ATLAS_SERVICES.map((item, index) => (
            <li key={item.id} className="grid gap-2 border-s-2 border-[var(--atlas-teal)] ps-4 md:grid-cols-[8rem_1fr_auto] md:items-center">
              <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">0{index + 1}</p>
              <div>
                <p className="text-xl font-extrabold">{item.nameAr}</p>
                <p className="store-atlas__meta mt-1 text-[var(--atlas-muted)]">{item.forWhomAr}</p>
                <p className="store-atlas__body mt-1">{item.resultAr}</p>
              </div>
              <a href={item.href} className="store-atlas__btn store-atlas__btn--teal min-h-11 text-sm">
                {STORE_ATLAS_COPY.discoverProductAr}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
