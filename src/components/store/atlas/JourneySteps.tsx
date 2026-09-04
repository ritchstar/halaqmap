/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_ATLAS_COPY, STORE_ATLAS_JOURNEY } from '@/config/storeAtlasTokens';

export function JourneySteps() {
  return (
    <section id="atlas-journey" className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold md:text-4xl">{STORE_ATLAS_COPY.journeyTitleAr}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {STORE_ATLAS_JOURNEY.map((step, index) => (
            <li key={step.id} className="store-atlas__card p-5">
              <p className="text-sm font-bold text-[var(--atlas-teal)]">{index + 1}</p>
              <p className="mt-2 text-xl font-extrabold">{step.titleAr}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
