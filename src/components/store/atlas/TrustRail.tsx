/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

function TrustMark() {
  return (
    <svg
      className="mt-1 h-4 w-4 shrink-0 text-[var(--atlas-teal)]"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M5.4 8.2 7.2 10l3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrustRail() {
  return (
    <section className="store-atlas__dark-band store-atlas__trust-rail border-y border-[var(--atlas-line)] bg-[var(--atlas-raised)] py-8">
      <ul className="store-atlas__shell grid gap-4 md:grid-cols-3">
        <li className="store-atlas__body flex gap-2 font-bold">
          <TrustMark />
          <span>{STORE_ATLAS_COPY.trustProfessionAr}</span>
        </li>
        <li className="store-atlas__body flex gap-2 font-bold">
          <TrustMark />
          <span>{STORE_ATLAS_COPY.trustDirectAr}</span>
        </li>
        <li className="store-atlas__body flex gap-2 font-bold">
          <TrustMark />
          <Link to={ROUTE_PATHS.STORE_TRUST} className="text-[var(--atlas-teal)] underline-offset-4 hover:underline">
            {STORE_ATLAS_COPY.trustWorksAr}
          </Link>
        </li>
      </ul>
    </section>
  );
}
