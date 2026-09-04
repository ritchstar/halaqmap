/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار أطلس الحلول: العرض ← الطلب ← التشغيل ← الولاء
 */
import { STORE_ATLAS_COPY, STORE_ATLAS_JOURNEY } from '@/config/storeAtlasTokens';

export function AtlasPath({ compact = false }: { compact?: boolean }) {
  return (
    <section id="atlas-journey" className="store-atlas__section">
      <div className="store-atlas__shell">
        <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.journeyTitleAr}</h2>
        <p className="store-atlas__body mt-3 max-w-2xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.journeyLeadAr}</p>
        <div className="store-atlas__constellation store-atlas__card relative mt-8 overflow-hidden px-4 py-8">
          <svg viewBox="0 0 640 120" className="absolute inset-x-6 top-8 h-16 w-[calc(100%-3rem)] opacity-80" aria-hidden>
            <path
              d="M40 72 C140 20, 220 110, 320 60 S500 10, 600 68"
              fill="none"
              stroke="#0D9488"
              strokeWidth={compact ? 1.4 : 1.8}
              strokeLinecap="round"
            />
            {[40, 220, 400, 600].map((x, index) => (
              <circle key={x} cx={x} cy={index === 1 ? 86 : index === 2 ? 52 : 70} r={5} fill="#0D9488" />
            ))}
          </svg>
          <ol className={`relative z-10 grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {STORE_ATLAS_JOURNEY.map((step, index) => (
              <li key={step.id} className="text-center">
                <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">{index + 1}</p>
                <p className="mt-1 text-xl font-extrabold">{step.titleAr}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
