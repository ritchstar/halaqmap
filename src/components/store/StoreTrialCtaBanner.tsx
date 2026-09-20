/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنر «اطلب تجربتك المجانية الآن» — شريط عائم أسفل الشاشة بعرض كامل، يظهر
 * فقط على صفحات هبوط المنتجات التي عليها فرصة التجربة العامة
 * (STORE_GENERAL_TRIAL_KEYS في storeProductTrial.ts). زجاجي داكن بلمسة
 * ذهبية واحدة، ليطابق لغة التصميم العائمة في المتجر (StoreVisitorEngage،
 * MobileStickyCTA)، ويحترم منطقة الأمان أسفل الشاشة على الجوال.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import {
  STORE_GENERAL_TRIAL_COPY,
  STORE_GENERAL_TRIAL_PUBLIC_ENABLED,
  storeGeneralTrialHref,
} from '@/config/storeProductTrial';
import { storeTrialLandingKeyForPath } from '@/lib/storeHmTube';

export function StoreTrialCtaBanner() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const trialKey = storeTrialLandingKeyForPath(location.pathname);

  // إعادة إظهار البنر عند الانتقال لصفحة منتج مؤهَّلة أخرى بعد إغلاقه في صفحة سابقة.
  useEffect(() => {
    setDismissed(false);
  }, [trialKey]);

  if (!STORE_GENERAL_TRIAL_PUBLIC_ENABLED || !trialKey || dismissed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8c547]/40 bg-[#061018]/95 px-4 py-3 shadow-[0_-16px_34px_-14px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      data-store-trial-cta="1"
      role="complementary"
      aria-label={STORE_GENERAL_TRIAL_COPY.promoAriaAr}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="hidden shrink-0 items-center justify-center rounded-full bg-[#e8c547]/15 p-1.5 sm:inline-flex">
            <Sparkles className="h-4 w-4 text-[#e8c547]" />
          </span>
          <p className="truncate text-sm font-extrabold text-[#f4efe4] sm:text-base">
            اطلب تجربتك المجانية الآن
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to={storeGeneralTrialHref(trialKey)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#e8c547] px-4 py-2.5 text-sm font-extrabold text-[#061018] shadow-[0_10px_24px_-10px_rgba(232,197,71,0.7)] hover:bg-[#f0d36a] sm:px-5"
          >
            {STORE_GENERAL_TRIAL_COPY.promoCtaAr}
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="إغلاق"
            className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
