/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونتا تقييم المتجر ومشاركته — أسفل يسار واجهة المتجر.
 */
import { useCallback, useState } from 'react';
import { Share2, Star, X, Check, Copy } from 'lucide-react';
import { STORE_ENGAGE_COPY, STORE_ORIGIN, STORE_PUBLIC_NAME_AR } from '@/config/storeFront';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const SHARE_URL = `${STORE_ORIGIN}/#${ROUTE_PATHS.STORE_LANDING}`;
const RATE_KEY = 'hm_store_ratings';

const STAR_LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'] as const;

export function StoreVisitorEngage() {
  const [panel, setPanel] = useState<'rate' | 'share' | null>(null);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [thanks, setThanks] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = useCallback(() => {
    setPanel(null);
    setThanks(false);
    setCopied(false);
  }, []);

  const sendRate = () => {
    if (stars === 0) return;
    try {
      const existing = JSON.parse(localStorage.getItem(RATE_KEY) ?? '[]') as number[];
      existing.push(stars);
      localStorage.setItem(RATE_KEY, JSON.stringify(existing));
    } catch {
      /* silent */
    }
    setThanks(true);
    window.setTimeout(close, 1400);
  };

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
      {panel === 'rate' ? (
        <div
          className="mb-1 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[#e8c547]/35 bg-[#061018]/95 p-4 shadow-2xl backdrop-blur-md"
          role="dialog"
          aria-labelledby="store-rate-title"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 id="store-rate-title" className="text-sm font-extrabold text-[#f4efe4]">
              {STORE_ENGAGE_COPY.rateTitleAr}
            </h3>
            <button type="button" onClick={close} aria-label="إغلاق" className="rounded-full p-1 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          {thanks ? (
            <p className="py-3 text-center text-sm font-bold text-[#e8c547]">{STORE_ENGAGE_COPY.rateThanksAr}</p>
          ) : (
            <>
              <p className="text-xs leading-6 text-white/65">{STORE_ENGAGE_COPY.rateLeadAr}</p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} من 5`}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setStars(value)}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        'h-7 w-7',
                        value <= (hover || stars) ? 'fill-[#e8c547] text-[#e8c547]' : 'text-white/25',
                      )}
                    />
                  </button>
                ))}
              </div>
              {(hover || stars) > 0 ? (
                <p className="mt-2 text-center text-xs font-bold text-[#e8c547]">{STAR_LABELS[hover || stars]}</p>
              ) : null}
              <button
                type="button"
                disabled={stars === 0}
                onClick={sendRate}
                className="mt-3 w-full rounded-full bg-[#e8c547] py-2 text-sm font-extrabold text-[#061018] disabled:opacity-40"
              >
                {STORE_ENGAGE_COPY.rateSendAr}
              </button>
            </>
          )}
        </div>
      ) : null}

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
        <button
          type="button"
          onClick={() => setPanel((current) => (current === 'rate' ? null : 'rate'))}
          aria-label={STORE_ENGAGE_COPY.rateAr}
          className="inline-flex items-center gap-2 rounded-full border border-[#e8c547]/40 bg-[#061018]/90 px-3 py-2 text-sm font-extrabold text-[#e8c547] shadow-lg backdrop-blur-md hover:bg-[#0b1a24]"
        >
          <Star className="h-4 w-4 fill-[#e8c547]" />
          {STORE_ENGAGE_COPY.rateAr}
        </button>
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
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#061018]/90 px-3 py-2 text-sm font-extrabold text-[#f4efe4] shadow-lg backdrop-blur-md hover:border-[#e8c547]/40 hover:text-[#e8c547]"
        >
          <Share2 className="h-4 w-4" />
          {STORE_ENGAGE_COPY.shareAr}
        </button>
      </div>
    </div>
  );
}
