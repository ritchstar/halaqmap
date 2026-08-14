/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بوابة المستعلمة — زر الاستعلام في الوسط، العنوان يميناً، التصنيفات يساراً.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { CoiffeurInquiryStage } from '@/components/coiffeur/CoiffeurInquiryStage';
import { CoiffeurBannerGallery } from '@/components/coiffeur/CoiffeurBannerGallery';
import {
  CoiffeurMobileSearchDock,
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_LANDING_META,
  type CoiffeurInquiryIntentId,
} from '@/config/coiffeurMapUmbrella';

export default function CoiffeurLanding() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<CoiffeurInquiryIntentId>('near_open');
  useDocumentTitle(COIFFEUR_LANDING_META.documentTitle);

  useEffect(() => {
    ProductEvents.coiffeurLandingView({ source: 'landing' });
  }, []);

  const goInquire = () => {
    ProductEvents.coiffeurCtaClick({ source: 'landing' });
    navigate(ROUTE_PATHS.COIFFEUR_INQUIRE);
  };

  return (
    <CoiffeurVisitorShell>
      <CoiffeurVisitorHeader />
      <CoiffeurInquiryStage
        intent={intent}
        onIntentChange={(id) => {
          setIntent(id);
          ProductEvents.coiffeurCategoryClick({ intent: id, source: 'landing' });
        }}
        onInquire={goInquire}
      />
      <CoiffeurBannerGallery />
      <div className="px-5 pb-8 text-center">
        <Link
          to={`${ROUTE_PATHS.COIFFEUR_INTEREST}?utm_source=landing`}
          className="inline-block text-sm font-semibold text-[#f4d4c0]/80 underline-offset-4 hover:text-[#f4d4c0] hover:underline"
        >
          سجّلي اهتمامك وتلقّي التحديثات بالبريد
        </Link>
      </div>
      <CoiffeurVisitorFooter showPartnersLater />
      <CoiffeurMobileSearchDock onClick={goInquire} />
    </CoiffeurVisitorShell>
  );
}
