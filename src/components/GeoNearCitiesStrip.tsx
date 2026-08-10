/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { GEO_NEAR_HUB_PATH, geoNearPath, listGeoNearCities } from '@/config/geoNearRegistry';

type Props = {
  className?: string;
  /** compact = تذييل · card = شريط أوضح في الرئيسية */
  variant?: 'compact' | 'card';
};

/**
 * روابط اكتشاف لصفحات SEO الجغرافية `/near/...` (روابط مطلقة نظيفة — ليست HashRouter).
 */
export function GeoNearCitiesStrip({ className = '', variant = 'compact' }: Props) {
  const cities = listGeoNearCities();

  if (variant === 'card') {
    return (
      <section
        className={`rounded-2xl border border-teal-400/25 bg-teal-500/5 px-4 py-5 sm:px-6 ${className}`}
        aria-labelledby="geo-near-heading"
      >
        <h2 id="geo-near-heading" className="text-lg font-bold text-foreground sm:text-xl">
          أقرب حلاق حسب المدينة
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          فزعات من حلاق ماب لبدء الاستعلام عن حلاق في مدينتك أو بما يوافق رغبتك.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {cities.map((city) => (
            <li key={city.slug}>
              <a
                href={geoNearPath(city)}
                className="inline-flex rounded-xl border border-teal-400/30 bg-background/80 px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-400/60 hover:bg-teal-500/10 dark:text-teal-200"
              >
                {city.nameAr}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          <a
            href={GEO_NEAR_HUB_PATH}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            كل المدن والمناطق
          </a>
        </p>
      </section>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
        أقرب حلاق
      </p>
      <div className="flex flex-col gap-2">
        <a
          href={GEO_NEAR_HUB_PATH}
          className="text-sm text-slate-500 transition-colors hover:text-teal-300"
        >
          حسب المدينة
        </a>
        {cities.slice(0, 5).map((city) => (
          <a
            key={city.slug}
            href={geoNearPath(city)}
            className="text-sm text-slate-500 transition-colors hover:text-teal-300"
          >
            {city.nameAr}
          </a>
        ))}
      </div>
    </div>
  );
}
