/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نظام التجربة العام — صفحة الطلب. لا تُذكر في صفحات عرض المنتجات.
 */
import { Navigate } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreGeneralTrialEnterForm } from '@/components/store/StoreGeneralTrialEnterForm';
import {
  STORE_GENERAL_TRIAL_COPY,
  STORE_GENERAL_TRIAL_PUBLIC_ENABLED,
} from '@/config/storeProductTrial';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreGeneralTrialLandingPage() {
  useDocumentTitle(STORE_GENERAL_TRIAL_COPY.documentTitle);

  if (!STORE_GENERAL_TRIAL_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const copy = STORE_GENERAL_TRIAL_COPY;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold tracking-wide text-teal-300">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">{copy.titleAr}</h1>
          <p className="mt-4 text-base leading-8 text-white/78 md:text-lg">{copy.leadAr}</p>
          <p className="mt-4 text-sm font-bold text-teal-200">{copy.clockAr}</p>
          <div className="mt-8 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5">
            <StoreGeneralTrialEnterForm />
          </div>
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
