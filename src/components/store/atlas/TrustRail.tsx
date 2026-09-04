/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function TrustRail() {
  return (
    <section className="store-atlas__dark-band border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)] py-8">
      <ul className="store-atlas__shell grid gap-4 md:grid-cols-3">
        <li className="store-atlas__body font-bold">{STORE_ATLAS_COPY.trustProfessionAr}</li>
        <li className="store-atlas__body font-bold">{STORE_ATLAS_COPY.trustDirectAr}</li>
        <li>
          <Link to={ROUTE_PATHS.STORE_TRUST} className="store-atlas__body font-bold text-[var(--atlas-teal)] underline-offset-4 hover:underline">
            {STORE_ATLAS_COPY.trustWorksAr}
          </Link>
        </li>
      </ul>
    </section>
  );
}
