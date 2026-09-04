/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';

export function TrustRail() {
  const items = [STORE_ATLAS_COPY.trustProfessionAr, STORE_ATLAS_COPY.trustDirectAr, STORE_ATLAS_COPY.trustWorksAr];
  return (
    <section className="border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)] px-4 py-8">
      <ul className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="text-base font-bold leading-7 text-[var(--atlas-ivory)]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
