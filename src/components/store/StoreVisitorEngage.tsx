/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونتا تقييم المتجر ومشاركته — أسفل يسار واجهة المتجر.
 * التقييم يفتح صفحة النجوم والتعليق. المشاركة تبقى هنا.
 */
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Share2, Star, X, Check, Copy } from 'lucide-react';
import { STORE_ENGAGE_COPY, STORE_ORIGIN, STORE_PUBLIC_NAME_AR } from '@/config/storeFront';
import { STORE_REVIEWS_COPY } from '@/config/storeReviews';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const SHARE_URL = `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_LANDING}`;

export function StoreVisitorEngage() {
  const location = useLocation();
  const [panel, setPanel] = useState<'share' | null>(null);
  const [copied, setCopied] = useState(false);
  const onReviewsPage = location.pathname === ROUTE_PATHS.STORE_REVIEWS;
  const hideForStickyBuy = location.pathname.includes('/store/wedding');
  if (hideForStickyBuy) return null;

  const close = useCallback(() => {
    setPanel(null);
    setCopied(false);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* silent */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator.share !== 'function') {
      setPanel('share');
      return;
    }
    try {
      await navigator.share({
        title: STORE_PUBLIC_NAME_AR,
        text: STORE_ENGAGE_COPY.shareTextAr,
        url: SHARE_URL,
      });
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') return;
      setPanel('share');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-6 sm:left-6">
      {panel === 'share' ? (
        <div
          className="mb-1 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[#e8c547]/35 bg-[#061018]/95 p-4 shadow-2xl backdrop-blur-md"
          role="dialog"
          aria-labelledby="store-share-title"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 id="store-share-title" className="text-sm font-extrabold text-[#f4efe4]">
              {STORE_ENGAGE_COPY.shareTitleAr}
            </h3>
            <button type="button" onClick={close} aria-label="إغلاق" className="rounded-full p-1 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs leading-6 text-white/65">{STORE_ENGAGE_COPY.shareLeadAr}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${STORE_ENGAGE_COPY.shareTextAr} ${SHARE_URL}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-center text-xs font-bold text-white/85 hover:border-[#e8c547]/40"
            >
              {STORE_ENGAGE_COPY.whatsappAr}
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:border-[#e8c547]/40"
            >
              {copied ? (
                <span className="inline-flex items-center justify-center gap-1">
                  <Check className="h-3.5 w-3.5 text-[#e8c547]" />
                  {STORE_ENGAGE_COPY.copiedAr}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  {STORE_ENGAGE_COPY.copyAr}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {onReviewsPage ? null : (
          <Link
            to={`${ROUTE_PATHS.STORE_REVIEWS}?write=1`}
            aria-label={STORE_ENGAGE_COPY.rateAr}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8c547]/40 bg-[#061018]/90 px-3 py-2 text-sm font-extrabold text-[#e8c547] shadow-lg backdrop-blur-md hover:bg-[#0b1a24]"
          >
            <Star className="h-4 w-4 fill-[#e8c547]" />
            {STORE_ENGAGE_COPY.rateAr}
          </Link>
        )}
        {onReviewsPage ? (
          <button
            type="button"
            onClick={() => {
              document.getElementById('store-review-write')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            aria-label={STORE_REVIEWS_COPY.formTitleAr}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8c547]/40 bg-[#061018]/90 px-3 py-2 text-sm font-extrabold text-[#e8c547] shadow-lg backdrop-blur-md hover:bg-[#0b1a24]"
          >
            <Star className="h-4 w-4 fill-[#e8c547]" />
            {STORE_ENGAGE_COPY.rateAr}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (panel === 'share') {
              setPanel(null);
              return;
            }
            void nativeShare();
          }}
          aria-label={STORE_ENGAGE_COPY.shareAr}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#061018]/90 px-3 py-2 text-sm font-extrabold text-[#f4efe4] shadow-lg backdrop-blur-md hover:border-[#e8c547]/40 hover:text-[#e8c547]',
          )}
        >
          <Share2 className="h-4 w-4" />
          {STORE_ENGAGE_COPY.shareAr}
        </button>
      </div>
    </div>
  );
}
