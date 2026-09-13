/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة المسار الفردي — /store/paths-lab/:slug. تجريبية ومعزولة تماماً:
 * لا تمس الفهرس الحالي ولا منطق الدفع أو الطلب أو التفعيل. تُبنى بالكامل
 * من STORE_PRODUCT_PATHS (الكتالوج + الثيمات + المحتوى التحريري الحقيقيين).
 */
import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PathsBackHeader } from '@/components/store/paths/PathsBackHeader';
import { PathDetailHeader } from '@/components/store/paths/PathDetailHeader';
import { PathFitSection } from '@/components/store/paths/PathFitSection';
import { PathProblemSection } from '@/components/store/paths/PathProblemSection';
import { PathOutcomeSection } from '@/components/store/paths/PathOutcomeSection';
import { PathDeliverablesSection } from '@/components/store/paths/PathDeliverablesSection';
import { PathMarketingSection } from '@/components/store/paths/PathMarketingSection';
import { PathFAQ } from '@/components/store/paths/PathFAQ';
import { RelatedPathsSection } from '@/components/store/paths/RelatedPathsSection';
import { MobilePathCTA } from '@/components/store/paths/MobilePathCTA';
import { PathHelpBanner } from '@/components/store/paths/PathHelpBanner';
import { findProductPathBySlug, STORE_PRODUCT_PATHS } from '@/lib/storeProductPathAdapter';
import { StorePathEvents } from '@/lib/storePathAnalytics';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_PATHS_LAB_PRODUCT_ENABLED = true;

export default function StoreProductPathPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const path = useMemo(() => findProductPathBySlug(slug), [slug]);

  useDocumentTitle(path ? `${path.titleAr} | معاينة صفحة المسارات` : 'مسار غير موجود | معاينة');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (path) StorePathEvents.detailView(path.code);
  }, [path]);

  const related = useMemo(() => {
    if (!path) return [];
    return STORE_PRODUCT_PATHS.filter(
      (candidate) => candidate.slug !== path.slug && candidate.operatingModel === path.operatingModel,
    ).slice(0, 3);
  }, [path]);

  if (!STORE_PATHS_LAB_PRODUCT_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  if (!path) {
    return <Navigate to={ROUTE_PATHS.STORE_PATHS_LAB} replace />;
  }

  return (
    <div className="min-h-screen bg-[#e9e5dc] px-3 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10" dir="rtl">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8">
        <PathsBackHeader />
        <PathDetailHeader
          shortTitleAr={path.shortTitleAr}
          titleAr={path.titleAr}
          summaryAr={path.summaryAr}
          categoryAr={path.categoryAr}
          accent={path.accent}
          href={path.href}
          external={path.external}
          ctaLabelAr={path.ctaLabelAr}
          onCtaClick={() => StorePathEvents.detailCtaClick(path.code, path.external)}
        />

        <PathFitSection editorial={path.editorial} accent={path.accent} />
        <PathProblemSection problemsAr={path.editorial.problemsAr} />
        <PathOutcomeSection outcomesAr={path.editorial.outcomesAr} accent={path.accent} />
        <PathDeliverablesSection deliverables={path.deliverables} accent={path.accent} />
        <PathMarketingSection marketingStepsAr={path.editorial.marketingStepsAr} />
        <PathFAQ faq={path.editorial.faq} code={path.code} />
        <RelatedPathsSection related={related} />

        <div id="paths-help">
          <PathHelpBanner code={path.code} />
        </div>
      </div>

      <MobilePathCTA href={path.href} external={path.external} label={path.ctaLabelAr} accent={path.accent} />
    </div>
  );
}
