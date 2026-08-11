/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  PLATFORM_NEAR_SEARCH_BLURB_AR,
  PLATFORM_NEAR_SEARCH_PHRASES_AR,
} from '@/config/platformBrandIdentity';
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
          أقرب حلاق من موقعي حسب المدينة
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {PLATFORM_NEAR_SEARCH_BLURB_AR}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="عبارات البحث الشائعة">
          {PLATFORM_NEAR_SEARCH_PHRASES_AR.map((phrase) => (
            <li key={phrase}>
              <span className="inline-flex rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[0.7rem] font-bold text-amber-800 dark:text-amber-100">
                {phrase}
              </span>
            </li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-2">
          {cities.map((city) => {
            const isMakkah = city.slug === 'makkah';
            return (
              <li key={city.slug}>
                <a
                  href={geoNearPath(city)}
                  className={
                    isMakkah
                      ? 'inline-flex rounded-xl border border-amber-400/45 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-800 transition-colors hover:border-amber-400/70 hover:bg-amber-500/15 dark:text-amber-100'
                      : 'inline-flex rounded-xl border border-teal-400/30 bg-background/80 px-3 py-2 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-400/60 hover:bg-teal-500/10 dark:text-teal-200'
                  }
                >
                  {isMakkah ? 'أقرب حلاق مكة' : city.nameAr}
                </a>
              </li>
            );
          })}
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

  const makkah = cities.find((c) => c.slug === 'makkah');
  const rest = cities.filter((c) => c.slug !== 'makkah').slice(0, 4);

  return (
    <div className={className}>
      <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
        أقرب حلاق من موقعي
      </p>
      <div className="flex flex-col gap-2">
        <a
          href={GEO_NEAR_HUB_PATH}
          className="text-sm text-slate-500 transition-colors hover:text-teal-300"
        >
          أبي حلاق قريب — حسب المدينة
        </a>
        {makkah ? (
          <a
            href={geoNearPath(makkah)}
            className="text-sm font-semibold text-teal-300/90 transition-colors hover:text-teal-200"
          >
            أقرب حلاق مكة
          </a>
        ) : null}
        {rest.map((city) => (
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
