/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';

export function TrustRail() {
  const items = [STORE_ATLAS_COPY.trustProfessionAr, STORE_ATLAS_COPY.trustDirectAr, STORE_ATLAS_COPY.trustWorksAr];
  return (
    <section className="border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)] py-8">
      <ul className="store-atlas__shell grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="store-atlas__body font-bold">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
