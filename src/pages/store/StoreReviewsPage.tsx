/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة تقييمات المتجر: صندوق النجوم والتعليق وقائمة التعليقات.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreReviewForm } from '@/components/store/StoreReviewForm';
import { STORE_REVIEWS_COPY, STORE_REVIEWS_PUBLIC_ENABLED } from '@/config/storeReviews';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { fetchStoreReviews, type StoreReviewPublic } from '@/lib/storeReviewsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(date);
}

export default function StoreReviewsPage() {
  const copy = STORE_REVIEWS_COPY;
  useDocumentTitle(copy.documentTitle);
  const [rows, setRows] = useState<StoreReviewPublic[]>([]);

  const load = () => {
    void fetchStoreReviews().then(setRows);
  };

  useEffect(() => {
    load();
    if (readHashQueryParam('write') === '1') {
      window.setTimeout(() => {
        document.getElementById('store-review-write')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, []);

  if (!STORE_REVIEWS_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-wide text-[#e8c547]">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">{copy.titleAr}</h1>
          <p className="mt-4 text-base leading-8 text-white/78 md:text-lg">{copy.leadAr}</p>
          <div className="mt-8">
            <StoreReviewForm onSubmitted={load} />
          </div>
          <section className="mt-10">
            <h2 className="text-xl font-extrabold text-[#f4efe4]">{copy.listTitleAr}</h2>
            {rows.length === 0 ? <p className="mt-3 text-sm leading-7 text-white/65">{copy.emptyAr}</p> : null}
            <ul className="mt-4 space-y-3">
              {rows.map((row) => (
                <li key={row.id} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold text-[#f4efe4]">{row.displayName || copy.visitorAr}</p>
                    <span className="inline-flex items-center gap-1 text-[#e8c547]">
                      {Array.from({ length: row.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-[#e8c547]" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/75">{row.comment}</p>
                  {row.createdAt ? <p className="mt-2 text-xs text-white/40">{formatStamp(row.createdAt)}</p> : null}
                </li>
              ))}
            </ul>
          </section>
          <Link
            to={ROUTE_PATHS.STORE_LANDING}
            className="mt-8 inline-flex rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018]"
          >
            {copy.backAr}
          </Link>
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
