/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "مسارات أخرى قد تناسبك" — من نفس نموذج التشغيل، من STORE_PRODUCT_PATHS
 * الحقيقية نفسها، بلا بيانات مستقلة.
 */
import { Link } from 'react-router-dom';
import type { ProductPathDefinition } from '@/config/storeProductPathTypes';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function RelatedPathsSection({ related }: { related: readonly ProductPathDefinition[] }) {
  if (related.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">مسارات أخرى قد تناسبك</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {related.map((path) => (
          <Link
            key={path.slug}
            to={`${ROUTE_PATHS.STORE_PATHS_LAB}/${path.slug}`}
            className="flex min-h-11 flex-col justify-center rounded-xl border border-[#bdb5a7] bg-[#fffaf4] p-3.5 transition hover:border-[#1d4f69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="text-sm font-extrabold text-[#1f2933]">{path.shortTitleAr}</span>
            <span className="mt-1 line-clamp-2 text-xs leading-6 text-[#566269]">{path.summaryAr}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
