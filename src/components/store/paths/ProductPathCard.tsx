/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة مسار منتج — نفس صورة الكتالوج الحقيقية، بتقديم "مسار" بدل "منتج فهرس".
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductPathDefinition } from '@/config/storeProductPathTypes';
import { sanitizeStoreProductImageSrc } from '@/lib/storeDisallowedImagery';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StorePathEvents } from '@/lib/storePathAnalytics';

export function ProductPathCard({ path }: { path: ProductPathDefinition }) {
  const [imageOk, setImageOk] = useState(true);
  const safeSrc = sanitizeStoreProductImageSrc(path.cardImageSrc);
  const showImage = Boolean(safeSrc) && imageOk;
  const detailHref = `${ROUTE_PATHS.STORE_PATHS_LAB}/${path.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] shadow-sm">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e9e5dc]">
        {showImage ? (
          <img
            src={safeSrc}
            alt={`صورة ${path.shortTitleAr}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setImageOk(false)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white"
            style={{ backgroundColor: path.accent }}
            aria-hidden="true"
          >
            {path.shortTitleAr.trim().charAt(0) || '؟'}
          </div>
        )}
        <span
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
          style={{ backgroundColor: path.accent }}
        >
          مسار
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-extrabold text-[#1f2933]">{path.titleAr}</h3>
          <p className="mt-1 text-sm leading-6 text-[#566269]">{path.summaryAr}</p>
        </div>

        {path.editorial.fitForAr[0] ? (
          <p className="text-xs leading-6 text-[#1d4f69]">
            <span className="font-bold">يناسبك إذا: </span>
            {path.editorial.fitForAr[0]}
          </p>
        ) : null}

        {path.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {path.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#bdb5a7] px-2.5 py-1 text-[11px] font-bold text-[#566269]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          to={detailHref}
          className="mt-auto flex min-h-11 items-center justify-center rounded-full border-2 px-4 py-2.5 text-sm font-extrabold transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ borderColor: path.accent, color: path.accent }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = path.accent;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => StorePathEvents.cardOpen(path.code)}
        >
          استكشف مسار {path.shortTitleAr}
        </Link>
      </div>
    </article>
  );
}
